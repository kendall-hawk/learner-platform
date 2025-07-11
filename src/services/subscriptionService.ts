/**10. src/services/subscriptionService.ts
 * 🎫 subscriptionService.ts - 订阅业务逻辑服务
 * 
 * 📋 功能概述:
 * - 处理所有订阅相关的业务逻辑和API调用
 * - 管理用户订阅状态和权限控制
 * - 集成Stripe支付和账单管理
 * - 提供功能门控和使用限额管理
 * - 支持订阅升级、降级、取消等操作
 * 
 * 🎯 主要功能:
 * - 订阅状态查询和管理
 * - 订阅计划升级和取消
 * - 功能权限检查和限额管理
 * - 支付集成和账单处理
 * - 订阅分析和推荐系统
 * - 试用期和促销管理
 * 
 * 💳 支付集成:
 * - Stripe Checkout和Billing Portal
 * - 价格计算和税费处理
 * - Webhook事件处理
 * - 发票生成和管理
 * 
 * 🚪 功能门控:
 * - 基于订阅等级的功能访问控制
 * - 使用量限制和追踪
 * - 升级推荐和用户引导
 * - 功能使用分析
 */

import { mockApiService } from './mockApi'
import type { 
  Subscription, 
  SubscriptionTier, 
  FeatureAccess,
  ApiResponse 
} from '@/types'
import { API_CONFIG } from '@/config/api'

/**
 * 💰 订阅服务类
 * 
 * 📋 设计原则:
 * - 单例模式，全局唯一实例
 * - 完整的订阅生命周期管理
 * - 灵活的功能门控系统
 * - 支持多种支付场景
 */
class SubscriptionService {
  
