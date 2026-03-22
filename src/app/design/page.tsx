import { getProjects, extractTags } from '@/lib/projects';
import ProjectGrid from '@/components/ProjectGrid';

/**
 * Design 페이지 (Server Component)
 *
 * /src/data/projects/design/ 하위 폴더를 자동 스캔.
 */
export default function DesignPage() {
  const projects = getProjects('design');
  const tags = extractTags(projects);

  return (
    <section>
      <div className="section-wrapper page-header">
        <p className="text-sm font-mono text-lab-400 uppercase tracking-widest mb-4 fade-in">
          Design
        </p>
        <h1 className="fade-in stagger-1">디자인 프로젝트</h1>
        <p className="fade-in stagger-2">
          도시설계 스튜디오, 공모전, 실무 협업을 통해 수행한 설계 작업을 소개합니다.
        </p>
      </div>

      <div className="section-wrapper pb-24">
        <ProjectGrid projects={projects} tags={tags} />
      </div>
    </section>
  );
}
