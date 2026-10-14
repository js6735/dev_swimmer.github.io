// 블로그 이름과 소개. 여기만 바꾸면 전체에 반영됩니다.
export const site = {
  title: '개발 기록',
  description: '프론트엔드 개발을 하며 배운 것들을 기록합니다.',
};

// 사이드바에 보이는 주제 목록. 적은 순서대로 사이드바에 나옵니다.
// slug는 주소(/category/slug/)와 글을 넣는 폴더 이름(content/posts/slug/)으로 쓰이므로 영문 소문자·숫자·하이픈으로 짓습니다.
export const categories = [
  { slug: 'frontend', title: '프론트엔드' },
  { slug: 'wechat', title: '위챗 미니프로그램' },
  { slug: 'server', title: '서버' },
  { slug: 'infra', title: '인프라' },
  { slug: 'linux', title: '리눅스' },
  { slug: 'git', title: 'Git' },
  { slug: 'blog', title: '블로그 운영' },
] as const;

export type CategorySlug = (typeof categories)[number]['slug'];
