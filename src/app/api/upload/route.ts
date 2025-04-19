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

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width?: number;
  height?: number;
  format?: string;
  resource_type?: string;
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;

    if (!file || !title) {
      return NextResponse.json(
        { error: 'Missing file or title' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const stream = Readable.from(buffer);

    const uploadPromise = () =>
      new Promise<CloudinaryUploadResult>((resolve, reject) => {
        const cloudinaryStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'video',
            folder: 'webinars',
          },
          (error, result) => {
            if (error) return reject(error);
            if (!result) return reject(new Error('Upload failed'));
            resolve(result);
          }
        );
        stream.pipe(cloudinaryStream);
      });

    const result = await uploadPromise();

    const saved = await prisma.video.create({
      data: {
        title,
        url: result.secure_url,
        publicId: result.public_id,
      },
    });

    return NextResponse.json({
      message: 'Uploaded successfully',
      video: saved,
    });
  } catch (error) {
    console.error('Video upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
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
