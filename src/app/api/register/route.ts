import crypto from 'crypto';
import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

import { encryptPassword } from '@/lib/encryption';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { name, email, phoneNumber, password } = await req.json();

    if (!name || !email || !phoneNumber || !password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { phoneNumber }] },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or phone number already exists' },
        { status: 409 }
      );
    }

    const encryptedPassword = encryptPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        phoneNumber,
        password: encryptedPassword,
        isActive: false,
      },
    });

    const verificationToken = crypto.randomBytes(32).toString('hex');

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires: new Date(Date.now() + 5 * 60 * 60 * 24),
        userId: user.id,
      },
    });

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER,
      port: 587,
      secure: false, // Use true for port 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/verify?token=${verificationToken}`;

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Confirm Your Registration',
      html: `<p>Welcome, ${name}!</p>
                <p>Click <a href="${verificationLink}">here</a> to verify your email.</p>
                <p>If you did not sign up, please ignore this email.</p>`,
    });

    return NextResponse.json(
      {
        message:
          'User registered. Please check your email to verify your account.',
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error('Error in registration:', error);

    let errorMessage = 'Registration failed';

    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
