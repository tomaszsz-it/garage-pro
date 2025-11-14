import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";
import path from "path";

// Load test environment variables
dotenv.config({ path: path.resolve(process.cwd(), ".env.test") });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./e2e",

  /* Run tests in files in parallel */
  fullyParallel: true,

  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,

  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,

  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,

  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [
    ["html"],
    ["json", { outputFile: "playwright-report/results.json" }],
    process.env.CI ? ["github"] : ["line"],
  ],

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* Take screenshot only on failures */
    screenshot: "only-on-failure",

    /* Record video only on failures */
    video: "retain-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    // Setup project
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
      teardown: "cleanup",
    },
    // Cleanup project
    {
      name: "cleanup",
      testMatch: /global\.teardown\.ts/,
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Use browser contexts for isolating test environments
        contextOptions: {
          // Ignore HTTPS errors for local development
          ignoreHTTPSErrors: true,
        },
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "npm run dev:e2e",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 90 * 1000, // 90 seconds for dev server startup
  },

  /* Global timeout for all tests - can be overridden per test */
  timeout: 60 * 1000, // 60 seconds default
  expect: {
    timeout: 5 * 1000,
  },

  /* Output directory for test results */
  outputDir: "test-results/",
});
