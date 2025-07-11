/**12. src/utils/featureGates.ts
 * ⚙️ featureGates.ts - 功能门控配置和工具函数
 * 
 * 📋 功能概述:
 * - 定义完整的功能门控系统配置
 * - 提供订阅等级与功能权限的映射关系
 * - 管理使用限额和权限检查逻辑
 * - 支持功能分类和批量权限操作
 * - 提供使用量追踪和分析工具
 * 
 * 🎯 主要功能:
 * - 功能门控定义和配置管理
 * - 订阅等级权限映射
 * - 使用限额配置和检查
 * - 功能分类和权限批量操作
 * - 使用量追踪和统计分析
 * - 升级推荐和用户引导
 * 
 * 🏗️ 架构设计:
 * - 类型安全的功能定义
 * - 灵活的权限配置系统
 * - 可扩展的功能分类结构
 * - 响应式的权限检查机制
 * 
 * 🔗 集成组件:
 * - FeatureGate组件
 * - useFeatureAccess Hook
 * - SubscriptionService
 * - 订阅状态管理
 */

import type { SubscriptionTier, FeatureAccess } from '@/types'

/**
 * 🚪 功能门控定义接口
 * 
 * 📋 功能门控结构:
 * - id: 唯一功能标识符
 * - name: 用户友好的功能名称
 * - description: 功能详细描述
 * - category: 功能分类（便于管理）
 * - tier: 支持的订阅等级
 * - usage: 可选的使用限制配置
 */
export interface FeatureGate {
  id: string                           // 功能唯一标识
  name: string                         // 功能显示名称
  description: string                  // 功能描述说明
  category: 'content' | 'dictionary' | 'audio' | 'analysis' | 'export' | 'support'  // 功能分类
  tier: SubscriptionTier[]             // 支持的订阅等级
  usage?: {                            // 可选的使用限制
    type: 'count' | 'time' | 'size'   // 限制类型
    limit: number                      // 限制数量
    period?: 'daily' | 'weekly' | 'monthly'  // 限制周期
  }
}

/**
 * 🎛️ 完整功能门控配置
 * 
 * 🎯 功能分类:
 * - Content: 内容访问相关功能
 * - Dictionary: 词典和定义相关功能
 * - Audio: 音频播放和同步功能
 * - Analysis: 分析和搜索功能
 * - Export: 导出和分享功能
 * - Support: 客户支持相关功能
 */
