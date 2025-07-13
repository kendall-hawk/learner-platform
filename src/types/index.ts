/**
 * 🎯 功能概述：
 * - 应用的中央类型定义文件，提供全局TypeScript类型
 * - 定义所有核心数据模型和接口
 * - 提供类型安全保证和智能提示支持
 * - 统一管理应用中的数据结构
 * 
 * 📋 主要功能：
 * 1. 用户和认证相关类型
 * 2. 订阅和权限系统类型
 * 3. 学习进度跟踪类型
 * 4. 文章和内容管理类型
 * 5. 单词分析和搜索类型
 * 6. 音频同步相关类型
 * 7. API响应和错误处理类型
 * 8. UI组件属性类型
 * 9. 实用工具类型
 * 
 * 🔗 依赖关系：
 * - 被所有TypeScript文件引用
 * - 为组件、store、服务提供类型
 * - 与后端API契约保持一致
 * 
 * 🛡️ 安全考虑：
 * - 严格的类型定义防止运行时错误
 * - 枚举类型限制非法值
 * - 必填/可选字段明确标注
 * 
 * ⚙️ 配置选项：
 * - 可扩展新的类型定义
 * - 支持泛型类型复用
 * - 提供类型工具函数
 */

/* ========== 用户和认证类型 ========== */

/**
 * 用户实体接口
 * 代表系统中的用户账户信息
 */
export interface User {
  id: string                    /* 用户唯一标识符 */
  email: string                 /* 用户邮箱（登录凭证） */
  name: string                  /* 用户显示名称 */
  avatar?: string               /* 用户头像URL（可选） */
  createdAt: string            /* 账户创建时间（ISO 8601） */
  lastLogin: string            /* 最后登录时间（ISO 8601） */
  preferences: UserPreferences  /* 用户偏好设置 */
}

/**
 * 用户偏好设置接口
 * 存储用户的个性化配置
 */
export interface UserPreferences {
  language: string                              /* 界面语言 */
  theme: 'light' | 'dark' | 'auto'            /* 主题模式 */
  notifications: boolean                        /* 是否开启通知 */
  autoPlay: boolean                            /* 是否自动播放音频 */
  highlightLevel: 'basic' | 'advanced'         /* 高亮级别 */
}

/**
 * 登录凭证接口
 * 用户登录时提交的数据
 */
export interface LoginCredentials {
  email: string          /* 登录邮箱 */
  password: string       /* 登录密码 */
  rememberMe?: boolean   /* 是否记住登录状态（可选） */
}

/**
 * 注册凭证接口
 * 继承登录凭证并添加注册特有字段
 */
export interface SignupCredentials extends LoginCredentials {
  name: string              /* 用户名称 */
  confirmPassword: string   /* 确认密码 */
}

/**
 * 认证响应接口
 * 登录/注册成功后的返回数据
 */
export interface AuthResponse {
  user: User              /* 用户信息 */
  token: string           /* 访问令牌 */
  refreshToken: string    /* 刷新令牌 */
  expiresIn: number      /* 令牌过期时间（秒） */
}

/* ========== 订阅类型 ========== */

/**
 * 订阅层级类型
 * 定义可用的订阅等级
 */
export type SubscriptionTier = 'free' | 'pro'

/**
 * 订阅实体接口
 * 用户的订阅状态和信息
 */
export interface Subscription {
  id: string                              /* 订阅ID */
  userId: string                          /* 关联用户ID */
  tier: SubscriptionTier                  /* 订阅层级 */
  status: 'active' | 'canceled' | 'past_due' | 'trialing'  /* 订阅状态 */
  currentPeriodStart: string              /* 当前计费周期开始时间 */
  currentPeriodEnd: string                /* 当前计费周期结束时间 */
  cancelAtPeriodEnd: boolean              /* 是否在周期结束时取消 */
  trialEnd?: string                       /* 试用结束时间（可选） */
  stripeSubscriptionId?: string           /* Stripe订阅ID（可选） */
}

/**
 * 功能访问权限接口
 * 定义不同订阅层级的功能权限
 */
export interface FeatureAccess {
  /* 文章访问权限 */
  articles: {
    limit: number          /* 月度文章限制 */
    unlimited: boolean     /* 是否无限制 */
  }
  
  /* 词汇表功能权限 */
  glossary: {
    level: 'basic' | 'advanced'    /* 词汇表级别 */
    contextAware: boolean           /* 是否支持上下文感知 */
    audioDefinitions: boolean       /* 是否支持音频定义 */
  }
  
  /* 音频同步功能权限 */
  audioSync: {
    precision: 'paragraph' | 'sentence'  /* 同步精度 */
    visualizer: boolean                  /* 是否支持可视化 */
    speedControl: boolean                /* 是否支持速度控制 */
  }
  
  /* 词频分析功能权限 */
  wordFrequency: {
    searchMode: 'intelligent' | 'exact' | 'both'  /* 搜索模式 */
    crossArticle: boolean                         /* 是否支持跨文章分析 */
    analytics: boolean                            /* 是否支持分析报告 */
  }
  
