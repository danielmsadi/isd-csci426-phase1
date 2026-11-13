import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/browser",
  timeout: 30000,
  use: {
    baseURL: "http://127.0.0.1:5173",
    browserName: "chromium",
    channel: process.env.PLAYWRIGHT_CHANNEL || "msedge",
    headless: true,
  },
  webServer: [
    {
      command: "npm run dev -- --port 5173",
      url: "http://127.0.0.1:5173",
      reuseExistingServer: true,
      timeout: 60000,
    },
    {
      command: "npm run build && npm run preview -- --port 4173",
      url: "http://127.0.0.1:4173",
      reuseExistingServer: false,
      timeout: 60000,
    },
  ],
  reporter: "list",
  workers: 1,
});
