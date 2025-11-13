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
    // For Jenkins - use headless mode but capture visual evidence
    headless: true, // Changed to true for Jenkins compatibility
    screenshot: 'on', // Capture screenshots for all tests
    video: 'on', // Record videos for all tests
  },
  
  projects: [
    { 
      name: 'chromium', 
      use: { 
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 720 }
      } 
    },
    // Comment out other browsers for faster execution in CI
    // { 
    //   name: 'firefox', 
    //   use: { 
    //     ...devices['Desktop Firefox'],
    //     viewport: { width: 1280, height: 720 }
    //   } 
    // },
    // { 
    //   name: 'webkit', 
    //   use: { 
    //     ...devices['Desktop Safari'],
    //     viewport: { width: 1280, height: 720 }
    //   } 
    // },
  ],
});