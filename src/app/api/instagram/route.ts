import { NextResponse } from 'next/server';

export interface InstagramPost {
  id: string;
  caption?: string;
  media_url: string;
  thumbnail_url?: string;
  permalink: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  timestamp: string;
}

export async function GET() {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (!token) {
    return NextResponse.json({ error: 'INSTAGRAM_ACCESS_TOKEN not set' }, { status: 500 });
  }

  const fields = 'id,caption,media_url,thumbnail_url,permalink,media_type,timestamp';
  const res = await fetch(
    `https://graph.instagram.com/me/media?fields=${fields}&limit=24&access_token=${token}`,
    { next: { revalidate: 3600 } }
  );

  if (!res.ok) {
    const err = await res.text();
    return NextResponse.json({ error: err }, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data.data ?? []);
}
