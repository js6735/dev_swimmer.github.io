---
title: 블로그를 시작합니다
date: 2026-10-12
tags: [회고, 블로그]
summary: Next.js 정적 export로 만들어 GitHub Pages에 올리는 블로그입니다.
---

이 글은 `content/posts/hello-blog.md` 파일입니다. 파일을 추가하거나 고치고 push 하면 자동으로 배포됩니다.

## 이 블로그가 동작하는 방식

글은 저장소 안의 마크다운 파일이고, 빌드할 때 한 번에 정적 HTML로 만들어집니다.

- 파일 이름이 글 주소가 됩니다. (`hello-blog.md` → `/posts/hello-blog/`)
- 맨 위 frontmatter에 제목, 날짜, 태그, 요약을 적습니다.
- `draft: true`를 넣으면 개발 서버에서만 보이고 배포에서는 빠집니다.

> 서버가 없으니 느릴 일도, 고장 날 일도 거의 없습니다.

## 코드 블록

```ts
type Post = {
  slug: string;
  title: string;
  date: string;
};

const latest = (posts: Post[]) => posts[0];
```

위챗 미니프로그램 코드도 색이 입혀집니다.

```wxml
<view class="card" wx:for="{{list}}" wx:key="id">
  <text>{{item.name}}</text>
</view>
```
