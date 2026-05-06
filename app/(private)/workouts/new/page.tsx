import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { fetchTodaySession } from '../apis/workouts.server';
import { toDateString } from '@/utils/date';
import NewSessionForm from './components/NewSessionForm';

// today を引数で渡すことでサーバー側のタイムゾーン依存を避ける
// （セッションはクライアントの today で保存されるため、比較も同じ基準を使う）
export default async function NewWorkoutPage() {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const today = toDateString(new Date());
  const result = await fetchTodaySession(session.user.id, today);

  // 今日のセッションが存在する場合は編集ページへリダイレクトする
  if (result.isSuccess && result.data) {
    redirect(`/workouts/${result.data.id}`);
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto flex flex-col gap-6 overflow-y-auto h-full">
      <div className="flex items-center gap-3">
        <Link
          href="/workouts"
          className="text-[13px] transition-colors"
          style={{ color: 'var(--fg-4)' }}
        >
          ← 戻る
        </Link>
        <h1 className="text-[17px] font-bold" style={{ color: 'var(--fg)' }}>
          新規セッション
        </h1>
      </div>

      <NewSessionForm />
    </div>
  );
}
