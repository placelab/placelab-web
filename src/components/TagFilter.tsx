'use client';

import type { TagCount } from '@/lib/types';

interface TagFilterProps {
  tags: TagCount[];
  activeTags: string[];
  onToggle: (tag: string) => void;
  onClear: () => void;
}

export default function TagFilter({
  tags,
  activeTags,
  onToggle,
  onClear,
}: TagFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* 전체 보기 버튼 */}
      <button
        onClick={onClear}
        className={`tag-chip ${activeTags.length === 0 ? 'active' : ''}`}
      >
        전체
      </button>

      {/* 태그 목록 */}
      {tags.map(({ tag, count }) => (
        <button
          key={tag}
          onClick={() => onToggle(tag)}
          className={`tag-chip ${activeTags.includes(tag) ? 'active' : ''}`}
        >
          {tag}
          <span className="ml-1 text-xs opacity-60">{count}</span>
        </button>
      ))}
    </div>
  );
}
