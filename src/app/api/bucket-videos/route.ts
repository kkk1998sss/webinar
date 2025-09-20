import { NextResponse } from 'next/server';

import { auth } from '@/app/api/auth/[...nextauth]/auth-options';

// Define types for Zata AI video objects
interface ZataVideo {
  id: string;
  name: string;
  url?: string;
  thumbnailUrl?: string;
  lastModified?: string;
}

interface ZataResponse {
  success: boolean;
  data?: ZataVideo[];
}

interface BucketVideo {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  lastModified: string;
}

// GET: Fetch videos from shrelivewebinars bucket
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🎬 Fetching videos from shrelivewebinars bucket...');

    // Create a specific instance for shrelivewebinars bucket
    const shrelivewebinarsService = new (
      await import('@/lib/zata')
    ).ZataService();
    // Override the bucket name to ensure we're using shrelivewebinars
    (shrelivewebinarsService as unknown as { bucketName: string }).bucketName =
      'shrelivewebinars';

    // Get videos from root folder
    const zataResponse = (await shrelivewebinarsService.getVideosByFolder(
      ''
    )) as ZataResponse;

    console.log('📦 Zata response:', JSON.stringify(zataResponse, null, 2));

    if (zataResponse.success && zataResponse.data) {
      console.log(`📁 Found ${zataResponse.data.length} videos in root folder`);

      // Filter to only include video files
      const videoFiles = zataResponse.data.filter((video: ZataVideo) => {
        const fileName = video.id.toLowerCase();
        return fileName.match(/\.(mp4|avi|mov|mkv|flv|webm|m4v)$/);
      });

      console.log(`🎬 Filtered to ${videoFiles.length} video files`);

      const bucketVideos: BucketVideo[] = videoFiles.map(
        (video: ZataVideo) => ({
          id: video.id,
          title: video.name,
          url:
            video.url || `https://idr01.zata.ai/shrelivewebinars/${video.id}`,
          thumbnailUrl:
            video.thumbnailUrl ||
            video.url ||
            `https://idr01.zata.ai/shrelivewebinars/${video.id}`,
          lastModified: video.lastModified || new Date().toISOString(),
        })
      );

      console.log(`✅ Processed ${bucketVideos.length} bucket videos`);

      return NextResponse.json({
        success: true,
        videos: bucketVideos,
      });
    } else {
      console.log('❌ No videos found in root folder or API failed');
      return NextResponse.json({
        success: true,
        videos: [],
      });
    }
  } catch (error) {
    console.error('Error fetching bucket videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}
