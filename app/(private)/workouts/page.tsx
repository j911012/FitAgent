import { Suspense } from 'react';
import Link from 'next/link';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import { fetchWorkoutSessions } from './apis/workouts.server';
import { fetchExercises } from './apis/exercises.server';
import SessionCard from './components/SessionCard';
import FilterBar from './components/FilterBar';
import Pagination from './components/Pagination';
import type { WorkoutSessionFilter, WorkoutSessionSummary } from './types';
import type { Result } from '@/types';

type SearchParams = {
  bodyPart?: string;
  exercise?: string;
  range?: string;
  page?: string;
};

type Props = {
  searchParams: Promise<SearchParams>;
};

// (private)グループは既に動的レンダリングのため、auth()によるSSG無効化の影響はない
// userIdをfetch関数に渡すためasync Componentとする
export default async function WorkoutsPage({ searchParams }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const userId = session.user.id;
  // Next.js 15からsearchParamsはPromiseのためawaitが必要
  const params = await searchParams;

  const page = Math.max(1, Number(params.page) || 1);
  const filter: WorkoutSessionFilter = {
    bodyPart: (params.bodyPart as WorkoutSessionFilter['bodyPart']) || undefined,
    exerciseId: params.exercise || undefined,
    range: (params.range as WorkoutSessionFilter['range']) || 'all',
    page,
  };

  // Promiseを作成するがawaitしない。Suspense境界内の子コンポーネントでストリーミングする
  const sessionsPromise = fetchWorkoutSessions(userId, filter);
  const exercisesPromise = fetchExercises(userId);

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto flex flex-col gap-4 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-[17px] font-bold" style={{ color: 'var(--fg)' }}>
          トレーニング履歴
        </h1>
        <Link
          href="/workouts/new"
          className="flex items-center gap-1 px-3 py-1.5 rounded-[8px] text-[13px] font-medium transition-colors"
          style={{
            background: 'linear-gradient(135deg, var(--red) 0%, var(--purple) 100%)',
            color: '#fff',
          }}
        >
          + 新しいセッション
        </Link>
      </div>

      {/* useSearchParamsを使うClient ComponentはSuspenseでラップが必要 */}
      <Suspense fallback={<FilterBarSkeleton />}>
        <FilterBar exercisesPromise={exercisesPromise} />
      </Suspense>

      <Suspense fallback={<SessionsListSkeleton />}>
        <SessionsContent sessionsPromise={sessionsPromise} page={page} />
      </Suspense>
    </div>
  );
}

// sessionsPromiseをSuspense境界内で解凍するasync Server Component
async function SessionsContent({
  sessionsPromise,
  page,
}: {
  sessionsPromise: Promise<Result<{ sessions: WorkoutSessionSummary[]; hasNextPage: boolean }>>;
  page: number;
}) {
  const result = await sessionsPromise;

  if (!result.isSuccess) {
    return (
      <div
        className="p-4 rounded-[10px]"
        style={{ background: 'rgba(255,80,80,0.08)', border: '1px solid rgba(255,80,80,0.2)' }}
      >
        <p className="text-[13px]" style={{ color: 'var(--fg-3)' }}>
          データの取得に失敗しました: {result.errorMessage}
        </p>
      </div>
    );
  }

  const { sessions, hasNextPage } = result.data;

  if (sessions.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center gap-3 py-16 rounded-[12px]"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--line)' }}
      >
        <p className="text-[15px] font-medium" style={{ color: 'var(--fg-3)' }}>
          まだトレーニング記録がありません
        </p>
        <p className="text-[13px]" style={{ color: 'var(--fg-4)' }}>
          最初のセッションを作成しましょう
        </p>
        <Link
          href="/workouts/new"
          className="mt-2 px-4 py-2 rounded-[8px] text-[13px] font-medium"
          style={{
            background: 'linear-gradient(135deg, var(--red) 0%, var(--purple) 100%)',
            color: '#fff',
          }}
        >
          + 新しいセッション
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3">
        {sessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))}
      </div>

      {/* useSearchParamsを使うPaginationはSuspenseでラップ */}
      <Suspense fallback={null}>
        <Pagination currentPage={page} hasNextPage={hasNextPage} />
      </Suspense>
    </>
  );
}

function FilterBarSkeleton() {
  return (
    <div className="flex gap-2">
      <div
        className="h-9 flex-1 rounded-[8px] animate-pulse"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      />
      <div
        className="h-9 w-28 rounded-[8px] animate-pulse shrink-0"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      />
    </div>
  );
}

function SessionsListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="h-[72px] rounded-[12px] animate-pulse"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        />
      ))}
    </div>
  );
}
