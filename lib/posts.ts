import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { categories } from '@/lib/site';

export type PostMeta = {
  slug: string; // 파일명(확장자 제외)이 곧 주소가 됩니다
  title: string;
  date: string; // YYYY-MM-DD
  category: string; // 글이 들어 있는 폴더 이름 (lib/site.ts 의 categories 중 하나의 slug)
  tags: string[];
  summary: string;
  readingMinutes: number;
};

export type Category = { slug: string; title: string; count: number };

export type Post = PostMeta & { body: string };

type LoadedPost = Post & { draft: boolean };

const POSTS_DIR = path.join(process.cwd(), 'content', 'posts');

// frontmatter의 날짜(2026-10-12)는 YAML 파서가 Date로 바꿔버리므로 문자열로 되돌립니다.
function toDateString(value: unknown) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  return String(value ?? '').slice(0, 10);
}

// content/posts/<카테고리>/<slug>.md 구조이므로 폴더 이름이 곧 카테고리입니다.
function readPost(category: string, file: string): LoadedPost {
  const slug = file.replace(/\.md$/, '');
  const raw = fs.readFileSync(path.join(POSTS_DIR, category, file), 'utf8');
  const { data, content } = matter(raw);
  const body = content.trim();

  return {
    slug,
    title: String(data.title ?? slug),
    date: toDateString(data.date),
    category,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    summary: String(data.summary ?? ''),
    // 한글 기준 분당 약 500자
    readingMinutes: Math.max(1, Math.round(body.replace(/\s/g, '').length / 500)),
    draft: data.draft === true,
    body,
  };
}

function loadAll(): LoadedPost[] {
  if (!fs.existsSync(POSTS_DIR)) return [];

  const entries = fs.readdirSync(POSTS_DIR, { withFileTypes: true });
  const allowed = categories.map((item) => item.slug).join(', ');

  // 폴더 밖에 둔 글은 카테고리를 알 수 없으므로 빌드 단계에서 막습니다.
  const looseFile = entries.find((entry) => entry.isFile() && entry.name.endsWith('.md'));
  if (looseFile) {
    throw new Error(`content/posts/${looseFile.name}: 카테고리 폴더 안에 넣어 주세요. (사용 가능: ${allowed})`);
  }

  const posts = entries
    .filter((entry) => entry.isDirectory())
    .flatMap((dir) => {
      // 폴더 이름 오타로 글이 어느 주제에도 안 보이는 일이 없도록 막습니다.
      if (!categories.some((item) => item.slug === dir.name)) {
        throw new Error(`content/posts/${dir.name}/: 폴더 이름이 lib/site.ts 의 categories 에 없습니다. (사용 가능: ${allowed})`);
      }
      return fs
        .readdirSync(path.join(POSTS_DIR, dir.name))
        .filter((file) => file.endsWith('.md'))
        .map((file) => readPost(dir.name, file));
    });

  // 주소는 /posts/<slug>/ 라서 폴더가 달라도 파일 이름이 겹치면 안 됩니다.
  const seen = new Map<string, string>();
  for (const post of posts) {
    const prev = seen.get(post.slug);
    if (prev) {
      throw new Error(`${post.slug}.md 가 ${prev}/ 와 ${post.category}/ 에 모두 있습니다. 파일 이름은 겹치지 않게 지어 주세요.`);
    }
    seen.set(post.slug, post.category);
  }

  return (
    posts
      // draft: true 인 글은 개발 서버에서만 보이고 배포에서는 빠집니다.
      .filter((post) => process.env.NODE_ENV !== 'production' || !post.draft)
      .sort((a, b) => b.date.localeCompare(a.date))
  );
}

export function getAllPosts(): PostMeta[] {
  return loadAll().map(({ slug, title, date, category, tags, summary, readingMinutes }) => ({
    slug,
    title,
    date,
    category,
    tags,
    summary,
    readingMinutes,
  }));
}

export function getPost(slug: string): Post | null {
  const post = loadAll().find((item) => item.slug === slug);
  if (!post) return null;

  const { draft: _draft, ...rest } = post;
  return rest;
}

export function getCategories(): Category[] {
  const posts = getAllPosts();
  return categories.map(({ slug, title }) => ({
    slug,
    title,
    count: posts.filter((post) => post.category === slug).length,
  }));
}

export function getCategory(slug: string): Category | null {
  return getCategories().find((item) => item.slug === slug) ?? null;
}

export function getPostsByCategory(slug: string): PostMeta[] {
  return getAllPosts().filter((post) => post.category === slug);
}
