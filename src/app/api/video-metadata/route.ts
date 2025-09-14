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
        // Method 1: Try YouTube Data API v3 (most reliable)
        const apiKey = process.env.YOUTUBE_API_KEY;
        if (apiKey) {
          const apiResponse = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails,snippet&key=${apiKey}`
          );

          if (apiResponse.ok) {
            const data = await apiResponse.json();

            if (data.items && data.items.length > 0) {
              const video = data.items[0];
              const duration = video.contentDetails.duration;
              const title = video.snippet.title;

              // Parse ISO 8601 duration format (PT4M13S -> 253 seconds)
              const durationSeconds = parseDuration(duration);

              console.log('✅ YouTube duration found via API:', {
                videoId,
                duration: durationSeconds,
                durationFormatted: `${Math.floor(durationSeconds / 60)}m ${durationSeconds % 60}s`,
                title,
              });

              return NextResponse.json({
                duration: durationSeconds,
                title,
                provider: 'youtube',
                method: 'api_v3',
              });
            }
          }
        }

        // Method 2: Try to get duration from video page source (fallback)
        console.log('⚠️ API not available, trying page source scraping...');
        try {
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

              console.log('✅ YouTube duration found via page source:', {
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
        } catch (scrapingError) {
          console.log(
            '⚠️ Page source scraping failed:',
            scrapingError instanceof Error
              ? scrapingError.message
              : 'Unknown error'
          );
        }

        // Method 3: Fallback to oembed for title only (no duration)
        console.log('⚠️ All methods failed, trying oembed for title...');
        const oembedResponse = await fetch(
          `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`
        );

        if (oembedResponse.ok) {
          const data = await oembedResponse.json();

          console.log(
            '⚠️ Duration not available via oembed, using estimated duration'
          );
          return NextResponse.json({
            duration: 3600, // Default 1 hour
            title: data.title,
            provider: 'youtube',
            method: 'oembed_estimated',
            warning:
              'Duration not available. Add YOUTUBE_API_KEY environment variable for accurate duration.',
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

    // Handle other video URLs
    return NextResponse.json({
      duration: 3600, // Default 1 hour for unknown videos
      title: 'Video',
      provider: 'unknown',
    });

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

// Helper function to parse ISO 8601 duration format
function parseDuration(duration: string): number {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 3600; // Default 1 hour

  const hours = parseInt(match[1] || '0');
  const minutes = parseInt(match[2] || '0');
  const seconds = parseInt(match[3] || '0');

  return hours * 3600 + minutes * 60 + seconds;
}
