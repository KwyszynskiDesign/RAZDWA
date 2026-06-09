import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 20_000,
  expect: { timeout: 6_000 },
  fullyParallel: true,
  retries: 0,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: 'http://localhost:8081',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npx http-server docs -p 8081 -s -c-1',
    url: 'http://localhost:8081',
    reuseExistingServer: !process.env.CI,
    timeout: 15_000,
  },
});