export const FEATURE_GATES: FeatureGate[] = [
  
  // 📚 内容访问功能
  {
    id: 'unlimited_articles',
    name: 'Unlimited Articles',
    description: 'Access to unlimited articles without monthly restrictions',
    category: 'content',
    tier: ['pro']
  },
  {
    id: 'premium_content',
    name: 'Premium Content',
    description: 'Access to exclusive premium articles and content',
    category: 'content',
    tier: ['pro']
  },
  {
    id: 'offline_download',
    name: 'Offline Downloads',
    description: 'Download articles for offline reading',
    category: 'content',
    tier: ['pro']
  },

  // 📖 词典功能
  {
    id: 'advanced_glossary',
    name: 'Advanced Dictionary',
    description: 'Context-aware definitions with etymology and usage examples',
    category: 'dictionary',
    tier: ['pro']
  },
  {
    id: 'contextual_definitions',
    name: 'Contextual Definitions',
    description: 'Definitions tailored to the specific context of the article',
    category: 'dictionary',
    tier: ['pro']
  },
  {
    id: 'audio_definitions',
    name: 'Audio Pronunciations',
    description: 'Audio pronunciations for word definitions',
    category: 'dictionary',
    tier: ['pro']
  },
  {
    id: 'word_etymology',
    name: 'Word Etymology',
    description: 'Etymology and word origin information',
    category: 'dictionary',
    tier: ['pro']
  },

  // 🎵 音频功能
  {
    id: 'sentence_audio_sync',
    name: 'Sentence-Level Audio Sync',
    description: 'Precise sentence-level audio synchronization',
    category: 'audio',
    tier: ['pro']
  },
  {
    id: 'speed_control',
    name: 'Playback Speed Control',
    description: 'Adjust audio playback speed for better comprehension',
    category: 'audio',
    tier: ['pro']
  },
  {
    id: 'audio_visualizer',
    name: 'Audio Visualizer',
    description: 'Visual waveform and frequency analysis of audio',
    category: 'audio',
    tier: ['pro']
  },
  {
    id: 'custom_audio',
    name: 'Custom Audio Upload',
    description: 'Upload and sync your own audio files',
    category: 'audio',
    tier: ['pro']
  },

  // 📊 分析功能
  {
    id: 'cross_article_search',
    name: 'Cross-Article Search',
    description: 'Search and analyze words across all articles',
    category: 'analysis',
    tier: ['pro']
  },
  {
    id: 'advanced_analytics',
    name: 'Advanced Analytics',
    description: 'Detailed learning analytics and progress insights',
    category: 'analysis',
    tier: ['pro']
  },
  {
    id: 'word_frequency_analytics',
    name: 'Word Frequency Analytics',
    description: 'Advanced word frequency analysis and trends',
    category: 'analysis',
    tier: ['pro']
  },
  {
    id: 'learning_patterns',
    name: 'Learning Pattern Analysis',
    description: 'AI-powered analysis of your learning patterns',
    category: 'analysis',
    tier: ['pro']
  },
  {
    id: 'smart_suggestions',
    name: 'Smart Suggestions',
    description: 'AI-powered content and learning suggestions',
    category: 'analysis',
    tier: ['pro']
  },

  // 📤 导出功能
  {
    id: 'export_pdf',
    name: 'PDF Export',
    description: 'Export articles and progress reports as PDF',
    category: 'export',
    tier: ['pro']
  },
  {
    id: 'export_epub',
    name: 'EPUB Export',
    description: 'Export articles as EPUB for e-readers',
    category: 'export',
    tier: ['pro']
  },
  {
    id: 'export_annotations',
    name: 'Export with Annotations',
    description: 'Export articles with your notes and highlights',
    category: 'export',
    tier: ['pro']
  },
  {
    id: 'bulk_export',
    name: 'Bulk Export',
    description: 'Export multiple articles at once',
    category: 'export',
    tier: ['pro']
  },

  // 🎧 客户支持功能
  {
    id: 'priority_support',
    name: 'Priority Support',
    description: 'Priority customer support with faster response times',
    category: 'support',
    tier: ['pro']
  },
  {
    id: 'live_chat',
    name: 'Live Chat Support',
    description: 'Real-time chat support during business hours',
    category: 'support',
    tier: ['pro']
  },
  {
    id: 'phone_support',
    name: 'Phone Support',
    description: 'Direct phone support for urgent issues',
    category: 'support',
    tier: ['pro']
  }
]

/**
 * 🆓 免费版使用限制配置
 * 
 * 🎯 限制策略:
 * - 适度限制以鼓励升级
 * - 保证基本功能体验
 * - 明确的升级价值主张
 */
export const FREE_TIER_LIMITS = {
  articles_per_month: 5,               // 每月可读文章数
  highlights_per_article: 10,         // 每篇文章可高亮数
  searches_per_day: 20,               // 每日搜索次数
  exports_per_month: 0,               // 每月导出次数（免费版不支持）
  api_calls_per_hour: 10              // 每小时API调用次数
}

/**
 * 💎 专业版使用限制配置
 * 
 * 🎯 专业版特权:
 * - 大部分功能无限制使用
 * - 合理的API调用限制
 * - 防止滥用的保护机制
 */
export const PRO_TIER_LIMITS = {
  articles_per_month: Infinity,        // 无限文章访问
  highlights_per_article: Infinity,   // 无限高亮功能
  searches_per_day: Infinity,         // 无限搜索功能
  exports_per_month: Infinity,        // 无限导出功能
  api_calls_per_hour: 1000            // 较高的API调用限制
}

/**
 * ✅ 检查功能是否对指定订阅等级可用
 * 
 * @param featureId - 功能标识符
 * @param tier - 订阅等级
 * @returns boolean - 是否可用
 * 
 * 🎯 检查逻辑:
 * - 查找功能定义
 * - 验证订阅等级权限
 * - 未知功能默认允许访问
 */
export function isFeatureAvailable(featureId: string, tier: SubscriptionTier): boolean {
  const feature = FEATURE_GATES.find(f => f.id === featureId)
  if (!feature) return true // 未知功能默认允许
  
  return feature.tier.includes(tier)
}

/**
 * 📋 获取指定订阅等级的所有可用功能
 * 
 * @param tier - 订阅等级
 * @returns FeatureGate[] - 可用功能列表
 * 
 * 🎯 应用场景:
 * - 功能对比页面展示
 * - 权限初始化检查
 * - 升级页面功能列表
 */
