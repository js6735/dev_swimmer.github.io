import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Markdown } from '@/components/Markdown';
import { TagList } from '@/components/TagList';
import { formatDate, getAllPosts, getPost } from '@/lib/posts';

// output: 'export' 에서는 빌드 때 만든 슬러그만 존재합니다.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  return post ? { title: post.title, description: post.summary || undefined } : {};
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <article className="post cols">
      <div className="post-meta">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <span>읽는 데 약 {post.readingMinutes}분</span>
        <TagList tags={post.tags} />
      </div>
      <div>
        <h1 className="post-title">{post.title}</h1>
        <Markdown>{post.body}</Markdown>
      </div>
    </article>
  );
}
