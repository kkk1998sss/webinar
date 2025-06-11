import { NextResponse } from 'next/server';

import { auth } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/prisma';
import { getRazorpayMode, isLiveMode, razorpay } from '@/lib/razorpay';

export const POST = async (req: Request) => {
  const session = await auth();

  try {
    // Extract webinarId from request body
    const { amount, planType, webinarId } = await req.json();
    console.log('Payment request:', {
      amount,
      planType,
      webinarId,
      mode: getRazorpayMode(),
      isLive: isLiveMode(),
      keyId: process.env.RAZORPAY_KEY_ID?.substring(0, 8) + '...', // Log partial key for debugging
    });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate required fields
    if (!amount || !planType) {
      return NextResponse.json(
        { error: 'Amount and plan type are required' },
        { status: 400 }
      );
    }

    // Validate amount is a positive number
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials missing:', {
        keyId: !!process.env.RAZORPAY_KEY_ID,
        keySecret: !!process.env.RAZORPAY_KEY_SECRET,
        mode: getRazorpayMode(),
      });
      return NextResponse.json(
        { error: 'Payment configuration error' },
        { status: 500 }
      );
    }

    const amountInPaise = Math.round(amount * 100);
    const receiptId = `${planType}_sub_${session.user.id}`;
    console.log('Creating Razorpay order:', {
      amountInPaise,
      receiptId,
      planType,
      mode: getRazorpayMode(),
    });

    try {
      // Create order with proper error handling
      const order = await razorpay.orders
        .create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: receiptId,
          notes: { planType },
        })
        .catch((error) => {
          console.error('Razorpay API error:', {
            error,
            statusCode: error.statusCode,
            message: error.message,
            error_description: error.error_description,
          });
          throw error;
        });

      console.log('Razorpay order created:', order);

      // Create payment record
      const paymentData = {
        razorpayOrderId: order.id,
        amount: amount,
        currency: 'INR',
        planType: planType,
        user: { connect: { id: session.user.id } },
      };

      // Only add webinar relation if webinarId exists and is valid
      if (webinarId) {
        try {
          // Verify webinar exists
          const webinar = await prisma.webinarDetails.findUnique({
            where: { id: webinarId },
          });

          if (webinar) {
            Object.assign(paymentData, {
              webinar: {
                connect: { id: webinarId },
              },
            });
          } else {
            console.warn('Webinar not found:', webinarId);
            // Continue without webinar relation
          }
        } catch (webinarError) {
          console.error('Error verifying webinar:', webinarError);
          // Continue without webinar relation
        }
      }

      const ordercreated = await prisma.payment.create({
        data: paymentData,
      });
      console.log('Payment record created:', ordercreated);

      return NextResponse.json({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order,
      });
    } catch (orderError: unknown) {
      const error = orderError as Error & {
        statusCode?: number;
        error_description?: string;
      };
      console.error('Razorpay order creation failed:', {
        error,
        statusCode: error.statusCode,
        message: error.message,
        error_description: error.error_description,
      });
      return NextResponse.json(
        {
          error: 'Failed to create Razorpay order',
          details: error.message || 'Unknown error',
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    const err = error as Error;
    console.error('Payment creation error:', {
      error: err,
      message: err.message,
      stack: err.stack,
    });
    return NextResponse.json(
      {
        error: 'Payment initiation failed',
        details: err.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
};

// Test mode code (commented out for reference)
/*
export const POST = async (req: Request) => {
  const session = await auth();

  try {
    // Extract webinarId from request body
    const { amount, planType, webinarId } = await req.json();
    console.log('Payment request:', { amount, planType, webinarId });

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validate required fields
    if (!amount || !planType) {
      return NextResponse.json(
        { error: 'Amount and plan type are required' },
        { status: 400 }
      );
    }

    // Validate amount is a positive number
    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      console.error('Razorpay credentials missing:', {
        keyId: !!process.env.RAZORPAY_KEY_ID,
        keySecret: !!process.env.RAZORPAY_KEY_SECRET,
      });
      return NextResponse.json(
        { error: 'Payment configuration error' },
        { status: 500 }
      );
    }

    const amountInPaise = Math.round(amount * 100);
    const receiptId = `${planType}_sub_${session.user.id}`;
    console.log('Creating Razorpay order:', {
      amountInPaise,
      receiptId,
      planType,
    });

    try {
      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: receiptId,
        notes: { planType },
      });
      console.log('Razorpay order created:', order);

      // Create payment record
      const paymentData = {
        razorpayOrderId: order.id,
        amount: amount,
        currency: 'INR',
        planType: planType,
        user: { connect: { id: session.user.id } },
      };

      // Only add webinar relation if webinarId exists and is valid
      if (webinarId) {
        try {
          // Verify webinar exists
          const webinar = await prisma.webinarDetails.findUnique({
            where: { id: webinarId },
          });

          if (webinar) {
            Object.assign(paymentData, {
              webinar: {
                connect: { id: webinarId },
              },
            });
          } else {
            console.warn('Webinar not found:', webinarId);
            // Continue without webinar relation
          }
        } catch (webinarError) {
          console.error('Error verifying webinar:', webinarError);
          // Continue without webinar relation
        }
      }

      const ordercreated = await prisma.payment.create({
        data: paymentData,
      });
      console.log('Payment record created:', ordercreated);

      return NextResponse.json({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order,
      });
    } catch (orderError) {
      console.error('Razorpay order creation failed:', orderError);
      return NextResponse.json(
        { error: 'Failed to create Razorpay order' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: 'Payment initiation failed' },
      { status: 500 }
    );
  }
};
*/
