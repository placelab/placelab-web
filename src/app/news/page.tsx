import Image from 'next/image';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

interface Post {
  mediaUrl: string;
  permalink?: string;
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

async function downloadJson<T>(token: string, path: string): Promise<T | null> {
  try {
    const res = await fetch('https://content.dropboxapi.com/2/files/download', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Dropbox-API-Arg': JSON.stringify({ path }),
      },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return await res.json() as T;
  } catch {
    return null;
  }
}

/** instagram-posts.json에서 인스타 포스트 목록 */
async function getInstagramPosts(token: string): Promise<Post[]> {
  const data = await downloadJson<Post[]>(token, '/News/instagram-posts.json');
  return Array.isArray(data) ? data : [];
}

/** /News/Custom/ 폴더에서 커스텀 포스트 목록 */
async function getCustomPosts(token: string): Promise<Post[]> {
  try {
    const listRes = await fetch('https://api.dropboxapi.com/2/files/list_folder', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: '/News/Custom' }),
      cache: 'no-store',
    });
    if (!listRes.ok) return [];

    const listData = await listRes.json();
    const entries: { '.tag': string; name: string; path_display: string }[] = listData.entries ?? [];

    // 이미지 파일 목록
    const imageFiles = entries.filter(e =>
      e['.tag'] === 'file' && /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(e.name)
    );

    const posts = await Promise.all(imageFiles.map(async (img) => {
      const baseName = img.name.replace(/\.[^.]+$/, '');
      const jsonPath = img.path_display.replace(/\.[^.]+$/, '.json');

      // 사이드카 JSON: { caption, date, link }
      const meta = await downloadJson<{ caption?: string; date?: string; link?: string }>(token, jsonPath);

      return {
        mediaUrl: `/api/image?path=${encodeURIComponent(img.path_display)}`,
        permalink: meta?.link,
        caption: meta?.caption ?? baseName,
        timestamp: meta?.date ? new Date(meta.date).toISOString() : new Date(0).toISOString(),
      } as Post;
    }));

    return posts;
  } catch {
    return [];
  }
}

export default async function NewsPage() {
  const token = await getDropboxToken();

  const [instagramPosts, customPosts] = await Promise.all([
    token ? getInstagramPosts(token) : Promise.resolve([]),
    token ? getCustomPosts(token) : Promise.resolve([]),
  ]);

  // 날짜 내림차순 정렬
  const allPosts = [...instagramPosts, ...customPosts].sort(
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
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 lg:gap-6">
            {allPosts.map((post, i) => {
              const date = (() => {
                try {
                  return new Date(post.timestamp).toLocaleDateString('ko-KR', {
                    year: 'numeric', month: 'long', day: 'numeric',
                  });
                } catch { return ''; }
              })();

              const inner = (
                <>
                  <div className="relative aspect-square bg-lab-100 overflow-hidden rounded-sm mb-3">
                    <Image
                      src={post.mediaUrl}
                      alt={post.caption?.slice(0, 60) ?? ''}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <p className="text-xs text-lab-400 font-mono mb-1">{date}</p>
                  {post.caption && (
                    <p className="text-xs text-lab-700 leading-relaxed line-clamp-3">
                      {post.caption}
                    </p>
                  )}
                </>
              );

              return post.permalink ? (
                <a
                  key={i}
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  {inner}
                </a>
              ) : (
                <div key={i} className="group block">
                  {inner}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
