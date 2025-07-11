/**
 * 💰 第14个文件：src/stores/subscription.ts
 * 
 * 📁 文件位置: src/stores/subscription.ts
 * 🎯 核心功能: Pinia订阅管理状态，处理用户订阅状态和功能权限
 * 🔧 关键作用: 订阅等级管理、功能门控、升级降级、账单处理
 * 
 * 📋 状态模块说明：
 * - 订阅状态: 当前订阅等级、状态、到期时间
 * - 功能权限: 基于订阅等级的功能访问控制
 * - 升级管理: 订阅升级、取消、重新激活流程
 * - 试用期: 试用状态和剩余天数计算
 * - 账单门户: Stripe账单管理集成
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Subscription, SubscriptionTier, FeatureAccess } from '@/types'
import { SUBSCRIPTION_FEATURES } from '@/types'
import { mockApiService } from '@/services/mockApi'
import { useAuthStore } from './auth'

export const useSubscriptionStore = defineStore('subscription', () => {
  // State
  // 状态定义 - 订阅相关的响应式数据
  const subscription = ref<Subscription | null>(null)  // 当前订阅信息
  const isLoading = ref(false)                         // 加载状态
  const error = ref<string | null>(null)               // 错误信息
  const upgradeInProgress = ref(false)                 // 升级进行中状态

  // Getters
  // 计算属性 - 基于订阅状态的派生数据

  const tier = computed((): SubscriptionTier => {
    return subscription.value?.tier || 'free'
  })

  const features = computed((): FeatureAccess => {
    return SUBSCRIPTION_FEATURES[tier.value]
  })

  const isPro = computed(() => tier.value === 'pro')
  const isFree = computed(() => tier.value === 'free')

  const isActive = computed(() => {
    return subscription.value?.status === 'active' || tier.value === 'free'
  })

  const isTrialing = computed(() => {
    return subscription.value?.status === 'trialing'
  })

  const trialDaysLeft = computed(() => {
    if (!subscription.value?.trialEnd) return 0
    
    const trialEnd = new Date(subscription.value.trialEnd)
    const now = new Date()
    const timeDiff = trialEnd.getTime() - now.getTime()
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24))
    
    return Math.max(0, daysLeft)
  })

  const periodEnd = computed(() => {
    if (!subscription.value?.currentPeriodEnd) return null
    return new Date(subscription.value.currentPeriodEnd)
  })

  const daysUntilRenewal = computed(() => {
    if (!periodEnd.value) return null
    
    const now = new Date()
    const timeDiff = periodEnd.value.getTime() - now.getTime()
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24))
    
    return Math.max(0, daysLeft)
  })

  // Actions
  // 动作方法 - 订阅状态变更逻辑

  const fetchSubscriptionStatus = async (): Promise<void> => {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      // Reset to free tier for unauthenticated users
      // 未认证用户重置为免费版
      subscription.value = null
      return
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await mockApiService.getSubscriptionStatus()
      
      if (response.success && response.data) {
        subscription.value = response.data as Subscription
      } else {
        throw new Error(response.error || 'Failed to fetch subscription status')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch subscription'
      console.error('Subscription fetch error:', err)
      
      // Default to free tier on error
      // 出错时默认为免费版
      subscription.value = null
    } finally {
      isLoading.value = false
    }
  }

  const upgrade = async (planId: string): Promise<void> => {
    const authStore = useAuthStore()
    
    if (!authStore.isAuthenticated) {
      throw new Error('Must be logged in to upgrade subscription')
    }

    upgradeInProgress.value = true
    error.value = null

    try {
      const response = await mockApiService.upgradeSubscription(planId)
      
      if (response.success && response.data) {
        subscription.value = response.data as Subscription
        console.log('Subscription upgraded successfully:', planId)
      } else {
        throw new Error(response.error || 'Failed to upgrade subscription')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Upgrade failed'
      console.error('Subscription upgrade error:', err)
      throw err
    } finally {
      upgradeInProgress.value = false
    }
  }

  const cancel = async (): Promise<void> => {
    if (!subscription.value) {
      throw new Error('No active subscription to cancel')
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await mockApiService.cancelSubscription()
      
      if (response.success && response.data) {
        subscription.value = response.data as Subscription
        console.log('Subscription canceled successfully')
      } else {
        throw new Error(response.error || 'Failed to cancel subscription')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Cancellation failed'
      console.error('Subscription cancellation error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const reactivate = async (): Promise<void> => {
    if (!subscription.value || subscription.value.status === 'active') {
      throw new Error('No canceled subscription to reactivate')
    }

    isLoading.value = true
    error.value = null

    try {
      const response = await mockApiService.reactivateSubscription()
      
      if (response.success && response.data) {
        subscription.value = response.data as Subscription
        console.log('Subscription reactivated successfully')
      } else {
        throw new Error(response.error || 'Failed to reactivate subscription')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Reactivation failed'
      console.error('Subscription reactivation error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const getBillingPortalUrl = async (): Promise<string> => {
    if (!subscription.value) {
      throw new Error('No active subscription')
    }

    try {
      const response = await mockApiService.getBillingPortalUrl()
      
      if (response.success && response.data) {
        return response.data.url
      } else {
        throw new Error(response.error || 'Failed to get billing portal URL')
      }
    } catch (err) {
      console.error('Billing portal error:', err)
      throw err
    }
  }

  // Feature access checks
  // 功能访问检查 - 基于订阅等级的权限控制

  const canAccess = (feature: string): boolean => {
    // Define feature access logic based on subscription tier
    // 基于订阅等级定义功能访问逻辑
    const currentFeatures = features.value
    
    switch (feature) {
      case 'unlimited_articles':
        return currentFeatures.articles.unlimited
      
      case 'advanced_glossary':
        return currentFeatures.glossary.level === 'advanced'
      
      case 'sentence_audio_sync':
        return currentFeatures.audioSync.precision === 'sentence'
      
      case 'cross_article_search':
        return currentFeatures.wordFrequency.crossArticle
      
      case 'export_features':
        return currentFeatures.export.formats.length > 1
      
      case 'analytics':
        return currentFeatures.wordFrequency.analytics
      
      default:
        return true // Default to allowing access for unknown features
    }
  }

  const getFeatureLimit = (feature: string): number | null => {
    const currentFeatures = features.value
    
    switch (feature) {
      case 'articles':
        return currentFeatures.articles.unlimited ? null : currentFeatures.articles.limit
      
      case 'highlights':
        return currentFeatures.search.highlightLimit === Infinity 
          ? null 
          : currentFeatures.search.highlightLimit
      
      default:
        return null
    }
  }

  const checkUsageLimit = (feature: string, currentUsage: number): boolean => {
    const limit = getFeatureLimit(feature)
    return limit === null || currentUsage < limit
  }

  const clearError = () => {
    error.value = null
  }

  // Initialize subscription when auth changes
  // 认证状态变化时初始化订阅
  const initializeSubscription = async () => {
    const authStore = useAuthStore()
    
    if (authStore.isAuthenticated) {
      await fetchSubscriptionStatus()
    } else {
      subscription.value = null
    }
  }

  // Subscription status helpers
  // 订阅状态辅助函数

  const getStatusBadge = computed(() => {
    if (!subscription.value) return { text: 'Free', color: 'gray' }
    
    switch (subscription.value.status) {
      case 'active':
        return { text: 'Pro', color: 'green' }
      case 'trialing':
        return { text: 'Trial', color: 'blue' }
      case 'canceled':
        return { text: 'Canceled', color: 'orange' }
      case 'past_due':
        return { text: 'Past Due', color: 'red' }
      default:
        return { text: 'Unknown', color: 'gray' }
    }
  })

  const getUpgradeMessage = computed(() => {
    if (isPro.value) return null
    
    return {
      title: 'Upgrade to Pro',
      description: 'Unlock unlimited articles, advanced features, and detailed analytics.',
      ctaText: 'Upgrade Now'
    }
  })

  return {
    // State
    // 状态
    subscription,
    isLoading,
    error,
    upgradeInProgress,
    
    // Getters
    // 计算属性
    tier,
    features,
    isPro,
    isFree,
    isActive,
    isTrialing,
    trialDaysLeft,
    periodEnd,
    daysUntilRenewal,
    getStatusBadge,
    getUpgradeMessage,
    
    // Actions
    // 动作方法
    fetchSubscriptionStatus,
    upgrade,
    cancel,
    reactivate,
    getBillingPortalUrl,
    canAccess,
    getFeatureLimit,
    checkUsageLimit,
    clearError,
    initializeSubscription
  }
})