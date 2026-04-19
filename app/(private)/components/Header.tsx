import Image from 'next/image';
import { signOut } from '@/auth';

// ロゴマーク（ダンベル型アイコン）- Dashboard.tsx のものと同一
function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <div
      className="flex items-center justify-center flex-shrink-0"
      style={{
        width: size,
        height: size,
        background: '#1a1040',
        borderRadius: size <= 24 ? 6 : 8,
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

// ユーザー画像が未設定の場合に名前のイニシャルを円形で表示するフォールバック
function InitialsAvatar({ name }: { name?: string | null }) {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  return (
    <div
      className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0"
      style={{ background: 'rgba(124,58,237,0.55)' }}
    >
      {initial}
    </div>
  );
}

// Auth.js の DefaultSession['user'] は name / email / image が optional（undefined になり得る）
type Props = {
  user: {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

export default function Header({ user }: Props) {
  return (
    <header
      className="flex items-center justify-between px-5 h-[46px] flex-shrink-0"
      style={{ borderBottom: '0.5px solid rgba(255,255,255,0.05)' }}
    >
      {/* ロゴ */}
      <div className="flex items-center gap-2.5">
        <LogoMark size={26} />
        <span className="text-[14px] font-medium text-white/75">FitLog</span>
      </div>

      {/* ユーザー情報 + ログアウト */}
      <div className="flex items-center gap-2.5">
        {/* アバター: Google プロフィール画像 or イニシャル */}
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name ?? 'ユーザー'}
            width={26}
            height={26}
            className="rounded-full flex-shrink-0"
          />
        ) : (
          <InitialsAvatar name={user.name} />
        )}

        {/* ユーザー名（スマートフォンでは非表示） */}
        <span className="text-[13px] text-white/55 hidden sm:block truncate max-w-[120px]">
          {user.name}
        </span>

        {/* ログアウトボタン: signOut をサーバーアクションとして form action に渡す */}
        <form
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/login' });
          }}
        >
          <button
            type="submit"
            className="text-[12px] text-white/28 hover:text-white/55 transition-colors px-2 py-1 rounded-[6px] hover:bg-white/5"
          >
            ログアウト
          </button>
        </form>
      </div>
    </header>
  );
}
