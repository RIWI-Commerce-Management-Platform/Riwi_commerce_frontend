import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  server: {
    port: 5173,
    open: true,
    // Con VITE_API_URL=/api la API queda en el mismo origen y la cookie de sesión funciona en desarrollo.
    proxy: {
      "/api": {
        target: process.env.API_PROXY_TARGET || "http://localhost:3015",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  test: { environment: "node" },
});
