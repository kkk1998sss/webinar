import { NextResponse } from 'next/server';

import { auth } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/prisma';

interface UpdateEBookData {
  title: string;
  description: string;
  isActive: boolean;
  fileUrl?: string;
  fileSize?: number;
  fileType?: string;
  thumbnail?: string;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const ebook = await prisma.eBook199.findUnique({
      where: { id },
    });

    if (!ebook) {
      return NextResponse.json({ error: 'Ebook not found' }, { status: 404 });
    }

    return NextResponse.json({ ebook });
  } catch (error) {
    console.error('Error fetching ebook:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ebook' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const formData = await request.formData();
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const file = formData.get('file') as File;
    const thumbnail = formData.get('thumbnail') as File;
    const isActive = formData.get('isActive') === 'true';

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updateData: UpdateEBookData = {
      title,
      description,
      isActive,
    };

    // Only update file if a new one is provided
    if (file) {
      const fileBuffer = await file.arrayBuffer();
      const fileBase64 = Buffer.from(fileBuffer).toString('base64');
      updateData.fileUrl = `data:${file.type};base64,${fileBase64}`;
      updateData.fileSize = file.size;
      updateData.fileType = file.type;
    }

    // Only update thumbnail if a new one is provided
    if (thumbnail) {
      const thumbnailBuffer = await thumbnail.arrayBuffer();
      const thumbnailBase64 = Buffer.from(thumbnailBuffer).toString('base64');
      updateData.thumbnail = `data:${thumbnail.type};base64,${thumbnailBase64}`;
    }

    const ebook = await prisma.eBook199.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ ebook });
  } catch (error) {
    console.error('Error updating ebook:', error);
    return NextResponse.json(
      { error: 'Failed to update ebook' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    await prisma.eBook199.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting ebook:', error);
    return NextResponse.json(
      { error: 'Failed to delete ebook' },
      { status: 500 }
    );
  }
}