export function getAvailableFeatures(tier: SubscriptionTier): FeatureGate[] {
  return FEATURE_GATES.filter(feature => feature.tier.includes(tier))
}

/**
 * 🗂️ 按功能分类获取功能列表
 * 
 * @param category - 功能分类
 * @returns FeatureGate[] - 该分类下的功能列表
 * 
 * 🎯 功能分类:
 * - content: 内容访问
 * - dictionary: 词典功能
 * - audio: 音频功能
 * - analysis: 分析功能
 * - export: 导出功能
 * - support: 客户支持
 */
export function getFeaturesByCategory(category: FeatureGate['category']): FeatureGate[] {
  return FEATURE_GATES.filter(feature => feature.category === category)
}

/**
 * 📊 获取功能的使用限制
 * 
 * @param featureId - 功能标识符
 * @param tier - 订阅等级
 * @returns number | null - 使用限制（null表示无限制）
 * 
 * 🎯 限制类型:
 * - articles: 文章访问数量
 * - highlights: 高亮功能使用
 * - searches: 搜索功能使用
 * - exports: 导出功能使用
 * - api_calls: API调用频率
 */
export function getUsageLimit(featureId: string, tier: SubscriptionTier): number | null {
  const limits = tier === 'free' ? FREE_TIER_LIMITS : PRO_TIER_LIMITS
  
  switch (featureId) {
    case 'articles':
      return limits.articles_per_month === Infinity ? null : limits.articles_per_month
    case 'highlights':
      return limits.highlights_per_article === Infinity ? null : limits.highlights_per_article
    case 'searches':
      return limits.searches_per_day === Infinity ? null : limits.searches_per_day
    case 'exports':
      return limits.exports_per_month === Infinity ? null : limits.exports_per_month
    case 'api_calls':
      return limits.api_calls_per_hour === Infinity ? null : limits.api_calls_per_hour
    default:
      return null // 未知功能无限制
  }
}

/**
 * ⚡ 检查使用量是否在限制范围内
 * 
 * @param featureId - 功能标识符
 * @param tier - 订阅等级
 * @param currentUsage - 当前使用量
 * @returns boolean - 是否在限制内
 * 
 * 🎯 使用场景:
 * - 功能使用前的权限检查
 * - 实时使用量监控
 * - 升级提示触发条件
 */
export function isWithinUsageLimit(
  featureId: string, 
  tier: SubscriptionTier, 
  currentUsage: number
): boolean {
  const limit = getUsageLimit(featureId, tier)
  return limit === null || currentUsage < limit
}

/**
 * 📈 获取功能的剩余使用量
 * 
 * @param featureId - 功能标识符
 * @param tier - 订阅等级
 * @param currentUsage - 当前使用量
 * @returns number | null - 剩余使用量（null表示无限制）
 * 
 * 🎯 计算逻辑:
 * - 限制总量 - 已使用量 = 剩余量
 * - 确保不返回负数
 * - 无限制功能返回null
 */
export function getRemainingUsage(
  featureId: string,
  tier: SubscriptionTier,
  currentUsage: number
): number | null {
  const limit = getUsageLimit(featureId, tier)
  if (limit === null) return null // 无限制
  return Math.max(0, limit - currentUsage)
}

/**
 * 🎛️ 创建功能门控中间件
 * 
 * @param featureId - 功能标识符
 * @returns 功能门控对象
 * 
 * 🎯 中间件功能:
 * - 权限检查封装
 * - 升级提示生成
 * - 功能详情获取
 */
