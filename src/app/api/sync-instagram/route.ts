import { NextResponse } from 'next/server';
import { listFiles, uploadToDropbox } from '@/lib/dropbox';

interface BeholdPost {
  id: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  mediaUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  timestamp: string;
  permalink: string;
}

async function fetchBeholdPosts(): Promise<BeholdPost[]> {
  const feed = process.env.BEHOLD_FEED_ID;
  if (!feed) return [];
  const url = feed.startsWith('http') ? feed : `https://feeds.behold.so/${feed}`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  // Vercel Cron 또는 CRON_SECRET으로 인증
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1) Behold 피드에서 최신 포스트 가져오기
    const posts = await fetchBeholdPosts();
    if (posts.length === 0) {
      return NextResponse.json({ synced: 0, message: 'No posts from Behold' });
    }

    // 2) Dropbox에 이미 저장된 파일 목록 (ID로 중복 확인)
    const existingFiles = await listFiles('/News/Instagram');
    const existingIds = new Set(
      existingFiles
        .map(f => f.split('/').pop()?.replace(/\.(json|jpg|jpeg|png|mp4)$/i, '') ?? '')
        .filter(Boolean)
    );

    let synced = 0;

    // 3) 새 포스트만 저장
    for (const post of posts) {
      if (existingIds.has(post.id)) continue;

      // 이미지 URL (VIDEO면 thumbnailUrl 사용)
      const imgUrl = post.mediaType === 'VIDEO'
        ? (post.thumbnailUrl ?? post.mediaUrl)
        : post.mediaUrl;

      // 이미지 다운로드
      try {
        const imgRes = await fetch(imgUrl);
        if (imgRes.ok) {
          const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
          const ext = imgUrl.split('?')[0].split('.').pop()?.toLowerCase() ?? 'jpg';
          const safeExt = ['jpg', 'jpeg', 'png', 'webp'].includes(ext) ? ext : 'jpg';
          await uploadToDropbox(`/News/Instagram/${post.id}.${safeExt}`, imgBuffer, 'image/jpeg');
        }
      } catch (e) {
        console.error(`Image download failed for post ${post.id}:`, e);
      }

      // 메타데이터 JSON 저장
      const meta = {
        id: post.id,
        mediaType: post.mediaType,
        mediaUrl: `/api/image?path=/News/Instagram/${post.id}.jpg`,
        caption: post.caption,
        timestamp: post.timestamp,
        permalink: post.permalink,
      };
      const jsonBuffer = Buffer.from(JSON.stringify(meta, null, 2), 'utf-8');
      await uploadToDropbox(`/News/Instagram/${post.id}.json`, jsonBuffer, 'application/json');

      synced++;
    }

    return NextResponse.json({ synced, total: posts.length });
  } catch (e) {
    console.error('sync-instagram error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
