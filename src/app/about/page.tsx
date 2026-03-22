import Image from 'next/image';
import { getMembers } from '@/lib/dropbox';

export const revalidate = 3600;

export default async function AboutPage() {
  const { professors, researchers } = await getMembers();

  return (
    <section>
      {/* ─── 교수 섹션 ─── */}
      {professors.map((prof) => (
        <div key={prof.name} className="section-wrapper pt-24 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            <div className="lg:col-span-4">
              <div className="relative aspect-[3/4] bg-lab-200 rounded-sm overflow-hidden">
                {prof.photo && (
                  <Image
                    src={prof.photo}
                    alt={prof.name}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                  />
                )}
              </div>
            </div>

            <div className="lg:col-span-8">
              <span className="text-xs font-mono text-lab-400 uppercase tracking-widest">Director</span>
              <h2 className="mt-2 text-4xl md:text-5xl font-display font-semibold text-lab-900">
                {prof.name}
              </h2>
              {(prof.nameEn || prof.title) && (
                <p className="mt-1 text-base text-lab-500">
                  {[prof.nameEn, prof.title].filter(Boolean).join(' · ')}
                </p>
              )}

              {prof.bio && (
                <p className="mt-8 text-base text-lab-700 leading-[1.68] whitespace-pre-line">
                  {prof.bio}
                </p>
              )}

              {prof.research && prof.research.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-sm font-semibold text-lab-900 uppercase tracking-wider mb-4">
                    Research Interests
                  </h3>
                  <ul className="space-y-2">
                    {prof.research.map((item) => (
                      <li key={item} className="text-sm text-lab-600 pl-4 border-l-2 border-lab-200">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {prof.education && prof.education.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-sm font-semibold text-lab-900 uppercase tracking-wider mb-4">
                    Education
                  </h3>
                  <ul className="space-y-1">
                    {prof.education.map((item) => (
                      <li key={item} className="text-sm text-lab-500 font-mono">{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* ─── 연구원 섹션 ─── */}
      {researchers.length > 0 && (
        <>
          <div className="section-wrapper"><hr className="border-lab-200" /></div>
          <div className="section-wrapper py-20">
            <h2 className="text-3xl md:text-4xl font-display font-semibold text-lab-900 mb-12">
              연구원
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {researchers.map((member) => (
                <div key={member.name} className="group">
                  <div className="relative aspect-square bg-lab-200 rounded-sm overflow-hidden mb-4">
                    {member.photo && (
                      <Image
                        src={member.photo}
                        alt={member.name}
                        fill
                        unoptimized
                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    )}
                  </div>
                  <h3 className="text-base font-semibold text-lab-900">{member.name}</h3>
                  {member.nameEn && (
                    <p className="text-sm text-lab-400 font-mono">{member.nameEn}</p>
                  )}
                  {member.title && (
                    <p className="mt-1 text-sm text-lab-500">{member.title}</p>
                  )}
                  {member.research && member.research.length > 0 && (
                    <p className="mt-2 text-sm text-lab-600">{member.research.join(', ')}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 데이터 없을 때 안내 */}
      {professors.length === 0 && researchers.length === 0 && (
        <div className="section-wrapper pb-24">
          <p className="text-lab-400 text-sm font-mono">
            Dropbox의 /Members/Professor 및 /Members/Researchers 폴더에 구성원 정보를 추가하세요.
          </p>
        </div>
      )}
    </section>
  );
}
