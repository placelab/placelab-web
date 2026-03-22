import { revalidatePath } from 'next/cache';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Vercel Cron이 자동으로 Authorization: Bearer <CRON_SECRET> 헤더를 보냄
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 루트 레이아웃 기준으로 모든 페이지 캐시 무효화
  revalidatePath('/', 'layout');

  return NextResponse.json({
    revalidated: true,
    timestamp: new Date().toISOString(),
  });
}
