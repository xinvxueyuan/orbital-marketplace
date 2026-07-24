import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      // 开发期把所有 /api 请求代理到 FastAPI 后端
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
