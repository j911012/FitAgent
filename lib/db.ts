import { neon } from '@neondatabase/serverless';

// DATABASE_URLはサーバー側でのみ参照される環境変数（クライアントに露出させない）
const sql = neon(process.env.DATABASE_URL!);

export default sql;
