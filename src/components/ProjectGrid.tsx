'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ProjectData, TagCount } from '@/lib/types';
import TagFilter from './TagFilter';
import ProjectCard from './ProjectCard';

interface ProjectGridProps {
  projects: ProjectData[];
  tags: TagCount[];
}

export default function ProjectGrid({ projects, tags }: ProjectGridProps) {
  const [activeTags, setActiveTags] = useState<string[]>([]);

  const handleToggle = (tag: string) => {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleClear = () => setActiveTags([]);

  const filtered = useMemo(() => {
    if (activeTags.length === 0) return projects;
    return projects.filter((p) => activeTags.some((tag) => p.tags.includes(tag)));
  }, [projects, activeTags]);

  return (
    <div>
      {/* 태그 필터 */}
      <div className="mb-10">
        <TagFilter tags={tags} activeTags={activeTags} onToggle={handleToggle} onClear={handleClear} />
      </div>

      {/* 프로젝트 그리드 */}
      {filtered.length > 0 ? (
        <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-1.5 md:gap-2">
          <AnimatePresence mode="popLayout">
            {filtered.map((project) => (
              <motion.div
                key={`${project.category}-${project.slug}`}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-lab-400">선택한 태그에 해당하는 프로젝트가 없습니다.</p>
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
