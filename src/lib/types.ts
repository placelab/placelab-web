// ──────────────────────────────────────────
// 프로젝트 데이터 타입
// ──────────────────────────────────────────

export interface ProjectData {
  slug: string;
  category: 'research' | 'design';
  title: string;
  subtitle?: string;
  description: string;
  year: number;
  tags: string[];
  thumbnail: string;
  gallery?: string[];
  team?: { members: { role: string; name: string }[] };
  keywords?: string[];
  order?: number;
  visible?: boolean;
}

export type ProjectInfoJson = Omit<ProjectData, 'slug' | 'category'>;

// ──────────────────────────────────────────
// 구성원 데이터 타입
// ──────────────────────────────────────────

export interface MemberData {
  name: string;
  nameEn?: string;
  role: 'professor' | 'phd' | 'ms-phd' | 'master' | 'phd-alumni' | 'master-alumni' | 'undergraduate' | 'undergraduate-intern' | 'alumni';
  title?: string;
  email?: string;
  photo?: string;
  bio?: string;
  research?: string[];
  education?: string[];
  links?: { label: string; url: string }[];
  year?: string;
  program?: string;
  affiliation?: string;
}

// ──────────────────────────────────────────
// 소식 데이터 타입
// ──────────────────────────────────────────

export interface NewsItem {
  title: string;
  date: string;
  description?: string;
  tags?: string[];
  link?: string;
}

// ──────────────────────────────────────────
// 태그 필터 관련
// ──────────────────────────────────────────

export interface TagCount {
  tag: string;
  count: number;
}
