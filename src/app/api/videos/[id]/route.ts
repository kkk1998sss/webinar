import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const video = await prisma.video.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        url: true,
        publicId: true,
        createdAt: true,
        webinarDetails: {
          select: {
            webinarName: true,
            webinarTitle: true,
          },
        },
      },
    });

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    const transformedVideo = {
      id: video.id,
      title: video.title,
      url: video.url,
      publicId: video.publicId,
      createdAt: video.createdAt.toISOString(),
      webinarDetails: video.webinarDetails
        ? {
            webinarName: video.webinarDetails.webinarName,
            webinarTitle: video.webinarDetails.webinarTitle,
          }
        : undefined,
    };

    return NextResponse.json({ success: true, video: transformedVideo });
  } catch (error) {
    console.error('Error fetching video:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { title, webinarDetailsId } = body;

    const video = await prisma.video.update({
      where: { id },
      data: {
        title,
        webinarDetails: webinarDetailsId
          ? {
              connect: { id: webinarDetailsId },
            }
          : undefined,
      },
    });

    return NextResponse.json({ success: true, video });
  } catch (error) {
    console.error('Error updating video:', error);
    return NextResponse.json(
      { error: 'Failed to update video' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    await prisma.video.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting video:', error);
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 }
    );
  }
}
