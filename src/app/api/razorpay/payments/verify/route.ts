import { SubscriptionType } from '@prisma/client';
import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { verifyWebhookSignature } from '@/lib/razorpay';

export const POST = async (req: Request) => {
  const body = await req.json();
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    planType,
    // amount,
  } = body;

  try {
    // Signature verification
    const isValid = verifyWebhookSignature(
      `${razorpay_order_id}|${razorpay_payment_id}`,
      razorpay_signature,
      process.env.RAZORPAY_KEY_SECRET!
    );

    if (!isValid)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });

    // Update payment record
    const payment = await prisma.payment.update({
      where: { razorpayOrderId: razorpay_order_id },
      data: {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'captured',
      },
      include: { user: true },
    });

    // Base subscription data
    const subscriptionBaseData = {
      userId: payment.userId,
      paymentId: payment.id,
      type:
        planType === 'FOUR_DAY'
          ? SubscriptionType.FOUR_DAY
          : SubscriptionType.SIX_MONTH,
      startDate: new Date(),
      endDate: new Date(),
      isActive: true,
    };

    // Additional data for FOUR_DAY plan
    const fourDayData =
      planType === 'FOUR_DAY'
        ? {
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
          }
        : {};

    // Final subscription data
    const subscriptionData = {
      ...subscriptionBaseData,
      ...(planType === 'FOUR_DAY'
        ? {
            endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
            ...fourDayData,
          }
        : {
            endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // 6 months
          }),
    };

    await prisma.subscription.create({
      data: subscriptionData,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Payment verification failed:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
};
