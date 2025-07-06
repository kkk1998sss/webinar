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
    webinarId,
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

    // Update payment record with proper webinar relation
    const payment = await prisma.payment.update({
      where: { razorpayOrderId: razorpay_order_id },
      data: {
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        status: 'captured',
        ...(webinarId && {
          webinar: {
            connect: { id: webinarId },
          },
        }),
      },
      include: { user: true },
    });

    // Handle different plan types
    console.log('Processing payment with planType:', planType);

    if (planType === 'PAID_WEBINAR') {
      // For individual webinar purchases, we don't create subscriptions
      // The user will have access to the specific webinar they purchased
      console.log('Paid webinar purchase successful:', {
        paymentId: payment.id,
        webinarId,
        userId: payment.userId,
      });
    } else {
      // Handle subscription plans (FOUR_DAY, SIX_MONTH)
      // Base subscription data
      const subscriptionBaseData = {
        userId: payment.userId,
        paymentId: payment.id,
        type:
          planType === 'FOUR_DAY'
            ? SubscriptionType.FOUR_DAY
            : planType === 'SIX_MONTH'
              ? SubscriptionType.SIX_MONTH
              : SubscriptionType.FOUR_DAY, // fallback
        startDate: new Date(),
        endDate: new Date(),
        isActive: true,
      };

      // If upgrading to SIX_MONTH, deactivate any existing FOUR_DAY subscriptions
      if (planType === 'SIX_MONTH') {
        await prisma.subscription.updateMany({
          where: {
            userId: payment.userId,
            type: SubscriptionType.FOUR_DAY,
            isActive: true,
          },
          data: {
            isActive: false,
          },
        });
      }

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
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Payment verification failed:', error);
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    );
  }
};
