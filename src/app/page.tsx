import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      {/* ─── Hero Section ─── */}
      <section className="relative min-h-[85vh] flex items-center">
        <div className="section-wrapper">
          <div className="max-w-3xl">
            <p className="text-sm font-mono text-lab-400 uppercase tracking-widest mb-6 fade-in">
              Urban Design Lab
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-semibold tracking-tight text-lab-900 leading-[0.95] fade-in stagger-1">
              사람을 위한<br />
              도시를 설계하다
            </h1>
            <p className="mt-8 text-lg md:text-xl text-lab-500 leading-relaxed max-w-xl fade-in stagger-2">
              보행자 중심의 공공공간, 지속가능한 도시재생,
              데이터 기반 도시설계를 연구합니다.
            </p>
            <div className="mt-10 flex gap-4 fade-in stagger-3">
              <Link
                href="/research"
                className="inline-flex items-center px-6 py-3 bg-lab-900 text-lab-50 text-sm font-medium rounded-sm hover:bg-lab-700 transition-colors"
              >
                Research →
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center px-6 py-3 border border-lab-300 text-lab-700 text-sm font-medium rounded-sm hover:border-lab-900 hover:text-lab-900 transition-colors"
              >
                About Us
              </Link>
            </div>
          </div>
        </div>

        {/* 배경 장식: 그리드 패턴 */}
        <div
          className="absolute inset-0 -z-10 opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(to right, #1c1917 1px, transparent 1px),
              linear-gradient(to bottom, #1c1917 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
      </section>

      {/* ─── 핵심 가치 Section ─── */}
      <section className="py-20 md:py-28 border-t border-lab-200">
        <div className="section-wrapper">
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-lab-900 mb-16">
            Core Values
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
            {[
              {
                num: '01',
                title: '보행 중심 도시',
                titleEn: 'Pedestrian-Oriented City',
                desc: '걷고 싶은 도시, 머물고 싶은 거리. 보행자의 경험을 최우선으로 하는 도시설계를 추구합니다.',
              },
              {
                num: '02',
                title: '공공공간 재생',
                titleEn: 'Public Space Regeneration',
                desc: '도시의 유휴 공간을 시민 모두의 장소로. 장소성과 커뮤니티를 회복하는 공간설계를 연구합니다.',
              },
              {
                num: '03',
                title: '데이터 기반 설계',
                titleEn: 'Data-Driven Design',
                desc: '공간 데이터와 행태 분석을 통해 근거 있는 설계를 실천합니다. 기술과 인문의 교차점을 탐구합니다.',
              },
            ].map((item) => (
              <div key={item.num}>
                <span className="text-xs font-mono text-lab-400 block mb-4">
                  {item.num}
                </span>
                <h3 className="text-2xl font-display font-semibold text-lab-900">
                  {item.title}
                </h3>
                <p className="text-sm text-lab-400 font-mono mt-1 mb-4">
                  {item.titleEn}
                </p>
                <p className="text-base text-lab-600 leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
