import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['__tests__/unit/**/*.test.ts'],
  },
  resolve: {
    alias: {
      // tsconfig の @/* パスエイリアスを解決する
      '@': path.resolve(__dirname, '.'),
    },
  },
});
