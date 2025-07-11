<!--
/**5. src/components/auth/SignupForm.vue
 * ✍️ SignupForm.vue - 注册表单组件
 * 
 * 📋 功能概述:
 * - 用户注册的核心表单组件
 * - 包含姓名、邮箱、密码、确认密码字段
 * - 实时表单验证和错误处理
 * - 密码强度检测和可视化指示器
 * - 服务条款同意确认
 * - 注册成功状态展示
 * 
 * 🎯 主要功能:
 * - 完整的注册表单字段管理
 * - 实时输入验证（姓名、邮箱、密码匹配）
 * - 密码强度计算和可视化展示
 * - 密码显示/隐藏切换
 * - 服务条款和隐私政策确认
 * - 注册状态管理和成功提示
 * 
 * 🔄 Emits:
 * - success: [] - 注册成功事件
 * - switch-to-login: [] - 切换到登录模式事件
 * 
 * 🔗 依赖组件:
 * - LoadingSpinner: 加载状态指示器
 * 
 * 🎨 特色功能:
 * - 密码强度实时检测
 * - 彩色强度指示条
 * - 密码匹配验证
 * - 流畅的成功状态过渡
 */
-->

<template>
  <form @submit.prevent="handleSubmit" class="space-y-6">
    
    <!-- 👤 姓名输入字段 -->
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700">
        Full Name
      </label>
      <div class="mt-1 relative">
        <input
          id="name"
          v-model="form.name"
          name="name"
          type="text"
          autocomplete="name"
          required
          class="input"
          :class="{ 
            'border-red-300 focus:border-red-500 focus:ring-red-500': errors.name,
            'border-green-300 focus:border-green-500 focus:ring-green-500': form.name && !errors.name
          }"
          placeholder="Enter your full name"
        />
        <!-- ⚠️ 姓名错误状态图标 -->
        <div v-if="errors.name" class="absolute inset-y-0 right-0 pr-3 flex items-center">
          <ExclamationTriangleIcon class="h-5 w-5 text-red-500" />
        </div>
      </div>
      <!-- 姓名错误信息 -->
      <p v-if="errors.name" class="mt-1 text-sm text-red-600">{{ errors.name }}</p>
    </div>

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
        <!-- ⚠️ 邮箱错误状态图标 -->
        <div v-if="errors.email" class="absolute inset-y-0 right-0 pr-3 flex items-center">
          <ExclamationTriangleIcon class="h-5 w-5 text-red-500" />
        </div>
      </div>
      <!-- 邮箱错误信息 -->
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
          autocomplete="new-password"
          required
          class="input pr-10"
          :class="{ 
            'border-red-300 focus:border-red-500 focus:ring-red-500': errors.password,
            'border-green-300 focus:border-green-500 focus:ring-green-500': form.password && !errors.password
          }"
          placeholder="Create a password"
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
      
      <!-- 💪 密码强度指示器 - 仅在有密码时显示 -->
      <div v-if="form.password" class="mt-2">
        <div class="flex items-center space-x-2">
          <!-- 强度进度条 -->
          <div class="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              class="h-2 rounded-full transition-all duration-300"
              :class="passwordStrengthClasses"
              :style="{ width: `${passwordStrength}%` }"
            ></div>
          </div>
          <!-- 强度文本标签 -->
          <span 
            class="text-xs font-medium"
            :class="passwordStrengthTextClasses"
          >
            {{ passwordStrengthText }}
          </span>
        </div>
      </div>
    </div>

    <!-- 🔐 确认密码字段 -->
    <div>
      <label for="confirmPassword" class="block text-sm font-medium text-gray-700">
        Confirm Password
      </label>
      <div class="mt-1 relative">
        <input
          id="confirmPassword"
          v-model="form.confirmPassword"
          name="confirmPassword"
          :type="showConfirmPassword ? 'text' : 'password'"
          autocomplete="new-password"
          required
          class="input pr-10"
          :class="{ 
            'border-red-300 focus:border-red-500 focus:ring-red-500': errors.confirmPassword,
            'border-green-300 focus:border-green-500 focus:ring-green-500': form.confirmPassword && !errors.confirmPassword && form.password === form.confirmPassword
          }"
          placeholder="Confirm your password"
        />
        <!-- 👁️ 确认密码显示/隐藏切换 -->
        <button
          type="button"
          @click="showConfirmPassword = !showConfirmPassword"
          class="absolute inset-y-0 right-0 pr-3 flex items-center"
        >
          <EyeIcon v-if="!showConfirmPassword" class="h-5 w-5 text-gray-400 hover:text-gray-500" />
          <EyeSlashIcon v-else class="h-5 w-5 text-gray-400 hover:text-gray-500" />
        </button>
      </div>
      <!-- 确认密码错误信息 -->
      <p v-if="errors.confirmPassword" class="mt-1 text-sm text-red-600">{{ errors.confirmPassword }}</p>
    </div>

    <!-- 📜 服务条款同意复选框 -->
    <div class="flex items-start">
      <input
        id="agree-terms"
        v-model="form.agreeTerms"
        name="agree-terms"
        type="checkbox"
        required
        class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded mt-1"
      />
      <label for="agree-terms" class="ml-2 block text-sm text-gray-900">
        I agree to the
        <a href="#" class="text-primary-600 hover:text-primary-500">Terms of Service</a>
        and
        <a href="#" class="text-primary-600 hover:text-primary-500">Privacy Policy</a>
      </label>
    </div>

    <!-- 🚀 注册提交按钮 -->
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
        <span v-if="!isLoading">Create Account</span>
        <!-- 加载状态显示加载器 -->
        <div v-else class="flex items-center justify-center">
          <LoadingSpinner size="small" color="white" />
          <span class="ml-2">Creating account...</span>
        </div>
      </button>
    </div>

    <!-- ⚠️ 注册错误信息显示 -->
    <div v-if="submitError" class="rounded-md bg-red-50 p-4">
      <div class="flex">
        <ExclamationTriangleIcon class="h-5 w-5 text-red-400 mr-3 mt-0.5 flex-shrink-0" />
        <div class="text-sm text-red-700">
          {{ submitError }}
        </div>
      </div>
    </div>

    <!-- ✅ 注册成功状态显示 -->
    <div v-if="showSuccess" class="rounded-md bg-green-50 p-4">
      <div class="flex">
        <CheckCircleIcon class="h-5 w-5 text-green-400 mr-3 mt-0.5 flex-shrink-0" />
        <div class="text-sm text-green-700">
          Account created successfully! Redirecting...
        </div>
      </div>
    </div>
  </form>
