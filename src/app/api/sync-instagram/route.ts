import { NextResponse } from 'next/server';
import { listFiles, uploadToDropbox } from '@/lib/dropbox';

interface BeholdSize { mediaUrl: string }

interface BeholdPost {
  id: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  mediaUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  timestamp: string;
  permalink: string;
  sizes?: { small?: BeholdSize; medium?: BeholdSize; large?: BeholdSize };
}

async function fetchBeholdPosts(): Promise<BeholdPost[]> {
  const feed = process.env.BEHOLD_FEED_ID;
  if (!feed) return [];
  const url = feed.startsWith('http') ? feed : `https://feeds.behold.so/${feed}`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.posts)) return data.posts;
    return [];
  } catch {
    return [];
  }
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const posts = await fetchBeholdPosts();
    if (posts.length === 0) {
      return NextResponse.json({ synced: 0, message: 'No posts from Behold' });
    }

    const existingFiles = await listFiles('/News/Instagram');
    const existingIds = new Set(
      existingFiles
        .map(f => f.split('/').pop()?.replace(/\.(json|jpg|jpeg|png|mp4)$/i, '') ?? '')
        .filter(Boolean)
    );

    let synced = 0;

    for (const post of posts) {
      if (existingIds.has(post.id)) continue;

      // Behold CDN(안정) > thumbnailUrl > mediaUrl
      const imgUrl =
        post.sizes?.medium?.mediaUrl ??
        post.sizes?.small?.mediaUrl ??
        (post.mediaType === 'VIDEO' ? (post.thumbnailUrl ?? post.mediaUrl) : post.mediaUrl);

      try {
        const imgRes = await fetch(imgUrl);
        if (imgRes.ok) {
          const imgBuffer = Buffer.from(await imgRes.arrayBuffer());
          await uploadToDropbox(`/News/Instagram/${post.id}.jpg`, imgBuffer, 'image/jpeg');
        }
      } catch (e) {
        console.error(`Image download failed for post ${post.id}:`, e);
      }

      // 아카이브 JSON: sizes.medium URL을 mediaUrl로 저장 (안정적 Behold CDN)
      const meta = {
        id: post.id,
        mediaType: post.mediaType,
        mediaUrl: post.sizes?.medium?.mediaUrl ?? `/api/image?path=/News/Instagram/${post.id}.jpg`,
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
