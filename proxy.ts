import { NextRequest, NextResponse } from 'next/server';

// Basic認証でアクセスを自分だけに制限する
// v1.1でAuth.jsによる本格的な認証を導入するまでの暫定対応
export function proxy(req: NextRequest) {
  const authHeader = req.headers.get('authorization');

  if (authHeader) {
    // "Basic <base64(user:pass)>" の形式をデコードして検証する
    const encoded = authHeader.split(' ')[1];
    const decoded = Buffer.from(encoded, 'base64').toString('utf-8');
    const [user, pass] = decoded.split(':');

    const validUser = process.env.BASIC_AUTH_USER;
    const validPass = process.env.BASIC_AUTH_PASS;

    if (user === validUser && pass === validPass) {
      return NextResponse.next();
    }
  }

  // 認証失敗 or 未入力の場合はブラウザにダイアログを表示させる
  return new NextResponse('Unauthorized', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="FitLog"' },
  });
}

export const config = {
  // API Route・静的ファイル・Next.js内部パスは認証対象外にする
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
