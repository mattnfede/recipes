import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  // ⚠️  Set to '/<your-github-repo-name>/' to match your GitHub Pages URL.
  //     e.g. if your repo is github.com/you/recipes, keep '/recipes/'.
  //     If you publish from a user/org root repo (you.github.io), use '/'.
  base: '/recipes/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
  },
});
