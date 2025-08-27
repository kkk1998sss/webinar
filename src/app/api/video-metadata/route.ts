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
      console.log('🎬 Processing YouTube video:', videoId);

      try {
        // Method 1: Try to get duration from video page source
        const pageResponse = await fetch(
          `https://www.youtube.com/watch?v=${videoId}`,
          {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            },
          }
        );

        if (pageResponse.ok) {
          const pageHtml = await pageResponse.text();

          // Look for duration in the page source
          const durationMatch = pageHtml.match(/"lengthSeconds":"(\d+)"/);
          const titleMatch = pageHtml.match(/"title":"([^"]+)"/);

          if (durationMatch) {
            const duration = parseInt(durationMatch[1]);
            const title = titleMatch
              ? titleMatch[1].replace(/\\"/g, '"')
              : 'YouTube Video';

            console.log('✅ YouTube duration found:', {
              videoId,
              duration,
              durationFormatted: `${Math.floor(duration / 60)}m ${duration % 60}s`,
              title,
            });

            return NextResponse.json({
              duration,
              title,
              provider: 'youtube',
              method: 'page_source',
            });
          }
        }

        // Method 2: Fallback to oembed for title
        console.log('⚠️ Duration not found in page source, trying oembed...');
        const oembedResponse = await fetch(
          `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
        );

        if (oembedResponse.ok) {
          const data = await oembedResponse.json();

          // Try to extract duration from oembed response
          const oembedHtml = await oembedResponse.text();
          const oembedDurationMatch = oembedHtml.match(
            /"lengthSeconds":"(\d+)"/
          );

          if (oembedDurationMatch) {
            const duration = parseInt(oembedDurationMatch[1]);
            console.log('✅ YouTube duration found via oembed:', {
              videoId,
              duration,
              durationFormatted: `${Math.floor(duration / 60)}m ${duration % 60}s`,
              title: data.title,
            });

            return NextResponse.json({
              duration,
              title: data.title,
              provider: 'youtube',
              method: 'oembed',
            });
          }

          // If still no duration, return estimated duration with warning
          console.log('⚠️ No duration found, using estimated duration');
          return NextResponse.json({
            duration: 3600, // Default 1 hour
            title: data.title,
            provider: 'youtube',
            method: 'estimated',
            warning:
              'Duration not available, using estimated 1 hour. Consider using YouTube Data API for accurate duration.',
          });
        }
      } catch (error) {
        console.error('Error fetching YouTube metadata:', error);
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
