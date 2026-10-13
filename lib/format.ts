// 클라이언트 컴포넌트에서도 쓰므로 node:fs 를 쓰는 lib/posts.ts 와 분리해 둡니다.
export function formatDate(date: string) {
  return date.replaceAll('-', '.');
}
