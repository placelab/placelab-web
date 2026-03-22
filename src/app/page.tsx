import Link from 'next/link';
import Image from 'next/image';
import { getAllProjects, extractTags } from '@/lib/dropbox';
import ProjectGrid from '@/components/ProjectGrid';

export const revalidate = 3600;

export default async function HomePage() {
  // getAllProjects()는 year 내림차순 정렬
  const projects = await getAllProjects();
  const tags = extractTags(projects);

  const featured = projects.slice(0, 3);
  const rest = projects.slice(3);

  return (
    <section>
      {/* ─── 최근 프로젝트 3개 전면 배치 ─── */}
      {featured.length > 0 && (
        <div className="section-wrapper pt-24 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {featured.map((project) => (
              <Link
                key={`${project.category}-${project.slug}`}
                href={`/${project.category}/${project.slug}`}
                className="block group relative overflow-hidden rounded-sm bg-lab-200"
              >
                <div className="relative aspect-[4/3]">
                  {project.thumbnail ? (
                    <Image
                      src={project.thumbnail}
                      alt={project.title}
                      fill
                      unoptimized
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-lab-200" />
                  )}
                  {/* 오버레이 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-lab-900/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-xs text-lab-300 uppercase tracking-widest mb-1">
                      {project.category} · {project.year}
                    </p>
                    <h2 className="text-sm font-semibold text-white leading-snug line-clamp-2">
                      {project.title}
                    </h2>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
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
