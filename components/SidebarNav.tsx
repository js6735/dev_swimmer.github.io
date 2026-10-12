'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Category } from '@/lib/posts';

type Props = {
  categories: Category[];
  total: number;
  postCategory: Record<string, string>;
};

// 현재 주소에서 선택된 주제를 찾습니다. '' 는 전체 글, null 은 선택 없음.
function activeCategory(pathname: string, postCategory: Record<string, string>) {
  const [section, slug] = pathname.split('/').filter(Boolean);
  if (!section) return '';
  if (section === 'category') return slug ?? null;
  if (section === 'posts') return postCategory[slug] ?? null;
  return null;
}

export function SidebarNav({ categories, total, postCategory }: Props) {
  const active = activeCategory(usePathname(), postCategory);

  const items = [
    { href: '/', key: '', title: '전체 글', count: total },
    ...categories.map((item) => ({
      href: `/category/${item.slug}/`,
      key: item.slug,
      title: item.title,
      count: item.count,
    })),
  ];

  return (
    <nav aria-label="주제">
      <h2 className="sidebar-heading">주제</h2>
      <ul className="sidebar-list">
        {items.map((item) => (
          <li key={item.key}>
            <Link
              href={item.href}
              className="sidebar-link"
              aria-current={active === item.key ? 'page' : undefined}
            >
              <span>{item.title}</span>
              <span className="sidebar-count">{item.count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
