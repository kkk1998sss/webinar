import { SubscriptionType } from '@prisma/client';
import { NextResponse } from 'next/server';

import { auth } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    // Check if user is admin
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is admin
    const adminUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { isAdmin: true },
    });

    if (!adminUser?.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    const { email, planType } = await req.json();

    if (!email || !planType) {
      return NextResponse.json(
        { error: 'Email and plan type are required' },
        { status: 400 }
      );
    }

    // Validate plan type
    if (!['FOUR_DAY', 'SIX_MONTH'].includes(planType)) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
    }

    // Find existing user by email
    const existingUser = await prisma.user.findUnique({
      where: { email },
      include: {
        subscriptions: {
          where: { isActive: true },
          orderBy: { startDate: 'desc' },
        },
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: 'User not found with this email' },
        { status: 404 }
      );
    }

    // Check if user already has an active subscription
    const hasActiveSubscription = existingUser.subscriptions.some(
      (sub) => sub.isActive && sub.type === planType
    );

    if (hasActiveSubscription) {
      return NextResponse.json(
        { error: `User already has an active ${planType} subscription` },
        { status: 409 }
      );
    }

    // Create a mock payment record for tracking purposes
    const mockPayment = await prisma.payment.create({
      data: {
        razorpayOrderId: `ADMIN_GRANT_${Date.now()}_${existingUser.id}`,
        razorpayPaymentId: `ADMIN_GRANT_PAYMENT_${Date.now()}_${existingUser.id}`,
        razorpaySignature: 'ADMIN_GRANT_SIGNATURE',
        amount: planType === 'FOUR_DAY' ? 199 : 699,
        currency: 'INR',
        status: 'captured',
        planType: planType,
        user: { connect: { id: existingUser.id } },
        name: existingUser.name,
      },
    });

    // Create subscription based on plan type
    const subscriptionData = {
      userId: existingUser.id,
      paymentId: mockPayment.id,
      type:
        planType === 'FOUR_DAY'
          ? SubscriptionType.FOUR_DAY
          : SubscriptionType.SIX_MONTH,
      startDate: new Date(),
      endDate:
        planType === 'FOUR_DAY'
          ? new Date(Date.now() + 4 * 24 * 60 * 60 * 1000) // 4 days
          : new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
      isActive: true,
      name: existingUser.name,
      ...(planType === 'FOUR_DAY' && {
        unlockedContent: {
          currentDay: 1,
          unlockedVideos: [1],
          expiryDates: {
            video1: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            video2: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
            video3: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
            video4: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000),
          },
        },
      }),
    };

    await prisma.subscription.create({
      data: subscriptionData,
    });

    return NextResponse.json(
      {
        message: `Successfully granted ${planType} plan access to user`,
        user: {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          planType: planType,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('Error in granting access:', error);

    let errorMessage = 'Failed to grant access';

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
