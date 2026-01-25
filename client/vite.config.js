import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,

    watch: {
      usePolling: true,
      interval: 1000,
      // ✅ ignore more folders that waste RAM in Docker/WSL
      ignored: [
        "**/node_modules/**",
        "**/.git/**",
        "**/dist/**",
        "**/build/**",
        "**/.cache/**",
        "**/.vite/**",
      ],
    },

    proxy: {
      "/api": {
        target: "http://server:5001",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
