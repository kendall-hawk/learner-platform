<!--
/**4. src/components/auth/LoginForm.vue
 * 📝 LoginForm.vue - 登录表单组件
 * 
 * 📋 功能概述:
 * - 用户登录的核心表单组件
 * - 包含邮箱和密码输入，支持记住我功能
 * - 实时表单验证和错误处理
 * - 密码可见性切换
 * - 忘记密码功能集成
 * - Demo账户信息提示
 * 
 * 🎯 主要功能:
 * - 表单字段验证（邮箱格式、密码长度）
 * - 实时输入验证反馈
 * - 登录状态管理和错误提示
 * - 密码显示/隐藏切换
 * - 忘记密码弹窗
 * - Demo账户快速体验
 * 
 * 📡 Props:
 * - initialEmail?: string - 预填充的邮箱地址
 * 
 * 🔄 Emits:
 * - success: [] - 登录成功事件
 * - switch-to-signup: [] - 切换到注册模式事件
 * 
 * 🔗 依赖组件:
 * - LoadingSpinner: 加载状态指示器
 */
-->

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    
    <!-- 📧 邮箱输入字段 -->
    <div>
      <label for="email" class="block text-sm font-medium text-gray-700">
        Email address
      </label>
      <div class="mt-1 relative">
        <input
          id="email"
          v-model="form.email"
          name="email"
          type="email"
          autocomplete="email"
          required
          class="input"
          :class="{ 
            'border-red-300 focus:border-red-500 focus:ring-red-500': errors.email,
            'border-green-300 focus:border-green-500 focus:ring-green-500': form.email && !errors.email
          }"
          placeholder="Enter your email"
        />
        <!-- ⚠️ 错误状态图标 -->
        <div v-if="errors.email" class="absolute inset-y-0 right-0 pr-3 flex items-center">
          <ExclamationTriangleIcon class="h-5 w-5 text-red-500" />
        </div>
      </div>
      <!-- 错误信息显示 -->
      <p v-if="errors.email" class="mt-1 text-sm text-red-600">{{ errors.email }}</p>
    </div>

    <!-- 🔒 密码输入字段 -->
    <div>
      <label for="password" class="block text-sm font-medium text-gray-700">
        Password
      </label>
      <div class="mt-1 relative">
        <input
          id="password"
          v-model="form.password"
          name="password"
          :type="showPassword ? 'text' : 'password'"
          autocomplete="current-password"
          required
          class="input pr-10"
          :class="{ 
            'border-red-300 focus:border-red-500 focus:ring-red-500': errors.password,
            'border-green-300 focus:border-green-500 focus:ring-green-500': form.password && !errors.password
          }"
          placeholder="Enter your password"
        />
        <!-- 👁️ 密码显示/隐藏切换按钮 -->
        <button
          type="button"
          @click="showPassword = !showPassword"
          class="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <EyeIcon v-if="!showPassword" class="h-5 w-5 text-gray-400 hover:text-gray-500" />
          <EyeSlashIcon v-else class="h-5 w-5 text-gray-400 hover:text-gray-500" />
        </button>
      </div>
      <!-- 密码错误信息 -->
      <p v-if="errors.password" class="mt-1 text-sm text-red-600">{{ errors.password }}</p>
    </div>

    <!-- 🔄 记住我 & 忘记密码 -->
    <div class="flex items-center justify-between">
      <!-- 记住我选项 -->
      <div class="flex items-center">
        <input
          id="remember-me"
          v-model="form.rememberMe"
          name="remember-me"
          type="checkbox"
          class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
        />
        <label for="remember-me" class="ml-2 block text-sm text-gray-900">
          Remember me
        </label>
      </div>

      <!-- 忘记密码链接 -->
      <div class="text-sm">
        <button
          type="button"
          class="font-medium text-primary-600 hover:text-primary-500"
          @click="showForgotPassword = true"
        >
          Forgot your password?
        </button>
      </div>
    </div>

    <!-- 🚀 提交按钮 -->
    <div>
      <button
        type="submit"
        :disabled="isLoading || !isFormValid"
        class="w-full btn-primary relative"
        :class="{ 
          'opacity-50 cursor-not-allowed': isLoading || !isFormValid,
          'hover:bg-primary-700': !isLoading && isFormValid
        }"
      >
        <!-- 正常状态显示文本 -->
        <span v-if="!isLoading">Sign in</span>
        <!-- 加载状态显示加载器 -->
        <div v-else class="flex items-center justify-center">
          <LoadingSpinner size="small" color="white" />
          <span class="ml-2">Signing in...</span>
        </div>
      </button>
    </div>

    <!-- ⚠️ 登录错误信息显示 -->
    <div v-if="submitError" class="rounded-md bg-red-50 p-4">
      <div class="flex">
        <ExclamationTriangleIcon class="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
        <div class="text-sm text-red-700">
          {{ submitError }}
        </div>
      </div>
    </div>

    <!-- 🎮 Demo账户提示 -->
    <div class="mt-4 p-3 bg-blue-50 rounded-md">
      <p class="text-sm text-blue-700">
        <strong>Demo:</strong> Use demo@example.com or john@example.com with any password
      </p>
    </div>
  </form>

  <!-- 🔄 忘记密码弹窗 - 使用Teleport渲染到body -->
  <Teleport to="body">
    <div
      v-if="showForgotPassword"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      @click.self="showForgotPassword = false"
    >
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Reset Password</h3>
        <p class="text-sm text-gray-600 mb-4">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        <!-- 密码重置表单 -->
        <form @submit.prevent="handlePasswordReset">
          <input
            v-model="resetEmail"
            type="email"
            placeholder="Enter your email"
            class="input mb-4"
            required
          />
          <div class="flex gap-3">
            <button
              type="submit"
              class="btn-primary flex-1"
              :disabled="!resetEmail || isResetting"
            >
              {{ isResetting ? 'Sending...' : 'Send Reset Link' }}
            </button>
            <button
              type="button"
              @click="showForgotPassword = false"
              class="btn-outline flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * 📝 组件逻辑
 * 
 * 🎯 主要功能:
 * - 管理登录表单状态和验证
 * - 处理用户输入和实时验证
 * - 执行登录请求和错误处理
 * - 管理忘记密码流程
 */

