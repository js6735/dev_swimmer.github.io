import { PostBrowser } from '@/components/PostBrowser';
import { getAllPosts } from '@/lib/posts';

export default function HomePage() {
  const posts = getAllPosts();

  if (posts.length === 0) {
    return (
      <p className="empty">
        아직 글이 없습니다. content/posts/ 폴더에 마크다운(.md) 파일을 추가하세요.
      </p>
    );
  }

  return (
    <>
      <h1 className="page-title">전체 글</h1>
      <PostBrowser posts={posts} />
    </>
  );
}
