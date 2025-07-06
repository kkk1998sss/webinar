import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { videoUrl } = await request.json();

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'Video URL is required' },
        { status: 400 }
      );
    }

    // Handle YouTube links
    const ytMatch = videoUrl.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]+)/
    );
    if (ytMatch) {
      const videoId = ytMatch[1];

      // For YouTube, we'll use a simple approach to get duration
      // In production, you'd use the YouTube Data API with a proper API key
      const response = await fetch(
        `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
      );

      if (response.ok) {
        const data = await response.json();

        // Since oembed doesn't provide duration, we'll estimate based on title or use a default
        // In a real implementation, you'd use the YouTube Data API
        const estimatedDuration = 3600; // Default 1 hour

        return NextResponse.json({
          duration: estimatedDuration,
          title: data.title,
          provider: 'youtube',
        });
      }
    }

    // Handle Vimeo links
    const vimeoMatch = videoUrl.match(/vimeo\.com\/(\d+)/);
    if (vimeoMatch) {
      const videoId = vimeoMatch[1];
      const response = await fetch(
        `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}`
      );

      if (response.ok) {
        const data = await response.json();
        return NextResponse.json({
          duration: data.duration,
          title: data.title,
          provider: 'vimeo',
        });
      }
    }

    // Handle pCloud links (estimate duration)
    if (videoUrl.includes('pcloud.link')) {
      return NextResponse.json({
        duration: 3600, // Default 1 hour for pCloud videos
        title: 'pCloud Video',
        provider: 'pcloud',
      });
    }

    return NextResponse.json(
      { error: 'Unsupported video provider' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error fetching video metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video metadata' },
      { status: 500 }
    );
  }
}
