import { NextResponse } from 'next/server';

import { encryptPassword } from '@/lib/encryption';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { email, newPassword } = await req.json();

    // Check if email exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'No user found with this email' },
        { status: 404 }
      );
    }

    // Encrypt the new password using the same encryption method used in login
    const encryptedPassword = encryptPassword(newPassword);

    // Update the user's password
    await prisma.user.update({
      where: { email },
      data: { password: encryptedPassword },
    });

    return NextResponse.json(
      { message: 'Password updated successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Password reset error:', error);
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    );
  }
}
