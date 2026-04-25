import { signIn } from '@/auth';

// ブランドマーク: 赤→紫グラデーションの角丸正方形にボルトアイコン
function BrandMark({ size = 52 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size <= 32 ? 8 : 14,
        background: 'linear-gradient(135deg, var(--red) 0%, var(--purple) 100%)',
        boxShadow: '0 12px 32px oklch(0.68 0.22 18 / 0.40)',
        display: 'grid',
        placeItems: 'center',
      }}
    >
      <svg
        width={size * 0.42}
        height={size * 0.42}
        viewBox="0 0 24 24"
        fill="white"
      >
        <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" />
      </svg>
    </div>
  );
}

// Google ブランドアイコン
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div
        className="flex flex-col items-center gap-8 w-full max-w-[320px] px-8 py-10"
        style={{
          background: 'var(--bg-1)',
          border: '1px solid var(--line)',
          borderRadius: 22,
        }}
      >
        {/* ブランドマーク + タイトル */}
        <div className="flex flex-col items-center gap-4">
          <BrandMark size={52} />
          <div className="flex flex-col items-center gap-1">
            <h1
              className="text-[20px] tracking-widest"
              style={{ fontWeight: 800, letterSpacing: '0.08em', color: 'var(--fg)' }}
            >
              FIT AGENT
            </h1>
            <p className="text-[13px] text-center" style={{ color: 'var(--fg-3)' }}>
              体重・トレーニングを記録・可視化する
            </p>
          </div>
        </div>

        {/* エラーメッセージ */}
        {error && (
          <div
            className="w-full px-4 py-3 text-[13px] rounded-[10px]"
            style={{
              background: 'oklch(0.68 0.22 18 / 0.12)',
              border: '1px solid oklch(0.68 0.22 18 / 0.30)',
              color: 'oklch(0.82 0.16 18)',
            }}
          >
            ログインに失敗しました。もう一度お試しください。
          </div>
        )}

        {/* Googleログインボタン */}
        <form
          action={async () => {
            'use server';
            await signIn('google', { redirectTo: '/' });
          }}
          className="w-full"
        >
          <button
            type="submit"
            className="flex items-center justify-center gap-3 w-full px-4 py-3 text-[14px] font-medium transition-opacity hover:opacity-80"
            style={{
              background: 'var(--bg-2)',
              border: '1px solid var(--line-2)',
              borderRadius: 12,
              color: 'var(--fg-2)',
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
