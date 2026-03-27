import { getProjects } from '@/lib/dropbox';
import ProjectDetailPage from '@/components/ProjectDetailPage';

export const revalidate = 3600;

export async function generateStaticParams() {
  const projects = await getProjects('design');
  return projects.map((p) => ({ slug: p.slug }));
}

interface Props {
  params: { slug: string };
}

export default function DesignProjectPage({ params }: Props) {
  return <ProjectDetailPage category="design" slug={params.slug} />;
}
