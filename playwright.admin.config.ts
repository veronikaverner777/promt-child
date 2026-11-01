import { defineConfig } from "@playwright/test";
import base from "./playwright.config";
export default defineConfig({
  ...base,
  testIgnore: [],
  testMatch: "**/admin.spec.ts",
  workers: 1,
  use: { ...base.use, baseURL: "http://127.0.0.1:5181" },
  webServer: {
    command: "npm run dev -- --port 5181 --strictPort",
    url: "http://127.0.0.1:5181/promt-child/",
    reuseExistingServer: false,
    env: {
      VITE_SUPABASE_URL: "https://aip-test.supabase.co",
      VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_mock_only_not_a_real_key",
    },
  },
});