  /* 搜索功能权限 */
  search: {
    highlightLimit: number      /* 高亮数量限制 */
    crossReference: boolean     /* 是否支持交叉引用 */
    smartSuggestions: boolean   /* 是否支持智能建议 */
  }
  
  /* 导出功能权限 */
  export: {
    formats: string[]      /* 支持的导出格式 */
    annotations: boolean   /* 是否支持导出注释 */
  }
}

/* ========== 学习进度类型 ========== */

/**
 * 学习进度接口
 * 跟踪用户的学习统计数据
 */
export interface LearningProgress {
  userId: string              /* 用户ID */
  totalArticles: number       /* 总文章数 */
  articlesRead: number        /* 已读文章数 */
  wordsLearned: number        /* 已学单词数 */
  studyTimeMinutes: number    /* 学习时间（分钟） */
  streak: number              /* 连续学习天数 */
  lastStudyDate: string       /* 最后学习日期 */
  weeklyGoal: number          /* 每周目标（分钟） */
  monthlyStats: MonthlyStats  /* 月度统计 */
}

/**
 * 月度统计接口
 * 按月汇总的学习数据
 */
export interface MonthlyStats {
  month: string           /* 月份（YYYY-MM） */
  articlesRead: number    /* 本月已读文章 */
  wordsLearned: number    /* 本月学习单词 */
  studyTime: number       /* 本月学习时间 */
  averageScore: number    /* 平均得分 */
}

/* ========== 文章类型 ========== */

/**
 * 文章实体接口
 * 学习内容的主要载体
 */
export interface Article {
  id: string                                        /* 文章ID */
  title: string                                     /* 文章标题 */
  content: string                                   /* 文章内容 */
  difficulty: 'beginner' | 'intermediate' | 'advanced'  /* 难度级别 */
  category: string                                  /* 文章分类 */
  tags: string[]                                    /* 标签列表 */
  audioUrl?: string                                 /* 音频URL（可选） */
  srtUrl?: string                                   /* 字幕URL（可选） */
  estimatedReadTime: number                         /* 预计阅读时间（分钟） */
  wordCount: number                                 /* 单词数 */
  createdAt: string                                 /* 创建时间 */
  updatedAt: string                                 /* 更新时间 */
}

/* ========== 词频分析类型 ========== */

/**
 * 单词条目接口
 * 词频分析的基本单位
 */
export interface WordEntry {
  word: string              /* 单词原形 */
  frequency: number         /* 出现频率 */
  articles: string[]        /* 出现的文章ID列表 */
  stemmed?: string          /* 词干形式（可选） */
  partOfSpeech?: string     /* 词性（可选） */
}

/**
 * 词汇分析结果接口
 * 文章或语料库的词汇统计
 */
export interface WordAnalysis {
  totalWords: number         /* 总词数 */
  uniqueWords: number        /* 不同单词数 */
  averageWordLength: number  /* 平均单词长度 */
  topWords: WordEntry[]      /* 高频词列表 */
  difficultyScore: number    /* 难度评分 */
}

/**
 * 搜索结果接口
 * 词频搜索的返回结果
 */
export interface SearchResult {
  word: string                /* 搜索词 */
  frequency: number           /* 总频率 */
  articles: ArticleMatch[]    /* 匹配的文章 */
  contexts: string[]          /* 上下文片段 */
}

/**
 * 文章匹配接口
 * 搜索结果中的文章信息
 */
export interface ArticleMatch {
  articleId: string      /* 文章ID */
  title: string          /* 文章标题 */
  matches: number        /* 匹配次数 */
  contexts: string[]     /* 上下文列表 */
}

/* ========== 音频同步类型 ========== */

/**
 * SRT字幕条目接口
 * 时间轴字幕的基本单位
 */
export interface SRTCue {
  id: string          /* 条目ID */
  startTime: number   /* 开始时间（秒） */
  endTime: number     /* 结束时间（秒） */
  text: string        /* 字幕文本 */
  index: number       /* 序号 */
}

/**
 * 音频播放状态接口
 * 音频播放器的状态管理
 */
export interface AudioState {
  isPlaying: boolean      /* 是否正在播放 */
  currentTime: number     /* 当前播放时间 */
  duration: number        /* 总时长 */
  volume: number          /* 音量（0-1） */
  playbackRate: number    /* 播放速度 */
  isLoading: boolean      /* 是否加载中 */
  error?: string          /* 错误信息（可选） */
}

/* ========== 词汇表类型 ========== */

/**
 * 单词定义接口
 * 词典条目的完整信息
 */
export interface WordDefinition {
  word: string                              /* 单词 */
  phonetic?: string                         /* 音标（可选） */
  definitions: Definition[]                 /* 定义列表 */
  etymology?: string                        /* 词源（可选） */
  frequency?: number                        /* 使用频率（可选） */
  difficulty?: 'easy' | 'medium' | 'hard'  /* 难度级别（可选） */
}

