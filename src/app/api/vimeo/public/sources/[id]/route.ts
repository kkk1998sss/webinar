import { NextRequest, NextResponse } from 'next/server';

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

    // Try different Vimeo video URL patterns
    const videoUrls = [
      `https://player.vimeo.com/external/${videoId}.hd.mp4?s=hash&profile_id=174`,
      `https://player.vimeo.com/external/${videoId}.sd.mp4?s=hash&profile_id=174`,
      `https://player.vimeo.com/external/${videoId}.mp4?s=hash&profile_id=174`,
    ];

    // Return the video URLs for the player to try
    return NextResponse.json({
      success: true,
      data: {
        videoId,
        sources: videoUrls.map((url, index) => ({
          src: url,
          type: 'video/mp4',
          quality: index === 0 ? 'hd' : index === 1 ? 'sd' : 'auto',
          label: index === 0 ? 'HD' : index === 1 ? 'SD' : 'Auto',
        })),
        embedUrl: `https://player.vimeo.com/video/${videoId}`,
      },
    });
  } catch (error) {
    console.error('Error fetching video sources:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video sources' },
      { status: 500 }
    );
  }
}
