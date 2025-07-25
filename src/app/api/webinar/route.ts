import { Prisma } from '@prisma/client';
import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

interface ResourceInput {
  name: string;
  url: string;
  type?: 'pdf' | 'doc' | 'docx' | 'jpg' | 'jpeg' | 'png' | 'ppt' | 'pptx';
  publicId?: string;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('body', body);

    // Validate required fields
    const requiredFields = ['webinarName', 'webinarTitle'];
    const missingFields = requiredFields.filter((field) => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          details: `Missing: ${missingFields.join(', ')}`,
        },
        { status: 400 }
      );
    }

    // Validate webinar date range format
    const parsedStartDate = new Date(body.webinarStartDate);
    const parsedEndDate = new Date(body.webinarEndDate);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid date format',
          details:
            'webinarStartDate and webinarEndDate must be valid ISO date strings',
        },
        { status: 400 }
      );
    }

    if (parsedEndDate <= parsedStartDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid date range',
          details: 'End date must be after start date',
        },
        { status: 400 }
      );
    }

    // Validate video uploads structure if present
    if (body.videoUploads && !Array.isArray(body.videoUploads)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid video uploads format',
          details: 'videoUploads must be an array',
        },
        { status: 400 }
      );
    }

    // Proceed with database operations
    const createdSettings = await prisma.webinarSettings.create({
      data: {
        name: body.webinarTitle,
        emailNotifications: body.emailNotifications || {},
        textNotifications: body.textNotifications || {},
        integration: body.integration || '',
        sharingEnabled: body.webinarSharing?.enabled ?? false,
        sharingName: body.webinarSharing?.name || '',
        sharingUrl: body.webinarSharing?.url || '',
      },
    });

    const newWebinar = await prisma.webinarDetails.create({
      data: {
        webinarSettingsId: createdSettings.id,
        webinarName: body.webinarName,
        webinarTitle: body.webinarTitle,
        description: body.description, // Added description
        durationHours: body.durationHours || 0,
        durationMinutes: body.durationMinutes || 0,
        durationSeconds: body.durationSeconds || 0,
        attendeeSignIn: body.attendeeSignIn || false,
        passwordProtected: body.passwordProtected || false,
        webinarDate: parsedStartDate, // Using start date as the main webinar date
        scheduledDates: {
          startDate: parsedStartDate.toISOString(),
          endDate: parsedEndDate.toISOString(),
        },
        webinarTime: body.webinarTime || '12:00', // Default time if not provided
        selectedLanguage: body.selectedLanguage || 'en',
        instantWatchEnabled: body.instantWatchEnabled || false,
        justInTimeEnabled: body.justInTimeEnabled || false,
        isPaid: body.isPaid || false,
        paidAmount: body.isPaid ? parseFloat(body.paidAmount || '0') : null,
        discountPercentage:
          body.isPaid && body.discountPercentage
            ? parseFloat(body.discountPercentage)
            : null,
        discountAmount:
          body.isPaid && body.discountAmount
            ? parseFloat(body.discountAmount)
            : null,
        // Add other fields that might be missing
        // scheduledDates is already set above with date range
        brandImage: body.brandImage || null,
        resources: {
          // Validate and structure resources
          create: body.resources?.map((res: ResourceInput) => ({
            name: res.name,
            type: res.type, // pdf/docx/jpg/etc
            url: res.url,
            publicId: res.publicId || null,
          })),
        },
      },
    });
    console.log('newwebinar', newWebinar);

    // Handle video uploads
    if (body.videoUploads?.length > 0) {
      try {
        await prisma.video.create({
          data: {
            title: body.videoUploads[0].title || 'Untitled Video',
            publicId: body.videoUploads[0].publicId || '',
            url: body.videoUploads[0].url || '',
            webinarDetails: {
              connect: { id: newWebinar.id },
            },
          },
        });
      } catch (videoError) {
        console.error('Video upload failed:', videoError);
        return NextResponse.json(
          {
            success: false,
            error: 'Video upload failed',
            details: 'Check video object structure',
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        webinar: newWebinar,
        settings: createdSettings,
        videoCount: body.videoUploads?.length || 0,
      },
    });
  } catch (error) {
    console.error('Database Error:', error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          {
            success: false,
            error: 'Conflict',
            details: 'Webinar with this name already exists',
          },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'Internal Server Error',
        details: 'Please check server logs',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const webinars = await prisma.webinarDetails.findMany({
      include: {
        webinarSettings: true,
        video: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    // console.log('webinars', webinars);

    return NextResponse.json({ success: true, webinars }, { status: 200 });
  } catch (error) {
    console.error('Error fetching webinars:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch webinars' },
      { status: 500 }
    );
  }
}
