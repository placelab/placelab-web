'use client';

/**
 * News 페이지
 *
 * 두 가지 콘텐츠 영역:
 * 1. 인스타그램 피드 임베딩 (공식 oEmbed 또는 iframe)
 * 2. 최신 소식 목록 (수동 관리용 정적 데이터)
 *
 * 인스타그램 임베딩 옵션:
 *   A) Instagram 공식 oEmbed → <script src="//www.instagram.com/embed.js">
 *   B) 외부 서비스 (Elfsight, SnapWidget 등)
 *   C) Instagram Basic Display API (토큰 필요)
 *
 * 여기서는 A 방식 + 정적 뉴스 목록을 구현.
 */

import { useEffect } from 'react';

// ─── 뉴스 데이터 (추후 JSON 파일로 분리 가능) ───
const newsItems = [
  {
    date: '2024.11.15',
    title: '2024 대한건축학회 추계학술발표대회 논문 발표',
    description:
      '김연구, 이석사 연구원이 "스마트시티 보행 데이터 분석 프레임워크" 논문을 발표했습니다.',
    tag: '학회',
  },
  {
    date: '2024.10.20',
    title: '수변공간 마스터플랜 공모전 당선',
    description:
      'OO시 하천변 수변공간 재생 공모전에서 연구실 팀이 당선되었습니다.',
    tag: '수상',
  },
  {
    date: '2024.09.01',
    title: '2024년 2학기 신입 연구원 모집',
    description:
      '도시설계 연구실에서 석사/박사 과정 신입 연구원을 모집합니다.',
    tag: '공지',
  },
  {
    date: '2024.07.10',
    title: 'Jan Gehl 연구소 방문 및 국제 공동 연구 협약',
    description:
      '덴마크 Gehl Institute와 보행환경 공동연구 MOU를 체결했습니다.',
    tag: '국제교류',
  },
];

export default function NewsPage() {
  // Instagram embed.js 로드
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//www.instagram.com/embed.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <section>
      {/* 페이지 헤더 */}
      <div className="section-wrapper page-header">
        <p className="text-sm font-mono text-lab-400 uppercase tracking-widest mb-4 fade-in">
          News
        </p>
        <h1 className="fade-in stagger-1">소식</h1>
        <p className="fade-in stagger-2">
          연구실의 최신 소식과 활동을 전합니다.
        </p>
      </div>

      <div className="section-wrapper pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          {/* ─── 좌측: 최신 소식 목록 ─── */}
          <div className="lg:col-span-7">
            <h2 className="text-sm font-semibold text-lab-900 uppercase tracking-wider mb-8">
              Latest News
            </h2>

            <div className="space-y-0">
              {newsItems.map((item, index) => (
                <article
                  key={index}
                  className="group py-6 border-b border-lab-200 first:border-t cursor-default hover:bg-lab-100/50 -mx-4 px-4 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* 날짜 */}
                    <time className="text-sm font-mono text-lab-400 shrink-0 pt-0.5">
                      {item.date}
                    </time>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs px-2 py-0.5 bg-lab-100 text-lab-500 rounded-full">
                          {item.tag}
                        </span>
                      </div>
                      <h3 className="text-base font-semibold text-lab-900 group-hover:text-lab-700 transition-colors">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-lab-500 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          {/* ─── 우측: 인스타그램 피드 ─── */}
          <div className="lg:col-span-5">
            <h2 className="text-sm font-semibold text-lab-900 uppercase tracking-wider mb-8">
              Instagram
            </h2>

            {/*
              인스타그램 임베딩 방법:

              방법 1: 개별 게시물 임베딩 (아래 예시)
              → Instagram 게시물 URL을 blockquote로 임베드

              방법 2: 프로필 피드 위젯
              → Elfsight, SnapWidget 등의 외부 서비스 iframe 사용

              방법 3: Instagram Basic Display API
              → 액세스 토큰으로 최근 게시물을 fetch → 커스텀 그리드 렌더링
            */}

            <div className="space-y-6">
              {/* 예시: 개별 게시물 임베딩 */}
              <div className="bg-lab-100 rounded-sm p-6 text-center">
                <p className="text-sm text-lab-500 mb-3">
                  Instagram 피드가 여기에 표시됩니다.
                </p>
                <p className="text-xs text-lab-400 leading-relaxed">
                  아래 코드를 실제 게시물 URL로 교체하세요:
                </p>
                <code className="block mt-2 text-xs text-lab-600 font-mono bg-white p-3 rounded text-left overflow-x-auto">
                  {`<blockquote
  class="instagram-media"
  data-instgrm-permalink=
    "https://www.instagram.com/p/POST_ID/"
  data-instgrm-version="14">
</blockquote>`}
                </code>
              </div>

              {/*
                실제 사용 시 아래처럼 교체:

                <blockquote
                  className="instagram-media"
                  data-instgrm-permalink="https://www.instagram.com/p/실제게시물ID/"
                  data-instgrm-version="14"
                  style={{
                    background: '#FFF',
                    border: 0,
                    borderRadius: '3px',
                    maxWidth: '540px',
                    width: '100%',
                  }}
                />
              */}

              {/* 인스타그램 계정 링크 */}
              <a
                href="https://instagram.com/urbandesignlab"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-lab-600 hover:text-lab-900 transition-colors"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" />
                  <circle cx="12" cy="12" r="5" />
                  <circle cx="17.5" cy="6.5" r="1.5" fill="currentColor" />
                </svg>
                @urbandesignlab 팔로우하기 →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
