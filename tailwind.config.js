/**
 * 🎯 功能概述：
 * - 集中管理API配置，包括端点、超时、缓存等
 * - 提供开发/生产环境的配置切换
 * - 定义API端点、错误码、订阅计划等常量
 * - 提供配置相关的辅助函数
 * 
 * 📋 主要功能：
 * 1. API端点定义和管理
 * 2. 请求配置（超时、重试、缓存）
 * 3. 错误码标准化
 * 4. 订阅计划配置
 * 5. 功能开关管理
 * 6. 环境配置切换
 * 
 * 🔗 依赖关系：
 * - 被所有API服务引用
 * - 被认证和订阅store使用
 * - 提供全局配置常量
 * 
 * 🛡️ 安全考虑：
 * - 环境变量隔离敏感信息
 * - Mock模式防止开发环境访问生产API
 * - 错误码标准化便于错误处理
 * 
 * ⚙️ 配置选项：
 * - USE_MOCK: 切换真实/模拟API
 * - BASE_URL: 配置API基础URL
 * - FEATURES: 功能开关控制
 */

/* ========== API配置对象 ========== */
export const API_CONFIG = {
  /* 
   * 开发/生产API切换
   * true: 使用mockApi服务
   * false: 使用真实API服务
   */
  USE_MOCK: process.env.NODE_ENV === 'development' || true, // 强制使用mock便于演示
  
  /* 
   * API基础URL配置
   * 根据环境变量自动切换
   */
  BASE_URL: process.env.NODE_ENV === 'production' 
    ? 'https://api.englishlearning.com'    /* 生产环境API */
    : 'http://localhost:3000',              /* 开发环境API */
  
  /* 
   * API端点定义
   * 所有API路径的集中管理
   */
  ENDPOINTS: {
    /* 认证相关端点 */
    LOGIN: '/api/auth/login',                    /* 用户登录 */
    REGISTER: '/api/auth/register',              /* 用户注册 */
    REFRESH: '/api/auth/refresh',                /* 刷新令牌 */
    LOGOUT: '/api/auth/logout',                  /* 用户登出 */
    PROFILE: '/api/auth/profile',                /* 用户资料 */
    
    /* 订阅管理端点 */
    SUBSCRIPTION_STATUS: '/api/subscription/status',        /* 订阅状态查询 */
    SUBSCRIPTION_UPGRADE: '/api/subscription/upgrade',      /* 升级订阅 */
    SUBSCRIPTION_CANCEL: '/api/subscription/cancel',        /* 取消订阅 */
    BILLING_PORTAL: '/api/subscription/billing-portal',     /* 账单门户 */
    
    /* 用户进度端点 */
    PROGRESS: '/api/progress',                   /* 学习进度 */
    ANALYTICS: '/api/analytics',                 /* 学习分析 */
    ACHIEVEMENTS: '/api/achievements',           /* 成就系统 */
    
    /* 内容相关端点 */
    ARTICLES: '/api/articles',                   /* 文章列表 */
    WORD_FREQUENCY: '/api/word-frequency',       /* 词频分析 */
    GLOSSARY: '/api/glossary',                   /* 词汇表 */
    AUDIO_SYNC: '/api/audio-sync',               /* 音频同步 */
    
    /* 搜索功能端点 */
    SEARCH_ARTICLES: '/api/search/articles',     /* 文章搜索 */
    SEARCH_WORDS: '/api/search/words',           /* 单词搜索 */
    SEARCH_GLOBAL: '/api/search/global',         /* 全局搜索 */
  },
  
  /* 
   * 请求配置
   * 控制HTTP请求的行为
   */
  TIMEOUT: 10000,        /* 请求超时时间：10秒 */
  RETRY_ATTEMPTS: 3,     /* 重试次数：3次 */
  RETRY_DELAY: 1000,     /* 重试延迟：1秒 */
  
  /* 
   * 缓存配置
   * 不同数据类型的缓存时效（毫秒）
   */
  CACHE_TTL: {
    USER_PROFILE: 300000,      /* 用户资料：5分钟 */
    SUBSCRIPTION: 600000,      /* 订阅状态：10分钟 */
    ARTICLES: 1800000,         /* 文章列表：30分钟 */
    WORD_FREQUENCY: 3600000,   /* 词频数据：1小时 */
  },
  
  /* 
   * 速率限制配置
   * 防止API滥用
   */
  RATE_LIMIT: {
    REQUESTS_PER_MINUTE: 100,   /* 每分钟请求限制 */
    REQUESTS_PER_HOUR: 1000,    /* 每小时请求限制 */
  },
  
  /* 
   * 功能开关
   * 控制特定功能的启用/禁用
   */
  FEATURES: {
    OFFLINE_MODE: true,              /* 离线模式支持 */
    ANALYTICS: true,                 /* 分析功能 */
    REAL_TIME_SYNC: false,          /* 实时同步（未实现） */
    BETA_FEATURES: process.env.NODE_ENV === 'development',  /* Beta功能 */
  },
  
  /* 
   * 错误码定义
   * 标准化错误处理
   */
  ERROR_CODES: {
    /* HTTP标准错误码 */
    UNAUTHORIZED: 401,               /* 未授权 */
    FORBIDDEN: 403,                  /* 禁止访问 */
    NOT_FOUND: 404,                  /* 资源不存在 */
    RATE_LIMITED: 429,               /* 请求过于频繁 */
    SERVER_ERROR: 500,               /* 服务器错误 */
    
    /* 自定义错误码 */
    NETWORK_ERROR: 'NETWORK_ERROR',                      /* 网络错误 */
    TIMEOUT: 'TIMEOUT',                                  /* 请求超时 */
    SUBSCRIPTION_REQUIRED: 'SUBSCRIPTION_REQUIRED',      /* 需要订阅 */
    FEATURE_NOT_AVAILABLE: 'FEATURE_NOT_AVAILABLE',      /* 功能不可用 */
  },
  
  /* 
   * 订阅计划配置
   * 定义所有可用的订阅方案
   */
  SUBSCRIPTION_PLANS: {
    /* 免费计划 */
    FREE: {
      id: 'free',
      name: 'Free Plan',
      price: 0,
      interval: null,
      features: [
        '5 articles per month',           /* 每月5篇文章 */
        'Basic word definitions',         /* 基础单词释义 */
        'Paragraph-level audio sync',     /* 段落级音频同步 */
        'Intelligent word search',        /* 智能单词搜索 */
        'Basic progress tracking'         /* 基础进度跟踪 */
      ]
    },
    
    /* Pro月度计划 */
    PRO_MONTHLY: {
      id: 'pro_monthly',
      name: 'Pro Monthly',
      price: 9.99,
      interval: 'month',
      stripePriceId: 'price_pro_monthly',   /* Stripe价格ID */
      features: [
        'Unlimited articles',              /* 无限文章 */
        'Advanced contextual definitions', /* 高级上下文释义 */
        'Sentence-level audio sync',       /* 句子级音频同步 */
        'Advanced word analysis',          /* 高级词汇分析 */
        'Cross-article search',            /* 跨文章搜索 */
        'Export capabilities',             /* 导出功能 */
        'Detailed analytics',              /* 详细分析 */
        'Priority support'                 /* 优先支持 */
      ]
    },
    
    /* Pro年度计划 */
    PRO_YEARLY: {
      id: 'pro_yearly',
      name: 'Pro Yearly',
      price: 99.99,
      interval: 'year',
      stripePriceId: 'price_pro_yearly',    /* Stripe价格ID */
      features: [
        'All Pro Monthly features',         /* 所有月度功能 */
        '2 months free',                    /* 优惠2个月 */
        'Advanced learning insights',       /* 高级学习洞察 */
        'Custom study plans',               /* 定制学习计划 */
        'API access'                        /* API访问权限 */
      ]
    }
  }
}

