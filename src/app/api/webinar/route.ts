import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      webinarName,
      webinarTitle,
      duration,
      attendeeSignIn,
      passwordProtected,
      webinarDate,
      webinarTime,
      selectedValue,
      brandImage,
      instantWatch,
      instantWatchSession,
      justInTime,
      justInTimeSession,
      scheduledDates,

      // Step 4: WebinarSettings
      emailNotifications,
      textNotifications,
      integration,
      webinarSharing,
    } = body;

    // Step 1: Create WebinarSettings
    const createdSettings = await prisma.webinarSettings.create({
      data: {
        name: webinarTitle,
        emailNotifications: emailNotifications || {},
        textNotifications: textNotifications || {},
        integration: integration || '',
        sharingEnabled: webinarSharing?.enabled ?? false,
        sharingName: webinarSharing?.name || '',
        sharingUrl: webinarSharing?.url || '',
      },
    });

    // Step 2: Create WebinarDetails and link the settings
    const parsedWebinarDate = new Date(webinarDate);
    const brandImageFilename =
      typeof brandImage === 'string' ? brandImage : null;

    const newWebinar = await prisma.webinarDetails.create({
      data: {
        webinarSettingsId: createdSettings.id,
        webinarName,
        webinarTitle,
        durationHours: duration?.hours || 0,
        durationMinutes: duration?.minutes || 0,
        durationSeconds: duration?.seconds || 0,
        attendeeSignIn,
        passwordProtected,
        webinarDate: parsedWebinarDate,
        webinarTime,
        selectedLanguage: selectedValue,
        brandImage: brandImageFilename,
        instantWatchEnabled: instantWatch,
        instantWatchSession,
        justInTimeEnabled: justInTime,
        justInTimeSession,
        scheduledDates: scheduledDates || null,
      },
    });

    return NextResponse.json({ success: true, newWebinar });
  } catch (error) {
    console.error('Error saving webinar:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create webinar' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const webinars = await prisma.webinarDetails.findMany({
      include: {
        webinarSettings: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    console.log('webinars', webinars);

    return NextResponse.json({ success: true, webinars }, { status: 200 });
  } catch (error) {
    console.error('Error fetching webinars:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch webinars' },
      { status: 500 }
    );
  }
}
