import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/prisma';

// Define types for Zata AI video objects
interface ZataVideo {
  id: string;
  name: string;
  url?: string;
  lastModified?: string;
}

interface ZataResponse {
  success: boolean;
  data?: ZataVideo[];
}

interface BucketVideo {
  id: string;
  title: string;
  description: string;
  videoUrl: string;
  day: number;
  createdAt: Date;
  source: string;
}

// GET: List all Four Day Plan videos (database + bucket)
export async function GET() {
  try {
    // Fetch database videos
    const dbVideos = await prisma.fourDayPlanVideo.findMany({
      orderBy: { day: 'asc' },
    });

    // Fetch bucket videos from shre3days bucket root folder only
    let bucketVideos: BucketVideo[] = [];
    try {
      console.log('🎬 Fetching videos from shre3days bucket root folder...');

      // Create a specific instance for shre3days bucket
      const shre3daysService = new (await import('@/lib/zata')).ZataService();
      // Override the bucket name to ensure we're using shre3days
      (shre3daysService as unknown as { bucketName: string }).bucketName =
        'shre3days';

      // Get videos from root folder only
      const zataResponse = (await shre3daysService.getVideosByFolder(
        ''
      )) as ZataResponse;

      console.log('📦 Zata response:', JSON.stringify(zataResponse, null, 2));

      if (zataResponse.success && zataResponse.data) {
        console.log(
          `📁 Found ${zataResponse.data.length} videos in root folder`
        );

        // Filter to only include video files and limit to reasonable number
        const videoFiles = zataResponse.data.filter((video: ZataVideo) => {
          const fileName = video.id.toLowerCase();
          return fileName.match(/\.(mp4|avi|mov|mkv|flv|webm|m4v)$/);
        });

        console.log(`🎬 Filtered to ${videoFiles.length} video files`);

        bucketVideos = videoFiles
          .slice(0, 10)
          .map((video: ZataVideo, index: number) => ({
            id: `bucket-${video.id}`, // Use video.id (which is the filename)
            title: video.name, // Use video.name (filename without extension)
            description: `Video from Zata AI bucket: ${video.id}`,
            videoUrl:
              video.url || `https://idr01.zata.ai/shre3days/${video.id}`, // Use signed URL if available
            day: index + 1,
            createdAt: new Date(video.lastModified || new Date().toISOString()),
            source: 'bucket',
          }));
        console.log(`✅ Processed ${bucketVideos.length} bucket videos`);
      } else {
        console.log('❌ No videos found in root folder or API failed');
      }
    } catch (bucketError) {
      console.warn('❌ Failed to fetch bucket videos:', bucketError);
      // Continue with database videos only
    }

    // Merge videos: prioritize Zata AI videos, fallback to database videos
    const allVideos = [...dbVideos];

    // Add bucket videos that don't conflict with database videos
    bucketVideos.forEach((bucketVideo) => {
      const existingVideo = dbVideos.find(
        (dbVideo) => dbVideo.day === bucketVideo.day
      );
      if (!existingVideo) {
        allVideos.push(bucketVideo);
      } else {
        // Update existing database video with Zata AI URL
        const videoIndex = allVideos.findIndex(
          (video) => video.day === bucketVideo.day
        );
        if (videoIndex !== -1) {
          allVideos[videoIndex] = {
            ...allVideos[videoIndex],
            zataVideoUrl: bucketVideo.videoUrl,
          } as (typeof allVideos)[0] & { zataVideoUrl: string };
        }
      }
    });

    // Sort by day
    allVideos.sort((a, b) => (a.day || 0) - (b.day || 0));

    return NextResponse.json({ videos: allVideos });
  } catch (error) {
    console.error('Error fetching four day plan videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

// POST: Create a new Four Day Plan video (admin only)
export async function POST(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, description, videoUrl, day } = await req.json();

    if (!title || !description || !videoUrl || !day) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const video = await prisma.fourDayPlanVideo.create({
      data: { title, description, videoUrl, day },
    });

    return NextResponse.json({ video }, { status: 201 });
  } catch (error) {
    console.error('Error creating four day plan video:', error);
    return NextResponse.json(
      { error: 'Failed to create video' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a Four Day Plan video (admin only)
export async function DELETE(req: NextRequest) {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json(
        { error: 'Video ID is required' },
        { status: 400 }
      );
    }

    await prisma.fourDayPlanVideo.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting four day plan video:', error);
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, title, description, videoUrl, day } = await req.json();
    if (!id) {
      return NextResponse.json(
        { success: false, message: 'ID is required' },
        { status: 400 }
      );
    }
    // Update in your DB (example with Prisma)
    const updated = await prisma.fourDayPlanVideo.update({
      where: { id },
      data: { title, description, videoUrl, day },
    });
    return NextResponse.json({ success: true, video: updated });
  } catch (error) {
    console.log('Error updating four day plan video:', error);

    return NextResponse.json(
      { success: false, message: 'Failed to update video' },
      { status: 500 }
    );
  }
}