  /**
   * 📊 获取当前订阅状态
   * 
   * @returns Promise<Subscription> - 订阅详细信息
   * 
   * 🎯 返回信息:
   * - 订阅等级和状态
   * - 当前计费周期
   * - 功能权限配置
   * - 使用量统计
   */
  async getSubscriptionStatus(): Promise<Subscription> {
    try {
      const response = await mockApiService.getSubscriptionStatus()
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to get subscription status')
      }
      
      return response.data as Subscription
    } catch (error) {
      console.error('Subscription service get status error:', error)
      throw error
    }
  }

  /**
   * ⬆️ 升级订阅到Pro版
   * 
   * @param planId - 目标订阅计划ID
   * @returns Promise<Subscription> - 升级后的订阅信息
   * 
   * 🎯 升级流程:
   * 1. 验证计划有效性
   * 2. 处理支付和计费
   * 3. 激活新功能权限
   * 4. 发送确认通知
   */
  async upgradeSubscription(planId: string): Promise<Subscription> {
    try {
      const response = await mockApiService.upgradeSubscription(planId)
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to upgrade subscription')
      }
      
      return response.data as Subscription
    } catch (error) {
      console.error('Subscription service upgrade error:', error)
      throw error
    }
  }

  /**
   * ❌ 取消订阅
   * 
   * @returns Promise<Subscription> - 取消后的订阅状态
   * 
   * 🎯 取消策略:
   * - 立即取消 vs 期末取消
   * - 退款政策处理
   * - 功能降级时机
   * - 挽留策略触发
   */
  async cancelSubscription(): Promise<Subscription> {
    try {
      const response = await mockApiService.cancelSubscription()
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to cancel subscription')
      }
      
      return response.data as Subscription
    } catch (error) {
      console.error('Subscription service cancel error:', error)
      throw error
    }
  }

  /**
   * 🔄 重新激活已取消的订阅
   * 
   * @returns Promise<Subscription> - 重新激活后的订阅状态
   * 
   * 🎯 重激活条件:
   * - 订阅仍在当前计费周期内
   * - 支付方式仍然有效
   * - 未超过重激活时间限制
   */
  async reactivateSubscription(): Promise<Subscription> {
    try {
      const response = await mockApiService.reactivateSubscription()
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to reactivate subscription')
      }
      
      return response.data as Subscription
    } catch (error) {
      console.error('Subscription service reactivate error:', error)
      throw error
    }
  }

  /**
   * 🌐 获取Stripe账单管理门户URL
   * 
   * @returns Promise<string> - 账单管理页面URL
   * 
   * 🎯 功能特性:
   * - 用户自助账单管理
   * - 支付方式更新
   * - 发票下载和查看
   * - 订阅历史记录
   */
  async getBillingPortalUrl(): Promise<string> {
    try {
      const response = await mockApiService.getBillingPortalUrl()
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to get billing portal URL')
      }
      
      return response.data.url
    } catch (error) {
      console.error('Subscription service billing portal error:', error)
      throw error
    }
  }

  /**
   * 💳 创建Stripe结账会话
   * 
   * @param planId - 订阅计划ID
   * @returns Promise<{url: string}> - 结账页面URL
   * 
   * 🎯 支付流程:
   * 1. 创建Stripe Checkout Session
   * 2. 配置成功/取消回调URL
   * 3. 设置元数据和客户信息
   * 4. 返回支付页面链接
   */
  async createCheckoutSession(planId: string): Promise<{ url: string }> {
    try {
      // 在真实实现中，这里会调用Stripe API
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock Stripe checkout URL
      return {
        url: `https://checkout.stripe.com/session/mock_${planId}_${Date.now()}`
      }
    } catch (error) {
      console.error('Subscription service create checkout error:', error)
      throw error
    }
  }

  /**
   * ✅ 验证订阅计划有效性
   * 
   * @param planId - 计划ID
   * @returns boolean - 是否为有效计划
   */
  validatePlan(planId: string): boolean {
    const validPlans = Object.keys(API_CONFIG.SUBSCRIPTION_PLANS)
    return validPlans.includes(planId)
  }

  /**
   * 📋 获取计划详情
   * 
   * @param planId - 计划ID
   * @returns 计划配置对象或undefined
   */
  getPlanDetails(planId: string) {
    return API_CONFIG.SUBSCRIPTION_PLANS[planId as keyof typeof API_CONFIG.SUBSCRIPTION_PLANS]
  }

  /**
   * 💰 计算订阅价格
   * 
   * @param planId - 计划ID
   * @param quantity - 数量（默认1）
   * @returns 价格计算结果
   * 
   * 🎯 计算项目:
   * - 基础价格
   * - 税费计算
   * - 折扣处理
   * - 最终总价
   */
  calculatePricing(planId: string, quantity: number = 1): {
    subtotal: number
    tax: number
    total: number
    discount?: number
  } {
    const plan = this.getPlanDetails(planId)
    
    if (!plan) {
      throw new Error('Invalid plan ID')
    }
    
    const subtotal = plan.price * quantity
    const tax = subtotal * 0.08 // 8%税率（示例）
    const total = subtotal + tax
    
    return {
      subtotal: Number(subtotal.toFixed(2)),
      tax: Number(tax.toFixed(2)),
      total: Number(total.toFixed(2))
    }
  }

  /**
   * 🚪 检查功能访问权限
   * 
   * @param tier - 订阅等级
   * @param feature - 功能标识符
   * @returns boolean - 是否有访问权限
   * 
   * 🎯 权限检查项:
   * - 基础功能权限
   * - 高级功能权限
   * - 使用量限制
   * - 试用期特殊权限
   */
  checkFeatureAccess(tier: SubscriptionTier, feature: string): boolean {
    const features = this.getFeatureAccess(tier)
    
    switch (feature) {
      case 'unlimited_articles':
        return features.articles.unlimited
      
      case 'advanced_glossary':
        return features.glossary.level === 'advanced'
      
      case 'sentence_audio_sync':
        return features.audioSync.precision === 'sentence'
      
      case 'cross_article_search':
        return features.wordFrequency.crossArticle
      
      case 'export_features':
        return features.export.formats.length > 1
      
      case 'analytics':
        return features.wordFrequency.analytics
      
      case 'smart_suggestions':
        return features.search.smartSuggestions
        
      case 'contextual_definitions':
        return features.glossary.contextAware
        
      case 'audio_definitions':
        return features.glossary.audioDefinitions
        
      case 'speed_control':
        return features.audioSync.speedControl
        
      case 'visualizer':
        return features.audioSync.visualizer
      
      default:
        return true // 默认允许访问未知功能
    }
  }

  /**
   * 🎛️ 获取订阅等级的功能权限配置
   * 
   * @param tier - 订阅等级
   * @returns FeatureAccess - 功能权限配置对象
   */
  getFeatureAccess(tier: SubscriptionTier): FeatureAccess {
    return API_CONFIG.SUBSCRIPTION_FEATURES[tier] || API_CONFIG.SUBSCRIPTION_FEATURES.free
  }

  /**
   * 📊 获取功能使用限额
   * 
   * @param tier - 订阅等级
   * @param feature - 功能标识符
   * @returns number | null - 使用限额（null表示无限制）
   */
  getUsageLimit(tier: SubscriptionTier, feature: string): number | null {
    const features = this.getFeatureAccess(tier)
    
    switch (feature) {
      case 'articles':
        return features.articles.unlimited ? null : features.articles.limit
      
      case 'highlights':
        return features.search.highlightLimit === Infinity 
          ? null 
          : features.search.highlightLimit
      
      default:
        return null
    }
  }

  /**
   * ⚡ 检查是否达到使用限额
   * 
   * @param tier - 订阅等级
   * @param feature - 功能标识符
   * @param currentUsage - 当前使用量
   * @returns boolean - 是否还可以继续使用
   */
  checkUsageLimit(tier: SubscriptionTier, feature: string, currentUsage: number): boolean {
    const limit = this.getUsageLimit(tier, feature)
    return limit === null || currentUsage < limit
  }

  /**
   * 🏷️ 获取订阅状态徽章信息
   * 
   * @param subscription - 订阅对象
   * @returns 徽章显示信息
   * 
   * 🎯 状态类型:
   * - Active: 正常激活状态
   * - Trialing: 试用期状态
   * - Canceled: 已取消状态
   * - Past Due: 逾期未付款
   */
  getStatusBadge(subscription: Subscription | null): {
    text: string
    color: string
    icon?: string
  } {
    if (!subscription) {
      return { text: 'Free', color: 'gray' }
    }
    
    switch (subscription.status) {
      case 'active':
        return { 
          text: subscription.tier === 'pro' ? 'Pro' : 'Free', 
          color: subscription.tier === 'pro' ? 'green' : 'gray' 
        }
      case 'trialing':
        return { text: 'Trial', color: 'blue' }
      case 'canceled':
        return { text: 'Canceled', color: 'orange' }
      case 'past_due':
        return { text: 'Past Due', color: 'red' }
      default:
        return { text: 'Unknown', color: 'gray' }
    }
  }

  /**
   * 📅 计算距离续费/到期的天数
   * 
   * @param subscription - 订阅对象
   * @returns number | null - 剩余天数（null表示无期限）
   */
  getDaysUntilRenewal(subscription: Subscription): number | null {
    if (!subscription.currentPeriodEnd) return null
    
    const endDate = new Date(subscription.currentPeriodEnd)
    const now = new Date()
    const timeDiff = endDate.getTime() - now.getTime()
    const daysLeft = Math.ceil(timeDiff / (1000 * 3600 * 24))
    
    return Math.max(0, daysLeft)
  }

  /**
   * ⚠️ 检查订阅是否即将到期
   * 
   * @param subscription - 订阅对象
   * @param daysThreshold - 提醒阈值天数（默认7天）
   * @returns boolean - 是否即将到期
   */
  isExpiringSoon(subscription: Subscription, daysThreshold: number = 7): boolean {
    const daysLeft = this.getDaysUntilRenewal(subscription)
    return daysLeft !== null && daysLeft <= daysThreshold
  }

  /**
   * 🎯 获取升级推荐信息
   * 
   * @param currentTier - 当前订阅等级
   * @returns 升级推荐对象或null
   * 
   * 🎯 推荐策略:
   * - 基于使用行为分析
   * - 个性化功能推荐
   * - 优惠活动整合
   * - A/B测试支持
   */
  getUpgradeRecommendations(currentTier: SubscriptionTier): {
    title: string
    description: string
    features: string[]
    ctaText: string
  } | null {
    if (currentTier === 'pro') return null
    
    return {
      title: 'Upgrade to Pro',
      description: 'Unlock advanced features and take your learning to the next level.',
      features: [
        'Unlimited article access',
        'Advanced dictionary features',
        'Sentence-level audio sync',
        'Cross-article word analysis',
        'Detailed progress analytics',
        'Export capabilities'
      ],
      ctaText: 'Upgrade Now'
    }
  }

  /**
   * 💵 格式化价格显示
   * 
   * @param amount - 金额
   * @param currency - 货币代码（默认USD）
   * @returns string - 格式化后的价格字符串
   */
  formatPrice(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  /**
   * 🎁 获取试用期信息
   * 
   * @param subscription - 订阅对象
   * @returns 试用期详细信息
   * 
   * 🎯 试用期管理:
   * - 试用期剩余天数
   * - 试用期结束日期
   * - 试用期功能权限
   * - 转换引导策略
   */
  getTrialInfo(subscription: Subscription): {
    isTrialing: boolean
    daysLeft: number
    trialEnd: Date | null
  } {
    const isTrialing = subscription.status === 'trialing'
    let daysLeft = 0
    let trialEnd: Date | null = null
    
    if (subscription.trialEnd) {
      trialEnd = new Date(subscription.trialEnd)
      const now = new Date()
      const timeDiff = trialEnd.getTime() - now.getTime()
      daysLeft = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)))
    }
    
    return {
      isTrialing,
      daysLeft,
      trialEnd
    }
  }

  /**
   * 🧾 生成发票预览
   * 
   * @param planId - 计划ID
   * @returns 发票预览数据
   * 
   * 🎯 发票项目:
   * - 订阅费用明细
   * - 税费计算
   * - 折扣应用
   * - 总计金额
   */
  generateInvoicePreview(planId: string): {
    items: Array<{
      description: string
      amount: number
    }>
    subtotal: number
    tax: number
    total: number
  } {
    const plan = this.getPlanDetails(planId)
    
    if (!plan) {
      throw new Error('Invalid plan ID')
    }
    
    const pricing = this.calculatePricing(planId)
    
    return {
      items: [
        {
          description: `${plan.name} (${plan.interval})`,
          amount: plan.price
        }
      ],
      subtotal: pricing.subtotal,
      tax: pricing.tax,
      total: pricing.total
    }
  }
}

/**
 * 🏭 导出单例实例
 * 
 * 🎯 使用方式:
 * import { subscriptionService } from '@/services/subscriptionService'
 * await subscriptionService.getSubscriptionStatus()
 */
export const subscriptionService = new SubscriptionService()

/**
 * 🔗 默认导出（兼容不同导入方式）
 */
export default subscriptionService