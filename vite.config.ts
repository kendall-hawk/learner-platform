/**
 * ⚡ vite.config.ts
 * 路径: project-root/vite.config.ts
 * 功能: Vite构建工具配置文件（独立完整版）
 * 
 * 主要功能:
 * - 配置Vue3支持和TypeScript编译
 * - 集成PWA功能，支持离线使用和应用安装
 * - 设置路径别名@指向src目录
 * - 配置Service Worker和应用清单
 * - 优化构建性能和开发体验
 * - 支持GitHub Pages部署
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

// 🌍 环境变量配置
const isProduction = process.env.NODE_ENV === 'production'
const isGitHubPages = process.env.GITHUB_PAGES === 'true'

// 📍 根据部署环境设置基础路径
// GitHub Pages: /repository-name/
// 其他平台: /
const baseUrl = isGitHubPages 
  ? `/${process.env.GITHUB_REPOSITORY?.split('/')[1] || 'modern-english-learning'}/`
  : '/'

// 🏗️ 导出Vite配置
export default defineConfig({
  // 📦 插件配置
  plugins: [
    // Vue3单文件组件支持
    vue(),
    
    // 🚀 PWA配置：将应用转换为渐进式Web应用
    VitePWA({
      registerType: 'autoUpdate',     // 自动更新Service Worker
      workbox: {
        // 缓存文件类型模式
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        
        // 运行时缓存策略
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
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1年
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30天
              }
            }
          }
        ]
      },
      
      // 📱 应用清单配置
      manifest: {
        name: 'Modern English Learning Platform',      // 应用全名
        short_name: 'EnglishPro',                     // 应用简称
        description: 'Advanced English learning with AI-powered features',
        theme_color: '#1e40af',        // 主题颜色（蓝色）
        background_color: '#ffffff',   // 背景颜色（白色）
        display: 'standalone',         // 独立应用模式
        orientation: 'portrait',       // 竖屏优先
        start_url: baseUrl,            // 启动URL
        scope: baseUrl,
        
        // 📱 应用图标配置
        icons: [
          {
            src: baseUrl + 'icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: baseUrl + 'icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        
        // 🎨 应用主题
        categories: ['education', 'productivity'],
        lang: 'zh-CN',
        dir: 'ltr'
      }
    })
  ],
  
  // 🛤️ 设置基础路径
  base: baseUrl,
  
  // 🔗 路径解析配置
  resolve: {
    // 路径别名配置：@指向src目录
    alias: {
      '@': resolve(__dirname, 'src'),
      '~': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@composables': resolve(__dirname, 'src/composables'),
      '@stores': resolve(__dirname, 'src/stores'),
      '@services': resolve(__dirname, 'src/services'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@types': resolve(__dirname, 'src/types'),
      '@assets': resolve(__dirname, 'src/assets')
    }
  },
  
  // 🏗️ 构建配置
  build: {
    // 输出目录
    outDir: 'dist',
    
    // 静态资源目录
    assetsDir: 'assets',
    
    // 源码映射（生产环境关闭以减小体积）
    sourcemap: !isProduction,
    
    // 压缩方式
    minify: isProduction ? 'esbuild' : false,
    
    // 目标环境
    target: 'esnext',
    
    // 📊 优化配置
    rollupOptions: {
      output: {
        // 手动分包配置
        manualChunks: {
          // 第三方库
          vendor: ['vue', 'vue-router', 'pinia'],
          
          // UI组件库
          ui: ['@headlessui/vue', '@heroicons/vue'],
          
          // 工具库
          utils: ['axios', 'date-fns', 'lodash-es']
        },
        
        // 📝 资源命名
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || []
          const ext = info[info.length - 1]
          
          if (/\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/i.test(assetInfo.name || '')) {
            return `media/[name]-[hash].${ext}`
          }
          if (/\.(png|jpe?g|gif|svg|webp|ico)(\?.*)?$/i.test(assetInfo.name || '')) {
            return `images/[name]-[hash].${ext}`
          }
          if (/\.(woff2?|eot|ttf|otf)(\?.*)?$/i.test(assetInfo.name || '')) {
            return `fonts/[name]-[hash].${ext}`
          }
          return `assets/[name]-[hash].${ext}`
        }
      }
    },
    
    // ⚡ 性能优化
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false
  },
  
  // 🔧 开发服务器配置
  server: {
    port: 3000,
    open: true,
    cors: true,
    
    // 🔄 代理配置（开发环境API代理）
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  
  // 🎯 预览服务器配置
  preview: {
    port: 4173,
    open: true,
    cors: true
  },
  
  // 📐 CSS配置
  css: {
    devSourcemap: true
  },
  
  // 🎛️ 环境变量定义
  define: {
    // 禁用Vue开发环境的水合不匹配详情
    __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: false,
    
    // 应用信息
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0'),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __COMMIT_HASH__: JSON.stringify(process.env.GITHUB_SHA || 'unknown'),
    
    // 环境标识
    __DEV__: !isProduction,
    __PROD__: isProduction,
    __GITHUB_PAGES__: isGitHubPages
  },
  
  // ⚡ 优化依赖
  optimizeDeps: {
    include: [
      'vue',
      'vue-router',
      'pinia',
      '@headlessui/vue',
      '@heroicons/vue/24/outline',
      '@heroicons/vue/24/solid',
      'axios',
      'date-fns'
    ]
  },
  
  // 🔍 ESBuild配置
  esbuild: {
    drop: isProduction ? ['console', 'debugger'] : [],
    target: 'esnext'
  }
})