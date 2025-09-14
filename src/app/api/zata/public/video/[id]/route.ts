import { NextRequest, NextResponse } from 'next/server';
import { zataService } from '@/lib/zata';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`🎬 Fetching video ${id} from Zata AI Cloud...`);
    console.log(`🔍 Video ID received: "${id}"`);

    const result = await zataService.getVideo(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Video not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error(`❌ Error fetching video:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
