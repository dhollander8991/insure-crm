import { defineConfig } from "vitest/config";
import { loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  const authTarget = env.VITE_AUTH_URL ?? "http://35.157.14.12:8081";
  const customerTarget = env.VITE_CUSTOMER_URL ?? "http://35.157.14.12:8082";
  const policyTarget = env.VITE_POLICY_URL ?? "http://35.157.14.12:8083";
  const aiTarget = env.VITE_AI_URL ?? "http://35.157.14.12:8084";

  return {
    plugins: [react(), tailwindcss(), tsconfigPaths()],
    server: {
      port: 5173,
      proxy: {
        "/api/auth": {
          target: authTarget,
          rewrite: (p) => p.replace(/^\/api\/auth/, ""),
          changeOrigin: true,
        },
        "/api/customers": {
          target: customerTarget,
          rewrite: (p) => p.replace(/^\/api\/customers/, ""),
          changeOrigin: true,
        },
        "/api/policies": {
          target: policyTarget,
          rewrite: (p) => p.replace(/^\/api\/policies/, ""),
          changeOrigin: true,
        },
        "/api/ai": {
          target: aiTarget,
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
  };
});
