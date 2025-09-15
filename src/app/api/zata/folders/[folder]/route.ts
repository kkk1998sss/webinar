import { NextRequest, NextResponse } from 'next/server';

import { zataService } from '@/lib/zata';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ folder: string }> }
) {
  try {
    const { folder } = await params;
    const folderPath = decodeURIComponent(folder);
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = parseInt(searchParams.get('per_page') || '12');

    console.log(
      `📁 Fetching videos from folder: ${folderPath}, page: ${page}, per_page: ${perPage}`
    );

    const result = await zataService.getVideosByFolder(folderPath);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch folder videos' },
        { status: 500 }
      );
    }

    // Paginate results
    const startIndex = (page - 1) * perPage;
    const endIndex = startIndex + perPage;
    const paginatedVideos = result.data.slice(startIndex, endIndex);

    return NextResponse.json({
      success: true,
      data: paginatedVideos,
      pagination: {
        page,
        perPage,
        total: result.data.length,
        totalPages: Math.ceil(result.data.length / perPage),
      },
    });
  } catch (error) {
    console.error('❌ Error in Zata AI Folder Videos API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
