import { NextRequest, NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const ebook = await prisma.eBook.findUnique({
      where: { id },
    });

    if (!ebook) {
      return NextResponse.json({ error: 'Ebook not found' }, { status: 404 });
    }

    if (!ebook.fileUrl) {
      return NextResponse.json(
        { error: 'File not available' },
        { status: 404 }
      );
    }

    // Increment download count
    await prisma.eBook.update({
      where: { id },
      data: { downloads: ebook.downloads + 1 },
    });

    // Convert base64 data URL to buffer
    const base64Data = ebook.fileUrl.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': ebook.fileType || 'application/pdf',
        'Content-Disposition': `attachment; filename="${ebook.title}.pdf"`,
        'Content-Length': buffer.length.toString(),
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
