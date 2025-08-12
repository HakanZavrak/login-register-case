import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests/e2e',
  use: {
    baseURL: 'http://localhost:8085', 
    headless: true,
  },
  reporter: [['list']],
  timeout: 30_000,
});
