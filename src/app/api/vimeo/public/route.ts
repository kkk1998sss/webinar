import { NextRequest, NextResponse } from 'next/server';

import { vimeoService } from '@/lib/vimeo';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '50');

    // Fetch videos from Vimeo (public access)
    const videos = await vimeoService.getVideos(page, perPage);

    return NextResponse.json({
      success: true,
      data: videos,
    });
  } catch (error: unknown) {
    console.error('Error fetching public Vimeo videos:', error);

    let errorMessage = 'Failed to fetch videos';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
