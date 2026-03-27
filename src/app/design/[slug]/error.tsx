'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function DesignProjectError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="section-wrapper pt-40 pb-24 flex flex-col items-start">
      <p className="text-xs font-mono text-lab-400 mb-4 uppercase tracking-widest">Error</p>
      <h1 className="text-2xl font-sans font-semibold text-lab-900 mb-6">Failed to load project</h1>
      <div className="flex gap-6">
        <button onClick={reset} className="text-sm text-lab-400 hover:text-lab-900 transition-colors">Try again</button>
        <Link href="/design" className="text-sm text-lab-400 hover:text-lab-900 transition-colors">← Design</Link>
      </div>
    </div>
  );
}
