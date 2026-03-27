import Image from 'next/image';
import { getArchivedInstagramPosts } from '@/lib/dropbox';

export const dynamic = 'force-dynamic';

interface BeholdPost {
  id: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  mediaUrl: string;
  thumbnailUrl?: string;
  caption?: string;
  timestamp: string;
  permalink: string;
}

async function getBeholdPosts(): Promise<BeholdPost[]> {
  const feed = process.env.BEHOLD_FEED_ID;
  if (!feed) return [];
  const url = feed.startsWith('http') ? feed : `https://feeds.behold.so/${feed}`;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function NewsPage() {
  // Behold (최신 6개) + Dropbox 아카이브 병합
  const [beholdPosts, archivedPosts] = await Promise.all([
    getBeholdPosts(),
    getArchivedInstagramPosts(),
  ]);

  // Behold 포스트를 BeholdPost 형태로 정규화
  const beholdNormalized: BeholdPost[] = beholdPosts;

  // Dropbox 아카이브를 BeholdPost 형태로 변환
  const archivedNormalized: BeholdPost[] = archivedPosts.map(p => ({
    id: p.id,
    mediaType: p.mediaType,
    mediaUrl: p.mediaUrl,
    caption: p.caption,
    timestamp: p.timestamp,
    permalink: p.permalink,
  }));

  // 중복 제거 (Behold 우선): Behold ID 세트
  const beholdIds = new Set(beholdNormalized.map(p => p.id));
  const archiveOnly = archivedNormalized.filter(p => !beholdIds.has(p.id));

  // 합친 뒤 날짜 내림차순 정렬
  const allPosts = [...beholdNormalized, ...archiveOnly].sort(
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
                  {/* 이미지 */}
                  <div className="relative aspect-square bg-lab-100 overflow-hidden rounded-sm mb-4">
                    <Image
                      src={imgSrc}
                      alt={post.caption?.slice(0, 60) ?? ''}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>

                  {/* 날짜 */}
                  <p className="text-xs text-lab-400 font-mono mb-2">{date}</p>

                  {/* 캡션 */}
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
