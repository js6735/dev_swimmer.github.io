import { getAllPosts, getCategories } from '@/lib/posts';
import { SidebarNav } from './SidebarNav';

export function Sidebar() {
  const posts = getAllPosts();
  // 글 상세 페이지에서도 그 글의 주제가 선택된 상태로 보이도록 글 → 주제 표를 넘겨줍니다.
  const postCategory = Object.fromEntries(posts.map((post) => [post.slug, post.category]));

  return (
    <aside className="sidebar">
      <SidebarNav categories={getCategories()} total={posts.length} postCategory={postCategory} />
    </aside>
  );
}
