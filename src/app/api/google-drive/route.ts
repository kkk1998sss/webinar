import { NextResponse } from 'next/server';

const GOOGLE_DRIVE_API_KEY = process.env.GOOGLE_DRIVE_API_KEY;
const FOLDER_ID = '1at8mW66FDrTQ05l4YtWgXoaWxroITOJ9';

export async function GET() {
  if (!GOOGLE_DRIVE_API_KEY) {
    return NextResponse.json(
      { error: 'Google Drive API key not configured' },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents&key=${GOOGLE_DRIVE_API_KEY}&fields=files(id,name,mimeType,size,webContentLink,webViewLink,thumbnailLink)`
    );

    if (!response.ok) {
      throw new Error(`Google Drive API error: ${response.status}`);
    }

    const data = await response.json();

    // Filter for audio files
    const audioFiles =
      data.files?.filter(
        (file: { mimeType: string; name: string }) =>
          file.mimeType.startsWith('audio/') ||
          file.name.toLowerCase().includes('.mp3') ||
          file.name.toLowerCase().includes('.wav') ||
          file.name.toLowerCase().includes('.m4a')
      ) || [];

    return NextResponse.json({
      success: true,
      files: audioFiles,
    });
  } catch (error) {
    console.error('Error fetching Google Drive files:', error);
    return NextResponse.json(
      { error: 'Failed to fetch audio files' },
      { status: 500 }
    );
  }
}
