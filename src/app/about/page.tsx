import Image from 'next/image';
import { getMembers } from '@/lib/dropbox';

export const revalidate = 3600;

export default async function AboutPage() {
  const { professors, researchers, labIntro } = await getMembers();

  return (
    <section>
      <div className="section-wrapper pt-24 pb-20">

        {/* ─── 연구실 소개글 (placelab.docx) ─── */}
        {labIntro && (
          <div
            className="max-w-3xl mb-16 prose prose-sm prose-stone max-w-none"
            dangerouslySetInnerHTML={{ __html: labIntro }}
          />
        )}

        {/* ─── 교수 섹션 ─── */}
        {professors.map((prof) => (
          <div key={prof.name} className="mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
              {/* 사진 */}
              <div className="lg:col-span-3">
                <div className="relative aspect-[3/4] bg-lab-200 rounded-sm overflow-hidden">
                  {prof.photo && (
                    <Image
                      src={prof.photo}
                      alt={prof.name}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 25vw"
                    />
                  )}
                </div>
              </div>

              {/* 이름 및 정보 */}
              <div className="lg:col-span-9">
                <span className="text-xs font-mono text-lab-400 uppercase tracking-widest">Director</span>
                <h2 className="mt-1 text-2xl md:text-3xl font-sans font-semibold text-lab-900">
                  {prof.name}
                </h2>
                {(prof.nameEn || prof.title) && (
                  <p className="mt-1 text-sm text-lab-500">
                    {[prof.nameEn, prof.title].filter(Boolean).join(' · ')}
                  </p>
                )}

                {prof.bio && (
                  <div
                    className="mt-6 prose prose-sm prose-stone max-w-none"
                    dangerouslySetInnerHTML={{ __html: prof.bio }}
                  />
                )}

                {prof.research && prof.research.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xs font-semibold text-lab-900 uppercase tracking-wider mb-3">
                      Research Interests
                    </h3>
                    <ul className="space-y-1">
                      {prof.research.map((item) => (
                        <li key={item} className="text-sm text-lab-600 pl-4 border-l-2 border-lab-200">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {prof.education && prof.education.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xs font-semibold text-lab-900 uppercase tracking-wider mb-3">
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
            <hr className="border-lab-200 mb-16" />
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
              {researchers.map((member) => (
                <div key={member.name} className="group">
                  <div className="relative aspect-square bg-lab-200 rounded-sm overflow-hidden mb-3">
                    {member.photo && (
                      <Image
                        src={member.photo}
                        alt={member.name}
                        fill
                        unoptimized
                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      />
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-lab-900">{member.name}</h3>
                  {member.nameEn && (
                    <p className="text-xs text-lab-400 font-mono">{member.nameEn}</p>
                  )}
                  {member.title && (
                    <p className="mt-0.5 text-xs text-lab-500">{member.title}</p>
                  )}
                  {member.research && member.research.length > 0 && (
                    <p className="mt-1 text-xs text-lab-600">{member.research.join(', ')}</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </section>
  );
}
