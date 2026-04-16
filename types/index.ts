// Googleプロフィール情報をDBに保存したユーザー型
export type User = {
  id: string;   // DBで生成したUUID
  name: string | null;
  email: string | null;
  image: string | null;
};

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
