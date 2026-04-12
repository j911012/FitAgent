'use client';

import { useEffect } from 'react';

type Props = {
  error: Error & { digest?: string };
  reset: () => void;
};

// ルートレイアウトで発生したエラーをキャッチする最後の砦
// <html>と<body>を含める（レイアウトを置き換えるため）
export default function GlobalError({ error, reset }: Props) {
  useEffect(() => {
    // 本番環境ではSentryなどのエラー監視サービスに送信する
    console.error('Global Error:', error);
  }, [error]);

  return (
    <html lang="ja">
      <body className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            予期しないエラーが発生しました
          </h2>
          <p className="text-gray-500 mb-6">
            申し訳ございません。しばらくしてから再度お試しください。
          </p>
          <button
            onClick={reset}
            className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
          >
            再試行
          </button>
        </div>
      </body>
    </html>
  );
}
