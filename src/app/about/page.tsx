import Image from 'next/image';
import { getMembers } from '@/lib/dropbox';
import type { MemberData } from '@/lib/types';

export const revalidate = 3600;

const ROLE_ORDER: Record<string, number> = {
  phd:                   1,
  'ms-phd':              2,
  master:                3,
  'phd-alumni':          4,
  'master-alumni':       5,
  alumni:                6,
  undergraduate:         7,
  'undergraduate-intern':8,
};

function sortResearchers(members: MemberData[]): MemberData[] {
  return [...members].sort((a, b) => {
    const roleDiff = (ROLE_ORDER[a.role] ?? 9) - (ROLE_ORDER[b.role] ?? 9);
    if (roleDiff !== 0) return roleDiff;
    return (a.year ?? '9999').localeCompare(b.year ?? '9999');
  });
}

export default async function AboutPage() {
  const { professors, researchers, labIntro } = await getMembers();
  const sorted = sortResearchers(researchers);

  return (
    <section>
      {/* ─── 연구실 소개 + 교수 — 옅은 회색 배경 ─── */}
      <div className="bg-lab-100">
        <div className="section-wrapper pt-24 pb-20">

          {/* 연구실 소개글 (placelab.docx) */}
          {labIntro && (
            <div
              className="max-w-3xl mb-16 prose prose-sm prose-stone max-w-none"
              dangerouslySetInnerHTML={{ __html: labIntro }}
            />
          )}

          {/* 교수 섹션 */}
          {professors.map((prof) => (
            <div key={prof.name}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
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
                <div className="lg:col-span-9">
                  {prof.bio && (
                    <div
                      className="prose prose-sm prose-stone max-w-none font-sans"
                      dangerouslySetInnerHTML={{ __html: prof.bio }}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* ─── 연구원 섹션 — 흰 배경, 2열 ─── */}
      {sorted.length > 0 && (
        <div className="section-wrapper py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-12">
            {sorted.map((member) => (
              <div key={member.name} className="flex items-end gap-6">
                {/* 사진 — 자연 비율 */}
                <div className="flex-shrink-0 w-36 sm:w-44">
                  {member.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-full h-auto"
                    />
                  ) : (
                    <div className="w-full aspect-[3/4] bg-lab-200" />
                  )}
                </div>

                {/* 텍스트 — 하단 정렬 */}
                <div className="flex-1 flex flex-col justify-end font-sans text-xs text-lab-500 space-y-0.5">
                  <p className="text-sm font-semibold text-lab-900 mb-1">{member.name}</p>
                  {member.year        && <p>{member.year}</p>}
                  {member.program     && <p>{member.program}</p>}
                  {member.affiliation && <p>{member.affiliation}</p>}
                  {member.bio && (
                    <p className="mt-1 leading-relaxed whitespace-pre-line">{member.bio}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
