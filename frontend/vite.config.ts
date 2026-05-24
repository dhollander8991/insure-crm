import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  server: {
    port: 5173,
    proxy: {
      "/api/auth": {
        target: "http://35.157.14.12:8081",
        rewrite: (p) => p.replace(/^\/api\/auth/, ""),
        changeOrigin: true,
      },
      "/api/customers": {
        target: "http://35.157.14.12:8082",
        rewrite: (p) => p.replace(/^\/api\/customers/, "/customers"),
        changeOrigin: true,
      },
      "/api/policies": {
        target: "http://35.157.14.12:8083",
        rewrite: (p) => p.replace(/^\/api\/policies/, "/policies"),
        changeOrigin: true,
      },
      "/api/ai": {
        target: "http://35.157.14.12:8084",
        rewrite: (p) => p.replace(/^\/api\/ai/, ""),
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    globals: true,
  },
});
