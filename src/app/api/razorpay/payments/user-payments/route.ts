import { NextResponse } from 'next/server';

import { auth } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/prisma';

export const GET = async () => {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's payments
    const payments = await prisma.payment.findMany({
      where: {
        userId: session.user.id,
        status: 'captured', // Only successful payments
      },
      include: {
        webinar: {
          select: {
            id: true,
            webinarTitle: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({
      payments: payments.map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        status: payment.status,
        planType: payment.planType,
        webinarId: payment.webinarId,
        webinarTitle: payment.webinar?.webinarTitle,
        createdAt: payment.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching user payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment history' },
      { status: 500 }
    );
  }
};
