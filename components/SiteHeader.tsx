import Link from 'next/link';
import { site } from '@/lib/site';

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="site-header-inner">
        <Link href="/" className="site-name">
          {site.title}
        </Link>
        <p className="site-description">{site.description}</p>
      </div>
    </header>
  );
}
