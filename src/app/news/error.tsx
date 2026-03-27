'use client';

import { useEffect } from 'react';

export default function NewsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => { console.error('[news] server error:', error); }, [error]);

  return (
    <section>
      <div className="section-wrapper pt-24 pb-24 text-center">
        <p className="text-lab-400 text-sm mb-3">피드를 불러올 수 없습니다.</p>
        <div className="flex justify-center gap-6 mt-4">
          <button
            onClick={reset}
            className="text-sm text-lab-400 hover:text-lab-900 transition-colors"
          >
            다시 시도
          </button>
          <a
            href="https://www.instagram.com/y_placelab/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-lab-700 underline underline-offset-4"
          >
            @y_placelab Instagram 바로가기
          </a>
        </div>
      </div>
    </section>
  );
}
