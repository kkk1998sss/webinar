import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Get total users
    const totalUsers = await prisma.user.count();

    // Get active users (users with active subscriptions)
    const activeUsers = await prisma.user.count({
      where: {
        isActive: true,
      },
    });

    // Get total webinars
    const totalWebinars = await prisma.webinarDetails.count();

    // Get upcoming webinars (webinars scheduled for future dates)
    const upcomingWebinars = await prisma.webinarDetails.count({
      where: {
        webinarDate: {
          gt: new Date(),
        },
      },
    });

    // Calculate user growth (using subscription dates instead)
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    const lastMonthUsers = await prisma.subscription.count({
      where: {
        startDate: {
          lt: lastMonth,
        },
      },
    });
    const userGrowth =
      lastMonthUsers > 0
        ? Math.round(((totalUsers - lastMonthUsers) / lastMonthUsers) * 100)
        : 0;

    // Calculate webinar growth
    const lastMonthWebinars = await prisma.webinarDetails.count({
      where: {
        createdAt: {
          lt: lastMonth,
        },
      },
    });
    const webinarGrowth =
      lastMonthWebinars > 0
        ? Math.round(
            ((totalWebinars - lastMonthWebinars) / lastMonthWebinars) * 100
          )
        : 0;

    // Get subscription plan counts
    const plan199Count = await prisma.payment.count({
      where: {
        planType: 'FOUR_DAY',
        status: 'captured',
      },
    });

    const plan599Count = await prisma.payment.count({
      where: {
        planType: 'SIX_MONTH',
        status: 'captured',
      },
    });

    // Calculate total revenue
    const totalRevenue = await prisma.payment.aggregate({
      where: {
        status: 'captured',
      },
      _sum: {
        amount: true,
      },
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalWebinars,
        upcomingWebinars,
        userGrowth,
        webinarGrowth,
        plan199Count,
        plan599Count,
        totalRevenue: totalRevenue._sum.amount || 0,
      },
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
