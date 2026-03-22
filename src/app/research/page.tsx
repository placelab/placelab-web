import { getProjects, extractTags } from '@/lib/dropbox';
import ProjectGrid from '@/components/ProjectGrid';

export const revalidate = 3600;

export default async function ResearchPage() {
  const projects = await getProjects('research');
  const tags = extractTags(projects);

  return (
    <section>
      <div className="section-wrapper page-header">
        <p className="text-sm font-mono text-lab-400 uppercase tracking-widest mb-4 fade-in">
          Research
        </p>
        <h1 className="fade-in stagger-1">연구 프로젝트</h1>
        <p className="fade-in stagger-2">
          장소, 공공공간, 보행환경 관련 연구 성과를 소개합니다.
        </p>
      </div>

      <div className="section-wrapper pb-24">
        <ProjectGrid projects={projects} tags={tags} />
      </div>
    </section>
  );
}
