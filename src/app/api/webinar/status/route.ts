import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

export async function PUT(request: NextRequest) {
  try {
    const { webinarId, status } = await request.json();

    if (!webinarId || !status) {
      return NextResponse.json(
        { error: 'Webinar ID and status are required' },
        { status: 400 }
      );
    }

    // Update the webinar status
    const updatedWebinar = await prisma.webinarSettings.updateMany({
      where: {
        webinarDetails: {
          id: webinarId,
        },
      },
      data: {
        status: status,
      },
    });

    console.log(`✅ Webinar ${webinarId} status updated to: ${status}`);

    return NextResponse.json({
      success: true,
      message: `Webinar status updated to ${status}`,
      updatedCount: updatedWebinar.count,
    });
  } catch (error) {
    console.error('❌ Error updating webinar status:', error);
    return NextResponse.json(
      { error: 'Failed to update webinar status' },
      { status: 500 }
    );
  }
}
