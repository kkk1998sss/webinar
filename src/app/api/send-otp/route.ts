import crypto from 'crypto';
import { NextResponse } from 'next/server';
import Twilio from 'twilio';

import { formatPhoneNumber } from '@/lib/formatNumber';
import prisma from '@/lib/prisma';

const twilioClient = Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

export async function POST(req: Request) {
  try {
    const { phoneNumber } = await req.json();
    if (!phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);

    const otp = crypto.randomInt(100000, 999999).toString();
    const expires = new Date(Date.now() + 100 * 60 * 1000);

    await prisma.otp.upsert({
      where: { phoneNumber: formattedPhone },
      update: { otp, expires },
      create: { phoneNumber: formattedPhone, otp, expires },
    });

    await twilioClient.messages.create({
      body: `Your OTP code is: ${otp}`,
      from: TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });

    return NextResponse.json({ message: 'OTP sent successfully' });
  } catch (error) {
    console.error('Error sending OTP:', error);
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 });
  }
}
