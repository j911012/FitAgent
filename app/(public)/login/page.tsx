import { signIn } from '@/auth';

// ロゴマーク（ダンベル型アイコン）
function LogoMark({ size = 40 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: '#1a1040',
        borderRadius: size <= 32 ? 8 : 12,
        border: '0.5px solid rgba(124,58,237,0.4)',
      }}
    >
      <svg width={size * 0.6} height={size * 0.6} viewBox="0 0 24 24" fill="none">
        <rect x="1.5" y="9" width="3" height="6" rx="1" fill="#A78BFA" />
        <rect x="4.5" y="7" width="2.5" height="10" rx="1" fill="#A78BFA" />
        <rect x="7" y="10.5" width="10" height="3" rx="1.5" fill="#7C6AC4" />
        <rect x="17" y="7" width="2.5" height="10" rx="1" fill="#A78BFA" />
        <rect x="19.5" y="9" width="3" height="6" rx="1" fill="#A78BFA" />
      </svg>
    </div>
  );
}

// Google ブランドアイコン
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

// searchParams で認証エラーを受け取り、インライン表示する
// Auth.js はログイン失敗時に ?error=... をクエリパラメータとして付与する
type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div
        className="flex flex-col items-center gap-8 w-full max-w-[320px] rounded-[16px] px-8 py-10"
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '0.5px solid rgba(255,255,255,0.08)',
        }}
      >
        {/* ロゴ + タイトル */}
        <div className="flex flex-col items-center gap-3">
          <LogoMark size={52} />
          <h1 className="text-[22px] font-semibold text-white/85 tracking-tight">
            FitLog
          </h1>
          <p className="text-[13px] text-white/35 text-center">
            体重・体脂肪率を記録・可視化する
          </p>
        </div>

        {/* エラーメッセージ（認証失敗時） */}
        {error && (
          <div
            className="w-full rounded-[8px] px-4 py-3 text-[13px] text-red-300"
            style={{ background: 'rgba(239,68,68,0.1)', border: '0.5px solid rgba(239,68,68,0.25)' }}
          >
            ログインに失敗しました。もう一度お試しください。
          </div>
        )}

        {/* Googleログインボタン */}
        {/* signIn をサーバーアクションとして直接 form action に渡す */}
        <form
          action={async () => {
            'use server';
            await signIn('google', { redirectTo: '/' });
          }}
          className="w-full"
        >
          <button
            type="submit"
            className="flex items-center justify-center gap-3 w-full rounded-[10px] px-4 py-3 text-[14px] font-medium text-white/85 transition-opacity hover:opacity-80"
            style={{
              background: 'rgba(255,255,255,0.07)',
              border: '0.5px solid rgba(255,255,255,0.12)',
            }}
          >
            <GoogleIcon />
            Googleでログイン
          </button>
        </form>
      </div>
    </div>
  );
}
