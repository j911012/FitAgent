import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { fetchWorkoutSessionDetail } from '../apis/workouts.server';
import EditSessionForm from './components/EditSessionForm';

type Props = {
  params: Promise<{ sessionId: string }>;
};

export default async function EditWorkoutPage({ params }: Props) {
  const session = await auth();
  if (!session?.user?.id) redirect('/login');

  const { sessionId } = await params;
  const result = await fetchWorkoutSessionDetail(sessionId, session.user.id);

  // セッションが存在しない・または他ユーザーのセッションは 404 を返す
  if (!result.isSuccess || !result.data) {
    notFound();
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto flex flex-col gap-6 overflow-y-auto h-full">
      <EditSessionForm sessionDetail={result.data} />
    </div>
  );
}