export function createFeatureGate(featureId: string) {
  return {
    /**
     * ✅ 检查功能是否可访问
     */
    canAccess(tier: SubscriptionTier): boolean {
      return isFeatureAvailable(featureId, tier)
    },

    /**
     * 📋 获取功能详情
     */
    getDetails(): FeatureGate | undefined {
      return FEATURE_GATES.find(f => f.id === featureId)
    },

    /**
     * 🎯 获取升级提示信息
     */
    getUpgradeMessage(): {
      title: string
      description: string
      features: string[]
    } {
      const feature = this.getDetails()
      const category = feature?.category || 'general'
      
      const messages = {
        content: {
          title: 'Unlock Premium Content',
          description: 'Get unlimited access to our full library of English learning materials.',
          features: ['Unlimited articles', 'Premium content', 'Offline downloads']
        },
        dictionary: {
          title: 'Advanced Dictionary Features',
          description: 'Access contextual definitions, pronunciations, and etymology.',
          features: ['Context-aware definitions', 'Audio pronunciations', 'Word etymology']
        },
        audio: {
          title: 'Enhanced Audio Features',
          description: 'Take control of your audio learning experience.',
          features: ['Sentence-level sync', 'Speed control', 'Audio visualizer']
        },
        analysis: {
          title: 'Advanced Learning Analytics',
          description: 'Get detailed insights into your learning progress.',
          features: ['Cross-article search', 'Learning patterns', 'Smart suggestions']
        },
        export: {
          title: 'Export & Sharing',
          description: 'Export your learning materials in multiple formats.',
          features: ['PDF export', 'EPUB format', 'Bulk operations']
        },
        support: {
          title: 'Priority Support',
          description: 'Get help when you need it with premium support options.',
          features: ['Priority response', 'Live chat', 'Phone support']
        }
      }
      
      return messages[category] || {
        title: 'Upgrade to Pro',
        description: 'Unlock this feature and many more with a Pro subscription.',
        features: ['Advanced features', 'Unlimited usage', 'Priority support']
      }
    }
  }
}

/**
 * 🔍 批量检查多个功能权限
 * 
 * @param featureIds - 功能标识符数组
 * @param tier - 订阅等级
 * @returns Record<string, boolean> - 功能权限映射
 * 
 * 🎯 应用场景:
 * - 页面初始化权限检查
 * - 批量功能状态更新
 * - 权限缓存机制
 */
export function checkMultipleFeatures(
  featureIds: string[],
  tier: SubscriptionTier
): Record<string, boolean> {
  const results: Record<string, boolean> = {}
  
  featureIds.forEach(featureId => {
    results[featureId] = isFeatureAvailable(featureId, tier)
  })
  
  return results
}

/**
 * 📊 获取免费版与专业版功能对比
 * 
 * @returns 功能对比数组
 * 
 * 🎯 对比信息:
 * - 功能详情
 * - 免费版可用性
 * - 专业版可用性
 * - 升级价值展示
 */
export function getFeatureComparison(): {
  feature: FeatureGate
  free: boolean
  pro: boolean
}[] {
  return FEATURE_GATES.map(feature => ({
    feature,
    free: feature.tier.includes('free'),
    pro: feature.tier.includes('pro')
  }))
}

/**
 * 📈 使用量追踪工具
 * 
 * 🎯 追踪功能:
 * - 功能使用统计
 * - 使用模式分析
 * - 限制接近警告
 * - 使用量可视化数据
 */
export const UsageTracker = {
  /**
   * 📊 记录功能使用
   * 
   * @param featureId - 功能标识符
   * @param userId - 用户ID
   * @param amount - 使用量（默认1）
   * 
   * 🎯 记录信息:
   * - 功能使用次数
   * - 使用时间戳
   * - 用户行为模式
   */
  track(featureId: string, userId: string, amount: number = 1): void {
    // 在真实应用中，这里会发送数据到分析服务
    console.log(`Usage tracked: ${featureId} for user ${userId}, amount: ${amount}`)
  },

  /**
   * 📊 获取使用统计（Mock实现）
   * 
   * @param featureId - 功能标识符
   * @param userId - 用户ID
   * @returns 使用统计数据
   * 
   * 🎯 统计维度:
   * - 日使用量
   * - 周使用量
   * - 月使用量
   */
  getUsage(featureId: string, userId: string): {
    daily: number
    weekly: number
    monthly: number
  } {
    // Mock使用数据 - 真实应用中从数据库获取
    return {
      daily: Math.floor(Math.random() * 10),
      weekly: Math.floor(Math.random() * 50),
      monthly: Math.floor(Math.random() * 200)
    }
  },

  /**
   * ⚠️ 检查是否接近使用限制
   * 
   * @param featureId - 功能标识符
   * @param tier - 订阅等级
   * @param currentUsage - 当前使用量
   * @param threshold - 警告阈值（默认80%）
   * @returns boolean - 是否接近限制
   * 
   * 🎯 警告策略:
   * - 80%使用量时显示温和提示
   * - 95%使用量时显示紧急警告
   * - 100%使用量时阻止继续使用
   */
  isApproachingLimit(
    featureId: string,
    tier: SubscriptionTier,
    currentUsage: number,
    threshold: number = 0.8
  ): boolean {
    const limit = getUsageLimit(featureId, tier)
    if (limit === null) return false // 无限制
    
    return (currentUsage / limit) >= threshold
  },

  /**
   * 📊 获取使用量百分比
   * 
   * @param featureId - 功能标识符
   * @param tier - 订阅等级
   * @param currentUsage - 当前使用量
   * @returns number - 使用量百分比（0-100）
   */
  getUsagePercentage(
    featureId: string,
    tier: SubscriptionTier,
    currentUsage: number
  ): number {
    const limit = getUsageLimit(featureId, tier)
    if (limit === null) return 0 // 无限制
    
    return Math.min((currentUsage / limit) * 100, 100)
  }
}

