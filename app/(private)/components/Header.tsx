import Image from 'next/image';
import { signOut } from '@/auth';

// ブランドマーク: 赤→紫グラデーションの角丸正方形にボルトアイコン
function BrandMark() {
  return (
    <div
      style={{
        width: 26,
        height: 26,
        borderRadius: 8,
        background: 'linear-gradient(135deg, var(--red) 0%, var(--purple) 100%)',
        boxShadow: '0 6px 20px oklch(0.68 0.22 18 / 0.35)',
        display: 'grid',
        placeItems: 'center',
        flexShrink: 0,
      }}
    >
      {/* ⚡ ボルトアイコン */}
      <svg width="14" height="14" viewBox="0 0 24 24" fill="white">
        <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z" />
      </svg>
    </div>
  );
}

function InitialsAvatar({ name }: { name?: string | null }) {
  const initial = name ? name.charAt(0).toUpperCase() : '?';
  return (
    <div
      className="w-[26px] h-[26px] rounded-full flex items-center justify-center text-[11px] font-semibold text-white flex-shrink-0"
      style={{ background: 'var(--purple-soft)', border: '1px solid var(--line-2)' }}
    >
      {initial}
    </div>
  );
}

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
      style={{
        background: 'var(--bg)',
        borderBottom: '1px solid var(--line)',
      }}
    >
      {/* ブランド */}
      <div className="flex items-center gap-2">
        <BrandMark />
        <span
          className="text-[13px] tracking-widest"
          style={{ fontWeight: 800, letterSpacing: '0.08em', color: 'var(--fg)' }}
        >
          FIT AGENT
        </span>
      </div>

      {/* ユーザー情報 + ログアウト */}
      <div className="flex items-center gap-2.5">
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

        <span
          className="text-[13px] hidden sm:block truncate max-w-[120px]"
          style={{ color: 'var(--fg-3)' }}
        >
          {user.name}
        </span>

        <form
          action={async () => {
            'use server';
            await signOut({ redirectTo: '/login' });
          }}
        >
          <button
            type="submit"
            className="text-[12px] px-2 py-1 rounded-[6px] transition-colors"
            style={{ color: 'var(--fg-4)' }}
          >
            ログアウト
          </button>
        </form>
      </div>
    </header>
  );
}
