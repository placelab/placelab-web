import { getProjects, extractTags } from '@/lib/dropbox';
import ProjectGrid from '@/components/ProjectGrid';

export const revalidate = 3600;

export default async function DesignPage() {
  const projects = await getProjects('design');
  const tags = extractTags(projects);

  return (
    <section>
      <div className="section-wrapper page-header">
        <p className="text-sm font-mono text-lab-400 uppercase tracking-widest mb-4 fade-in">
          Design
        </p>
        <h1 className="fade-in stagger-1">설계 프로젝트</h1>
        <p className="fade-in stagger-2">
          도시설계, 공간 디자인, 스튜디오 작업을 소개합니다.
        </p>
      </div>

      <div className="section-wrapper pb-24">
        <ProjectGrid projects={projects} tags={tags} />
      </div>
    </section>
  );
}
