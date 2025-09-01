import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET - Fetch all series
export async function GET() {
  try {
    const series = await prisma.series.findMany({
      include: {
        videos: {
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ success: true, series }, { status: 200 });
  } catch (error) {
    console.error('Error fetching series:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch series' },
      { status: 500 }
    );
  }
}

// POST - Create new series
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, thumbnail, isPublished, videos } = body;

    // Validate required fields
    if (!title || !description || !videos || videos.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Calculate total duration (if available)
    const totalDuration = videos.reduce(
      (sum: number, video: { duration?: number }) => {
        return sum + (video.duration || 0);
      },
      0
    );

    // Create series with videos in a transaction
    const series = await prisma.$transaction(async (tx) => {
      // Create the series
      const newSeries = await tx.series.create({
        data: {
          title,
          description,
          thumbnail,
          isPublished,
          totalVideos: videos.length,
          totalDuration: Math.ceil(totalDuration / 60), // Convert to minutes
        },
      });

      // Create videos
      const videoPromises = videos.map(
        (
          video: {
            title: string;
            description?: string;
            videoUrl: string;
            duration?: number;
          },
          index: number
        ) =>
          tx.seriesVideo.create({
            data: {
              title: video.title,
              description: video.description,
              videoUrl: video.videoUrl,
              orderIndex: index,
              seriesId: newSeries.id,
            },
          })
      );

      await Promise.all(videoPromises);

      // Return series with videos
      return await tx.series.findUnique({
        where: { id: newSeries.id },
        include: {
          videos: {
            orderBy: {
              orderIndex: 'asc',
            },
          },
        },
      });
    });

    return NextResponse.json({ success: true, series }, { status: 201 });
  } catch (error) {
    console.error('Error creating series:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create series' },
      { status: 500 }
    );
  }
}
