/**
 * 🚀 第7个文件：src/main.ts
 * 
 * 📁 文件位置: src/main.ts
 * 🎯 核心功能: Vue3应用启动入口，PWA注册，全局配置
 * 🔧 关键作用: 创建Vue应用实例、注册插件、PWA支持、错误处理
 * 
 * 📋 配置模块说明：
 * - Vue应用创建: 实例化Vue3应用
 * - 插件注册: Pinia状态管理 + Vue Router路由
 * - PWA注册: Service Worker自动更新
 * - 错误处理: 全局错误捕获和日志记录
 * - 性能监控: 页面加载时间统计
 */

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'

// Import PWA registration
// PWA Service Worker注册 - 实现离线功能和自动更新
import { registerSW } from 'virtual:pwa-register'

// Create app instance
// 创建Vue3应用实例
const app = createApp(App)
const pinia = createPinia()

// Use plugins
// 注册插件：状态管理和路由系统
app.use(pinia)    // Pinia状态管理：替代Vuex的现代状态管理方案
app.use(router)   // Vue Router：单页应用路由系统

// Mount app
// 将Vue应用挂载到DOM的#app元素上
app.mount('#app')

// Register Service Worker for PWA
// PWA Service Worker注册和更新处理
const updateSW = registerSW({
  // 当有新版本可用时的回调
  onNeedRefresh() {
    console.log('New content available, please refresh.')
    // 这里可以显示更新提示给用户
  },
  // 当应用准备好离线工作时的回调
  onOfflineReady() {
    console.log('App ready to work offline.')
    // 这里可以提示用户应用已支持离线访问
  }
})

// Global error handler
// 全局错误处理器 - 捕获所有Vue组件中的错误
app.config.errorHandler = (error, instance, info) => {
  console.error('Global error:', error, info)
  // 这里可以集成错误监控服务（如Sentry）
}

// Performance monitoring
// 性能监控 - 统计应用加载时间
if ('performance' in window) {
  window.addEventListener('load', () => {
    const perfData = performance.timing
    // 计算从导航开始到页面完全加载的时间
    const loadTime = perfData.loadEventEnd - perfData.navigationStart
    console.log(`App load time: ${loadTime}ms`)
    // 这里可以发送性能数据到分析服务
  })
}