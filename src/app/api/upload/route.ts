import { Readable } from 'stream';
import { v2 as cloudinary } from 'cloudinary';
import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

// Chunk size for streaming (100MB)
const CHUNK_SIZE = 100 * 1024 * 1024;

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Create a readable stream from the buffer
    const stream = Readable.from(buffer);

    // Upload to Cloudinary using streaming
    const uploadPromise = new Promise<CloudinaryUploadResult>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'video',
            chunk_size: CHUNK_SIZE,
            eager: [
              { format: 'mp4', quality: 'auto' },
              { format: 'webm', quality: 'auto' },
            ],
            eager_async: true,
            public_id: `videos/${Date.now()}_${title}`,
          },
          (error, result) => {
            if (error) reject(error);
            else if (result) resolve(result as CloudinaryUploadResult);
            else reject(new Error('Upload failed'));
          }
        );

        stream.pipe(uploadStream);
      }
    );

    const result = await uploadPromise;

    const saved = await prisma.video.create({
      data: {
        title,
        url: result.secure_url,
        publicId: result.public_id,
      },
    });

    return NextResponse.json({
      success: true,
      video: saved,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload video' },
      { status: 500 }
    );
  }
}

interface DeleteRequest {
  publicId: string;
}

export async function DELETE(req: Request) {
  try {
    const body: DeleteRequest = await req.json();
    const { publicId } = body;

    console.log('Deleting from Cloudinary publicId:', publicId);

    if (!publicId) {
      return NextResponse.json({ error: 'Missing publicId' }, { status: 400 });
    }

    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: 'video',
    });

    console.log('Cloudinary delete result:', result);

    return NextResponse.json({
      message: 'Video deleted from Cloudinary successfully',
    });
  } catch (error) {
    console.error('Video delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 }
    );
  }
}
