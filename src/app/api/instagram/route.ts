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

const INSTAGRAM_USERNAME = 'y_placelab';

export async function GET() {
  // 1) 공식 API (토큰이 있을 때)
  const token = process.env.INSTAGRAM_ACCESS_TOKEN;
  if (token) {
    const fields = 'id,caption,media_url,thumbnail_url,permalink,media_type,timestamp';
    const res = await fetch(
      `https://graph.instagram.com/me/media?fields=${fields}&limit=24&access_token=${token}`,
      { next: { revalidate: 3600 } }
    );
    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data.data ?? []);
    }
  }

  // 2) 공개 프로필 비공식 API (토큰 없을 때 fallback)
  try {
    const res = await fetch(
      `https://www.instagram.com/api/v1/users/web_profile_info/?username=${INSTAGRAM_USERNAME}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'x-ig-app-id': '936619743392459',
          'Accept': '*/*',
          'Accept-Language': 'ko-KR,ko;q=0.9',
          'Referer': 'https://www.instagram.com/',
        },
        next: { revalidate: 3600 },
      }
    );

    if (!res.ok) throw new Error(`Instagram API ${res.status}`);

    const json = await res.json();
    const edges: unknown[] =
      json?.data?.user?.edge_owner_to_timeline_media?.edges ?? [];

    const posts: InstagramPost[] = edges.slice(0, 24).map((e: unknown) => {
      const node = (e as { node: Record<string, unknown> }).node;
      const isVideo = node.is_video as boolean;
      const shortcode = node.shortcode as string;
      const caption =
        ((node.edge_media_to_caption as { edges: { node: { text: string } }[] })
          ?.edges?.[0]?.node?.text) ?? '';
      const media_url = isVideo
        ? ((node.thumbnail_src ?? node.display_url) as string)
        : (node.display_url as string);

      return {
        id: node.id as string,
        caption,
        media_url,
        permalink: `https://www.instagram.com/p/${shortcode}/`,
        media_type: isVideo ? 'VIDEO' : 'IMAGE',
        timestamp: new Date((node.taken_at_timestamp as number) * 1000).toISOString(),
      };
    });

    return NextResponse.json(posts);
  } catch (err) {
    console.error('Instagram fetch error:', err);
    return NextResponse.json({ error: 'Instagram 피드를 불러올 수 없습니다.' }, { status: 502 });
  }
}
