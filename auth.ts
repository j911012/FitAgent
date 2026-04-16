import NextAuth, { type DefaultSession } from 'next-auth';
import Google from 'next-auth/providers/google';
import sql from '@/lib/db';

// Auth.jsのSession型を拡張してuser.idを含める
// デフォルトのSessionにはidが存在しないため明示的に追加する
declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
    } & DefaultSession['user'];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    // Google OAuthプロバイダー
    // AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET を環境変数から自動読み込みする
    Google,
  ],

  // JWTセッション戦略を使用する
  // DBアダプターなしでEdge Runtimeに対応し、実装をシンプルに保つ
  session: { strategy: 'jwt' },

  // カスタムログインページを使用する（デフォルトのAuth.jsページを使わない）
  pages: {
    signIn: '/login',
  },

  callbacks: {
    async jwt({ token, account }) {
      // account が存在するのはOAuth認証直後のみ（以降のリクエストではnull）
      // 初回ログイン時にusersテーブルをUPSERTし、DB生成UUIDをJWTに永続化する
      if (account?.provider === 'google') {
        const result = await sql`
          INSERT INTO users (name, email, image)
          VALUES (${token.name ?? null}, ${token.email ?? null}, ${token.picture ?? null})
          ON CONFLICT (email) DO UPDATE
            SET name       = EXCLUDED.name,
                image      = EXCLUDED.image,
                updated_at = now()
          RETURNING id
        `;
        // DBで生成したUUIDをtoken.userIdとして保持する
        // JWT型はRecord<string, unknown>を継承しているため任意のキーを追加できる
        token['userId'] = result[0].id as string;
      }
      return token;
    },

    async session({ session, token }) {
      // JWTに保存したuserIdをセッションに付与する
      // Server ActionsでsessionからDBクエリ用のuser_idを取得できるようにするため
      const userId = token['userId'];
      if (typeof userId === 'string') {
        session.user.id = userId;
      }
      return session;
    },
  },
});
