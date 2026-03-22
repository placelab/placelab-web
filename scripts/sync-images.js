#!/usr/bin/env node

/**
 * scripts/sync-images.js
 *
 * 빌드 전에 실행하여 src/data/projects/ 의 이미지 파일을
 * public/projects/ 로 복사합니다.
 *
 * 사용법:
 *   node scripts/sync-images.js
 *
 * package.json에 추가:
 *   "prebuild": "node scripts/sync-images.js",
 *   "predev": "node scripts/sync-images.js"
 */

const fs = require('fs');
const path = require('path');

const SRC_ROOT = path.join(__dirname, '..', 'src', 'data', 'projects');
const DEST_ROOT = path.join(__dirname, '..', 'public', 'projects');

const IMAGE_EXTENSIONS = new Set([
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.avif',
]);

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function copyImages(srcDir, destDir) {
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);

    if (entry.isDirectory()) {
      ensureDir(destPath);
      copyImages(srcPath, destPath);
    } else if (IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 실행
console.log('🖼️  이미지 동기화 시작...');
console.log(`   소스: ${SRC_ROOT}`);
console.log(`   대상: ${DEST_ROOT}`);

ensureDir(DEST_ROOT);

['research', 'design'].forEach((category) => {
  const catSrc = path.join(SRC_ROOT, category);
  const catDest = path.join(DEST_ROOT, category);

  if (!fs.existsSync(catSrc)) return;

  ensureDir(catDest);
  copyImages(catSrc, catDest);
});

console.log('✅ 이미지 동기화 완료');
