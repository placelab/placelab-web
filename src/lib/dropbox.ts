import mammoth from 'mammoth';
import type { ProjectData, MemberData, NewsItem, TagCount } from './types';

const API_BASE = 'https://api.dropboxapi.com/2';
const CONTENT_BASE = 'https://content.dropboxapi.com/2';

// 메모리 캐시: 프로세스 재시작 전까지 재사용
let _cachedToken: string | null = null;
let _tokenExpiry = 0;

/** Refresh Token으로 새 Access Token 자동 발급 */
async function getToken(): Promise<string> {
  // 1) 아직 유효한 토큰이 있으면 재사용
  if (_cachedToken && Date.now() < _tokenExpiry) return _cachedToken;

  const refreshToken = process.env.DROPBOX_REFRESH_TOKEN;
  const appKey      = process.env.DROPBOX_APP_KEY;
  const appSecret   = process.env.DROPBOX_APP_SECRET;

  // 2) Refresh Token이 설정된 경우 → 자동 갱신
  if (refreshToken && appKey && appSecret) {
    const res = await fetch('https://api.dropboxapi.com/oauth2/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type:    'refresh_token',
        refresh_token: refreshToken,
        client_id:     appKey,
        client_secret: appSecret,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      _cachedToken = data.access_token as string;
      _tokenExpiry = Date.now() + (data.expires_in as number) * 1000 - 60_000; // 1분 여유
      return _cachedToken;
    }
  }

  // 3) Fallback: 기존 DROPBOX_ACCESS_TOKEN
  const token = process.env.DROPBOX_ACCESS_TOKEN;
  if (!token) throw new Error('Dropbox 토큰 미설정: DROPBOX_REFRESH_TOKEN 또는 DROPBOX_ACCESS_TOKEN 필요');
  return token;
}

/** HTTP 헤더에 사용하기 위해 non-ASCII(한글 등)를 유니코드 이스케이프 */
function toAsciiHeader(obj: unknown): string {
  return JSON.stringify(obj).replace(/[\u0080-\uFFFF]/g, (c) =>
    `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`
  );
}

type DropboxEntry = { '.tag': string; path_lower: string; path_display: string };

