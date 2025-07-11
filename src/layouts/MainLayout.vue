<!--
🎨 第15个文件：src/layouts/MainLayout.vue

📁 文件位置: src/layouts/MainLayout.vue
🎯 核心功能: 应用主布局组件，包含导航栏、用户菜单、移动端适配
🔧 关键作用: 统一页面布局、用户认证UI、订阅状态显示、响应式设计

📋 组件模块说明：
- 顶部导航: Logo、主导航菜单、用户状态显示
- 用户菜单: 头像下拉菜单、个人设置、账单管理
- 移动端菜单: 汉堡菜单、触摸友好的移动导航
- 订阅状态: 当前订阅等级徽章和升级提示
- 页面布局: 头部、主内容区、底部的完整结构
-->

<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <!-- Header -->
    <!-- 顶部导航栏 - 包含Logo、导航菜单、用户操作区 -->
    <header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo and Navigation -->
          <!-- Logo和主导航区域 -->
          <div class="flex items-center space-x-8">
            <router-link 
              to="/" 
              class="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
            >
              <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-sm">E</span>
              </div>
              <span class="font-bold text-xl hidden sm:block">EnglishPro</span>
            </router-link>

            <!-- Desktop Navigation -->
            <!-- 桌面端导航菜单 -->
            <nav class="hidden md:flex items-center space-x-6">
              <router-link
                to="/dashboard"
                class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                :class="{ 'text-primary-600 bg-primary-50': $route.name === 'Dashboard' }"
              >
                Dashboard
              </router-link>
              <router-link
                to="/word-frequency"
                class="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                :class="{ 'text-primary-600 bg-primary-50': $route.name === 'WordFrequency' }"
              >
                Word Analysis
              </router-link>
              <router-link
                v-if="!subscriptionStore.isPro"
                to="/subscription"
                class="text-orange-600 hover:text-orange-700 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Upgrade
              </router-link>
            </nav>
          </div>

          <!-- User Actions -->
          <!-- 用户操作区域 -->
          <div class="flex items-center space-x-4">
            <!-- Subscription Badge -->
            <!-- 订阅状态徽章 -->
            <div 
              v-if="authStore.isAuthenticated"
              class="hidden sm:flex items-center"
            >
              <span 
                class="px-2 py-1 text-xs font-medium rounded-full"
                :class="subscriptionBadgeClasses"
              >
                {{ subscriptionStore.getStatusBadge.text }}
              </span>
            </div>

            <!-- User Menu -->
            <!-- 用户下拉菜单 -->
            <div v-if="authStore.isAuthenticated" class="relative">
              <Menu as="div" class="relative">
                <MenuButton class="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded-md p-1">
                  <img
                    :src="authStore.user?.avatar || defaultAvatar"
                    :alt="authStore.userName"
                    class="w-8 h-8 rounded-full object-cover"
                  />
                  <span class="hidden sm:block text-sm font-medium">{{ authStore.userName }}</span>
                  <ChevronDownIcon class="w-4 h-4 text-gray-400" />
                </MenuButton>

                <Transition
                  enter-active-class="transition ease-out duration-100"
                  enter-from-class="transform opacity-0 scale-95"
                  enter-to-class="transform opacity-100 scale-100"
                  leave-active-class="transition ease-in duration-75"
                  leave-from-class="transform opacity-100 scale-100"
                  leave-to-class="transform opacity-0 scale-95"
                >
                  <MenuItems class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div class="py-1">
                      <MenuItem v-slot="{ active }">
                        <router-link
                          to="/profile"
                          :class="[
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'group flex items-center px-4 py-2 text-sm'
                          ]"
                        >
                          <UserIcon class="mr-3 h-4 w-4 text-gray-400" />
                          Profile Settings
                        </router-link>
                      </MenuItem>
                      
                      <MenuItem v-if="subscriptionStore.isPro" v-slot="{ active }">
                        <button
                          @click="openBillingPortal"
                          :class="[
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'group flex items-center px-4 py-2 text-sm w-full text-left'
                          ]"
                        >
                          <CreditCardIcon class="mr-3 h-4 w-4 text-gray-400" />
                          Billing
                        </button>
                      </MenuItem>

                      <MenuItem v-else v-slot="{ active }">
                        <router-link
                          to="/subscription"
                          :class="[
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'group flex items-center px-4 py-2 text-sm'
                          ]"
                        >
                          <StarIcon class="mr-3 h-4 w-4 text-yellow-400" />
                          Upgrade to Pro
                        </router-link>
                      </MenuItem>

                      <div class="border-t border-gray-100"></div>
                      
                      <MenuItem v-slot="{ active }">
                        <button
                          @click="handleLogout"
                          :class="[
                            active ? 'bg-gray-100 text-gray-900' : 'text-gray-700',
                            'group flex items-center px-4 py-2 text-sm w-full text-left'
                          ]"
                        >
                          <ArrowRightOnRectangleIcon class="mr-3 h-4 w-4 text-gray-400" />
                          Sign Out
                        </button>
                      </MenuItem>
                    </div>
                  </MenuItems>
                </Transition>
              </Menu>
            </div>

            <!-- Login Button -->
            <!-- 登录按钮（未认证用户显示） -->
            <router-link
              v-else
              to="/login"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
            >
              Sign In
            </router-link>

            <!-- Mobile Menu Button -->
            <!-- 移动端菜单切换按钮 -->
            <button
              @click="isMobileMenuOpen = !isMobileMenuOpen"
              class="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
            >
              <span class="sr-only">Open main menu</span>
              <Bars3Icon v-if="!isMobileMenuOpen" class="block h-6 w-6" />
              <XMarkIcon v-else class="block h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Navigation Menu -->
      <!-- 移动端导航菜单 -->
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="transform opacity-0 scale-95"
        enter-to-class="transform opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="transform opacity-100 scale-100"
        leave-to-class="transform opacity-0 scale-95"
      >
        <div v-if="isMobileMenuOpen" class="md:hidden bg-white border-t border-gray-200">
          <div class="px-2 pt-2 pb-3 space-y-1">
            <router-link
              to="/dashboard"
              @click="isMobileMenuOpen = false"
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Dashboard
            </router-link>
            <router-link
              to="/word-frequency"
              @click="isMobileMenuOpen = false"
              class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
            >
              Word Analysis
            </router-link>
            <router-link
              v-if="!subscriptionStore.isPro"
              to="/subscription"
              @click="isMobileMenuOpen = false"
              class="block px-3 py-2 rounded-md text-base font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50"
            >
              Upgrade to Pro
            </router-link>
          </div>
        </div>
      </Transition>
    </header>

    <!-- Main Content -->
    <!-- 主内容区域 - 页面内容插槽 -->
    <main class="flex-1">
      <slot />
    </main>

    <!-- Footer -->
    <!-- 页面底部 -->
    <footer class="bg-white border-t border-gray-200 mt-auto">
      <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
        <div class="flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <div class="text-sm text-gray-500">
            © 2024 Modern English Learning Platform. All rights reserved.
          </div>
          <div class="flex items-center space-x-4 text-sm text-gray-500">
            <a href="#" class="hover:text-gray-700 transition-colors">Privacy</a>
            <a href="#" class="hover:text-gray-700 transition-colors">Terms</a>
            <a href="#" class="hover:text-gray-700 transition-colors">Support</a>
          </div>
        </div>
      </div>
    </footer>

    <!-- Loading Overlay -->
    <!-- 全局加载遮罩 -->
    <Transition name="fade">
      <div
        v-if="isLoading"
        class="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50"
      >
        <LoadingSpinner size="large" />
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSubscriptionStore } from '@/stores/subscription'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

