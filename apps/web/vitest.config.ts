import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./")
      // If your project uses /src as root, change to:
      // "@": path.resolve(__dirname, "./src")
    }
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setupTests.ts"],
    globals: true,
    exclude: ["**/e2e/**", "**/playwright-report/**", "**/node_modules/**"]
  }
});
