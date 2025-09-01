import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

// POST - Add new video to existing series
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: seriesId } = await params;
    const body = await req.json();
    const { title, description, videoUrl, duration } = body;

    // Validate required fields
    if (!title || !videoUrl) {
      return NextResponse.json(
        { success: false, error: 'Title and video URL are required' },
        { status: 400 }
      );
    }

    // Validate series exists
    const series = await prisma.series.findUnique({
      where: { id: seriesId },
      include: {
        videos: {
          orderBy: {
            orderIndex: 'desc',
          },
          take: 1,
        },
      },
    });

    if (!series) {
      return NextResponse.json(
        { success: false, error: 'Series not found' },
        { status: 404 }
      );
    }

    // Calculate next order index
    const nextOrderIndex =
      series.videos.length > 0 ? series.videos[0].orderIndex + 1 : 0;

    // Create new video in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the new video
      const newVideo = await tx.seriesVideo.create({
        data: {
          title,
          description: description || '',
          videoUrl,
          duration: duration || null,
          orderIndex: nextOrderIndex,
          seriesId,
        },
      });

      // Update series total video count and duration
      const updatedSeries = await tx.series.update({
        where: { id: seriesId },
        data: {
          totalVideos: {
            increment: 1,
          },
          totalDuration: {
            increment: duration ? Math.ceil(duration / 60) : 0, // Convert seconds to minutes
          },
        },
        include: {
          videos: {
            orderBy: {
              orderIndex: 'asc',
            },
          },
        },
      });

      return { newVideo, updatedSeries };
    });

    return NextResponse.json(
      {
        success: true,
        video: result.newVideo,
        series: result.updatedSeries,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding video to series:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add video to series' },
      { status: 500 }
    );
  }
}
