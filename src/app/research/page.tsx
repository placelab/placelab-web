import { getProjects, extractTags } from '@/lib/projects';
import ProjectGrid from '@/components/ProjectGrid';

/**
 * Research 페이지 (Server Component)
 *
 * 빌드 타임에 getProjects('research')를 호출하여
 * /src/data/projects/research/ 하위 폴더를 자동 스캔.
 * → 결과를 클라이언트 컴포넌트(ProjectGrid)에 props로 전달.
 */
export default function ResearchPage() {
  // ★ 빌드 타임에 파일시스템을 읽어 프로젝트 목록 생성
  const projects = getProjects('research');
  const tags = extractTags(projects);

  return (
    <section>
      {/* 페이지 헤더 */}
      <div className="section-wrapper page-header">
        <p className="text-sm font-mono text-lab-400 uppercase tracking-widest mb-4 fade-in">
          Research
        </p>
        <h1 className="fade-in stagger-1">연구 프로젝트</h1>
        <p className="fade-in stagger-2">
          도시설계, 공공공간, 보행환경, 스마트시티 관련 연구 성과를 소개합니다.
        </p>
      </div>

      {/* 프로젝트 그리드 (태그 필터 포함) */}
      <div className="section-wrapper pb-24">
        <ProjectGrid projects={projects} tags={tags} />
      </div>
    </section>
  );
}
