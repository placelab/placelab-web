import { getProjects, extractTags } from '@/lib/dropbox';
import ProjectGrid from '@/components/ProjectGrid';

export const revalidate = 3600;

export default async function ResearchPage() {
  const projects = await getProjects('research');
  const tags = extractTags(projects);

  return (
    <section>
      <div className="section-wrapper pt-24 pb-24">
        <ProjectGrid projects={projects} tags={tags} />
      </div>
    </section>
  );
}