</template>

<script setup lang="ts">
/**
 * 📝 组件逻辑
 * 
 * 🎯 主要功能:
 * - 管理注册表单状态和验证
 * - 实时密码强度检测
 * - 处理用户输入和验证
 * - 执行注册请求和状态管理
 */

import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import type { SignupCredentials } from '@/types'

// 🔗 Heroicons图标组件导入
import {
  EyeIcon,
  EyeSlashIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/vue/24/outline'

/**
 * 🔄 组件Emits定义
 */
const emit = defineEmits<{
  success: []                    // 注册成功事件
  'switch-to-login': []         // 切换到登录模式事件
}>()

// 📊 认证状态管理
const authStore = useAuthStore()

// 📋 表单数据（扩展了agreeTerms字段）
const form = ref<SignupCredentials & { agreeTerms: boolean }>({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
})

// 🎛️ 组件状态
const showPassword = ref(false)        // 密码显示状态
const showConfirmPassword = ref(false) // 确认密码显示状态
const isLoading = ref(false)          // 加载状态
const submitError = ref('')           // 提交错误信息
const showSuccess = ref(false)        // 成功状态显示
const errors = ref<Record<string, string>>({}) // 字段验证错误

/**
 * 💪 密码强度计算
 * 根据多个因素评估密码强度：长度、字符类型等
 */
const passwordStrength = computed(() => {
  const password = form.value.password
  if (!password) return 0
  
  let strength = 0
  
  // 长度检查
  if (password.length >= 8) strength += 25
  if (password.length >= 12) strength += 15
  
  // 字符类型检查
  if (/[a-z]/.test(password)) strength += 15  // 小写字母
  if (/[A-Z]/.test(password)) strength += 15  // 大写字母
  if (/[0-9]/.test(password)) strength += 15  // 数字
  if (/[^A-Za-z0-9]/.test(password)) strength += 15  // 特殊字符
  
  return Math.min(strength, 100)
})

/**
 * 📝 密码强度文本标签
 */
const passwordStrengthText = computed(() => {
  const strength = passwordStrength.value
  if (strength < 30) return 'Weak'
  if (strength < 60) return 'Fair'
  if (strength < 80) return 'Good'
  return 'Strong'
})

/**
 * 🎨 密码强度进度条颜色样式
 */
const passwordStrengthClasses = computed(() => {
  const strength = passwordStrength.value
  if (strength < 30) return 'bg-red-500'
  if (strength < 60) return 'bg-yellow-500'
  if (strength < 80) return 'bg-blue-500'
  return 'bg-green-500'
})

/**
 * 🎨 密码强度文本颜色样式
 */
const passwordStrengthTextClasses = computed(() => {
  const strength = passwordStrength.value
  if (strength < 30) return 'text-red-600'
  if (strength < 60) return 'text-yellow-600'
  if (strength < 80) return 'text-blue-600'
  return 'text-green-600'
})

/**
 * ✅ 表单验证状态
 * 所有必填字段都有效且服务条款已同意时表单才有效
 */
const isFormValid = computed(() => {
  return form.value.name && 
         form.value.email && 
         form.value.password && 
         form.value.confirmPassword &&
         form.value.agreeTerms &&
         !errors.value.name &&
         !errors.value.email && 
         !errors.value.password &&
         !errors.value.confirmPassword
})

/**
 * 📧 邮箱格式验证函数
 */
const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * 👤 姓名长度验证函数
 */
const validateName = (name: string) => {
  return name.trim().length >= 2
}

/**
 * 🔒 密码长度验证函数
 */
const validatePassword = (password: string) => {
  return password.length >= 6
}

/**
 * 👀 实时姓名验证 - 监听姓名输入变化
 */
watch(() => form.value.name, (newName) => {
  if (newName && !validateName(newName)) {
    errors.value.name = 'Name must be at least 2 characters'
  } else {
    delete errors.value.name
  }
})

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
 * 👀 实时密码验证 - 监听密码输入变化
 */
watch(() => form.value.password, (newPassword) => {
  if (newPassword && !validatePassword(newPassword)) {
    errors.value.password = 'Password must be at least 6 characters'
  } else {
    delete errors.value.password
  }
  
  // 当密码改变时，重新验证确认密码
  if (form.value.confirmPassword && newPassword !== form.value.confirmPassword) {
    errors.value.confirmPassword = 'Passwords do not match'
  } else {
    delete errors.value.confirmPassword
  }
})

/**
 * 👀 实时确认密码验证 - 监听确认密码输入变化
 */
watch(() => form.value.confirmPassword, (newConfirmPassword) => {
  if (newConfirmPassword && newConfirmPassword !== form.value.password) {
    errors.value.confirmPassword = 'Passwords do not match'
  } else {
    delete errors.value.confirmPassword
  }
})

/**
 * 🚀 处理注册表单提交
 */
const handleSubmit = async () => {
  // 表单无效时不提交
  if (!isFormValid.value) return

  isLoading.value = true
  submitError.value = ''

  try {
    // 调用认证store的注册方法
    await authStore.signup({
      name: form.value.name,
      email: form.value.email,
      password: form.value.password,
      confirmPassword: form.value.confirmPassword
    })
    
    // 显示成功状态
    showSuccess.value = true
    
    // 延迟显示成功消息后发出成功事件
    setTimeout(() => {
      emit('success')
    }, 1500)
  } catch (error) {
    // 捕获并显示注册错误
    submitError.value = error instanceof Error ? error.message : 'Registration failed'
  } finally {
    isLoading.value = false
  }
}
</script>