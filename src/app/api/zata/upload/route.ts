import { NextRequest, NextResponse } from 'next/server';

import { zataService } from '@/lib/zata';

export async function POST(request: NextRequest) {
  try {
    console.log('🎬 Uploading video to Zata AI Cloud...');

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

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Upload to Zata AI Cloud
    const result = await zataService.uploadVideo(buffer, file.name, file.type);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to upload video' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Video uploaded successfully',
      videoId: result.videoId,
    });
  } catch (error) {
    console.error('❌ Error uploading video:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
