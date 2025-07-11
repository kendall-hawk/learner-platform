/**
 * 🛤️ 第11个文件：src/router/index.ts
 * 
 * 📁 文件位置: src/router/index.ts
 * 🎯 核心功能: Vue Router路由系统配置，页面导航和权限控制
 * 🔧 关键作用: 定义路由规则、懒加载组件、导航守卫、权限验证
 * 
 * 📋 配置模块说明：
 * - 路由定义: 所有页面路由配置和元信息
 * - 懒加载: 组件按需加载提升性能
 * - 导航守卫: 认证检查和订阅验证
 * - 滚动行为: 页面切换时的滚动处理
 * - 错误处理: 导航失败和chunk加载错误
 */

import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useSubscriptionStore } from '@/stores/subscription'

// Lazy load components for better performance
// 懒加载组件 - 提升应用启动性能，按需加载页面组件
const HomePage = () => import('@/views/HomePage.vue')
const LoginPage = () => import('@/views/LoginPage.vue')
const Dashboard = () => import('@/views/Dashboard.vue')
const ArticlePage = () => import('@/views/ArticlePage.vue')
const WordFrequencyPage = () => import('@/views/WordFrequencyPage.vue')
const SubscriptionPage = () => import('@/views/SubscriptionPage.vue')
const ProfilePage = () => import('@/views/ProfilePage.vue')
const NotFoundPage = () => import('@/views/NotFoundPage.vue')

// Route definitions
// 路由定义 - 配置所有页面的路由规则和元信息
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: HomePage,
    meta: {
      title: 'Modern English Learning Platform',
      description: 'Advanced English learning with AI-powered features',
      requiresAuth: false
    }
  },
  {
    path: '/login',
    name: 'Login',
    component: LoginPage,
    meta: {
      title: 'Login - English Learning',
      requiresAuth: false,
      redirectIfAuthenticated: true
    }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: {
      title: 'Dashboard - English Learning',
      requiresAuth: true,
      requiresSubscription: false
    }
  },
  {
    path: '/article/:id',
    name: 'Article',
    component: ArticlePage,
    meta: {
      title: 'Article - English Learning',
      requiresAuth: true,
      requiresSubscription: false
    },
    props: true
  },
  {
    path: '/word-frequency',
    name: 'WordFrequency',
    component: WordFrequencyPage,
    meta: {
      title: 'Word Frequency Analysis - English Learning',
      requiresAuth: true,
      requiresSubscription: false,
      description: 'Analyze word frequency patterns across articles'
    }
  },
  {
    path: '/subscription',
    name: 'Subscription',
    component: SubscriptionPage,
    meta: {
      title: 'Subscription Plans - English Learning',
      requiresAuth: true,
      requiresSubscription: false
    }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: ProfilePage,
    meta: {
      title: 'Profile Settings - English Learning',
      requiresAuth: true,
      requiresSubscription: false
    }
  },
  {
    path: '/premium',
    redirect: '/subscription'
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFoundPage,
    meta: {
      title: 'Page Not Found - English Learning'
    }
  }
]

// Create router instance
// 创建路由实例 - 配置历史模式和滚动行为
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Scroll to saved position if available (back/forward navigation)
    // 如果有保存的位置则滚动到该位置（前进/后退导航）
    if (savedPosition) {
      return savedPosition
    }
    // Scroll to anchor if present
    // 如果有锚点则滚动到锚点位置
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }
    // Scroll to top for new pages
    // 新页面滚动到顶部
    return { top: 0, behavior: 'smooth' }
  }
})

// Global navigation guards
// 全局导航守卫 - 处理认证、权限、页面标题等
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()
  const subscriptionStore = useSubscriptionStore()
  
  // Set page title
  // 设置页面标题
  if (to.meta.title) {
    document.title = to.meta.title as string
  }
  
  // Set meta description
  // 设置页面描述
  if (to.meta.description) {
    const metaDescription = document.querySelector('meta[name="description"]')
    if (metaDescription) {
      metaDescription.setAttribute('content', to.meta.description as string)
    }
  }
  
  // Check authentication requirement
  // 检查认证要求 - 未登录用户重定向到登录页
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({
      name: 'Login',
      query: { redirect: to.fullPath }
    })
    return
  }
  
  // Redirect authenticated users away from login page
  // 已登录用户访问登录页时重定向到仪表板
  if (to.meta.redirectIfAuthenticated && authStore.isAuthenticated) {
    next({ name: 'Dashboard' })
    return
  }
  
  // Check subscription requirement
  // 检查订阅要求 - 免费用户访问专业功能时重定向到订阅页
  if (to.meta.requiresSubscription && authStore.isAuthenticated) {
    await subscriptionStore.fetchSubscriptionStatus()
    
    if (subscriptionStore.tier === 'free') {
      next({
        name: 'Subscription',
        query: { feature: to.name as string }
      })
      return
    }
  }
  
  // Load user data if authenticated
  // 加载用户数据（如果已认证）
  if (authStore.isAuthenticated && !authStore.user) {
    try {
      await authStore.fetchUserProfile()
    } catch (error) {
      console.error('Failed to load user profile:', error)
      // Don't block navigation, just log the error
      // 不阻止导航，只记录错误
    }
  }
  
  next()
})

// After navigation hook for analytics
// 导航后钩子 - 用于分析和调试
router.afterEach((to, from) => {
  // Track page views (implement your analytics here)
  // 页面访问统计（在此处实现分析代码）
  if (typeof gtag !== 'undefined') {
    gtag('config', 'GA_TRACKING_ID', {
      page_path: to.path,
      page_title: to.meta.title
    })
  }
  
  // Log navigation for debugging
  // 导航日志记录（开发环境调试用）
  if (process.env.NODE_ENV === 'development') {
    console.log(`Navigated from ${from.path} to ${to.path}`)
  }
})

// Error handling for navigation failures
// 导航错误处理
router.onError((error) => {
  console.error('Router error:', error)
  
  // Handle chunk load errors (lazy loading failures)
  // 处理代码块加载错误（懒加载失败时刷新页面）
  if (error.message.includes('Loading chunk')) {
    window.location.reload()
  }
})

export default router

// Helper function to check if current route requires subscription
// 工具函数：检查当前路由是否需要订阅
export const requiresSubscription = (routeName?: string): boolean => {
  if (!routeName) return false
  
  const route = routes.find(r => r.name === routeName)
  return route?.meta?.requiresSubscription === true
}

// Helper function to get route by name
// 工具函数：根据名称获取路由
export const getRouteByName = (name: string) => {
  return routes.find(route => route.name === name)
}

// Helper function for programmatic navigation with loading state
// 工具函数：带加载状态的编程式导航
export const navigateWithLoading = async (to: string | object) => {
  const loadingStore = { isLoading: true } // You might want to use a proper loading store
  
  try {
    loadingStore.isLoading = true
    await router.push(to)
  } catch (error) {
    console.error('Navigation error:', error)
  } finally {
    loadingStore.isLoading = false
  }
}