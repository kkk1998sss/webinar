import { NextResponse } from 'next/server';

import { decryptPassword } from '@/lib/encryption';
import { formatPhoneNumber } from '@/lib/formatNumber';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const requestBody = await req.text();
    if (!requestBody) {
      return NextResponse.json(
        { error: 'Request body is missing' },
        { status: 400 }
      );
    }

    const { phoneNumber, otp } = JSON.parse(requestBody);
    if (!phoneNumber || !otp) {
      return NextResponse.json(
        { error: 'Phone number and OTP are required' },
        { status: 400 }
      );
    }

    const formattedPhoneNumber = formatPhoneNumber(phoneNumber);
    const otpRecord = await prisma.otp.findFirst({
      where: { phoneNumber: formattedPhoneNumber },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'OTP not found or expired' },
        { status: 400 }
      );
    }

    const isExpired = otpRecord?.expires
      ? new Date() > otpRecord.expires
      : true;
    if (otpRecord.otp !== otp || isExpired) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    // OTP is valid → Delete OTP from the database
    await prisma.otp.delete({ where: { id: otpRecord.id } });

    const user = await prisma.user.findUnique({
      where: { phoneNumber: formattedPhoneNumber },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found. Please register first.' },
        { status: 404 }
      );
    }
    const decryptedPassword = user.password
      ? decryptPassword(user.password)
      : null;
    console.log('decryptPassword', decryptedPassword);

    return NextResponse.json({
      success: true,
      message: 'OTP verified successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image || null,
        isActive: user.isActive,
        password: decryptedPassword,
      },
    });
  } catch (error: unknown) {
    console.error('OTP Verification Error:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    );
  }
}