/* ========== 辅助函数 ========== */

/**
 * 获取完整API URL
 * @param endpoint - API端点路径
 * @returns 完整的API URL
 * 
 * 💡 使用示例：
 * getApiUrl('/api/auth/login') => 'http://localhost:3000/api/auth/login'
 */
export const getApiUrl = (endpoint: string): string => {
  /* Mock模式下直接返回端点（mockApi会拦截） */
  if (API_CONFIG.USE_MOCK) {
    return endpoint
  }
  /* 真实API模式下拼接基础URL */
  return `${API_CONFIG.BASE_URL}${endpoint}`
}

/**
 * 检查功能是否启用
 * @param feature - 功能名称
 * @returns 功能是否启用
 * 
 * 💡 使用示例：
 * isFeatureEnabled('OFFLINE_MODE') => true
 */
export const isFeatureEnabled = (feature: keyof typeof API_CONFIG.FEATURES): boolean => {
  return API_CONFIG.FEATURES[feature]
}

/**
 * 根据ID获取订阅计划
 * @param planId - 计划ID
 * @returns 订阅计划对象或undefined
 * 
 * 💡 使用示例：
 * getSubscriptionPlan('pro_monthly') => { id: 'pro_monthly', ... }
 */
export const getSubscriptionPlan = (planId: string) => {
  return Object.values(API_CONFIG.SUBSCRIPTION_PLANS).find(plan => plan.id === planId)
}

/* ========== 环境配置 ========== */

/**
 * 环境特定配置
 * 根据不同环境设置不同的行为
 */
export const ENV_CONFIG = {
  /* 开发环境配置 */
  development: {
    DEBUG: true,                /* 启用调试模式 */
    LOG_LEVEL: 'debug',        /* 日志级别：调试 */
    ENABLE_DEVTOOLS: true,     /* 启用开发工具 */
  },
  
  /* 生产环境配置 */
  production: {
    DEBUG: false,              /* 禁用调试模式 */
    LOG_LEVEL: 'error',       /* 日志级别：错误 */
    ENABLE_DEVTOOLS: false,   /* 禁用开发工具 */
  },
  
  /* 测试环境配置 */
  test: {
    DEBUG: false,              /* 禁用调试模式 */
    LOG_LEVEL: 'silent',      /* 日志级别：静默 */
    ENABLE_DEVTOOLS: false,   /* 禁用开发工具 */
  }
}

/**
 * 获取当前环境配置
 * @returns 当前环境的配置对象
 * 
 * 💡 使用示例：
 * getCurrentEnvConfig().DEBUG => true (in development)
 */
export const getCurrentEnvConfig = () => {
  const env = process.env.NODE_ENV || 'development'
  return ENV_CONFIG[env as keyof typeof ENV_CONFIG] || ENV_CONFIG.development
}