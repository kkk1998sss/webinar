import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // const { id } = params;

    const webinar = await prisma.webinarDetails.findUnique({
      where: { id },
      include: {
        webinarSettings: true,
        video: true,
      },
    });

    if (!webinar) {
      return NextResponse.json(
        { success: false, error: 'Webinar not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, webinar }, { status: 200 });
  } catch (error) {
    console.error('Error fetching webinar:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch webinar' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();

    const updatedWebinar = await prisma.webinarDetails.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ success: true, updatedWebinar });
  } catch (error) {
    console.error('Error updating webinar:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update webinar' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const deletedWebinar = await prisma.webinarDetails.delete({
      where: { id },
    });

    if (deletedWebinar.webinarSettingsId) {
      await prisma.webinarSettings.delete({
        where: { id: deletedWebinar.webinarSettingsId },
      });
    }

    return NextResponse.json({ success: true, deletedWebinar });
  } catch (error) {
    console.error('Error deleting webinar:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete webinar' },
      { status: 500 }
    );
  }
}
