import { NextResponse } from 'next/server';

import { zataService } from '@/lib/zata';

export async function GET() {
  try {
    console.log('🔗 Testing Zata AI Cloud connection...');

    const result = await zataService.testConnection();

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Successfully connected to Zata AI Cloud',
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Connection failed',
          timestamp: new Date().toISOString(),
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('❌ Error testing Zata AI Cloud connection:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
