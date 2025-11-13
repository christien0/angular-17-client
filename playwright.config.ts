import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: [['list'], ['junit', { outputFile: 'playwright-report/results.xml' }], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  
  use: {
    baseURL: 'http://localhost:8081',
    trace: 'on-first-retry',
    // Add these for better visibility
    headless: false, // Show browser windows
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  
  projects: [
    { 
      name: 'chromium', 
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 } // Consistent window size
      } 
    },
    { 
      name: 'firefox', 
      use: { 
        ...devices['Desktop Firefox'],
        viewport: { width: 1280, height: 720 }
      } 
    },
    { 
      name: 'webkit', 
      use: { 
        ...devices['Desktop Safari'],
        viewport: { width: 1280, height: 720 }
      } 
    },
  ],
});