/**
 * 定义详情接口
 * 单词的具体释义
 */
export interface Definition {
  partOfSpeech: string    /* 词性 */
  meaning: string         /* 含义 */
  example?: string        /* 例句（可选） */
  synonyms?: string[]     /* 同义词（可选） */
  antonyms?: string[]     /* 反义词（可选） */
}

/* ========== 搜索和高亮类型 ========== */

/**
 * 搜索选项接口
 * 控制搜索行为的参数
 */
export interface SearchOptions {
  query: string                           /* 搜索关键词 */
  caseSensitive: boolean                  /* 是否区分大小写 */
  wholeWords: boolean                     /* 是否全词匹配 */
  useRegex: boolean                       /* 是否使用正则表达式 */
  mode: 'intelligent' | 'exact'           /* 搜索模式 */
}

/**
 * 高亮匹配接口
 * 文本高亮的位置信息
 */
export interface HighlightMatch {
  index: number           /* 匹配索引 */
  text: string           /* 匹配文本 */
  startOffset: number    /* 开始偏移 */
  endOffset: number      /* 结束偏移 */
  element: HTMLElement   /* DOM元素引用 */
}

/* ========== API响应类型 ========== */

/**
 * 通用API响应接口
 * 标准化的API返回格式
 */
export interface ApiResponse<T = any> {
  success: boolean      /* 请求是否成功 */
  data?: T             /* 响应数据（可选） */
  error?: string       /* 错误信息（可选） */
  message?: string     /* 提示信息（可选） */
  timestamp: string    /* 响应时间戳 */
}

/**
 * 分页响应接口
 * 带分页信息的API响应
 */
export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number        /* 当前页码 */
    limit: number       /* 每页数量 */
    total: number       /* 总记录数 */
    totalPages: number  /* 总页数 */
    hasNext: boolean    /* 是否有下一页 */
    hasPrev: boolean    /* 是否有上一页 */
  }
}

/* ========== 错误类型 ========== */

/**
 * 应用错误接口
 * 统一的错误格式
 */
export interface AppError {
  code: string          /* 错误代码 */
  message: string       /* 错误信息 */
  details?: any         /* 详细信息（可选） */
  timestamp: string     /* 错误时间 */
}

/* ========== 导航类型 ========== */

/**
 * 导航项接口
 * 菜单和导航栏的数据结构
 */
export interface NavItem {
  id: string              /* 导航项ID */
  label: string           /* 显示标签 */
  path: string           /* 路由路径 */
  icon?: string          /* 图标名称（可选） */
  children?: NavItem[]   /* 子菜单（可选） */
  requiresAuth?: boolean /* 需要认证（可选） */
  requiresPro?: boolean  /* 需要Pro版（可选） */
}

/* ========== 组件属性类型 ========== */

/**
 * 加载组件属性接口
 * LoadingSpinner组件的props
 */
export interface LoadingProps {
  size?: 'small' | 'medium' | 'large'  /* 尺寸 */
  color?: string                        /* 颜色 */
  text?: string                         /* 加载文本 */
}

/**
 * 模态框属性接口
 * Modal组件的props
 */
export interface ModalProps {
  isOpen: boolean                                    /* 是否打开 */
  title?: string                                     /* 标题 */
  size?: 'small' | 'medium' | 'large' | 'full'     /* 尺寸 */
  persistent?: boolean                               /* 是否持久化 */
}

/* ========== 实用工具类型 ========== */

/**
 * 深度可选类型
 * 递归地将对象的所有属性变为可选
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * 必填字段类型
 * 将指定字段变为必填
 */
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

/**
 * 可选字段类型
 * 将指定字段变为可选
 */
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

/* ========== 常量定义 ========== */

/**
 * 订阅功能配置
 * 定义不同订阅层级的功能权限
 */
export const SUBSCRIPTION_FEATURES: Record<SubscriptionTier, FeatureAccess> = {
  /* 免费版功能配置 */
  free: {
    articles: { limit: 5, unlimited: false },
    glossary: { level: 'basic', contextAware: false, audioDefinitions: false },
    audioSync: { precision: 'paragraph', visualizer: false, speedControl: false },
    wordFrequency: { searchMode: 'intelligent', crossArticle: false, analytics: false },
    search: { highlightLimit: 10, crossReference: false, smartSuggestions: false },
    export: { formats: ['txt'], annotations: false }
  },
  
  /* Pro版功能配置 */
  pro: {
    articles: { limit: Infinity, unlimited: true },
    glossary: { level: 'advanced', contextAware: true, audioDefinitions: true },
    audioSync: { precision: 'sentence', visualizer: true, speedControl: true },
    wordFrequency: { searchMode: 'both', crossArticle: true, analytics: true },
    search: { highlightLimit: Infinity, crossReference: true, smartSuggestions: true },
    export: { formats: ['txt', 'pdf', 'epub'], annotations: true }
  }
}