import { NextResponse } from 'next/server';

import { auth } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  // Check if user is authenticated
  if (!session?.user) {
    return NextResponse.json(
      { success: false, message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { id } = await params;
    const ebook = await prisma.eBook.findUnique({
      where: { id },
    });

    if (!ebook) {
      return NextResponse.json(
        { success: false, message: 'E-book not found' },
        { status: 404 }
      );
    }

    if (!ebook.fileUrl || !ebook.fileType) {
      return NextResponse.json(
        { success: false, message: 'File not found' },
        { status: 404 }
      );
    }

    // Increment download count
    await prisma.eBook.update({
      where: { id },
      data: { downloads: { increment: 1 } },
    });

    // Get file extension
    const fileExtension = ebook.fileType.split('/')[1] || 'pdf';

    // Return the base64 data
    return new NextResponse(ebook.fileUrl, {
      headers: {
        'Content-Type': ebook.fileType,
        'Content-Disposition': `attachment; filename="${ebook.title}.${fileExtension}"`,
      },
    });
  } catch (error) {
    console.error('Error downloading e-book:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to download e-book' },
      { status: 500 }
    );
  }
}