/**
 * 🎛️ Vue组件辅助工具
 * 
 * 🎯 组件集成:
 * - 响应式功能门控
 * - 组件状态管理
 * - 功能分类展示
 */
export const FeatureGateHelpers = {
  /**
   * 🔄 创建响应式功能门控
   * 
   * @param featureId - 功能标识符
   * @param tier - 订阅等级
   * @returns 响应式功能门控对象
   */
  createReactiveGate(featureId: string, tier: SubscriptionTier) {
    return {
      id: featureId,
      available: isFeatureAvailable(featureId, tier),
      details: FEATURE_GATES.find(f => f.id === featureId),
      upgradeMessage: createFeatureGate(featureId).getUpgradeMessage()
    }
  },

  /**
   * 📋 获取订阅等级的所有功能门控
   * 
   * @param tier - 订阅等级
   * @returns 功能门控数组
   */
  getAllGatesForTier(tier: SubscriptionTier) {
    return FEATURE_GATES.map(feature => ({
      ...feature,
      available: feature.tier.includes(tier)
    }))
  },

  /**
   * 🗂️ 按分类分组功能
   * 
   * @param tier - 订阅等级
   * @returns 按分类分组的功能对象
   */
  groupByCategory(tier: SubscriptionTier) {
    const categories: Record<string, any[]> = {}
    
    FEATURE_GATES.forEach(feature => {
      if (!categories[feature.category]) {
        categories[feature.category] = []
      }
      
      categories[feature.category].push({
        ...feature,
        available: feature.tier.includes(tier)
      })
    })
    
    return categories
  }
}

/**
 * 🔗 常用功能ID常量导出
 * 
 * 🎯 使用优势:
 * - 类型安全的功能引用
 * - IDE自动完成支持
 * - 重构时的统一更新
 * - 减少拼写错误
 */
export const FEATURE_IDS = {
  // 📚 内容相关
  UNLIMITED_ARTICLES: 'unlimited_articles',
  PREMIUM_CONTENT: 'premium_content',
  OFFLINE_DOWNLOAD: 'offline_download',
  
  // 📖 词典相关
  ADVANCED_GLOSSARY: 'advanced_glossary',
  CONTEXTUAL_DEFINITIONS: 'contextual_definitions',
  AUDIO_DEFINITIONS: 'audio_definitions',
  WORD_ETYMOLOGY: 'word_etymology',
  
  // 🎵 音频相关
  SENTENCE_AUDIO_SYNC: 'sentence_audio_sync',
  SPEED_CONTROL: 'speed_control',
  AUDIO_VISUALIZER: 'audio_visualizer',
  CUSTOM_AUDIO: 'custom_audio',
  
  // 📊 分析相关
  CROSS_ARTICLE_SEARCH: 'cross_article_search',
  ADVANCED_ANALYTICS: 'advanced_analytics',
  WORD_FREQUENCY_ANALYTICS: 'word_frequency_analytics',
  LEARNING_PATTERNS: 'learning_patterns',
  SMART_SUGGESTIONS: 'smart_suggestions',
  
  // 📤 导出相关
  EXPORT_PDF: 'export_pdf',
  EXPORT_EPUB: 'export_epub',
  EXPORT_ANNOTATIONS: 'export_annotations',
  BULK_EXPORT: 'bulk_export',
  
  // 🎧 支持相关
  PRIORITY_SUPPORT: 'priority_support',
  LIVE_CHAT: 'live_chat',
  PHONE_SUPPORT: 'phone_support'
} as const

/**
 * 🏷️ 功能ID类型定义
 * 
 * 基于FEATURE_IDS常量生成的类型，确保类型安全
 */
export type FeatureId = typeof FEATURE_IDS[keyof typeof FEATURE_IDS]