'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import type { InstagramPost } from '@/app/api/instagram/route';

export default function InstagramFeed() {
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/api/instagram')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setPosts(data);
        else setError(true);
      })
      .catch(() => setError(true));
  }, []);

  if (error) {
    return (
      <div className="py-20 text-center text-lab-400 text-sm">
        Instagram 피드를 불러올 수 없습니다.
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="py-20 text-center text-lab-400 text-sm">
        불러오는 중...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-1.5 md:gap-2">
      {posts.map((post) => {
        const src = post.media_type === 'VIDEO' ? (post.thumbnail_url ?? post.media_url) : post.media_url;
        return (
          <a
            key={post.id}
            href={post.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="relative aspect-square bg-lab-100 overflow-hidden block group"
          >
            <Image
              src={src}
              alt={post.caption?.slice(0, 60) ?? ''}
              fill
              unoptimized
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </a>
        );
      })}
    </div>
  );
}
