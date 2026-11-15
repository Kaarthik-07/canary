import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL ||
      'http://k8s-default-canarysh-775063b19d-143114923.ap-southeast-2.elb.amazonaws.com',
    browserName: 'chromium',
    launchOptions: {
      executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH,
    },
    headless: true,
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },
});
