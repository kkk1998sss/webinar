import { NextResponse } from 'next/server';

import { auth } from '@/app/api/auth/[...nextauth]/auth-options';
import prisma from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ebook = await prisma.eBook.findUnique({
      where: { id },
    });

    if (!ebook) {
      return NextResponse.json({ error: 'E-book not found' }, { status: 404 });
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
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    const data = await req.json();
    const { title, description, fileUrl, fileType, thumbnail, isActive } = data;

    const ebook = await prisma.eBook.update({
      where: {
        id: id,
      },
      data: {
        title,
        description,
        fileUrl,
        fileType,
        thumbnail,
        isActive,
      },
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
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();

  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await params;
    await prisma.eBook.delete({
      where: {
        id: id,
      },
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
