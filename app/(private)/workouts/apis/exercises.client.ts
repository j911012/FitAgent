import type { Exercise } from '../types';

// Route Handlerを経由してサーバー側でフェッチする（APIキー等をクライアントに露出させない）
// エラーはthrowしてTanStack Queryのerrorプロパティに委任する
export async function fetchExercisesClient(): Promise<Exercise[]> {
  const res = await fetch('/api/exercises');
  if (!res.ok) throw new Error('種目の取得に失敗しました');
  return await res.json();
}
