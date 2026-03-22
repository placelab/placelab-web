import Image from 'next/image';
import { getMembers } from '@/lib/dropbox';

export const revalidate = 3600;

export default async function AboutPage() {
  const { researchers, labIntro } = await getMembers();

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
