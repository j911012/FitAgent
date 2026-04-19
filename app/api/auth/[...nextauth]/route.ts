import { handlers } from '@/auth';

// Auth.jsのGET/POSTハンドラーをそのままexportする
// GET: セッション取得・OAuthコールバック
// POST: サインイン・サインアウト
export const { GET, POST } = handlers;
