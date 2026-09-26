import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
	testDir: "./e2e",
	fullyParallel: true,
	timeout: 30000,
	retries: 0,
	use: {
		baseURL: process.env.REDACT_TEST_URL ?? "http://localhost:4313",
		trace: "retain-on-failure",
	},
	projects: [
		{ name: "chromium", use: { ...devices["Desktop Chrome"] } },
		{ name: "firefox", use: { ...devices["Desktop Firefox"] } },
		{ name: "webkit", use: { ...devices["Desktop Safari"] } },
	],
	webServer: process.env.REDACT_TEST_URL
		? undefined
		: {
				command: "pnpm --filter react-redact-docs exec next dev --port 4313",
				url: "http://localhost:4313",
				reuseExistingServer: true,
				timeout: 120000,
			},
});
