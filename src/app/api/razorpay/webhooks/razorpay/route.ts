import { SubscriptionType } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';
import { verifyWebhookSignature } from '@/lib/razorpay';

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET!;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get('x-razorpay-signature')!;
    console.log('body', body, signature);

    // Verify webhook signature
    const isValid = verifyWebhookSignature(body, signature, WEBHOOK_SECRET);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const event = JSON.parse(body);
    const paymentData = event.payload.payment.entity;

    // Move declarations outside the case block
    let payment;
    let isFourDayPlan;
    let subscriptionData;

    switch (event.event) {
      case 'payment.captured':
        // Update payment status
        await prisma.payment.update({
          where: { razorpayPaymentId: paymentData.id },
          data: {
            status: 'captured',
            razorpayPaymentId: paymentData.id,
            razorpaySignature: signature,
          },
        });

        // Create subscription
        payment = await prisma.payment.findUnique({
          where: { razorpayPaymentId: paymentData.id },
          include: { user: true, webinar: true },
        });

        if (payment) {
          // Determine subscription type based on amount or other criteria
          isFourDayPlan = payment.planType === 'FOUR_DAY';

          subscriptionData = {
            userId: payment.userId,
            paymentId: payment.id,
            type: isFourDayPlan
              ? SubscriptionType.FOUR_DAY
              : SubscriptionType.SIX_MONTH,
            startDate: new Date(),
            endDate: new Date(
              Date.now() +
                (isFourDayPlan
                  ? 4 * 24 * 60 * 60 * 1000 // 4 days
                  : 180 * 24 * 60 * 60 * 1000) // 6 months
            ),
            isActive: true,
            ...(isFourDayPlan && {
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

          // Create subscription
          await prisma.subscription.create({
            data: subscriptionData,
          });

          // Update user activation status
          await prisma.user.update({
            where: { id: payment.userId },
            data: { isActive: true },
          });
        }
        break;

      case 'payment.failed':
        await prisma.payment.update({
          where: { razorpayOrderId: paymentData.order_id },
          data: { status: 'failed' },
        });
        break;

      default:
        console.log(`Unhandled event type: ${event.event}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler failed:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
