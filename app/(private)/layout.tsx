import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import Header from '@/app/(private)/components/Header';

// ミドルウェアで保護されているが、サーバー側でも認証チェックを行い多重防御とする
export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session) {
    // ミドルウェアが先に処理するため通常は到達しない。念のため。
    redirect('/login');
  }

  return (
    <div className="flex flex-col h-screen">
      {/* ヘッダー: ユーザー情報・ログアウトを提供する */}
      <Header user={session.user} />
      {/* コンテンツエリア: 残りの高さを埋める */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
