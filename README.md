# 개발 기록 블로그

Next.js 정적 export + GitHub Pages. 글은 저장소 안의 마크다운 파일입니다.

## 설치와 실행

```bash
yarn add next react react-dom react-markdown remark-gfm rehype-slug rehype-highlight gray-matter
yarn add -D typescript @types/node @types/react @types/react-dom

yarn dev     # http://localhost:3000
yarn build   # out/ 에 정적 사이트 생성
```

## 글 쓰기

`content/posts/` 에 `.md` 파일을 추가합니다. 파일 이름이 주소가 됩니다. (영문 소문자·숫자·하이픈 권장)

```md
---
title: 글 제목
date: 2026-10-12
category: frontend   # lib/site.ts 의 categories 중 하나 (필수)
tags: [태그1, 태그2]
summary: 목록에 보일 한두 줄 요약
draft: false   # true면 개발 서버에서만 보임
---

본문을 마크다운으로 씁니다.
```

## 주제(사이드바)

왼쪽 사이드바의 주제 목록은 `lib/site.ts` 의 `categories` 에서 관리합니다. 적은 순서대로 보이고, 주제를 누르면 `/category/slug/` 에서 그 주제의 글만 모아 보여줍니다.

```ts
export const categories = [
  { slug: 'frontend', title: '프론트엔드' },
  { slug: 'wechat', title: '위챗 미니프로그램' },
];
```

글의 `category` 가 목록에 없는 값이면 오타를 막기 위해 빌드가 실패합니다.

이미지는 `public/images/` 에 넣고 `![설명](/images/파일명.png)` 로 적습니다.

## GitHub Pages 배포

1. 저장소를 만들어 push 합니다. (`username.github.io` 저장소면 루트, 그 외에는 `/저장소명` 아래로 배포되며 자동 처리됩니다)
2. Settings → Pages → Source를 **GitHub Actions**로 바꿉니다.
3. `main`에 push 하면 배포됩니다.

## 구조

```
app/              라우트 (전체 목록, 주제별 목록, 글 상세) + globals.css
components/       SiteHeader, Sidebar(주제 목록), PostList, Markdown, TagList
content/posts/    글 (마크다운)
lib/              site.ts(블로그 이름, 주제 목록), posts.ts(글 읽기)
public/images/    글에 쓰는 이미지
```
