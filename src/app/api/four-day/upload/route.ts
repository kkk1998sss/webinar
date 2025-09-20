import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/app/api/auth/[...nextauth]/auth-options';
import { zataService } from '@/lib/zata';

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('🎬 Uploading Four Day Plan video to Zata AI Cloud...');

    const formData = await request.formData();
    const file = formData.get('file') as File;

    console.log(
      `🔍 File received: ${file?.name}, type: ${file?.type}, size: ${file?.size}`
    );

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'video/mp4',
      'video/avi',
      'video/mov',
      'video/mkv',
      'video/flv',
      'video/webm',
    ];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only video files are allowed.' },
        { status: 400 }
      );
    }

    // Convert file to buffer with error handling
    let buffer: Buffer;
    try {
      buffer = Buffer.from(await file.arrayBuffer());
    } catch (error) {
      console.error('❌ Error converting file to buffer:', error);
      return NextResponse.json(
        { error: 'Failed to process file. Please try a smaller file.' },
        { status: 400 }
      );
    }

    // Upload to Zata AI Cloud in the dedicated folder
    const folderPath = 'four-day-plan-videos';
    const result = await zataService.uploadVideo(
      buffer,
      file.name,
      file.type,
      folderPath
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to upload video' },
        { status: 500 }
      );
    }

    // Return the full video URL
    const videoUrl = `https://idr01.zata.ai/${process.env.ZATA_BUCKET_NAME || 'shre3days'}/${result.videoId}`;

    return NextResponse.json({
      success: true,
      message: 'Video uploaded successfully',
      videoId: result.videoId,
      videoUrl: videoUrl,
    });
  } catch (error) {
    console.error('❌ Error uploading Four Day Plan video:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
