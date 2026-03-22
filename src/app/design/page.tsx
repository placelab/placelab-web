import { getProjects, extractTags } from '@/lib/dropbox';
import ProjectGrid from '@/components/ProjectGrid';

export const revalidate = 3600;

export default async function DesignPage() {
  const projects = await getProjects('design');
  const tags = extractTags(projects);

  return (
    <section>
      <div className="section-wrapper pt-24 pb-24">
        <ProjectGrid projects={projects} tags={tags} />
      </div>
    </section>
  );
}
