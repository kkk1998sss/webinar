import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { error: 'Invalid or missing token' },
        { status: 400 }
      );
    }

    const verificationRecord = await prisma.verificationToken.findFirst({
      where: { token },
    });

    if (!verificationRecord || new Date() > verificationRecord.expires) {
      return NextResponse.json(
        { error: 'Token expired or invalid' },
        { status: 400 }
      );
    }

    await prisma.user.update({
      where: { id: verificationRecord.userId ?? undefined },
      data: { isActive: true },
    });

    await prisma.verificationToken.delete({
      where: { id: verificationRecord.id },
    });

    console.log('✅ Email Verified Successfully!');

    return NextResponse.json({
      message: 'Email verified successfully. You can now log in.',
    });
  } catch (error: unknown) {
    console.error('Verification error:', error);

    let errorMessage = 'Verification failed';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
