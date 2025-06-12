import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Get the last 8 months of data
    const months = Array.from({ length: 8 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      return date;
    }).reverse();

    // Get subscription counts for each month
    const userGrowthData = await Promise.all(
      months.map(async (month) => {
        const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1);
        const endOfMonth = new Date(
          month.getFullYear(),
          month.getMonth() + 1,
          0
        );

        const count = await prisma.subscription.count({
          where: {
            startDate: {
              gte: startOfMonth,
              lte: endOfMonth,
            },
          },
        });

        return {
          month: month.toLocaleString('default', { month: 'short' }),
          count,
        };
      })
    );

    return NextResponse.json({
      success: true,
      data: userGrowthData,
    });
  } catch (error) {
    console.error('Error fetching user growth data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch user growth data' },
      { status: 500 }
    );
  }
}