async function dbxPost(endpoint: string, body: unknown): Promise<{ entries: DropboxEntry[] }> {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${await getToken()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    next: { revalidate: 3600 },
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Dropbox /${endpoint} failed (${res.status}): ${err}`);
  }
  return res.json();
}

async function dbxDownload(path: string): Promise<string> {
  const res = await fetch(`${CONTENT_BASE}/files/download`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${await getToken()}`,
      'Dropbox-API-Arg': toAsciiHeader({ path }),
    },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Dropbox download failed for ${path} (${res.status})`);
  return res.text();
}

async function dbxDownloadBuffer(path: string): Promise<Buffer> {
  const res = await fetch(`${CONTENT_BASE}/files/download`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${await getToken()}`,
      'Dropbox-API-Arg': toAsciiHeader({ path }),
    },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Dropbox download failed for ${path} (${res.status})`);
  return Buffer.from(await res.arrayBuffer());
}

/** .docx 파일을 다운로드하여 HTML로 변환 (서식 보존) */
export async function parseDocx(path: string): Promise<string> {
  try {
    const buffer = await dbxDownloadBuffer(path);
    const result = await mammoth.convertToHtml({ buffer });
    return result.value.trim();
  } catch (e) {
    console.error('parseDocx error for', path, e);
    return '';
  }
}

export async function listFolders(path: string): Promise<string[]> {
  try {
    const data = await dbxPost('files/list_folder', { path });
    return data.entries.filter(e => e['.tag'] === 'folder').map(e => e.path_display ?? e.path_lower);
  } catch (e) {
    console.error('listFolders error for', path, e);
    return [];
  }
}

export async function listFiles(path: string): Promise<string[]> {
  try {
    const data = await dbxPost('files/list_folder', { path });
    return data.entries.filter(e => e['.tag'] === 'file').map(e => e.path_display ?? e.path_lower);
  } catch (e) {
    console.error('listFiles error for', path, e);
    return [];
  }
}

/** 폴더에서 첫 번째 이미지 파일의 proxy URL 반환 (00-main.jpg 우선) */
async function findThumbnail(folderPath: string): Promise<string> {
  const files = await listFiles(folderPath);
  const images = files.filter(f => /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(f));
  if (images.length === 0) return '';
  const main = images.find(f => f.includes('00-main')) ?? images[0];
  return imageProxyUrl(main);
}

export async function downloadJson<T>(path: string): Promise<T | null> {
  try {
    const text = await dbxDownload(path);
    return JSON.parse(text) as T;
  } catch (e) {
    console.error('downloadJson error for', path, e);
    return null;
  }
}

/** Dropbox 이미지를 /api/image 프록시를 통해 제공하는 URL 반환 */
export function imageProxyUrl(dropboxPath: string): string {
  return `/api/image?path=${encodeURIComponent(dropboxPath)}`;
}

// ─── 프로젝트 ────────────────────────────────────────────

export async function getProjects(category: 'research' | 'design'): Promise<ProjectData[]> {
  const folderName = category === 'research' ? 'Research' : 'Design';
  const folders = await listFolders(`/Projects/${folderName}`);

  const projects = await Promise.all(
    folders.map(async (folderPath) => {
      const rawName = folderPath.split('/').pop() ?? '';

      // info.json이 있으면 우선 사용, 없으면 폴더 구조에서 자동 추출
      const info = await downloadJson<Partial<Omit<ProjectData, 'slug' | 'category'>>>(`${folderPath}/info.json`);

      const slug = rawName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9가-힣-]/g, '') || rawName;

      // 순서: 숫자 접두사 추출 (예: "1.프로젝트" → 1)
      const orderMatch = rawName.match(/^(\d+)[.\s]/);
      const order = info?.order ?? (orderMatch ? parseInt(orderMatch[1]) : 999);

      // 제목: 숫자 접두사 제거
      const title = info?.title ?? rawName.replace(/^\d+[.\s]/, '').trim();

      // 썸네일: info.json에 명시된 파일 또는 자동 탐지
      const thumbnail = info?.thumbnail
        ? imageProxyUrl(`${folderPath}/${info.thumbnail}`)
        : await findThumbnail(folderPath);

      return {
        slug,
        category,
        title,
        subtitle: info?.subtitle,
        description: info?.description ?? '',
        year: info?.year ?? new Date().getFullYear(),
        tags: info?.tags ?? [],
        thumbnail,
        order,
        visible: info?.visible !== false,
      } as ProjectData;
    })
  );

  // PDF 등 이미지 없는 항목 제외하지 않고, 숨김 항목만 제거
  return projects
    .filter(p => p.visible !== false)
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999));
}

export async function getAllProjects(): Promise<ProjectData[]> {
  const [research, design] = await Promise.all([
    getProjects('research'),
    getProjects('design'),
  ]);
  return [...research, ...design].sort((a, b) => b.year - a.year);
}

/** 단일 프로젝트 + 갤러리 이미지 전체 반환 */
export async function getProjectWithGallery(
  category: 'research' | 'design',
  slug: string
): Promise<{ project: ProjectData; gallery: string[]; abstract: string } | null> {
  const folderName = category === 'research' ? 'Research' : 'Design';
  // 폴더 목록에서 slug에 맞는 폴더 찾기
  const folders = await listFolders(`/Projects/${folderName}`);
  const folderPath = folders.find(f => {
    const rawName = f.split('/').pop() ?? '';
    const s = rawName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9가-힣-]/g, '') || rawName;
    return s === slug || rawName === slug;
  });
  if (!folderPath) return null;

  const rawName = folderPath.split('/').pop() ?? '';
  const info = await downloadJson<Partial<Omit<ProjectData, 'slug' | 'category'>> & { abstract?: string }>(`${folderPath}/info.json`);
  const orderMatch = rawName.match(/^(\d+)[.\s]/);

  const files = await listFiles(folderPath);
  const imageFiles = files.filter(f => /\.(jpg|jpeg|png|gif|webp|avif)$/i.test(f));
  const mainImage = imageFiles.find(f => f.includes('00-main')) ?? imageFiles[0] ?? '';
  // 갤러리: 메인 이미지 제외한 나머지
  const galleryFiles = imageFiles.filter(f => f !== mainImage);

  const project: ProjectData = {
    slug,
    category,
    title: info?.title ?? rawName.replace(/^\d+[.\s]/, '').trim(),
    subtitle: info?.subtitle,
    description: info?.description ?? '',
    year: info?.year ?? new Date().getFullYear(),
    tags: info?.tags ?? [],
    thumbnail: mainImage ? imageProxyUrl(mainImage) : '',
    order: info?.order ?? (orderMatch ? parseInt(orderMatch[1]) : 999),
    team: info?.team,
    keywords: info?.keywords,
  };

  const gallery = [
    ...(mainImage ? [imageProxyUrl(mainImage)] : []),
    ...galleryFiles.map(f => imageProxyUrl(f)),
  ];

  // 00-abstract.docx 우선, 없으면 info.json의 abstract 텍스트 사용
  const abstractFile = files.find(f => /00-abstract\.docx$/i.test(f.split('/').pop() ?? ''));
  const abstract = abstractFile ? await parseDocx(abstractFile) : (info?.abstract ?? '');

  return { project, gallery, abstract };
}

// ─── 구성원 ────────────────────────────────────────────

export async function getMembers(): Promise<{ professors: MemberData[]; researchers: MemberData[]; labIntro: string }> {
  // ── 교수: /Members/Professor/ 안에 파일이 바로 있음 ──
  const professorFiles = await listFiles('/Members/Professor');
  const profImageFile = professorFiles.find(f => /\.(jpg|jpeg|png|gif|webp)$/i.test(f));
  const profBio = await downloadJson<Partial<MemberData>>('/Members/Professor/bio.json');

  // 파일명에서 이름 추출 (예: "m_이재민-.jpg" → "이재민")
  let profNameFromFile = '';
  if (profImageFile) {
    const filename = profImageFile.split('/').pop()?.replace(/\.[^.]+$/, '') ?? '';
    profNameFromFile = filename.replace(/^[a-zA-Z_]+/, '').replace(/[-_\s]+$/, '').trim();
  }

  // placelab.docx → 연구실 소개글
  const labIntroFile = professorFiles.find(f => /placelab\.docx$/i.test(f.split('/').pop() ?? ''));
  const labIntro = labIntroFile ? await parseDocx(labIntroFile) : '';

  // Profile.docx → 교수 소개 (항상 우선)
  const profDocxFile = professorFiles.find(f => /profile.*\.docx$/i.test(f.split('/').pop() ?? ''));
  const profDocxHtml = profDocxFile ? await parseDocx(profDocxFile) : '';

  const professor: MemberData = {
    name: profBio?.name ?? profNameFromFile ?? '교수',
    role: 'professor',
    photo: profImageFile ? imageProxyUrl(profImageFile) : '',
    bio: profDocxHtml || profBio?.bio || '',
    ...profBio,
    // Profile.docx가 있으면 bio 덮어씌움
    ...(profDocxHtml ? { bio: profDocxHtml } : {}),
  };

  // ── 연구원: /Members/Researchers/ 안에 서브폴더 ──
  const researcherFolders = await listFolders('/Members/Researchers');
  const researchers = await Promise.all(
    researcherFolders.map(async (folderPath) => {
      const rawName = folderPath.split('/').pop() ?? '';
      // 숫자 접두사 제거: "1.채지원" → "채지원"
      const name = rawName.replace(/^\d+[.\s]/, '').trim();
      const bio = await downloadJson<Partial<MemberData>>(`${folderPath}/bio.json`);
      const photo = await findThumbnail(folderPath);
      return {
        name: bio?.name ?? name,
        role: (bio?.role ?? 'phd') as MemberData['role'],
        photo,
        ...bio,
      } as MemberData;
    })
  );

  return { professors: [professor], researchers, labIntro };
}

// ─── 소식 ────────────────────────────────────────────

export async function getNews(): Promise<NewsItem[]> {
  const files = await listFiles('/News');
  const jsonFiles = files.filter(f => f.endsWith('.json'));

  const news = await Promise.all(jsonFiles.map(f => downloadJson<NewsItem>(f)));

  return news
    .filter((n): n is NewsItem => n !== null)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

// ─── 유틸리티 ────────────────────────────────────────────

export function extractTags(projects: ProjectData[]): TagCount[] {
  const tagMap = new Map<string, number>();
  for (const project of projects) {
    for (const tag of project.tags ?? []) {
      tagMap.set(tag, (tagMap.get(tag) ?? 0) + 1);
    }
  }
  return Array.from(tagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count);
}
