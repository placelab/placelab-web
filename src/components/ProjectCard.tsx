import Link from 'next/link';
import Image from 'next/image';
import type { ProjectData } from '@/lib/types';

interface ProjectCardProps {
  project: ProjectData;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/${project.category}/${project.slug}`} className="block">
      <article className="project-card group fade-in">
        {/* 정사각형 썸네일 */}
        <div className="relative aspect-square bg-lab-200 overflow-hidden rounded-sm">
          {project.thumbnail ? (
            <Image
              src={project.thumbnail}
              alt={project.title}
              fill
              unoptimized
              className="object-cover"
              sizes="(max-width: 640px) 50vw, (max-width: 1280px) 25vw, 20vw"
            />
          ) : (
            <div className="absolute inset-0 bg-lab-200" />
          )}

          {/* 호버 오버레이 */}
          <div className="absolute inset-0 bg-lab-900/0 group-hover:bg-lab-900/60 transition-colors duration-300 flex items-end">
            <div className="p-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
              {project.description && (
                <p className="text-lab-100 text-xs leading-relaxed line-clamp-3">
                  {project.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* 정보 */}
        <div className="pt-3 pb-2">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="font-sans text-sm font-semibold text-lab-900 leading-snug line-clamp-2">
              {project.title}
            </h3>
            <span className="text-xs text-lab-400 font-mono shrink-0">
              {project.year}
            </span>
          </div>

          {project.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {project.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="text-xs px-1.5 py-0.5 bg-lab-100 text-lab-500 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
