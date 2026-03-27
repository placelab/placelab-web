import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProjectWithGallery, getAllProjects } from '@/lib/dropbox';

export const revalidate = 3600;

export async function generateStaticParams() {
  const projects = await getAllProjects();
  return projects.map((p) => ({ category: p.category, slug: p.slug }));
}

interface Props {
  params: { category: string; slug: string };
}

export default async function ProjectPage({ params }: Props) {
  const { category, slug } = params;

  if (category !== 'research' && category !== 'design') notFound();

  const result = await getProjectWithGallery(category, slug);
  if (!result) notFound();

  const { project, gallery, abstract } = result;

  return (
    <div className="section-wrapper pt-28 pb-24">
      {/* 뒤로 가기 */}
      <Link
        href={`/${category}`}
        className="inline-flex items-center gap-2 text-sm text-lab-400 hover:text-lab-900 transition-colors mb-10"
      >
        ← {category === 'research' ? 'Research' : 'Design'}
      </Link>

      {/* 제목 + 부제목 */}
      <div className="max-w-3xl mb-10">
        <h1 className="text-2xl md:text-3xl font-sans font-semibold text-lab-900 leading-tight">
          {project.title}
        </h1>
        {project.subtitle && (
          <p className="mt-2 text-lg text-lab-500">{project.subtitle}</p>
        )}
      </div>

      {/* 메인 이미지 */}
      {gallery[0] && (
        <div className="relative w-full bg-lab-100 rounded-sm overflow-hidden mb-10">
          <Image
            src={gallery[0]}
            alt={project.title}
            width={1600}
            height={900}
            unoptimized
            className="w-full h-auto object-contain"
            style={{ maxHeight: '90vh' }}
          />
        </div>
      )}

      {/* Abstract only */}
      {abstract && (
        <div className="max-w-3xl prose prose-sm prose-stone max-w-none">
          {abstract.startsWith('<')
            ? <div dangerouslySetInnerHTML={{ __html: abstract }} />
            : <p>{abstract}</p>
          }
        </div>
      )}

      {/* 나머지 갤러리 이미지 */}
      {gallery.length > 1 && (
        <div className="space-y-4 mt-12">
          {gallery.slice(1).map((src, i) => (
            <div key={i} className="relative w-full bg-lab-100 rounded-sm overflow-hidden">
              <Image
                src={src}
                alt={`${project.title} ${i + 2}`}
                width={1600}
                height={900}
                unoptimized
                className="w-full h-auto object-contain"
                style={{ maxHeight: '90vh' }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
