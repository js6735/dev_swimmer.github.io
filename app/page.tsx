import Link from 'next/link';
import { TagList } from '@/components/TagList';
import { formatDate, getAllPosts } from '@/lib/posts';

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
    <ol className="post-list">
      {posts.map((post) => (
        <li key={post.slug} className="post-row cols">
          <time className="post-date" dateTime={post.date}>
            {formatDate(post.date)}
          </time>
          <div>
            <h2 className="post-row-title">
              <Link href={`/posts/${post.slug}/`}>{post.title}</Link>
            </h2>
            {post.summary && <p className="post-row-summary">{post.summary}</p>}
            <TagList tags={post.tags} />
          </div>
        </li>
      ))}
    </ol>
  );
}
