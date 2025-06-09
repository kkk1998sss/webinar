import { NextResponse } from 'next/server';

import { auth } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const ebooks = await prisma.eBook199.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ ebooks });
  } catch (error) {
    console.error('Error fetching ebooks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch ebooks' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await req.formData();
  const title = formData.get('title');
  const description = formData.get('description');
  const file = formData.get('file'); // Blob/File
  const thumbnail = formData.get('thumbnail'); // May be null

  try {
    let fileUrl = null;
    let fileType = null;
    let fileSize = null;

    if (file && file instanceof Blob) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      fileUrl = `data:${file.type};base64,${buffer.toString('base64')}`;
      fileType = file.type;
      fileSize = file.size;
    }

    const ebook = await prisma.eBook199.create({
      data: {
        title: typeof title === 'string' ? title : '',
        description: typeof description === 'string' ? description : '',
        fileUrl,
        fileType,
        fileSize,
        thumbnail: typeof thumbnail === 'string' ? thumbnail : null,
        isActive: true,
        downloads: 0,
      },
    });

    return NextResponse.json({ ebook });
  } catch (error) {
    console.error('Error creating ebook:', error);
    return NextResponse.json(
      { error: 'Failed to create ebook' },
      { status: 500 }
    );
  }
}
