import Image from 'next/image';

/**
 * About 페이지
 * - 지도교수: 상세 프로필 (사진, 경력, 연구 관심사)
 * - 연구원: 간략 프로필 카드 그리드
 *
 * 데이터를 별도 JSON으로 분리하려면 /src/data/members.json을 만들어
 * import members from '@/data/members.json' 으로 불러올 수 있음.
 */

// ─── 지도교수 데이터 ───
const professor = {
  name: '홍길동',
  nameEn: 'Gil-Dong Hong',
  title: '교수 · 공학박사',
  photo: '/images/professor.jpg',
  bio: `서울대학교 건축학과 졸업, MIT 도시설계 석사, 하버드 GSD 도시설계 박사.
현재 OO대학교 건축학과 교수로 재직하며 도시설계 연구실을 이끌고 있다.
보행자 중심 도시설계, 공공공간론, 도시재생을 주요 연구 분야로 삼고 있으며,
William H. Whyte와 Jan Gehl의 공공생활 연구 방법론을 한국 도시 맥락에 적용하는
작업을 지속하고 있다.`,
  research: [
    '보행자 중심 도시설계 (Pedestrian-Oriented Urban Design)',
    '공공공간과 도시 활력 (Public Space & Urban Vitality)',
    '도시재생과 장소 만들기 (Urban Regeneration & Placemaking)',
    '데이터 기반 도시분석 (Data-Driven Urban Analytics)',
  ],
  education: [
    'Ph.D. Urban Design, Harvard GSD',
    'M.Arch. Urban Design, MIT',
    'B.Arch. Seoul National University',
  ],
};

// ─── 연구원 데이터 ───
const members = [
  {
    name: '김연구',
    nameEn: 'Yeon-Gu Kim',
    role: '박사과정',
    research: '스마트시티, 보행 데이터 분석',
    photo: '/images/member-placeholder.jpg',
  },
  {
    name: '이석사',
    nameEn: 'Seok-Sa Lee',
    role: '석사과정',
    research: '수변공간 설계, 도시재생',
    photo: '/images/member-placeholder.jpg',
  },
  {
    name: '박연구',
    nameEn: 'Yeon-Gu Park',
    role: '석사과정',
    research: '공간구문론, 보행 네트워크',
    photo: '/images/member-placeholder.jpg',
  },
  {
    name: '최학부',
    nameEn: 'Hak-Bu Choi',
    role: '학부 연구원',
    research: '도시설계 스튜디오',
    photo: '/images/member-placeholder.jpg',
  },
];

export default function AboutPage() {
  return (
    <section>
      {/* 페이지 헤더 */}
      <div className="section-wrapper page-header">
        <p className="text-sm font-mono text-lab-400 uppercase tracking-widest mb-4 fade-in">
          About
        </p>
        <h1 className="fade-in stagger-1">연구실 소개</h1>
        <p className="fade-in stagger-2">
          보행자 중심의 도시를 꿈꾸며, 사람과 공간의 관계를 탐구합니다.
        </p>
      </div>

      {/* ─── 지도교수 섹션 ─── */}
      <div className="section-wrapper pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* 사진 */}
          <div className="lg:col-span-4">
            <div className="relative aspect-[3/4] bg-lab-200 rounded-sm overflow-hidden">
              <Image
                src={professor.photo}
                alt={professor.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 33vw"
              />
            </div>
          </div>

          {/* 상세 정보 */}
          <div className="lg:col-span-8">
            <span className="text-xs font-mono text-lab-400 uppercase tracking-widest">
              Director
            </span>
            <h2 className="mt-2 text-4xl md:text-5xl font-display font-semibold text-lab-900">
              {professor.name}
            </h2>
            <p className="mt-1 text-base text-lab-500">
              {professor.nameEn} · {professor.title}
            </p>

            <p className="mt-8 text-base text-lab-700 leading-relaxed whitespace-pre-line">
              {professor.bio}
            </p>

            {/* 연구 관심사 */}
            <div className="mt-10">
              <h3 className="text-sm font-semibold text-lab-900 uppercase tracking-wider mb-4">
                Research Interests
              </h3>
              <ul className="space-y-2">
                {professor.research.map((item) => (
                  <li
                    key={item}
                    className="text-sm text-lab-600 pl-4 border-l-2 border-lab-200"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* 학력 */}
            <div className="mt-10">
              <h3 className="text-sm font-semibold text-lab-900 uppercase tracking-wider mb-4">
                Education
              </h3>
              <ul className="space-y-1">
                {professor.education.map((item) => (
                  <li key={item} className="text-sm text-lab-500 font-mono">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* ─── 구분선 ─── */}
      <div className="section-wrapper">
        <hr className="border-lab-200" />
      </div>

      {/* ─── 연구원 섹션 ─── */}
      <div className="section-wrapper py-20">
        <h2 className="text-3xl md:text-4xl font-display font-semibold text-lab-900 mb-12">
          연구원
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {members.map((member) => (
            <div key={member.name} className="group">
              {/* 사진 */}
              <div className="relative aspect-square bg-lab-200 rounded-sm overflow-hidden mb-4">
                <Image
                  src={member.photo}
                  alt={member.name}
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                />
              </div>

              {/* 정보 */}
              <h3 className="text-base font-semibold text-lab-900">
                {member.name}
              </h3>
              <p className="text-sm text-lab-400 font-mono">
                {member.nameEn}
              </p>
              <p className="mt-1 text-sm text-lab-500">{member.role}</p>
              <p className="mt-2 text-sm text-lab-600">{member.research}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
