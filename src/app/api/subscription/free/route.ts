import { JsonValue } from '@prisma/client/runtime/library';
import { NextResponse } from 'next/server';

import { auth } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/prisma';

interface SubscriptionWithPayment {
  id: string;
  type: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  unlockedContent: JsonValue;
  payment: {
    id: string;
    amount: number;
    planType: string;
    createdAt: Date;
  };
}

export const POST = async (req: Request) => {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already has a free subscription
    const existingFreeSubscription = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        type: 'FOUR_DAY', // We'll use FOUR_DAY type for free access
      },
    });

    if (existingFreeSubscription) {
      return NextResponse.json({
        message: 'Free subscription already exists',
        subscription: existingFreeSubscription,
      });
    }

    // Create a temporary payment record for free subscription
    const freePayment = await prisma.payment.create({
      data: {
        razorpayOrderId: `free_${Date.now()}_${user.id}`,
        amount: 0,
        currency: 'INR',
        status: 'completed',
        planType: 'FOUR_DAY',
        userId: user.id,
        name: user.name,
      },
    });

    // Create free subscription (30 days access)
    const freeSubscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        type: 'FOUR_DAY',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        paymentId: freePayment.id,
        isActive: true,
        name: user.name,
        unlockedContent: {
          currentDay: 1,
          unlockedVideos: [1, 2, 3], // Unlock all videos for free users
          expiryDates: {
            video1: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
            video2: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
            video3: new Date(
              Date.now() + 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
          },
        },
      },
    });

    // Update user pending status to true (they now have access)
    await prisma.user.update({
      where: { id: user.id },
      data: { pending: true },
    });

    return NextResponse.json({
      message: 'Free subscription created successfully',
      subscription: freeSubscription,
    });
  } catch (error) {
    console.error('Error creating free subscription:', error);
    return NextResponse.json(
      { error: 'Failed to create free subscription' },
      { status: 500 }
    );
  }
};

export const GET = async () => {
  const session = await auth();

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        subscriptions: {
          include: {
            payment: {
              select: {
                id: true,
                amount: true,
                planType: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const formattedSubscriptions = user.subscriptions.map(
      (sub: SubscriptionWithPayment) => {
        const currentDate = new Date();
        const endDate = new Date(sub.endDate);
        const isValid = sub.isActive && currentDate <= endDate;

        return {
          id: sub.id,
          type: sub.type,
          startDate: sub.startDate,
          endDate: sub.endDate,
          isActive: sub.isActive,
          isValid,
          isFree: sub.payment.amount === 0, // Mark as free if amount is 0
          payment: {
            amount: sub.payment.amount,
            planType: sub.payment.planType,
            paidAt: sub.payment.createdAt,
          },
          unlockedContent: sub.unlockedContent,
        };
      }
    );

    return NextResponse.json({
      subscriptions: formattedSubscriptions,
    });
  } catch (error) {
    console.error('Error fetching free subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
};
