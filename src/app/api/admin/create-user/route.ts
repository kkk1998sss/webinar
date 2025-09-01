import { SubscriptionType } from '@prisma/client';
import { NextResponse } from 'next/server';

import { auth } from '@/app/api/auth/[...nextauth]/auth-options';
import { encryptPassword } from '@/lib/encryption';
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

    const { name, email, phoneNumber, password, planType } = await req.json();

    if (!name || !email || !phoneNumber || !password || !planType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate plan type
    if (!['FOUR_DAY', 'SIX_MONTH'].includes(planType)) {
      return NextResponse.json({ error: 'Invalid plan type' }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phoneNumber }] },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or phone number already exists' },
        { status: 409 }
      );
    }

    // Encrypt password
    const encryptedPassword = encryptPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phoneNumber,
        password: encryptedPassword,
        isActive: true, // Admin-created users are automatically active
        pending: false, // No pending status since admin is giving access
      },
    });

    // Create a mock payment record for tracking purposes
    const mockPayment = await prisma.payment.create({
      data: {
        razorpayOrderId: `ADMIN_${Date.now()}_${user.id}`,
        razorpayPaymentId: `ADMIN_PAYMENT_${Date.now()}_${user.id}`,
        razorpaySignature: 'ADMIN_SIGNATURE',
        amount: planType === 'FOUR_DAY' ? 199 : 699,
        currency: 'INR',
        status: 'captured',
        planType: planType,
        user: { connect: { id: user.id } },
        name: user.name,
      },
    });

    // Create subscription based on plan type
    const subscriptionData = {
      userId: user.id,
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
      name: user.name,
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
        message: `User created successfully with ${planType} plan access`,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          phoneNumber: user.phoneNumber,
          planType: planType,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error in admin user creation:', error);

    let errorMessage = 'User creation failed';

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
