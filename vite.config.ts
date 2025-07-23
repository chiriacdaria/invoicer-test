import { defineConfig } from 'vitest/config';
import {cloudflare} from '@cloudflare/vite-plugin';
import { fileURLToPath } from 'url';
import path from 'path';

const isTest = process.env.VITEST;

export default defineConfig({
  plugins: isTest ? [] : [cloudflare()],
  resolve: {
    alias: {
      '@': path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'src')
    }
  },
  test: {
    globals: true,
    environment: 'node'
  }
});
