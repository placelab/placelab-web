import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProjectWithGallery } from '@/lib/dropbox';

export const revalidate = 3600;

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

      {/* 제목 */}
      <div className="max-w-3xl mb-12">
        <h1 className="text-4xl md:text-5xl font-display font-semibold text-lab-900 leading-tight">
          {project.title}
        </h1>
        {project.subtitle && (
          <p className="mt-3 text-lg text-lab-500">{project.subtitle}</p>
        )}
        {project.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {project.tags.map(tag => (
              <span key={tag} className="text-xs px-2 py-0.5 bg-lab-100 text-lab-500 rounded-full">
                {tag}
              </span>
            ))}
          </div>
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

      {/* Abstract (00-abstract.docx 내용) */}
      {abstract && (
        <div className="max-w-3xl mb-12">
          <p className="text-base text-lab-700 leading-[1.2] whitespace-pre-line">
            {abstract}
          </p>
        </div>
      )}

      {/* 나머지 갤러리 이미지 */}
      {gallery.length > 1 && (
        <div className="space-y-4">
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
