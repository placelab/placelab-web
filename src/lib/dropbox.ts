import type { ProjectData, MemberData, NewsItem, TagCount } from './types';

const API_BASE = 'https://api.dropboxapi.com/2';
const CONTENT_BASE = 'https://content.dropboxapi.com/2';

function getToken(): string {
  const token = process.env.DROPBOX_ACCESS_TOKEN;
  if (!token) throw new Error('DROPBOX_ACCESS_TOKEN is not set');
  return token;
}

type DropboxEntry = { '.tag': string; path_lower: string };

async function dbxPost(endpoint: string, body: unknown): Promise<{ entries: DropboxEntry[] }> {
  const res = await fetch(`${API_BASE}/${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getToken()}`,
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
      Authorization: `Bearer ${getToken()}`,
      'Dropbox-API-Arg': JSON.stringify({ path }),
    },
    next: { revalidate: 3600 },
  });
  if (!res.ok) throw new Error(`Dropbox download failed for ${path} (${res.status})`);
  return res.text();
}

export async function listFolders(path: string): Promise<string[]> {
  try {
    const data = await dbxPost('files/list_folder', { path });
    return data.entries.filter(e => e['.tag'] === 'folder').map(e => e.path_lower);
  } catch (e) {
    console.error('listFolders error for', path, e);
    return [];
  }
}

export async function listFiles(path: string): Promise<string[]> {
  try {
    const data = await dbxPost('files/list_folder', { path });
    return data.entries.filter(e => e['.tag'] === 'file').map(e => e.path_lower);
  } catch (e) {
    console.error('listFiles error for', path, e);
    return [];
  }
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
      const slug = folderPath.split('/').pop() ?? '';
      const info = await downloadJson<Omit<ProjectData, 'slug' | 'category'>>(`${folderPath}/info.json`);
      if (!info) return null;

      const thumbnail = info.thumbnail
        ? imageProxyUrl(`${folderPath}/${info.thumbnail}`)
        : '';

      return { ...info, slug, category, thumbnail } as ProjectData;
    })
  );

  return projects
    .filter((p): p is ProjectData => p !== null && p.visible !== false)
    .sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || b.year - a.year);
}

export async function getAllProjects(): Promise<ProjectData[]> {
  const [research, design] = await Promise.all([
    getProjects('research'),
    getProjects('design'),
  ]);
  return [...research, ...design].sort((a, b) => b.year - a.year);
}

// ─── 구성원 ────────────────────────────────────────────

export async function getMembers(): Promise<{ professors: MemberData[]; researchers: MemberData[] }> {
  const [professorFolders, researcherFolders] = await Promise.all([
    listFolders('/Members/Professor'),
    listFolders('/Members/Researchers'),
  ]);

  const parseMember = async (folderPath: string, defaultRole: MemberData['role']): Promise<MemberData> => {
    const folderName = folderPath.split('/').pop()?.replace(/_/g, ' ') ?? '';
    const bio = await downloadJson<Partial<MemberData>>(`${folderPath}/bio.json`);
    return {
      name: folderName,
      role: defaultRole,
      photo: imageProxyUrl(`${folderPath}/profile.jpg`),
      ...bio,
    };
  };

  const [professors, researchers] = await Promise.all([
    Promise.all(professorFolders.map(f => parseMember(f, 'professor'))),
    Promise.all(researcherFolders.map(f => parseMember(f, 'phd'))),
  ]);

  return { professors, researchers };
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
