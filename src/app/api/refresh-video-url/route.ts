import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const videoUrl = searchParams.get('videoUrl');

    if (!videoUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'Video URL is required',
        },
        { status: 400 }
      );
    }

    // Check if it's a Zata AI video
    if (!videoUrl.includes('zata.ai')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Not a Zata AI video',
        },
        { status: 400 }
      );
    }

    // Extract the base video path from the URL
    const url = new URL(videoUrl);
    const basePath = url.pathname;

    // Make a request to Zata AI to get a fresh signed URL
    // This would typically involve calling your Zata AI API or service
    // For now, we'll return the same URL as a fallback
    // You'll need to implement the actual Zata AI API call here

    console.log('Attempting to refresh Zata AI video URL:', basePath);

    // TODO: Implement actual Zata AI API call to get fresh signed URL
    // This is a placeholder - you'll need to replace this with your actual Zata AI API integration

    // For now, return an error indicating the video is unavailable
    return NextResponse.json(
      {
        success: false,
        error: 'Video URL refresh not implemented yet. Please contact support.',
      },
      { status: 503 }
    );
  } catch (error) {
    console.error('Error refreshing video URL:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { videoUrl } = await request.json();

    if (!videoUrl) {
      return NextResponse.json(
        { success: false, error: 'Video URL is required' },
        { status: 400 }
      );
    }

    console.log('Refreshing video URL:', videoUrl);

    // Check if this is a Zata AI video
    if (videoUrl.includes('zata.ai')) {
      try {
        // Extract the video path from the URL
        const urlParts = videoUrl.split('?')[0]; // Remove query parameters
        const videoPath = urlParts.split('zata.ai/')[1]; // Get path after domain

        console.log('Extracted video path:', videoPath);

        // Call Zata AI API to get a fresh signed URL
        // Note: You'll need to implement the actual Zata AI API call here
        // For now, we'll return the original URL and let the client handle the fallback

        // TODO: Replace this with actual Zata AI API call
        // const zataResponse = await fetch('https://api.zata.ai/refresh-url', {
        //   method: 'POST',
        //   headers: {
        //     'Authorization': `Bearer ${process.env.ZATA_API_KEY}`,
        //     'Content-Type': 'application/json'
        //   },
        //   body: JSON.stringify({ videoPath })
        // });

        // For now, return failure so client can use YouTube fallback
        return NextResponse.json({
          success: false,
          error: 'Zata AI URL refresh not implemented yet. Using fallback.',
        });
      } catch (error) {
        console.error('Error refreshing Zata AI URL:', error);
        return NextResponse.json({
          success: false,
          error: 'Failed to refresh Zata AI URL',
        });
      }
    }

    // For non-Zata AI videos, return success with original URL
    return NextResponse.json({
      success: true,
      newUrl: videoUrl,
    });
  } catch (error) {
    console.error('Error refreshing video URL:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
