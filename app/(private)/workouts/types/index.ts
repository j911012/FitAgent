export type BodyPart = 'chest' | 'back' | 'shoulder' | 'arm' | 'leg' | 'abs';

export type Exercise = {
  id: string;
  user_id: string | null; // null = グローバルマスタ（全ユーザー共通のプリセット）
  name: string;
  body_part: BodyPart;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export type WorkoutSession = {
  id: string;
  user_id: string;
  date: string; // 'YYYY-MM-DD'
  created_at: string;
  updated_at: string;
};

export type WorkoutSet = {
  id: string;
  user_id: string;
  session_id: string;
  exercise_id: string;
  set_number: number;
  weight_kg: number;
  reps: number;
  memo: string | null;
  created_at: string;
  updated_at: string;
};

// セッション編集ページ用: セットに種目情報を結合した詳細型
export type WorkoutSessionDetail = WorkoutSession & {
  sets: (WorkoutSet & { exercise: Exercise })[];
};

// セッション一覧カード用: 集計済みサマリー型
export type WorkoutSessionSummary = WorkoutSession & {
  exerciseCount: number;
  totalSets: number;
  totalVolume: number; // Σ(weight_kg × reps)
};

// セッション一覧の絞り込み条件
export type WorkoutSessionFilter = {
  bodyPart?: BodyPart;
  exerciseId?: string;
  range?: '7days' | '30days' | '90days' | 'all';
  page?: number;
};
