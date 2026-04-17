import { auth } from '@/auth';
import { NextResponse } from 'next/server';

// 認証不要のパス
// /login と Auth.js のコールバックエンドポイントは除外する
const PUBLIC_PATHS = ['/login', '/api/auth'];

function isPublicPath(pathname: string): boolean {
  return PUBLIC_PATHS.some((path) => pathname.startsWith(path));
}

export const proxy = auth((req) => {
  const { nextUrl, auth: session } = req;
  const isAuthenticated = !!session;

  // 認証済みユーザーが /login にアクセスした場合は / にリダイレクト
  // ログイン済みなのにログインページを表示するのを防ぐ
  if (isAuthenticated && nextUrl.pathname === '/login') {
    return NextResponse.redirect(new URL('/', nextUrl));
  }

  // 未認証ユーザーが (private) 配下（公開パス以外）にアクセスした場合は /login にリダイレクト
  if (!isAuthenticated && !isPublicPath(nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Next.js の内部パス・静的ファイルを除外し、全ルートに適用する
    // _next/static, _next/image, favicon.ico などはミドルウェア不要のため除外
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
