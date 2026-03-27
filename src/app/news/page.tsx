import Image from 'next/image';

export const dynamic = 'force-dynamic';

interface Post {
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

async function getPostList(): Promise<Post[]> {
  try {
    const token = await getDropboxToken();
    if (!token) return [];

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

export default async function NewsPage() {
  const posts = await getPostList();

  return (
    <section>
      <div className="section-wrapper pt-24 pb-24">
        {posts.length === 0 ? (
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
            {posts.map((post, i) => {
              const date = new Date(post.timestamp).toLocaleDateString('ko-KR', {
                year: 'numeric', month: 'long', day: 'numeric',
              });
              return (
                <a
                  key={post.permalink + i}
                  href={post.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <div className="relative aspect-square bg-lab-100 overflow-hidden rounded-sm mb-4">
                    <Image
                      src={post.mediaUrl}
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
