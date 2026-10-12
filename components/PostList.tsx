import Link from 'next/link';
import { TagList } from '@/components/TagList';
import { formatDate, type PostMeta } from '@/lib/posts';

export function PostList({ posts }: { posts: PostMeta[] }) {
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
