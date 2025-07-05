import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import viteReact from "@vitejs/plugin-react";
import { TanStackRouterVite } from "@tanstack/router-plugin/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [TanStackRouterVite(), viteReact()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src/"),
    },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8000",

        changeOrigin: true,
      },
    },
  },
});
