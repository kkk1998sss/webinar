import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🔍 API: Fetching webinar with ID:', id);

    // Test database connection first
    try {
      await prisma.$connect();
      console.log('✅ Database connection successful');
    } catch (dbError) {
      console.error('❌ Database connection failed:', dbError);
      return NextResponse.json(
        { success: false, error: 'Database connection failed' },
        { status: 500 }
      );
    }

    // Check if the ID is valid
    if (!id || typeof id !== 'string') {
      console.error('❌ Invalid ID provided:', id);
      return NextResponse.json(
        { success: false, error: 'Invalid ID provided' },
        { status: 400 }
      );
    }

    console.log('🔍 Querying database for webinar...');
    const webinar = await prisma.webinarDetails.findUnique({
      where: { id },
      include: {
        webinarSettings: true,
        video: true,
      },
    });

    console.log(
      '🔍 Query result:',
      webinar ? 'Webinar found' : 'Webinar not found'
    );

    if (!webinar) {
      return NextResponse.json(
        { success: false, error: 'Webinar not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, webinar }, { status: 200 });
  } catch (error) {
    console.error('❌ Error fetching webinar:', error);

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes('prisma')) {
        return NextResponse.json(
          { success: false, error: 'Database error occurred' },
          { status: 500 }
        );
      }
      if (error.message.includes('connection')) {
        return NextResponse.json(
          { success: false, error: 'Database connection failed' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: 'Failed to fetch webinar' },
      { status: 500 }
    );
  } finally {
    // Always disconnect from database
    try {
      await prisma.$disconnect();
    } catch (disconnectError) {
      console.error(
        'Warning: Failed to disconnect from database:',
        disconnectError
      );
    }
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
