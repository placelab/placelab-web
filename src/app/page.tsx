import { getAllProjects, extractTags } from '@/lib/dropbox';
import ProjectGrid from '@/components/ProjectGrid';

export const revalidate = 3600;

export default async function HomePage() {
  const projects = await getAllProjects();
  const tags = extractTags(projects);

  return (
    <section>
      <div className="section-wrapper pt-24 pb-24">
        {projects.length > 0 ? (
          <ProjectGrid projects={projects} tags={tags} />
        ) : (
          <div className="py-20">
            <p className="text-lab-400 text-sm font-mono">
              Dropbox의 /Projects/Research 및 /Projects/Design 폴더에 프로젝트를 추가하세요.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
