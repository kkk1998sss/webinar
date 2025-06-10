// app/api/subscription/route.ts
import { NextResponse } from 'next/server';

import { auth } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/prisma';

export const GET = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
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

    const formattedSubscriptions = user.subscriptions.map((sub) => {
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
        payment: {
          amount: sub.payment.amount,
          planType: sub.payment.planType,
          paidAt: sub.payment.createdAt,
        },
        unlockedContent: sub.unlockedContent,
      };
    });

    return NextResponse.json({
      subscriptions: formattedSubscriptions,
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
};
