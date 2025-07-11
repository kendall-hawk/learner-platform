/**11. src/composables/useFeatureAccess.ts
 * 🎛️ useFeatureAccess.ts - 功能访问权限Hook
 * 
 * 📋 功能概述:
 * - Vue 3组合式API，提供响应式的功能访问权限管理
 * - 基于用户订阅等级控制功能可用性
 * - 集成使用量限制和追踪系统
 * - 提供升级推荐和用户引导功能
 * - 支持实时权限检查和状态更新
 * 
 * 🎯 主要功能:
 * - 功能权限检查和访问控制
 * - 使用量限制管理和剩余量计算
 * - 订阅状态监听和响应式更新
 * - 升级推荐和功能门控信息
 * - 使用量追踪和警告提示
 * - 功能分类和权限映射
 * 
 * 🔗 集成服务:
 * - SubscriptionStore: 订阅状态管理
 * - SubscriptionService: 业务逻辑处理
 * - FeatureGates: 功能门控配置
 * 
 * 💡 使用示例:
 * ```typescript
 * const { canAccess, features, usage } = useFeatureAccess()
 * 
 * // 检查功能权限
 * if (canAccess('unlimited_articles')) {
 *   // 显示无限文章功能
 * }
 * 
 * // 检查使用量
 * const status = usage.getUsageStatus('articles', currentCount)
 * if (status.warning) {
 *   // 显示使用量警告
 * }
 * ```
 */

import { computed } from 'vue'
import { useSubscriptionStore } from '@/stores/subscription'
import { subscriptionService } from '@/services/subscriptionService'
import type { SubscriptionTier } from '@/types'

/**
 * 🎛️ 功能访问权限组合式函数
 * 
 * 🎯 设计原则:
 * - 响应式权限状态管理
 * - 类型安全的功能检查
 * - 灵活的使用量追踪
 * - 用户友好的升级引导
 * 
 * @returns 功能访问权限管理对象
 */
