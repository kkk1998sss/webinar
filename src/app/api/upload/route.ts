import { Readable } from 'stream';
import axios from 'axios';
import { NextResponse } from 'next/server';

import prisma from '@/lib/prisma';

// pCloud API configuration
const PCLOUD_API_URL = process.env.PCLOUD_API_URL!;
const PCLOUD_CLIENT_ID = process.env.PCLOUD_CLIENT_ID!;
const PCLOUD_CLIENT_SECRET = process.env.PCLOUD_CLIENT_SECRET!;

// Chunk size for streaming (100MB)
// const CHUNK_SIZE = 100 * 1024 * 1024;

interface PCloudUploadResult {
  url: string;
  fileid: number;
}

// Function to get access token
async function getAccessToken() {
  try {
    const response = await axios.post('https://api.pcloud.com/oauth2_token', {
      client_id: PCLOUD_CLIENT_ID,
      client_secret: PCLOUD_CLIENT_SECRET,
      grant_type: 'client_credentials',
    });

    if (response.data.access_token) {
      return response.data.access_token;
    }
    throw new Error('Failed to get access token');
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Get access token
    const accessToken = await getAccessToken();

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());

    // Create a readable stream from the buffer
    const stream = Readable.from(buffer);

    // First, create a file in pCloud
    const createFileResponse = await axios.post(
      `${PCLOUD_API_URL}/createfile`,
      {
        access_token: accessToken,
        path: `/Videos/${Date.now()}_${title}`,
        size: buffer.length,
      }
    );

    if (!createFileResponse.data.fileid) {
      throw new Error('Failed to create file in pCloud');
    }

    // Upload to pCloud using streaming
    const uploadResponse = await axios.post(
      `${PCLOUD_API_URL}/uploadfile`,
      stream,
      {
        params: {
          access_token: accessToken,
          fileid: createFileResponse.data.fileid,
          path: `/Videos/${Date.now()}_${title}`,
        },
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Length': buffer.length,
        },
      }
    );

    if (uploadResponse.data.result !== 0) {
      throw new Error('Upload failed');
    }

    const result: PCloudUploadResult = {
      url: uploadResponse.data.url,
      fileid: uploadResponse.data.fileid,
    };

    // Get the public link for the file
    const publicLinkResponse = await axios.post(
      `${PCLOUD_API_URL}/getfilepublink`,
      {
        access_token: accessToken,
        fileid: result.fileid,
      }
    );

    const saved = await prisma.video.create({
      data: {
        title,
        url: publicLinkResponse.data.link,
        publicId: result.fileid.toString(),
      },
    });

    return NextResponse.json({
      success: true,
      video: saved,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload video' },
      { status: 500 }
    );
  }
}

interface DeleteRequest {
  publicId: string;
}

export async function DELETE(req: Request) {
  try {
    const body: DeleteRequest = await req.json();
    const { publicId } = body;

    console.log('Deleting from pCloud fileid:', publicId);

    if (!publicId) {
      return NextResponse.json({ error: 'Missing publicId' }, { status: 400 });
    }

    // Get access token
    const accessToken = await getAccessToken();

    const result = await axios.post(`${PCLOUD_API_URL}/deletefile`, {
      access_token: accessToken,
      fileid: parseInt(publicId),
    });

    console.log('pCloud delete result:', result.data);

    return NextResponse.json({
      message: 'Video deleted from pCloud successfully',
    });
  } catch (error) {
    console.error('Video delete error:', error);
    return NextResponse.json(
      { error: 'Failed to delete video' },
      { status: 500 }
    );
  }
}
