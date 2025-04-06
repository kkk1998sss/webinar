import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const webinar = await prisma.webinarSettings.findUnique({
      where: { id: body.webinarId },
    });

    if (!webinar) {
      return NextResponse.json(
        { success: false, error: 'Webinar not found' },
        { status: 404 }
      );
    }

    const webinarSettings = await prisma.webinarSettings.update({
      where: { id: body.webinarId },
      data: {
        emailNotifications: body.emailNotifications,
        textNotifications: body.textNotifications,
        integration: body.integration,
        sharingEnabled: body.sharingEnabled,
        sharingName: body.sharingName,
        sharingUrl: body.sharingUrl,
      },
    });

    return NextResponse.json(
      { success: true, webinarSettings },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating webinar settings:', error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const updatedSettings = await prisma.webinarSettings.update({
      where: { id: body.webinarId },
      data: {
        emailNotifications: body.emailNotifications,
        textNotifications: body.textNotifications,
        integration: body.integration,
        sharingEnabled: body.sharingEnabled,
        sharingName: body.sharingName,
        sharingUrl: body.sharingUrl,
      },
    });

    return NextResponse.json(
      { success: true, updatedSettings },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error updating webinar settings:', error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { webinarId } = await req.json();

    await prisma.webinarSettings.delete({
      where: { id: webinarId },
    });

    return NextResponse.json(
      { success: true, message: 'Webinar settings deleted' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting webinar settings:', error);
    return NextResponse.json({ success: false, error: error }, { status: 500 });
  }
}
