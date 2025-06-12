import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Get recent user registrations
    const recentUsers = await prisma.user.findMany({
      take: 2,
      orderBy: {
        id: 'desc',
      },
      select: {
        name: true,
        id: true,
      },
    });

    // Get recent webinar creations
    const recentWebinars = await prisma.webinarDetails.findMany({
      take: 2,
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        webinarName: true,
        webinarTitle: true,
        createdAt: true,
      },
    });

    // Combine and format activities
    const activities = [
      ...recentUsers.map((user) => ({
        user: user.name,
        action: 'registered for a webinar',
        time: 'recently',
        color: 'bg-green-500',
      })),
      ...recentWebinars.map((webinar) => ({
        user: webinar.webinarName,
        action: 'created a new webinar',
        time: formatTimeAgo(webinar.createdAt),
        color: 'bg-blue-500',
      })),
    ].sort((a, b) => {
      if (a.time === 'recently' && b.time === 'recently') return 0;
      if (a.time === 'recently') return -1;
      if (b.time === 'recently') return 1;
      const timeA = new Date(a.time).getTime();
      const timeB = new Date(b.time).getTime();
      return timeB - timeA;
    });

    return NextResponse.json({
      success: true,
      activities,
    });
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recent activity' },
      { status: 500 }
    );
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  return date.toLocaleDateString();
}
