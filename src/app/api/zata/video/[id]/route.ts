import { NextRequest, NextResponse } from 'next/server';

import { zataService } from '@/lib/zata';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log(`🎬 Deleting video ${id} from Zata AI Cloud...`);
    console.log(`🔍 Video ID received: "${id}"`);

    const result = await zataService.deleteVideo(id);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to delete video' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Video deleted successfully',
    });
  } catch (error) {
    console.error(`❌ Error deleting video:`, error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
