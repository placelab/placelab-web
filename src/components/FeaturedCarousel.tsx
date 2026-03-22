'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import type { ProjectData } from '@/lib/types';

interface Props {
  projects: ProjectData[];
}

export default function FeaturedCarousel({ projects }: Props) {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (projects.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % projects.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [projects.length]);

  if (projects.length === 0) return null;

  return (
    <div className="relative w-full aspect-[16/7] overflow-hidden bg-lab-200">
      {projects.map((project, i) => (
        <div
          key={`${project.category}-${project.slug}`}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <Link href={`/${project.category}/${project.slug}`} className="block w-full h-full">
            {project.thumbnail && (
              <Image
                src={project.thumbnail}
                alt={project.title}
                fill
                unoptimized
                className="object-cover"
                sizes="100vw"
                priority={i === 0}
              />
            )}
            {/* 하단 그라디언트 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-t from-lab-900/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
              <p className="text-xs text-lab-300 uppercase tracking-widest mb-2">
                {project.category} · {project.year}
              </p>
              <h2 className="text-xl md:text-3xl font-sans font-semibold text-white leading-snug max-w-2xl">
                {project.title}
              </h2>
            </div>
          </Link>
        </div>
      ))}

      {/* 인디케이터 */}
      <div className="absolute bottom-4 right-6 md:right-10 flex gap-1.5">
        {projects.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-1.5 h-1.5 rounded-full transition-all ${
              i === current ? 'bg-white w-4' : 'bg-white/40'
            }`}
            aria-label={`슬라이드 ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
