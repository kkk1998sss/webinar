import { NextResponse } from 'next/server';

import { auth } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/prisma';
import { razorpay } from '@/lib/razorpay';

export const POST = async (req: Request) => {
  const session = await auth();
  // Extract webinarId from request body
  const { amount, planType, webinarId } = await req.json();
  console.log('body', amount, planType, webinarId);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials missing');
      return NextResponse.json(
        { error: 'Payment configuration error' },

        { status: 500 }
      );
    }
    const amountInPaise = amount * 100;
    console.log('receipts', `${planType}_sub_${session.user.id}`);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `${planType}_sub_${session.user.id}`,
      notes: { planType },
    });
    console.log('orderis done', order);

    // Conditionally connect webinar only if ID exists
    const ordercreated = await prisma.payment.create({
      data: {
        razorpayOrderId: order.id,
        amount: amount,
        currency: 'INR',
        planType: planType,
        user: { connect: { id: session.user.id } },
        ...(webinarId && {
          webinar: {
            connect: { id: webinarId },
          },
        }),
      },
    });
    console.log('ordercreated', ordercreated);

    return NextResponse.json({
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      order,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'Payment initiation failed' },
      { status: 500 }
    );
  }
};
