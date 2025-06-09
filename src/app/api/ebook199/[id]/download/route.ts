import { NextRequest, NextResponse } from 'next/server';

import { auth } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/prisma';

export async function POST(
  request: NextRequest,
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

    if (!ebook.fileUrl || !ebook.fileType) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Increment download count
    await prisma.eBook199.update({
      where: { id },
      data: { downloads: { increment: 1 } },
    });

    // Get file extension
    const fileExtension = ebook.fileType.split('/')[1] || 'pdf';

    // Fetch the file from the URL
    const response = await fetch(ebook.fileUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch file');
    }

    const blob = await response.blob();
    return new NextResponse(blob, {
      headers: {
        'Content-Type': ebook.fileType,
        'Content-Disposition': `attachment; filename="${ebook.title}.${fileExtension}"`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
    });
  } catch (error) {
    console.error('Error downloading ebook:', error);
    return NextResponse.json(
      { error: 'Failed to download ebook' },
      { status: 500 }
    );
  }
}
