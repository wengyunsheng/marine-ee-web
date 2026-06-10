import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      },
      // 添加静态文件代理，用于访问上传的3D模型
      '/uploads': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    // 提高 chunk 大小警告阈值到 2000 kB
    chunkSizeWarningLimit: 2000,
    // 启用压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 生产环境移除 console
        drop_debugger: true
      }
    },
    rollupOptions: {
      output: {
        // 更细粒度的手动分块
        manualChunks: {
          // Vue 核心
          'vue-vendor': ['vue'],
          // Element Plus 按需加载（需要在 main.js 中配置）
          'element-plus': ['element-plus', '@element-plus/icons-vue'],
          // 3D 可视化
          'three': ['three'],
          // 图表库
          'chart': ['chart.js/auto', 'chartjs-plugin-datalabels'],
          // 拖拽库
          'sortable': ['sortablejs']
        },
        // 优化文件名
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    }
  }
})