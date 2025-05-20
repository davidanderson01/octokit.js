import { defineConfig } from "vite";

export default defineConfig({
  test: {
    coverage: {
      include: ["src/**/*.ts"],
      reporter: ["html"],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
});
