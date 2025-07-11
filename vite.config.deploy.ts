import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

// 导入部署配置
const { getDeployConfig } = require('./dist-deploy.config.js')
const deployConfig = getDeployConfig('github-pages')

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com/,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts-stylesheets'
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-webfonts',
              expiration: {
                maxAgeSeconds: 60 * 60 * 24 * 365
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Modern English Learning Platform',
        short_name: 'EnglishPro',
        description: 'Advanced English learning with AI-powered features',
        theme_color: '#1e40af',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        start_url: deployConfig.publicPath,
        icons: [
          {
            src: deployConfig.publicPath + 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: deployConfig.publicPath + 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  
  // 设置基础路径
  base: deployConfig.publicPath,
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  
  build: {
    outDir: deployConfig.outputDir,
    assetsDir: deployConfig.assetsDir,
    sourcemap: deployConfig.sourceMap,
    minify: deployConfig.minify,
    
    // 优化配置
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          ui: ['@headlessui/vue', '@heroicons/vue']
        }
      }
    }
  },
  
  define: {
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false
  }
})
