<!--
🎯 第8个文件：src/App.vue

📁 文件位置: src/App.vue
🎯 核心功能: Vue3根组件，全局布局，PWA更新提示，加载状态
🔧 关键作用: 应用入口组件、路由出口、全局样式、用户体验优化

📋 组件模块说明：
- 加载屏幕: 应用启动时的过渡动画
- 路由出口: 页面组件的渲染容器
- PWA更新: 新版本提示和更新流程
- 过渡动画: 页面切换的平滑过渡
- 全局样式: CSS重置和基础样式定义
-->

<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- Loading Screen -->
    <!-- 应用加载屏幕 - 启动时显示，提供良好的用户体验 -->
    <Transition name="fade">
      <div
        v-if="isLoading"
        class="fixed inset-0 bg-white z-50 flex items-center justify-center"
      >
        <LoadingSpinner size="large" />
      </div>
    </Transition>

    <!-- Main App Content -->
    <!-- 主要应用内容 - 路由组件的渲染出口 -->
    <router-view v-slot="{ Component }">
      <Transition name="page" mode="out-in">
        <component :is="Component" />
      </Transition>
    </router-view>

    <!-- PWA Update Notification -->
    <!-- PWA更新通知 - 当有新版本时提示用户更新 -->
    <Transition name="slide-up">
      <div
        v-if="showUpdatePrompt"
        class="fixed bottom-4 right-4 bg-primary-600 text-white p-4 rounded-lg shadow-lg z-40"
      >
        <p class="text-sm mb-2">New version available!</p>
        <div class="flex gap-2">
          <button
            @click="updateApp"
            class="px-3 py-1 bg-white text-primary-600 rounded text-xs font-medium"
          >
            Update
          </button>
          <button
            @click="showUpdatePrompt = false"
            class="px-3 py-1 bg-primary-700 rounded text-xs"
          >
            Later
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

// 路由和状态管理
const router = useRouter()
const authStore = useAuthStore()

// 响应式状态
const isLoading = ref(true)          // 加载状态
const showUpdatePrompt = ref(false)  // PWA更新提示

// 组件挂载时的初始化逻辑
onMounted(async () => {
  try {
    // Initialize auth state from localStorage
    // 从本地存储初始化认证状态
    await authStore.initializeAuth()
    
    // Simulate initial loading
    // 模拟初始加载过程（实际项目中可能是获取用户数据等）
    setTimeout(() => {
      isLoading.value = false
    }, 1000)

    // Check for app updates periodically
    // 定期检查应用更新（这里用随机数模拟）
    setInterval(() => {
      if (Math.random() < 0.1) { // 10% chance for demo
        showUpdatePrompt.value = true
      }
    }, 60000) // Check every minute

  } catch (error) {
    console.error('App initialization error:', error)
    isLoading.value = false
  }
})

// PWA应用更新处理
const updateApp = () => {
  showUpdatePrompt.value = false
  window.location.reload()  // 重新加载页面应用更新
}
</script>

<style>
/* CSS Reset and Base Styles */
/* CSS重置和基础样式 */
*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
}

/* Transitions */
/* 过渡动画定义 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease;
}

.slide-up-enter-from {
  opacity: 0;
  transform: translateY(100%);
}

.slide-up-leave-to {
  opacity: 0;
  transform: translateY(100%);
}

/* Scrollbar Styling */
/* 自定义滚动条样式 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f5f9;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

/* Focus Styles */
/* 键盘导航焦点样式 */
.focus-visible\:ring {
  outline: 2px solid transparent;
  outline-offset: 2px;
}

.focus-visible\:ring:focus-visible {
  box-shadow: 0 0 0 2px #3b82f6;
}

/* Loading Skeleton */
/* 骨架屏动画 */
@keyframes skeleton {
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: calc(200px + 100%) 0;
  }
}

.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200px 100%;
  animation: skeleton 1.5s infinite;
}
</style>