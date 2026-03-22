# 도시설계 연구실 (Urban Design Lab) — Next.js Website

## 프로젝트 구조

```
urban-lab-web/
├── next.config.js              # 정적 export + GitHub Pages 설정
├── tailwind.config.js          # Tailwind 커스텀 테마
├── package.json
├── tsconfig.json
│
├── public/
│   └── images/                 # 전역 이미지 (로고, 배경 등)
│
├── src/
│   ├── app/
│   │   ├── layout.tsx          # 루트 레이아웃 (Header + Footer)
│   │   ├── page.tsx            # Home
│   │   ├── about/
│   │   │   └── page.tsx        # About (교수 + 연구원)
│   │   ├── research/
│   │   │   └── page.tsx        # Research 프로젝트 목록
│   │   ├── design/
│   │   │   └── page.tsx        # Design 프로젝트 목록
│   │   └── news/
│   │       └── page.tsx        # News / Instagram 피드
│   │
│   ├── components/
│   │   ├── Header.tsx          # 네비게이션
│   │   ├── Footer.tsx          # 푸터
│   │   ├── ProjectGrid.tsx     # 프로젝트 그리드 (공용 컴포넌트)
│   │   ├── TagFilter.tsx       # 태그 필터링 UI
│   │   └── ProjectCard.tsx     # 개별 프로젝트 카드
│   │
│   ├── lib/
│   │   ├── projects.ts         # ★ 핵심: 파일시스템 기반 프로젝트 로더
│   │   └── types.ts            # TypeScript 타입 정의
│   │
│   └── data/
│       └── projects/
│           ├── research/       # 연구 프로젝트 폴더들
│           │   ├── smart-city-platform/
│           │   │   ├── info.json
│           │   │   ├── thumbnail.jpg
│           │   │   └── gallery-01.jpg
│           │   └── pedestrian-network/
│           │       ├── info.json
│           │       └── thumbnail.jpg
│           │
│           └── design/         # 디자인 프로젝트 폴더들
│               ├── waterfront-masterplan/
│               │   ├── info.json
│               │   └── thumbnail.jpg
│               └── station-plaza/
│                   ├── info.json
│                   └── thumbnail.jpg
```

## 핵심 원리: 프로젝트 자동 동기화

```
[/data/projects/research/] ──build time──▶ getProjects('research')
         │                                        │
    폴더 자동 스캔                           info.json 파싱
         │                                        │
    slug = 폴더명                          → ProjectData[]
         │                                        │
    info.json + 이미지                     → 정적 HTML 생성
```

**새 프로젝트 추가 = 폴더 하나 생성 + info.json 작성 → 빌드하면 자동 반영**

## 설치 및 실행

```bash
npx create-next-app@latest urban-lab-web --typescript --tailwind --app --src-dir
cd urban-lab-web
npm install
npm run dev          # 개발 서버
npm run build        # 정적 빌드 (out/ 폴더 생성)
```

## GitHub Pages 배포

```bash
npm install --save-dev gh-pages
npx gh-pages -d out
```

또는 GitHub Actions 사용 (권장) → `.github/workflows/deploy.yml` 참조
