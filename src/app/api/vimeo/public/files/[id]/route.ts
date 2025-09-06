import { NextRequest, NextResponse } from 'next/server';
import { vimeoService } from '@/lib/vimeo';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: videoId } = await params;

    if (!videoId) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    // Get video details with files
    const video = await vimeoService.getVideo(videoId);

    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    // Return video files for streaming
    return NextResponse.json({
      success: true,
      data: {
        videoId,
        name: video.name,
        files: video.files || [],
        download: video.download || [],
        poster: video.pictures?.sizes?.[video.pictures.sizes.length - 1]?.link,
        duration: video.duration,
      },
    });
  } catch (error) {
    console.error('Error fetching video files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video files' },
      { status: 500 }
    );
  }
}
