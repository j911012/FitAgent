'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type Props = {
  currentPage: number;
  hasNextPage: boolean;
};

const btnBase = 'px-3 py-1.5 rounded-[7px] text-[13px] transition-colors';

export default function Pagination({ currentPage, hasNextPage }: Props) {
  const searchParams = useSearchParams();

  function buildPageUrl(page: number): string {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete('page');
    } else {
      params.set('page', String(page));
    }
    return `/workouts?${params.toString()}`;
  }

  const hasPrev = currentPage > 1;

  if (!hasPrev && !hasNextPage) return null;

  return (
    <div className="flex items-center justify-center gap-3 pt-2">
      {hasPrev ? (
        <Link
          href={buildPageUrl(currentPage - 1)}
          className={btnBase}
          style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--fg-2)' }}
        >
          ← 前のページ
        </Link>
      ) : (
        <span className={btnBase} style={{ color: 'var(--fg-4)', cursor: 'not-allowed' }}>
          ← 前のページ
        </span>
      )}

      <span className="text-[13px]" style={{ color: 'var(--fg-4)' }}>
        {currentPage}ページ
      </span>

      {hasNextPage ? (
        <Link
          href={buildPageUrl(currentPage + 1)}
          className={btnBase}
          style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--fg-2)' }}
        >
          次のページ →
        </Link>
      ) : (
        <span className={btnBase} style={{ color: 'var(--fg-4)', cursor: 'not-allowed' }}>
          次のページ →
        </span>
      )}
    </div>
  );
}
