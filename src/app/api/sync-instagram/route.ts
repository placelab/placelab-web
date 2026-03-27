import { NextResponse } from 'next/server';
import { uploadToDropbox } from '@/lib/dropbox';

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

interface PostEntry {
  mediaUrl: string;
  permalink: string;
  caption?: string;
  timestamp: string;
}

async function getDropboxToken(): Promise<string> {
  const refresh = process.env.DROPBOX_REFRESH_TOKEN;
  const key = process.env.DROPBOX_APP_KEY;
  const secret = process.env.DROPBOX_APP_SECRET;
  if (refresh && key && secret) {
    const r = await fetch('https://api.dropboxapi.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refresh, client_id: key, client_secret: secret }),
      cache: 'no-store',
    });
    if (r.ok) return (await r.json()).access_token as string;
  }
  return process.env.DROPBOX_ACCESS_TOKEN ?? '';
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

async function loadPostList(token: string): Promise<PostEntry[]> {
  try {
    const res = await fetch('https://content.dropboxapi.com/2/files/download', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Dropbox-API-Arg': JSON.stringify({ path: '/News/instagram-posts.json' }),
      },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
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
    const [token, beholdPosts] = await Promise.all([
      getDropboxToken(),
      fetchBeholdPosts(),
    ]);

    if (!token) return NextResponse.json({ error: 'No Dropbox token' }, { status: 500 });
    if (beholdPosts.length === 0) return NextResponse.json({ synced: 0, message: 'No posts from Behold' });

    // 현재 instagram-posts.json 로드
    const existing = await loadPostList(token);
    const existingPermalinks = new Set(existing.map(p => p.permalink));

    // 새 포스트만 필터
    const newPosts: PostEntry[] = beholdPosts
      .filter(p => !existingPermalinks.has(p.permalink))
      .map(p => ({
        mediaUrl: p.sizes?.medium?.mediaUrl ?? p.sizes?.small?.mediaUrl ?? p.mediaUrl,
        permalink: p.permalink,
        caption: p.caption,
        timestamp: p.timestamp,
      }));

    if (newPosts.length === 0) {
      return NextResponse.json({ synced: 0, message: 'All posts already in list' });
    }

    // 새 포스트를 맨 앞에 추가 후 저장
    const updated = [...newPosts, ...existing];
    const jsonBuffer = Buffer.from(JSON.stringify(updated, null, 2), 'utf-8');
    const ok = await uploadToDropbox('/News/instagram-posts.json', jsonBuffer);

    return NextResponse.json({ synced: newPosts.length, total: updated.length, saved: ok });
  } catch (e) {
    console.error('sync-instagram error:', e);
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