import { ref, computed, watch, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import type { LoginCredentials } from '@/types'

// 🔗 Heroicons图标组件导入
import {
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

/**
 * 📡 组件Props定义
 */
interface Props {
  initialEmail?: string // 预填充的邮箱地址
}

const props = defineProps<Props>()

/**
 * 🔄 组件Emits定义
 */
const emit = defineEmits<{
  success: []                    // 登录成功事件
  'switch-to-signup': []         // 切换到注册模式事件
}>()

// 📊 认证状态管理
const authStore = useAuthStore()

// 📋 表单数据
const form = ref<LoginCredentials>({
  email: '',
  password: '',
  rememberMe: false
})

// 🎛️ 组件状态
const showPassword = ref(false)        // 密码显示状态
const isLoading = ref(false)          // 加载状态
const submitError = ref('')           // 提交错误信息
const errors = ref<Record<string, string>>({}) // 字段验证错误

// 🔄 忘记密码相关状态
const showForgotPassword = ref(false) // 忘记密码弹窗显示
const resetEmail = ref('')           // 重置密码邮箱
const isResetting = ref(false)       // 重置密码加载状态

/**
 * ✅ 表单验证状态
 * 当邮箱和密码都有效且没有错误时，表单才有效
 */
const isFormValid = computed(() => {
  return form.value.email && 
         form.value.password && 
         !errors.value.email && 
         !errors.value.password
})

/**
 * 📧 邮箱格式验证函数
 * @param email - 待验证的邮箱地址
 */
const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 👀 实时邮箱验证 - 监听邮箱输入变化
 */
watch(() => form.value.email, (newEmail) => {
  if (newEmail && !validateEmail(newEmail)) {
    errors.value.email = 'Please enter a valid email address'
  } else {
    delete errors.value.email
  }
})

/**
 * 🔒 实时密码验证 - 监听密码输入变化
 */
watch(() => form.value.password, (newPassword) => {
  if (newPassword && newPassword.length < 3) {
    errors.value.password = 'Password must be at least 3 characters'
  } else {
    delete errors.value.password
  }
})

/**
 * 🚀 处理登录表单提交
 */
const handleSubmit = async () => {
  // 表单无效时不提交
  if (!isFormValid.value) return

  isLoading.value = true
  submitError.value = ''

  try {
    // 调用认证store的登录方法
    await authStore.login(form.value)
    // 登录成功，发出成功事件
    emit('success')
  } catch (error) {
    // 捕获并显示登录错误
    submitError.value = error instanceof Error ? error.message : 'Login failed'
  } finally {
    isLoading.value = false
  }
}

/**
 * 🔄 处理忘记密码请求
 */
const handlePasswordReset = async () => {
  if (!resetEmail.value) return

  isResetting.value = true

  try {
    // 模拟密码重置API调用
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // 显示成功消息
    alert('Password reset link sent to your email!')
    showForgotPassword.value = false
    resetEmail.value = ''
  } catch (error) {
    alert('Failed to send reset link. Please try again.')
  } finally {
    isResetting.value = false
  }
}

/**
 * 🎯 组件挂载时的初始化
 */
onMounted(() => {
  // 如果有初始邮箱，则预填充
  if (props.initialEmail) {
    form.value.email = props.initialEmail
  }
})
</script>