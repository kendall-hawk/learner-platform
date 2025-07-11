<!--
/**2. src/views/LoginPage.vue
 * 🔐 LoginPage.vue - 登录注册页面
 * 
 * 📋 功能概述:
 * - 统一的用户认证页面，支持登录和注册模式切换
 * - 集成社交登录选项（Google等）
 * - 支持Demo账户快速体验
 * - 智能重定向：登录后跳转到指定页面或仪表板
 * - 响应式设计，移动端友好
 * 
 * 🎯 主要功能:
 * - 登录/注册模式动态切换
 * - 表单验证和错误处理
 * - 社交登录集成
 * - Demo账户信息展示
 * - 重定向参数处理
 * - 功能特色展示
 * 
 * 🔗 依赖组件:
 * - LoginForm: 登录表单组件
 * - SignupForm: 注册表单组件
 * 
 * 📱 响应式设计:
 * - 移动端优先
 * - 平板和桌面端适配
 * - 表单输入体验优化
 */
-->

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <!-- 📱 页面头部 - Logo和标题 -->
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <!-- 🏠 Logo - 点击返回首页 -->
      <router-link to="/" class="flex justify-center">
        <div class="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
          <span class="text-white font-bold text-xl">E</span>
        </div>
      </router-link>
      
      <!-- 📝 动态标题 - 根据模式显示不同内容 -->
      <h2 class="mt-6 text-center text-3xl font-bold text-gray-900">
        {{ isSignup ? 'Create your account' : 'Sign in to your account' }}
      </h2>
      
      <!-- 🔄 模式切换提示 -->
      <p class="mt-2 text-center text-sm text-gray-600">
        {{ isSignup ? 'Already have an account?' : "Don't have an account?" }}
        <button
          @click="toggleMode"
          class="font-medium text-primary-600 hover:text-primary-500 transition-colors"
        >
          {{ isSignup ? 'Sign in' : 'Sign up' }}
        </button>
      </p>
    </div>

    <!-- 📋 主表单区域 -->
    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
        
        <!-- 🌐 社交登录选项 - 可选功能 -->
        <div v-if="showSocialLogin" class="space-y-3 mb-6">
          <!-- Google登录按钮 -->
          <button
            class="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          >
            <img src="https://developers.google.com/identity/images/g-logo.png" alt="Google" class="w-5 h-5 mr-3">
            Continue with Google
          </button>
          
          <!-- 分隔线 -->
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300" />
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>
        </div>

        <!-- 📝 表单组件 - 根据模式动态切换 -->
        <!-- 登录表单 -->
        <LoginForm 
          v-if="!isSignup"
          @success="handleAuthSuccess"
          @switch-to-signup="isSignup = true"
          :initial-email="initialEmail"
        />
        
        <!-- 注册表单 -->
        <SignupForm 
          v-else
          @success="handleAuthSuccess"
          @switch-to-login="isSignup = false"
        />

        <!-- 📜 服务条款和Demo信息 -->
        <div class="mt-6">
          <!-- 服务条款 - 仅注册时显示 -->
          <div v-if="isSignup" class="text-xs text-gray-500 text-center">
            By signing up, you agree to our
            <a href="#" class="text-primary-600 hover:text-primary-500">Terms of Service</a>
            and
            <a href="#" class="text-primary-600 hover:text-primary-500">Privacy Policy</a>
          </div>

          <!-- 🎮 Demo账户信息 - 方便测试体验 -->
          <div class="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 class="text-sm font-medium text-blue-900 mb-2">Demo Accounts Available:</h4>
            <div class="space-y-1 text-xs text-blue-700">
              <div>
                <strong>Free User:</strong> demo@example.com (any password)
              </div>
              <div>
                <strong>Pro User:</strong> john@example.com (any password)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 🌟 功能亮点展示 - 增强用户信心 -->
    <div class="mt-12 max-w-3xl mx-auto px-4">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <!-- 智能学习特色 -->
        <div class="flex flex-col items-center">
          <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-3">
            <BookOpenIcon class="w-6 h-6 text-primary-600" />
          </div>
          <h3 class="text-sm font-medium text-gray-900 mb-1">Smart Learning</h3>
          <p class="text-xs text-gray-600">AI-powered contextual definitions</p>
        </div>
        
        <!-- 音频同步特色 -->
        <div class="flex flex-col items-center">
          <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-3">
            <SpeakerWaveIcon class="w-6 h-6 text-green-600" />
          </div>
          <h3 class="text-sm font-medium text-gray-900 mb-1">Audio Sync</h3>
          <p class="text-xs text-gray-600">Real-time text highlighting</p>
        </div>
        
        <!-- 进度跟踪特色 -->
        <div class="flex flex-col items-center">
          <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
            <ChartBarIcon class="w-6 h-6 text-purple-600" />
          </div>
          <h3 class="text-sm font-medium text-gray-900 mb-1">Progress Tracking</h3>
          <p class="text-xs text-gray-600">Detailed learning analytics</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 📝 组件逻辑
 * 
 * 🎯 主要功能:
 * - 管理登录/注册模式切换
 * - 处理URL参数（模式、邮箱、重定向等）
 * - 认证成功后的路由跳转
 * - 已登录用户的重定向处理
 */

import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import LoginForm from '@/components/auth/LoginForm.vue'
import SignupForm from '@/components/auth/SignupForm.vue'

// 🔗 Heroicons图标组件导入
import {
  BookOpenIcon,
  SpeakerWaveIcon,
  ChartBarIcon
} from '@heroicons/vue/24/outline'

// 🛠️ Vue Router和Store
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// 📋 组件状态
const isSignup = ref(false) // 当前是否为注册模式
const showSocialLogin = ref(true) // 是否显示社交登录选项
const initialEmail = ref('') // 初始邮箱（从URL参数获取）

/**
 * 🎯 组件挂载时的初始化逻辑
 */
onMounted(() => {
  // 🔄 检查URL参数设置模式
  if (route.query.mode === 'signup') {
    isSignup.value = true
  }
  
  // 📧 从URL参数获取预填邮箱
  if (route.query.email) {
    initialEmail.value = route.query.email as string
  }

  // 🔀 已登录用户自动重定向
  if (authStore.isAuthenticated) {
    const redirectTo = route.query.redirect as string || '/dashboard'
    router.push(redirectTo)
  }
})

/**
 * 🔄 切换登录/注册模式
 */
const toggleMode = () => {
  isSignup.value = !isSignup.value
}

/**
 * ✅ 处理认证成功后的跳转逻辑
 * 
 * 🎯 跳转优先级:
 * 1. URL参数中的plan（订阅页面）
 * 2. URL参数中的redirect（指定页面）
 * 3. 默认仪表板
 */
const handleAuthSuccess = () => {
  // 获取重定向URL，默认为仪表板
  const redirectTo = route.query.redirect as string || '/dashboard'
  
  // 🎫 如果有订阅计划参数，优先跳转到订阅页面
  if (route.query.plan && route.query.plan !== 'free') {
    router.push(`/subscription?plan=${route.query.plan}`)
  } else {
    // 🏠 否则跳转到指定页面或仪表板
    router.push(redirectTo)
  }
}
</script>