// Headless UI components
// Headless UI组件导入
import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/vue'

// Icons
// 图标组件导入
import { 
  ChevronDownIcon,
  UserIcon,
  CreditCardIcon,
  StarIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const authStore = useAuthStore()
const subscriptionStore = useSubscriptionStore()

const isMobileMenuOpen = ref(false)
const isLoading = ref(false)

const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'

// 订阅徽章样式计算
const subscriptionBadgeClasses = computed(() => {
  const badge = subscriptionStore.getStatusBadge
  const baseClasses = 'px-2 py-1 text-xs font-medium rounded-full'
  
  switch (badge.color) {
    case 'green':
      return `${baseClasses} bg-green-100 text-green-800`
    case 'blue':
      return `${baseClasses} bg-blue-100 text-blue-800`
    case 'orange':
      return `${baseClasses} bg-orange-100 text-orange-800`
    case 'red':
      return `${baseClasses} bg-red-100 text-red-800`
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`
  }
})

// 用户登出处理
const handleLogout = async () => {
  isLoading.value = true
  
  try {
    await authStore.logout()
    router.push('/')
  } catch (error) {
    console.error('Logout error:', error)
  } finally {
    isLoading.value = false
  }
}

// 打开账单门户
const openBillingPortal = async () => {
  try {
    const url = await subscriptionStore.getBillingPortalUrl()
    window.open(url, '_blank')
  } catch (error) {
    console.error('Failed to open billing portal:', error)
  }
}

// 组件挂载时初始化
onMounted(async () => {
  // Initialize subscription data if user is authenticated
  // 如果用户已认证则初始化订阅数据
  if (authStore.isAuthenticated) {
    await subscriptionStore.initializeSubscription()
  }
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Custom scrollbar for mobile menu */
/* 移动端菜单自定义滚动条 */
.mobile-menu {
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.mobile-menu::-webkit-scrollbar {
  display: none;
}
</style>