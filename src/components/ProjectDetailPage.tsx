import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProjectWithGallery, getProjects } from '@/lib/dropbox';

interface Props {
  category: 'research' | 'design';
  slug: string;
}

export default async function ProjectDetailPage({ category, slug }: Props) {
  const [result, allProjects] = await Promise.all([
    getProjectWithGallery(category, slug),
    getProjects(category),
  ]);
  if (!result) notFound();

  const { project, gallery, abstract } = result;

  const currentIndex = allProjects.findIndex(p => p.slug === slug);
  const prevProject = currentIndex > 0 ? allProjects[currentIndex - 1] : null;
  const nextProject = currentIndex < allProjects.length - 1 ? allProjects[currentIndex + 1] : null;

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

      {/* Abstract */}
      {abstract && (
        <div className="max-w-3xl prose prose-sm prose-stone max-w-none mb-6">
          {abstract.startsWith('<')
            ? <div dangerouslySetInnerHTML={{ __html: abstract }} />
            : <p>{abstract}</p>
          }
        </div>
      )}

      {/* Keywords (research) */}
      {category === 'research' && project.keywords && project.keywords.length > 0 && (
        <div className="max-w-3xl mt-6">
          <p className="text-sm text-lab-500">{project.keywords.join(' · ')}</p>
        </div>
      )}

      {/* Team (design) */}
      {category === 'design' && project.team && project.team.members.length > 0 && (
        <div className="max-w-3xl mt-6 space-y-1">
          {project.team.members.map((m, i) => (
            <div key={i} className="flex gap-4 text-sm text-lab-500">
              {m.role && <span className="min-w-[200px]">{m.role}</span>}
              {m.name && <span>{m.name}</span>}
            </div>
          ))}
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

      {/* 이전 / 다음 프로젝트 네비게이션 */}
      {(prevProject || nextProject) && (
        <div className="flex items-stretch justify-between gap-4 mt-20 pt-8 border-t border-lab-200">
          {prevProject ? (
            <Link
              href={`/${category}/${prevProject.slug}`}
              className="group flex items-center gap-3 text-left max-w-[45%]"
            >
              <span className="text-xl text-lab-400 group-hover:text-lab-900 transition-colors shrink-0">←</span>
              <div>
                <p className="text-xs text-lab-400 mb-0.5">Previous</p>
                <p className="text-sm text-lab-700 group-hover:text-lab-900 transition-colors leading-snug line-clamp-2">
                  {prevProject.title}
                </p>
              </div>
            </Link>
          ) : <div />}

          {nextProject ? (
            <Link
              href={`/${category}/${nextProject.slug}`}
              className="group flex items-center gap-3 text-right max-w-[45%] ml-auto"
            >
              <div>
                <p className="text-xs text-lab-400 mb-0.5">Next</p>
                <p className="text-sm text-lab-700 group-hover:text-lab-900 transition-colors leading-snug line-clamp-2">
                  {nextProject.title}
                </p>
              </div>
              <span className="text-xl text-lab-400 group-hover:text-lab-900 transition-colors shrink-0">→</span>
            </Link>
          ) : <div />}
        </div>
      )}
    </div>
  );
}
