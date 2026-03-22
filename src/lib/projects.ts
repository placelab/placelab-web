// ──────────────────────────────────────────────────────────────
// lib/projects.ts
// ★ 핵심 모듈: 빌드 타임에 파일시스템을 스캔하여 프로젝트 데이터를 수집
//
// 동작 원리:
//   1. /src/data/projects/{category}/ 하위 폴더를 순회
//   2. 각 폴더의 info.json을 파싱
//   3. 이미지 경로를 public 기준 상대경로로 변환
//   4. 정렬·필터 후 ProjectData[] 반환
//
// ⚠️ 이 모듈은 Node.js fs를 사용하므로 서버 사이드(빌드 타임)에서만 실행됨
// ──────────────────────────────────────────────────────────────

import fs from 'fs';
import path from 'path';
import type { ProjectData, ProjectInfoJson, TagCount } from './types';

// ──────────────────────────────────────────
// 경로 상수
// ──────────────────────────────────────────

const DATA_ROOT = path.join(process.cwd(), 'src', 'data', 'projects');

/** 카테고리별 데이터 디렉토리 */
function getCategoryDir(category: 'research' | 'design'): string {
  return path.join(DATA_ROOT, category);
}

// ──────────────────────────────────────────
// 이미지 경로 변환
// ──────────────────────────────────────────

/**
 * 프로젝트 폴더 내 이미지 파일의 상대경로를
 * 웹에서 접근 가능한 public 경로로 변환.
 *
 * 빌드 전에 이미지를 public/으로 복사하거나,
 * next.config.js에서 커스텀 webpack 설정을 사용할 수 있음.
 *
 * 여기서는 빌드 스크립트가 이미지를 public/projects/에 복사한다고 가정.
 */
function toPublicImagePath(
  category: string,
  slug: string,
  filename: string
): string {
  return `/projects/${category}/${slug}/${filename}`;
}

// ──────────────────────────────────────────
// 단일 프로젝트 로더
// ──────────────────────────────────────────

/**
 * 하나의 프로젝트 폴더에서 info.json을 읽어 ProjectData를 반환.
 * info.json이 없거나 파싱 실패 시 null 반환.
 */
function loadProjectFromDir(
  category: 'research' | 'design',
  folderName: string
): ProjectData | null {
  const folderPath = path.join(getCategoryDir(category), folderName);

  // 폴더인지 확인
  if (!fs.statSync(folderPath).isDirectory()) return null;

  // info.json 존재 여부
  const infoPath = path.join(folderPath, 'info.json');
  if (!fs.existsSync(infoPath)) {
    console.warn(`⚠️  info.json 없음: ${folderPath}`);
    return null;
  }

  try {
    const raw = fs.readFileSync(infoPath, 'utf-8');
    const info: ProjectInfoJson = JSON.parse(raw);

    // visible이 명시적으로 false인 경우 제외
    if (info.visible === false) return null;

    // 이미지 경로 변환
    const thumbnail = toPublicImagePath(
      category,
      folderName,
      info.thumbnail || 'thumbnail.jpg'
    );

    const gallery = (info.gallery || []).map((img) =>
      toPublicImagePath(category, folderName, img)
    );

    return {
      ...info,
      slug: folderName,
      category,
      thumbnail,
      gallery,
      order: info.order ?? 0,
    };
  } catch (err) {
    console.error(`❌ info.json 파싱 실패: ${folderPath}`, err);
    return null;
  }
}

// ──────────────────────────────────────────
// 메인 API: 프로젝트 목록 가져오기
// ──────────────────────────────────────────

/**
 * 특정 카테고리의 전체 프로젝트 목록을 반환.
 * 빌드 타임에 호출되며, 폴더 구조를 자동 스캔.
 *
 * @param category - 'research' | 'design'
 * @returns 정렬된 ProjectData 배열
 */
export function getProjects(category: 'research' | 'design'): ProjectData[] {
  const categoryDir = getCategoryDir(category);

  // 카테고리 디렉토리 존재 확인
  if (!fs.existsSync(categoryDir)) {
    console.warn(`⚠️  카테고리 디렉토리 없음: ${categoryDir}`);
    return [];
  }

  const folders = fs.readdirSync(categoryDir);

  const projects = folders
    .map((folder) => loadProjectFromDir(category, folder))
    .filter((p): p is ProjectData => p !== null);

  // 정렬: order → year(내림차순) → title(가나다순)
  return projects.sort((a, b) => {
    if ((a.order ?? 0) !== (b.order ?? 0)) return (a.order ?? 0) - (b.order ?? 0);
    if (a.year !== b.year) return b.year - a.year;
    return a.title.localeCompare(b.title, 'ko');
  });
}

/**
 * 모든 카테고리의 프로젝트를 합쳐서 반환.
 */
export function getAllProjects(): ProjectData[] {
  return [...getProjects('research'), ...getProjects('design')];
}

/**
 * 특정 slug로 프로젝트 하나를 검색.
 */
export function getProjectBySlug(
  category: 'research' | 'design',
  slug: string
): ProjectData | null {
  return loadProjectFromDir(category, slug);
}

// ──────────────────────────────────────────
// 태그 유틸리티
// ──────────────────────────────────────────

/**
 * 프로젝트 목록에서 중복 없는 태그와 각 태그의 프로젝트 수를 반환.
 */
export function extractTags(projects: ProjectData[]): TagCount[] {
  const tagMap = new Map<string, number>();

  projects.forEach((p) => {
    p.tags.forEach((tag) => {
      tagMap.set(tag, (tagMap.get(tag) || 0) + 1);
    });
  });

  return Array.from(tagMap.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count); // 빈도순 정렬
}

/**
 * 선택된 태그로 프로젝트 필터링.
 * activeTags가 비어있으면 전체 반환.
 */
export function filterByTags(
  projects: ProjectData[],
  activeTags: string[]
): ProjectData[] {
  if (activeTags.length === 0) return projects;
  return projects.filter((p) =>
    activeTags.some((tag) => p.tags.includes(tag))
  );
}
