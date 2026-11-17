import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    // 允许省略 .vue 后缀
    extensions: ['.mjs', '.js', '.json', '.vue']
  },
  server: {
    port: 4116,
    open: false,
    // 开发环境代理，避免跨域；后端默认端口 8797
    proxy: {
      '/api': {
        target: 'http://localhost:8797',
        changeOrigin: true
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'static',
    chunkSizeWarningLimit: 1500
  }
})
