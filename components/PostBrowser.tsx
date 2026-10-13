'use client';

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';
import { PostList } from '@/components/PostList';
import type { PostMeta } from '@/lib/posts';

const PAGE_SIZE = 10;
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

type Props = { posts: PostMeta[] };

// 정적 export 라서 검색·페이지 이동은 브라우저에서 처리하고, 상태는 주소(?q=&page=)에 남깁니다.
// 그래야 글을 읽고 뒤로 가도 보던 페이지와 검색어가 유지됩니다.
// 빌드 결과(HTML)에는 Suspense fallback 인 첫 페이지가 들어갑니다.
export function PostBrowser({ posts }: Props) {
  return (
    <Suspense fallback={<Browser posts={posts} initialQuery="" page={1} />}>
      <BrowserFromUrl posts={posts} />
    </Suspense>
  );
}

function BrowserFromUrl({ posts }: Props) {
  const params = useSearchParams();
  const page = Number.parseInt(params.get('page') ?? '', 10);

  return (
    <Browser
      posts={posts}
      initialQuery={params.get('q') ?? ''}
      page={Number.isNaN(page) ? 1 : page}
    />
  );
}

type BrowserProps = Props & { initialQuery: string; page: number };

function Browser({ posts, initialQuery, page }: BrowserProps) {
  const pathname = usePathname();
  // 입력값은 컴포넌트 상태로 둡니다. 주소에서 바로 읽으면 한글 조합 중에 글자가 깨질 수 있습니다.
  const [query, setQuery] = useState(initialQuery);

  const keyword = query.trim().toLowerCase();
  const matched = keyword
    ? posts.filter((post) => post.title.toLowerCase().includes(keyword))
    : posts;

  const totalPages = Math.max(1, Math.ceil(matched.length / PAGE_SIZE));
  const current = Math.min(Math.max(1, page), totalPages);
  const visible = matched.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const hrefFor = (target: number, q = query) => {
    const search = new URLSearchParams();
    if (q.trim()) search.set('q', q.trim());
    if (target > 1) search.set('page', String(target));
    const qs = search.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  const onSearch = (value: string) => {
    setQuery(value);
    // 검색어가 바뀌면 1페이지로. 글자마다 기록이 쌓이지 않도록 replace 합니다.
    // Link 와 달리 history API 는 basePath 를 붙여주지 않으므로 직접 붙입니다.
    window.history.replaceState(null, '', `${basePath}${hrefFor(1, value)}`);
  };

  return (
    <>
      <div role="search" className="post-search">
        <label htmlFor="post-search-input" className="visually-hidden">
          제목으로 검색
        </label>
        <input
          id="post-search-input"
          type="search"
          className="post-search-input"
          placeholder="제목으로 검색"
          value={query}
          onChange={(event) => onSearch(event.target.value)}
          autoComplete="off"
        />
        {keyword && (
          <p className="post-search-result" aria-live="polite">
            {matched.length}개의 글
          </p>
        )}
      </div>

      {visible.length > 0 ? (
        <PostList posts={visible} />
      ) : (
        <p className="empty">‘{query.trim()}’ 이(가) 제목에 들어간 글이 없습니다.</p>
      )}

      {totalPages > 1 && <Pagination current={current} total={totalPages} hrefFor={hrefFor} />}
    </>
  );
}

type PaginationProps = {
  current: number;
  total: number;
  hrefFor: (page: number) => string;
};

function Pagination({ current, total, hrefFor }: PaginationProps) {
  return (
    <nav className="pagination" aria-label="페이지">
      {current > 1 ? (
        <Link className="pagination-step" href={hrefFor(current - 1)}>
          이전
        </Link>
      ) : (
        <span className="pagination-step" aria-disabled="true">
          이전
        </span>
      )}

      <ol className="pagination-list">
        {pageItems(current, total).map((item, index) =>
          item === 'gap' ? (
            <li key={`gap-${index}`} className="pagination-gap" aria-hidden="true">
              …
            </li>
          ) : (
            <li key={item}>
              <Link
                className="pagination-link"
                href={hrefFor(item)}
                aria-current={item === current ? 'page' : undefined}
              >
                {item}
              </Link>
            </li>
          ),
        )}
      </ol>

      {current < total ? (
        <Link className="pagination-step" href={hrefFor(current + 1)}>
          다음
        </Link>
      ) : (
        <span className="pagination-step" aria-disabled="true">
          다음
        </span>
      )}
    </nav>
  );
}

// 1 … 4 5 6 … 12 처럼 처음·끝과 현재 페이지 주변만 보여줍니다.
function pageItems(current: number, total: number): (number | 'gap')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = [1, current - 1, current, current + 1, total].filter(
    (page, index, list) => page >= 1 && page <= total && list.indexOf(page) === index,
  );
  pages.sort((a, b) => a - b);

  const items: (number | 'gap')[] = [];
  for (const page of pages) {
    const prev = items[items.length - 1];
    if (typeof prev === 'number' && page - prev > 1) items.push('gap');
    items.push(page);
  }
  return items;
}
