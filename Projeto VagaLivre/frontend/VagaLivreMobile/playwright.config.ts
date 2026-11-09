import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 60000,
  use: {
    baseURL: 'http://127.0.0.1:5173',
    browserName: 'chromium',
    channel: 'msedge',
    viewport: { width: 412, height: 915 },
    screenshot: 'only-on-failure',
    actionTimeout: 10000,
  },
  webServer: {
    command: 'npm run web',
    url: 'http://127.0.0.1:5173',
    reuseExistingServer: true,
  },
});
