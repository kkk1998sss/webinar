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

    // For YouTube videos, generate thumbnail URL
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      const thumbnailUrl = generateYouTubeThumbnail(videoUrl);
      return NextResponse.json({
        success: true,
        thumbnailUrl,
        source: 'youtube',
      });
    }

    // For Zata AI videos, we can generate a thumbnail using the video URL
    if (videoUrl.includes('idr01.zata.ai')) {
      // For now, return the video URL as thumbnail (can be enhanced later)
      return NextResponse.json({
        success: true,
        thumbnailUrl: videoUrl,
        source: 'zata',
      });
    }

    // For other video URLs, try to generate a thumbnail
    // This is a placeholder - you might want to use a service like Cloudinary or similar
    return NextResponse.json({
      success: true,
      thumbnailUrl: videoUrl, // Fallback to video URL
      source: 'generic',
    });
  } catch (error) {
    console.error('Error generating thumbnail:', error);
    return NextResponse.json(
      { error: 'Failed to generate thumbnail' },
      { status: 500 }
    );
  }
}

function generateYouTubeThumbnail(videoUrl: string): string {
  let videoId = '';

  // Extract video ID from different YouTube URL formats
  if (videoUrl.includes('youtube.com/watch?v=')) {
    videoId = videoUrl.split('v=')[1]?.split('&')[0] || '';
  } else if (videoUrl.includes('youtu.be/')) {
    videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0] || '';
  } else if (videoUrl.includes('youtube.com/embed/')) {
    videoId = videoUrl.split('embed/')[1]?.split('?')[0] || '';
  }

  if (!videoId) {
    throw new Error('Could not extract YouTube video ID');
  }

  // Return high quality thumbnail URL
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
}
