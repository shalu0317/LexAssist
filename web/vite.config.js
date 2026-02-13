import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/ws": {
        target: "http://localhost:8080",  // FastAPI backend
        ws: true
      },
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  }
})
