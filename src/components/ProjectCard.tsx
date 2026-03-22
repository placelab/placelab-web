import Image from 'next/image';
import type { ProjectData } from '@/lib/types';

interface ProjectCardProps {
  project: ProjectData;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <article className="project-card group fade-in">
      {/* 썸네일 */}
      <div className="relative aspect-[4/3] bg-lab-200 overflow-hidden rounded-sm">
        <Image
          src={project.thumbnail}
          alt={project.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />

        {/* 호버 오버레이 */}
        <div className="absolute inset-0 bg-lab-900/0 group-hover:bg-lab-900/60 transition-colors duration-300 flex items-end">
          <div className="p-5 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
            <p className="text-lab-100 text-sm leading-relaxed line-clamp-3">
              {project.description}
            </p>
          </div>
        </div>
      </div>

      {/* 정보 */}
      <div className="pt-4 pb-2">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-sans text-base font-semibold text-lab-900 leading-snug">
            {project.title}
          </h3>
          <span className="text-sm text-lab-400 font-mono shrink-0">
            {project.year}
          </span>
        </div>

        {project.subtitle && (
          <p className="mt-1 text-sm text-lab-500">{project.subtitle}</p>
        )}

        {/* 태그 */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 bg-lab-100 text-lab-500 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
}
