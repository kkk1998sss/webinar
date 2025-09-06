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

    const video = await vimeoService.getVideo(videoId);

    return NextResponse.json({
      success: true,
      data: video,
    });
  } catch (error: unknown) {
    console.error('Error fetching Vimeo video:', error);

    let errorMessage = 'Failed to fetch video';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
