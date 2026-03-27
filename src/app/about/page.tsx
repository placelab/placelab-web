import Image from 'next/image';
import { getMembers } from '@/lib/dropbox';

export const revalidate = 3600;

export default async function AboutPage() {
  const { professors, researchers, labIntro } = await getMembers();

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
                      className="prose prose-sm prose-stone max-w-none"
                      dangerouslySetInnerHTML={{ __html: prof.bio }}
                    />
                  )}
                </div>
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* ─── 연구원 섹션 — 흰 배경 ─── */}
      {researchers.length > 0 && (
        <div className="section-wrapper py-20">
          <div className="divide-y divide-lab-100">
            {researchers.map((member) => (
              <div key={member.name} className="flex items-end gap-8 py-10">
                {/* 사진 — 자연 비율 */}
                <div className="flex-shrink-0 w-40 sm:w-52">
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

                {/* 텍스트 — 오른쪽, 하단 정렬 */}
                <div className="flex-1 flex flex-col justify-end">
                  <h3 className="text-sm font-semibold text-lab-900 mb-1">{member.name}</h3>
                  {member.nameEn && (
                    <p className="text-xs text-lab-400 font-mono mb-2">{member.nameEn}</p>
                  )}
                  {member.bio && (
                    <div
                      className="prose prose-sm prose-stone max-w-none"
                      dangerouslySetInnerHTML={{ __html: member.bio }}
                    />
                  )}
                  {!member.bio && (
                    <>
                      {member.year && <p className="text-xs text-lab-500">{member.year}</p>}
                      {member.program && <p className="text-xs text-lab-500">{member.program}</p>}
                      {member.affiliation && <p className="text-xs text-lab-500">{member.affiliation}</p>}
                      {member.title && <p className="text-xs text-lab-500">{member.title}</p>}
                    </>
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
