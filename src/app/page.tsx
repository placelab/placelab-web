import { getAllProjects, extractTags } from '@/lib/dropbox';
import ProjectGrid from '@/components/ProjectGrid';
import FeaturedCarousel from '@/components/FeaturedCarousel';

export const revalidate = 3600;

export default async function HomePage() {
  // getAllProjects()는 year 내림차순 정렬
  const projects = await getAllProjects();
  const tags = extractTags(projects);

  const featured = projects.slice(0, 5);
  const rest = projects.slice(5);

  return (
    <section>
      {/* ─── 최근 프로젝트 3개 슬라이드쇼 ─── */}
      {featured.length > 0 && (
        <div className="pt-16">
          <FeaturedCarousel projects={featured} />
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
