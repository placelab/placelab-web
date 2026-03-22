'use client';

import { useState, useMemo } from 'react';
import type { ProjectData, TagCount } from '@/lib/types';
import TagFilter from './TagFilter';
import ProjectCard from './ProjectCard';

interface ProjectGridProps {
  projects: ProjectData[];
  tags: TagCount[];
}

export default function ProjectGrid({ projects, tags }: ProjectGridProps) {
  const [activeTags, setActiveTags] = useState<string[]>([]);

  // 태그 토글
  const handleToggle = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleClear = () => setActiveTags([]);

  // 필터링된 프로젝트
  const filtered = useMemo(() => {
    if (activeTags.length === 0) return projects;
    return projects.filter((p) =>
      activeTags.some((tag) => p.tags.includes(tag))
    );
  }, [projects, activeTags]);

  return (
    <div>
      {/* 태그 필터 */}
      <div className="mb-10">
        <TagFilter
          tags={tags}
          activeTags={activeTags}
          onToggle={handleToggle}
          onClear={handleClear}
        />
      </div>

      {/* 결과 카운트 */}
      <p className="mb-6 text-sm text-lab-400 font-mono">
        {filtered.length}개 프로젝트
        {activeTags.length > 0 && (
          <span>
            {' '}
            · 필터:{' '}
            {activeTags.map((t, i) => (
              <span key={t}>
                {i > 0 && ', '}
                {t}
              </span>
            ))}
          </span>
        )}
      </p>

      {/* 프로젝트 그리드 */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-projects gap-8">
          {filtered.map((project, index) => (
            <div
              key={project.slug}
              className={`fade-in stagger-${Math.min(index + 1, 6)}`}
            >
              <ProjectCard project={project} />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-lab-400">
            선택한 태그에 해당하는 프로젝트가 없습니다.
          </p>
          <button
            onClick={handleClear}
            className="mt-3 text-sm text-accent underline underline-offset-4"
          >
            필터 초기화
          </button>
        </div>
      )}
    </div>
  );
}
