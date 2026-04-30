import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { fetchExercises } from '@/app/(private)/workouts/apis/exercises.server';

// 種目一覧取得 Route Handler
// 種目選択モーダルのTanStack Queryから呼ばれる
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await fetchExercises(session.user.id);
  if (!result.isSuccess) {
    return NextResponse.json({ error: result.errorMessage }, { status: 500 });
  }

  return NextResponse.json(result.data);
}
