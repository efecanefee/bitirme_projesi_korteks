import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  use: { baseURL: 'http://localhost:5173', locale: 'tr-TR', timezoneId: 'Europe/Istanbul' },
  webServer: { command: 'npm run dev', url: 'http://localhost:5173', reuseExistingServer: true },
  projects: [
    { name: 'masaustu', use: { ...devices['Desktop Chrome'], launchOptions: { executablePath: process.env.CHROME_PATH } } },
    { name: 'mobil', use: { ...devices['Pixel 7'], launchOptions: { executablePath: process.env.CHROME_PATH } } },
  ],
});
