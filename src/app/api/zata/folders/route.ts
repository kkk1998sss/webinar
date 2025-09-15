import { NextResponse } from 'next/server';

import { zataService } from '@/lib/zata';

export async function GET() {
  try {
    console.log('📁 Fetching folders from Zata AI Cloud...');

    const result = await zataService.getFolders();

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch folders' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('❌ Error in Zata AI Folders API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
