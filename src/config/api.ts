/**
 * ⚙️ 第10个文件：src/config/api.ts
 * 
 * 📁 文件位置: src/config/api.ts
 * 🎯 核心功能: API配置中心，统一管理接口地址、超时、缓存、功能开关
 * 🔧 关键作用: 提供Mock/真实API切换、错误码定义、订阅计划配置
 * 
 * 📋 配置模块说明：
 * - API切换: Mock模式和生产环境API一键切换
 * - 端点管理: 统一管理所有API接口地址
 * - 请求配置: 超时、重试、缓存等请求参数
 * - 功能开关: 特性标志控制功能启用/禁用
 * - 订阅计划: 免费版和专业版功能定义
 */

// API Configuration
export const API_CONFIG = {
  // Development/Production API Toggle
  // API切换配置 - 开发时使用Mock，生产时使用真实API
  USE_MOCK: process.env.NODE_ENV === 'development' || true, // Force mock for now
  
  // Base URLs
  // 基础URL配置 - 根据环境自动切换
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://api.englishlearning.com' 
    : 'http://localhost:3000',
  
  // API Endpoints
  // API端点定义 - 统一管理所有接口路径
  ENDPOINTS: {
    // Authentication
    // 认证相关接口
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
    PROFILE: '/api/auth/profile',
    
    // Subscription
    // 订阅管理接口
    SUBSCRIPTION_STATUS: '/api/subscription/status',
    SUBSCRIPTION_UPGRADE: '/api/subscription/upgrade',
    SUBSCRIPTION_CANCEL: '/api/subscription/cancel',
    BILLING_PORTAL: '/api/subscription/billing-portal',
    
    // User Progress
    // 用户进度接口
    PROGRESS: '/api/progress',
    ANALYTICS: '/api/analytics',
    ACHIEVEMENTS: '/api/achievements',
    
    // Content
    // 内容相关接口
    ARTICLES: '/api/articles',
    WORD_FREQUENCY: '/api/word-frequency',
    GLOSSARY: '/api/glossary',
    AUDIO_SYNC: '/api/audio-sync',
    
    // Search
    // 搜索功能接口
    SEARCH_ARTICLES: '/api/search/articles',
    SEARCH_WORDS: '/api/search/words',
    SEARCH_GLOBAL: '/api/search/global',
  },
  
  // Request Configuration
  // 请求配置参数
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
  
  // Cache Configuration
  // 缓存配置 - 不同数据的缓存时间
  CACHE_TTL: {
    USER_PROFILE: 300000, // 5 minutes
    SUBSCRIPTION: 600000, // 10 minutes
    ARTICLES: 1800000, // 30 minutes
    WORD_FREQUENCY: 3600000, // 1 hour
  },
  
  // Rate Limiting
  // 速率限制配置
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: 100,
    REQUESTS_PER_HOUR: 1000,
  },
  
  // Feature Flags
  // 功能开关 - 控制不同特性的启用状态
  FEATURES: {
    OFFLINE_MODE: true,
    ANALYTICS: true,
    REAL_TIME_SYNC: false,
    BETA_FEATURES: process.env.NODE_ENV === 'development',
  },
  
  // Error Codes
  // 错误码定义 - 统一错误处理标准
  ERROR_CODES: {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    RATE_LIMITED: 429,
    SERVER_ERROR: 500,
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT: 'TIMEOUT',
    SUBSCRIPTION_REQUIRED: 'SUBSCRIPTION_REQUIRED',
    FEATURE_NOT_AVAILABLE: 'FEATURE_NOT_AVAILABLE',
  },
  
  // Subscription Plans
  // 订阅计划配置 - 定义不同套餐的功能和价格
  SUBSCRIPTION_PLANS: {
    FREE: {
      id: 'free',
      name: 'Free Plan',
      price: 0,
      interval: null,
      features: [
        '5 articles per month',
        'Basic word definitions',
        'Paragraph-level audio sync',
        'Intelligent word search',
        'Basic progress tracking'
      ]
    },
    PRO_MONTHLY: {
      id: 'pro_monthly',
      name: 'Pro Monthly',
      price: 9.99,
      interval: 'month',
      stripePriceId: 'price_pro_monthly',
      features: [
        'Unlimited articles',
        'Advanced contextual definitions',
        'Sentence-level audio sync',
        'Advanced word analysis',
        'Cross-article search',
        'Export capabilities',
        'Detailed analytics',
        'Priority support'
      ]
    },
    PRO_YEARLY: {
      id: 'pro_yearly',
      name: 'Pro Yearly',
      price: 99.99,
      interval: 'year',
      stripePriceId: 'price_pro_yearly',
      features: [
        'All Pro Monthly features',
        '2 months free',
        'Advanced learning insights',
        'Custom study plans',
        'API access'
      ]
    }
  }
}

// Helper function to get full API URL
// 工具函数：获取完整API地址
export const getApiUrl = (endpoint: string): string => {
  if (API_CONFIG.USE_MOCK) {
    return endpoint // Mock service handles URLs differently
  }
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

// Helper function to check if feature is enabled
// 工具函数：检查功能是否启用
export const isFeatureEnabled = (feature: keyof typeof API_CONFIG.FEATURES): boolean => {
  return API_CONFIG.FEATURES[feature]
}

// Helper function to get subscription plan by ID
// 工具函数：根据ID获取订阅计划
export const getSubscriptionPlan = (planId: string) => {
  return Object.values(API_CONFIG.SUBSCRIPTION_PLANS).find(plan => plan.id === planId)
}

// Environment-specific configurations
// 环境特定配置
export const ENV_CONFIG = {
  development: {
    DEBUG: true,
    LOG_LEVEL: 'debug',
    ENABLE_DEVTOOLS: true,
  },
  production: {
    DEBUG: false,
    LOG_LEVEL: 'error',
    ENABLE_DEVTOOLS: false,
  },
  test: {
    DEBUG: false,
    LOG_LEVEL: 'silent',
    ENABLE_DEVTOOLS: false,
  }
}

// Get current environment config
// 获取当前环境配置
export const getCurrentEnvConfig = () => {
  const env = process.env.NODE_ENV || 'development'
  return ENV_CONFIG[env as keyof typeof ENV_CONFIG] || ENV_CONFIG.development
}