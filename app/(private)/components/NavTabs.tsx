'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavTab = {
  label: string;
  href: string;
  // hrefで始まるパスをすべてアクティブ扱いにするか（/workouts配下など）
  matchPrefix?: boolean;
};

const NAV_TABS: NavTab[] = [
  { label: 'ホーム', href: '/' },
  { label: 'トレーニング', href: '/workouts', matchPrefix: true },
];

export default function NavTabs() {
  const pathname = usePathname();

  const isActive = (tab: NavTab) => {
    if (tab.matchPrefix) return pathname.startsWith(tab.href);
    return pathname === tab.href;
  };

  return (
    <nav className="flex items-center gap-1">
      {NAV_TABS.map((tab) => {
        const active = isActive(tab);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className="px-3 py-1 rounded-[6px] text-[13px] font-medium transition-colors"
            style={{
              color: active ? 'var(--fg)' : 'var(--fg-4)',
              background: active ? 'var(--line)' : 'transparent',
            }}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
