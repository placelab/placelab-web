import Image from 'next/image';
import { getAllProjects, extractTags, listFiles, imageProxyUrl } from '@/lib/dropbox';
import ProjectGrid from '@/components/ProjectGrid';
import FeaturedCarousel from '@/components/FeaturedCarousel';

export const revalidate = 3600;

export default async function HomePage() {
  const [projects, heroFiles] = await Promise.all([
    getAllProjects(),
    listFiles('/Hero'),
  ]);
  const tags = extractTags(projects);

  const featured = projects.slice(0, 5);
  const rest = projects.slice(5);

  // /Hero 폴더 이미지 중 랜덤 1개
  const heroImages = heroFiles.filter(f => /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(f));
  const heroBg = heroImages.length > 0
    ? imageProxyUrl(heroImages[Math.floor(Math.random() * heroImages.length)])
    : null;

  return (
    <section>
      {/* ─── 히어로 ─── */}
      <div className="relative w-full h-screen overflow-hidden bg-lab-900">
        {heroBg && (
          <Image
            src={heroBg}
            alt="placeLab"
            fill
            unoptimized
            className="object-cover opacity-70"
            priority
          />
        )}
        {/* 상→하 그라디언트 — 텍스트 가독성 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/70" />

        <div className="relative z-10 flex flex-col justify-end h-full section-wrapper pb-16 md:pb-24">
          <h1 className="text-[5.1rem] md:text-[7.65rem] font-sans font-semibold text-white leading-none tracking-tight mb-4">
            placeLab
          </h1>
          <p className="text-xl md:text-[1.9rem] text-white/75 font-sans">
            연세대학교 도시공학과 도시설계 연구실
          </p>
        </div>
      </div>

      {/* ─── 최근 프로젝트 캐러셀 ─── */}
      {featured.length > 0 && (
        <FeaturedCarousel projects={featured} />
      )}

      {/* ─── 나머지 프로젝트 그리드 ─── */}
      <div className="section-wrapper pb-24 pt-6">
        {rest.length > 0 ? (
          <ProjectGrid projects={rest} tags={tags} />
        ) : projects.length === 0 ? (
          <div className="py-20">
            <p className="text-lab-400 text-sm font-mono">
              Dropbox의 /Projects/Research 및 /Projects/Design 폴더에 프로젝트를 추가하세요.
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}
