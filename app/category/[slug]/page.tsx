import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PostBrowser } from '@/components/PostBrowser';
import { getCategories, getCategory, getPostsByCategory } from '@/lib/posts';

// output: 'export' 에서는 빌드 때 만든 주제 페이지만 존재합니다.
export const dynamicParams = false;

export function generateStaticParams() {
  return getCategories().map((category) => ({ slug: category.slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  return category ? { title: category.title } : {};
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const posts = getPostsByCategory(slug);

  return (
    <>
      <h1 className="page-title">
        {category.title} <span className="page-title-count">{posts.length}</span>
      </h1>
      {posts.length > 0 ? (
        <PostBrowser posts={posts} />
      ) : (
        <p className="empty">이 주제에는 아직 글이 없습니다.</p>
      )}
    </>
  );
}
