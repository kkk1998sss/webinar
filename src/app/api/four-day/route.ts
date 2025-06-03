import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/prisma';

// GET: List all Four Day Plan videos
export async function GET() {
  try {
    const videos = await prisma.fourDayPlanVideo.findMany({
      orderBy: { day: 'asc' },
    });
    return NextResponse.json({ videos });
  } catch (error) {
    console.error('Error fetching four day plan videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

// POST: Create a new Four Day Plan video (admin only)
export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, description, videoUrl, day } = await req.json();

    if (!title || !description || !videoUrl || !day) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const video = await prisma.fourDayPlanVideo.create({
      data: { title, description, videoUrl, day },
    });

    return NextResponse.json({ video }, { status: 201 });
  } catch (error) {
    console.error('Error creating four day plan video:', error);
    return NextResponse.json(
      { error: 'Failed to create video' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a Four Day Plan video (admin only)
export async function DELETE(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    await prisma.fourDayPlanVideo.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting four day plan video:', error);
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, title, description, videoUrl, day } = await req.json();
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID is required' },
        { status: 400 }
      );
    }
    // Update in your DB (example with Prisma)
    const updated = await prisma.fourDayPlanVideo.update({
      where: { id },
      data: { title, description, videoUrl, day },
    });
    return NextResponse.json({ success: true, video: updated });
  } catch (error) {
    console.log('Error updating four day plan video:', error);

    return NextResponse.json(
      { success: false, message: 'Failed to update video' },
      { status: 500 }
    );
  }
}
