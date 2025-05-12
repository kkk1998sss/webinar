import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const videos = await prisma.video.findMany({
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform the data to match the frontend type
    const transformedVideos = videos.map((video) => ({
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
    }));

    return NextResponse.json({ success: true, videos: transformedVideos });
  } catch (error) {
    console.error('Error fetching videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, url, publicId, webinarDetailsId } = body;

    const video = await prisma.video.create({
      data: {
        title,
        url,
        publicId,
        webinarDetails: webinarDetailsId
          ? {
              connect: { id: webinarDetailsId },
            }
          : undefined,
      },
    });

    return NextResponse.json({ success: true, video });
  } catch (error) {
    console.error('Error creating video:', error);
    return NextResponse.json(
      { error: 'Failed to create video' },
      { status: 500 }
    );
  }
}
