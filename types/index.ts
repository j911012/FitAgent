export type BodyRecord = {
  id: string;
  date: string; // 'YYYY-MM-DD'
  weight_kg: number;
  body_fat: number | null;
  created_at: string;
  updated_at: string;
};

export type Goal = {
  id: string;
  target_weight_kg: number | null;
  target_body_fat: number | null;
  created_at: string;
  updated_at: string;
};

// 想定済みエラーをthrowせずに型安全に表現するためResult型を使用
export type Result<T> =
  | { isSuccess: true; data: T }
  | { isSuccess: false; errorMessage: string };
