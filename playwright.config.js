// playwright.config.js
const { devices } = require('@playwright/test');

/** @type {import('@playwright/test').PlaywrightTestConfig} */
const config = {
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    testDir: "src/test/javascript/js",
    use: {
        trace: 'on-first-retry',
    },
    webServer: {
        command: 'npm run startTestServer',
        port: 3000,
        timeout: 30 * 1000
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'firefox',
            use: { ...devices['Desktop Firefox'] },
        },
        {
            name: 'webkit',
            use: { ...devices['Desktop Safari'] },
        },
    ],
};

module.exports = config;