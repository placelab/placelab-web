'use client';

import { motion } from 'framer-motion';
import type { TagCount } from '@/lib/types';

interface TagFilterProps {
  tags: TagCount[];
  activeTags: string[];
  onToggle: (tag: string) => void;
  onClear: () => void;
}

export default function TagFilter({ tags, activeTags, onToggle, onClear }: TagFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <motion.button
        whileTap={{ scale: 0.96 }}
        onClick={onClear}
        className={`tag-chip ${activeTags.length === 0 ? 'active' : ''}`}
      >
        전체
      </motion.button>

      {tags.map(({ tag, count }) => (
        <motion.button
          key={tag}
          whileTap={{ scale: 0.96 }}
          onClick={() => onToggle(tag)}
          className={`tag-chip ${activeTags.includes(tag) ? 'active' : ''}`}
        >
          {tag}
          <span className="ml-1 text-xs opacity-60">{count}</span>
        </motion.button>
      ))}
    </div>
  );
}
