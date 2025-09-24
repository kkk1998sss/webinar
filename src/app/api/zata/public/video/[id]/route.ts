import { NextRequest, NextResponse } from 'next/server';
import { zataService } from '@/lib/zata';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const decodedId = decodeURIComponent(id);
    console.log(`🎬 Fetching video ${decodedId} from Zata AI Cloud...`);
    console.log(`🔍 Video ID received (raw): "${id}"`);
    console.log(`🔍 Video ID decoded: "${decodedId}"`);

    const result = await zataService.getVideo(decodedId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Video not found' },
        { status: 404 }
      );
    }

    // Generate a fresh URL with 7-day expiry
    const freshUrl = zataService.getFreshVideoUrl(decodedId);

    return NextResponse.json({
      success: true,
      data: {
        ...result.data,
        url: freshUrl, // Override with fresh URL
      },
    });
  } catch (error) {
    console.error(`❌ Error fetching video:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
