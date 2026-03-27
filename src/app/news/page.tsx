import Image from 'next/image';

export const dynamic = 'force-dynamic';

interface Post {
  id: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  mediaUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  timestamp: string;
  permalink: string;
}

async function getBeholdPosts(): Promise<Post[]> {
  const feed = process.env.BEHOLD_FEED_ID;
  if (!feed) return [];
  const url = feed.startsWith('http') ? feed : `https://feeds.behold.so/${feed}`;
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    // Behold 위젯 응답: { posts: [...] } 또는 직접 배열
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.posts)) return data.posts;
    return [];
  } catch {
    return [];
  }
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

async function getArchivedPosts(): Promise<Post[]> {
  try {
    const token = await getDropboxToken();
    if (!token) return [];

    // /News/Instagram/ 폴더 파일 목록
    const listRes = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: '/News/Instagram' }),
      cache: 'no-store',
    });
    if (!listRes.ok) return [];

    const listData = await listRes.json();
    const jsonFiles: string[] = (listData.entries ?? [])
      .filter((e: { '.tag': string; path_display: string }) => e['.tag'] === 'file' && e.path_display.endsWith('.json'))
      .map((e: { path_display: string }) => e.path_display);

    // 각 JSON 파일 다운로드
    const posts = await Promise.all(jsonFiles.map(async (path) => {
      try {
        const dlRes = await fetch('https://content.dropboxapi.com/2/files/download', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Dropbox-API-Arg': JSON.stringify({ path }),
          },
          cache: 'no-store',
        });
        if (!dlRes.ok) return null;
        return await dlRes.json() as Post;
      } catch {
        return null;
      }
    }));

    return posts.filter((p): p is Post => p !== null);
  } catch {
    return [];
  }
}

export default async function NewsPage() {
  const [beholdPosts, archivedPosts] = await Promise.all([
    getBeholdPosts(),
    getArchivedPosts(),
  ]);

  const beholdIds = new Set(beholdPosts.map(p => p.id));
  const archiveOnly = archivedPosts.filter(p => !beholdIds.has(p.id));

  const allPosts = [...beholdPosts, ...archiveOnly].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <section>
      <div className="section-wrapper pt-24 pb-24">
        {allPosts.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lab-400 text-sm mb-3">피드를 불러올 수 없습니다.</p>
            <a
              href="https://www.instagram.com/y_placelab/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-lab-700 underline underline-offset-4"
            >
              @y_placelab Instagram 바로가기
            </a>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {allPosts.map((post) => {
              const imgSrc = post.mediaType === 'VIDEO'
                ? (post.thumbnailUrl ?? post.mediaUrl)
                : post.mediaUrl;
              const date = new Date(post.timestamp).toLocaleDateString('ko-KR', {
                year: 'numeric', month: 'long', day: 'numeric',
              });
              return (
                <a
                  key={post.id}
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <div className="relative aspect-square bg-lab-100 overflow-hidden rounded-sm mb-4">
                    <Image
                      src={imgSrc}
                      alt={post.caption?.slice(0, 60) ?? ''}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <p className="text-xs text-lab-400 font-mono mb-2">{date}</p>
                  {post.caption && (
                    <p className="text-sm text-lab-700 leading-relaxed line-clamp-4">
                      {post.caption}
                    </p>
                  )}
                </a>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
