// ──────────────────────────────────────────
// 프로젝트 데이터 타입
// ──────────────────────────────────────────

export interface ProjectData {
  /** 폴더명 기반 고유 식별자 (URL slug) */
  slug: string;

  /** 프로젝트 카테고리: research | design */
  category: 'research' | 'design';

  /** 프로젝트 제목 */
  title: string;

  /** 부제 또는 한 줄 요약 */
  subtitle?: string;

  /** 프로젝트 설명 (마크다운 가능) */
  description: string;

  /** 연도 */
  year: number;

  /** 태그 목록 (필터링용) */
  tags: string[];

  /** 썸네일 이미지 경로 (폴더 내 상대경로) */
  thumbnail: string;

  /** 갤러리 이미지 경로 목록 */
  gallery?: string[];

  /** 참여 연구원 */
  members?: string[];

  /** 관련 출판물 */
  publications?: string[];

  /** 외부 링크 */
  links?: { label: string; url: string }[];

  /** 정렬 우선순위 (낮을수록 먼저, 기본값 0) */
  order?: number;

  /** 공개 여부 (기본값 true) */
  visible?: boolean;
}

// ──────────────────────────────────────────
// info.json 스키마 (파일에 저장되는 형태)
// ──────────────────────────────────────────

export type ProjectInfoJson = Omit<ProjectData, 'slug' | 'category'>;

// ──────────────────────────────────────────
// 연구원 데이터 타입
// ──────────────────────────────────────────

export interface MemberData {
  name: string;
  nameEn?: string;
  role: 'professor' | 'phd' | 'master' | 'undergraduate' | 'alumni';
  email?: string;
  photo?: string;
  bio?: string;
  research?: string[];
  links?: { label: string; url: string }[];
}

// ──────────────────────────────────────────
// 태그 필터 관련
// ──────────────────────────────────────────

export interface TagCount {
  tag: string;
  count: number;
}