export function useFeatureAccess() {
  // 📊 订阅状态管理Store
  const subscriptionStore = useSubscriptionStore()

  /**
   * 🔍 检查用户是否可以访问指定功能
   * 
   * @param feature - 功能标识符
   * @returns boolean - 是否有访问权限
   * 
   * 🎯 功能特性:
   * - 基于当前订阅等级检查
   * - 支持所有预定义功能
   * - 实时响应订阅变化
   */
  const canAccess = (feature: string): boolean => {
    return subscriptionService.checkFeatureAccess(subscriptionStore.tier, feature)
  }

  /**
   * 📊 获取功能的使用量限制
   * 
   * @param feature - 功能标识符
   * @returns number | null - 使用限制（null表示无限制）
   * 
   * 🎯 应用场景:
   * - 显示剩余使用次数
   * - 使用量进度条展示
   * - 接近限制时的警告
   */
  const getLimit = (feature: string): number | null => {
    return subscriptionService.getUsageLimit(subscriptionStore.tier, feature)
  }

  /**
   * ⚠️ 检查是否已达到使用限制
   * 
   * @param feature - 功能标识符
   * @param currentUsage - 当前使用量
   * @returns boolean - 是否已达到限制
   * 
   * 🎯 限制策略:
   * - 软限制：显示警告但允许继续
   * - 硬限制：完全阻止功能使用
   * - 宽限期：超限后的缓冲时间
   */
  const hasReachedLimit = (feature: string, currentUsage: number): boolean => {
    return !subscriptionService.checkUsageLimit(subscriptionStore.tier, feature, currentUsage)
  }

  /**
   * 📈 获取功能的剩余使用量
   * 
   * @param feature - 功能标识符
   * @param currentUsage - 当前已使用量
   * @returns number | null - 剩余可用量（null表示无限制）
   * 
   * 🎯 计算逻辑:
   * - 总限额 - 已使用量 = 剩余量
   * - 确保不返回负数
   * - 无限制功能返回null
   */
  const getRemainingUsage = (feature: string, currentUsage: number): number | null => {
    const limit = getLimit(feature)
    if (limit === null) return null // 无限制
    return Math.max(0, limit - currentUsage)
  }

  /**
   * 🎛️ 响应式功能权限配置
   * 
   * 🎯 包含信息:
   * - 完整的功能权限映射
   * - 基于当前订阅等级
   * - 自动响应订阅变化
   */
  const getFeatureAccess = computed(() => {
    return subscriptionService.getFeatureAccess(subscriptionStore.tier)
  })

  /**
   * 🆓 检查用户是否为免费版
   */
  const isFree = computed(() => subscriptionStore.tier === 'free')

  /**
   * 💎 检查用户是否为专业版
   */
  const isPro = computed(() => subscriptionStore.tier === 'pro')

  /**
   * 🎯 获取升级推荐信息
   * 
   * 🎯 推荐策略:
   * - 基于当前订阅等级
   * - 个性化功能推荐
   * - 动态CTA文本
   */
  const getUpgradeInfo = computed(() => {
    return subscriptionService.getUpgradeRecommendations(subscriptionStore.tier)
  })

  /**
   * ⭐ 预定义功能权限映射
   * 
   * 🎯 功能分类:
   * - 文章访问相关
   * - 词典功能相关
   * - 音频功能相关
   * - 搜索分析相关
   * - 分析导出相关
   * - 通用功能相关
   */
  const features = computed(() => ({
    // 📚 文章访问相关
    unlimitedArticles: canAccess('unlimited_articles'),
    articleLimit: getLimit('articles'),
    
    // 📖 词典功能相关
    advancedDictionary: canAccess('advanced_glossary'),
    contextualDefinitions: canAccess('contextual_definitions'),
    audioDefinitions: canAccess('audio_definitions'),
    
    // 🎵 音频功能相关
    sentenceAudioSync: canAccess('sentence_audio_sync'),
    audioSpeedControl: canAccess('speed_control'),
    audioVisualizer: canAccess('visualizer'),
    
    // 🔍 搜索和分析相关
    crossArticleSearch: canAccess('cross_article_search'),
    smartSuggestions: canAccess('smart_suggestions'),
    highlightLimit: getLimit('highlights'),
    
    // 📊 分析和导出相关
    detailedAnalytics: canAccess('analytics'),
    exportFeatures: canAccess('export_features'),
    
    // 🌟 通用功能相关
    adFree: isPro.value,
    prioritySupport: isPro.value
  }))

  /**
   * 📊 使用量追踪和管理工具
   * 
   * 🎯 功能特性:
   * - 使用量验证和追踪
   * - 状态分析和警告
   * - 用户友好的提示信息
   */
  const usage = {
    /**
     * 📚 追踪文章阅读使用量
     * 
     * @param currentCount - 当前已读文章数
     * @returns 使用量检查结果
     */
    trackArticleRead: (currentCount: number) => {
      const limit = getLimit('articles')
      if (limit !== null && currentCount >= limit) {
        return {
          allowed: false,
          message: `You've reached your limit of ${limit} articles this month. Upgrade to Pro for unlimited access.`,
          upgradeRequired: true
        }
      }
      return { allowed: true }
    },

    /**
     * 🖍️ 追踪高亮功能使用量
     * 
     * @param currentCount - 当前高亮数量
     * @returns 使用量检查结果
     */
    trackHighlight: (currentCount: number) => {
      const limit = getLimit('highlights')
      if (limit !== null && currentCount >= limit) {
        return {
          allowed: false,
          message: `You've reached your limit of ${limit} highlights. Upgrade to Pro for unlimited highlights.`,
          upgradeRequired: true
        }
      }
      return { allowed: true }
    },

    /**
     * 📈 获取功能使用状态详情
     * 
     * @param feature - 功能标识符
     * @param currentUsage - 当前使用量
     * @returns 详细的使用状态信息
     * 
     * 🎯 状态类型:
     * - unlimited: 无限制使用
     * - limited: 有限制，包含进度信息
     * - warning: 接近限制的警告状态
     */
    getUsageStatus: (feature: string, currentUsage: number) => {
      const limit = getLimit(feature)
      
      if (limit === null) {
        // 无限制功能
        return {
          type: 'unlimited' as const,
          usage: currentUsage,
          limit: null,
          percentage: 0,
          warning: false
        }
      }
      
      // 有限制功能
      const percentage = (currentUsage / limit) * 100
      const warning = percentage >= 80 // 使用量超过80%时显示警告
      
      return {
        type: 'limited' as const,
        usage: currentUsage,
        limit,
        percentage,
        warning,
        remaining: Math.max(0, limit - currentUsage)
      }
    }
  }

  /**
   * 🚪 功能门控辅助工具
   * 
   * 🎯 门控策略:
   * - 个性化升级提示
   * - 智能显示时机
   * - 用户引导优化
   */
  const gates = {
    /**
     * 📝 创建功能门控提示信息
     * 
     * @param feature - 功能标识符
     * @returns 门控提示信息对象
     * 
     * 🎯 信息结构:
     * - 标题：吸引用户注意
     * - 描述：功能价值说明
     * - 优势：具体功能列表
     */
    createGateMessage: (feature: string) => {
      const messages: Record<string, { title: string; description: string; benefits: string[] }> = {
        unlimited_articles: {
          title: 'Unlock Unlimited Articles',
          description: 'Access our full library of English learning content.',
          benefits: ['Read unlimited articles', 'No monthly limits', 'New content weekly']
        },
        advanced_glossary: {
          title: 'Advanced Dictionary Features',
          description: 'Get contextual definitions and pronunciation guides.',
          benefits: ['Context-aware definitions', 'Audio pronunciations', 'Etymology & word origins']
        },
        sentence_audio_sync: {
          title: 'Precise Audio Synchronization',
          description: 'Follow along with sentence-level audio highlighting.',
          benefits: ['Sentence-level precision', 'Better pronunciation practice', 'Improved comprehension']
        },
        cross_article_search: {
          title: 'Advanced Search & Analysis',
          description: 'Search and analyze words across all articles.',
          benefits: ['Cross-article word search', 'Usage pattern analysis', 'Advanced filtering']
        },
        export_features: {
          title: 'Export & Sharing',
          description: 'Export articles and progress in multiple formats.',
          benefits: ['PDF & EPUB export', 'Print-friendly formats', 'Share with others']
        },
        analytics: {
          title: 'Detailed Analytics',
          description: 'Track your learning progress with advanced insights.',
          benefits: ['Detailed progress reports', 'Learning pattern analysis', 'Personalized recommendations']
        }
      }
      
      return messages[feature] || {
        title: 'Upgrade to Pro',
        description: 'This feature is available with a Pro subscription.',
        benefits: ['Enhanced learning experience', 'Advanced features', 'Priority support']
      }
    },

    /**
     * 💡 判断是否应该显示升级提示
     * 
     * @param feature - 功能标识符
     * @param usage - 可选的使用量参数
     * @returns boolean - 是否显示升级提示
     * 
     * 🎯 显示条件:
     * - 专业版用户不显示
     * - 无权限功能直接显示
     * - 接近使用限制时显示
     */
    shouldShowUpgrade: (feature: string, usage?: number) => {
      if (isPro.value) return false
      
      if (!canAccess(feature)) return true
      
      if (usage !== undefined) {
        const status = usage.getUsageStatus(feature, usage)
        return status.type === 'limited' && status.warning
      }
      
      return false
    }
  }

  /**
   * 📊 响应式订阅状态概览
   * 
   * 🎯 状态信息:
   * - 订阅等级和激活状态
   * - 试用期和续费信息
   * - 状态徽章显示配置
   */
  const status = computed(() => ({
    tier: subscriptionStore.tier,
    isActive: subscriptionStore.isActive,
    isTrialing: subscriptionStore.isTrialing,
    trialDaysLeft: subscriptionStore.trialDaysLeft,
    daysUntilRenewal: subscriptionStore.daysUntilRenewal,
    badge: subscriptionStore.getStatusBadge
  }))

  // 🔗 返回完整的功能访问管理接口
  return {
    // 🔍 核心权限检查
    canAccess,
    getLimit,
    hasReachedLimit,
    getRemainingUsage,
    
    // 🎛️ 响应式计算属性
    features,
    getFeatureAccess,
    getUpgradeInfo,
    status,
    
    // 🏷️ 订阅等级检查
    isFree,
    isPro,
    
    // 📊 使用量追踪工具
    usage,
    
    // 🚪 功能门控工具
    gates
  }
}

/**
 * 🔗 默认导出
 */
export default useFeatureAccess