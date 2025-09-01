import { PrismaClient } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

const prisma = new PrismaClient();

// GET - Fetch specific series by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const series = await prisma.series.findUnique({
      where: { id },
      include: {
        videos: {
          orderBy: {
            orderIndex: 'asc',
          },
        },
      },
    });

    if (!series) {
      return NextResponse.json(
        { success: false, error: 'Series not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, series }, { status: 200 });
  } catch (error) {
    console.error('Error fetching series:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch series' },
      { status: 500 }
    );
  }
}

// PUT - Update series
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { title, description, thumbnail, isPublished, videos } = body;

    // Calculate total duration (if available)
    const totalDuration =
      videos?.reduce((sum: number, video: { duration?: number }) => {
        return sum + (video.duration || 0);
      }, 0) || 0;

    const series = await prisma.$transaction(async (tx) => {
      // Update the series
      await tx.series.update({
        where: { id },
        data: {
          title,
          description,
          thumbnail,
          isPublished,
          totalVideos: videos?.length || 0,
          totalDuration: Math.ceil(totalDuration / 60), // Convert to minutes
        },
      });

      // If videos are provided, update them
      if (videos) {
        // Delete existing videos
        await tx.seriesVideo.deleteMany({
          where: { seriesId: id },
        });

        // Create new videos
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
                seriesId: id,
              },
            })
        );

        await Promise.all(videoPromises);
      }

      // Return updated series with videos
      return await tx.series.findUnique({
        where: { id },
        include: {
          videos: {
            orderBy: {
              orderIndex: 'asc',
            },
          },
        },
      });
    });

    return NextResponse.json({ success: true, series }, { status: 200 });
  } catch (error) {
    console.error('Error updating series:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update series' },
      { status: 500 }
    );
  }
}

// DELETE - Delete series
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Delete series (videos will be cascade deleted due to schema relationship)
    await prisma.series.delete({
      where: { id },
    });

    return NextResponse.json(
      { success: true, message: 'Series deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting series:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete series' },
      { status: 500 }
    );
  }
}
