/**
 * 📋 第9个文件：src/types/index.ts
 * 
 * 📁 文件位置: src/types/index.ts
 * 🎯 核心功能: 全局TypeScript类型定义，统一数据结构标准
 * 🔧 关键作用: 定义用户、订阅、学习进度、音频、词典等核心类型
 * 
 * 📋 类型模块说明：
 * - 用户认证: User、LoginCredentials、AuthResponse等
 * - 订阅系统: Subscription、SubscriptionTier、FeatureAccess等
 * - 学习数据: LearningProgress、WordEntry、ArticleMatch等
 * - 音频同步: SRTCue、AudioState等
 * - 词典系统: WordDefinition、Definition等
 * - API响应: ApiResponse、PaginatedResponse等
 */

// User & Authentication Types
// 用户和认证相关类型定义

export interface User {
  id: string                           // 用户唯一标识
  email: string                        // 邮箱地址
  name: string                         // 用户姓名
  avatar?: string                      // 头像URL（可选）
  createdAt: string                    // 账户创建时间
  lastLogin: string                    // 最后登录时间
  preferences: UserPreferences         // 用户偏好设置
}

export interface UserPreferences {
  language: string                     // 界面语言
  theme: 'light' | 'dark' | 'auto'    // 主题模式
  notifications: boolean               // 是否接收通知
  autoPlay: boolean                    // 音频自动播放
  highlightLevel: 'basic' | 'advanced' // 高亮显示级别
}

export interface LoginCredentials {
  email: string                        // 登录邮箱
  password: string                     // 登录密码
  rememberMe?: boolean                 // 记住登录状态（可选）
}

export interface SignupCredentials extends LoginCredentials {
  name: string                         // 注册用户名
  confirmPassword: string              // 确认密码
}

export interface AuthResponse {
  user: User                          // 用户信息
  token: string                       // 访问令牌
  refreshToken: string                // 刷新令牌
  expiresIn: number                   // 令牌过期时间（秒）
}

// Subscription Types
// 订阅系统相关类型定义

export type SubscriptionTier = 'free' | 'pro'  // 订阅等级：免费版 | 专业版

export interface Subscription {
  id: string                          // 订阅ID
  userId: string                      // 用户ID
  tier: SubscriptionTier              // 订阅等级
  status: 'active' | 'canceled' | 'past_due' | 'trialing'  // 订阅状态
  currentPeriodStart: string          // 当前周期开始时间
  currentPeriodEnd: string            // 当前周期结束时间
  cancelAtPeriodEnd: boolean          // 是否在周期末取消
  trialEnd?: string                   // 试用期结束时间（可选）
  stripeSubscriptionId?: string       // Stripe订阅ID（可选）
}

export interface FeatureAccess {
  articles: {
    limit: number                     // 文章阅读限制数量
    unlimited: boolean                // 是否无限制
  }
  glossary: {
    level: 'basic' | 'advanced'      // 词典功能级别
    contextAware: boolean             // 是否支持上下文感知
    audioDefinitions: boolean         // 是否支持音频释义
  }
  audioSync: {
    precision: 'paragraph' | 'sentence'  // 音频同步精度
    visualizer: boolean               // 是否支持可视化
    speedControl: boolean             // 是否支持速度控制
  }
  wordFrequency: {
    searchMode: 'intelligent' | 'exact' | 'both'  // 搜索模式
    crossArticle: boolean             // 是否支持跨文章搜索
    analytics: boolean                // 是否支持数据分析
  }
  search: {
    highlightLimit: number            // 高亮显示限制
    crossReference: boolean           // 是否支持交叉引用
    smartSuggestions: boolean         // 是否支持智能建议
  }
  export: {
    formats: string[]                 // 支持的导出格式
    annotations: boolean              // 是否支持注释导出
  }
}

// Learning Progress Types
// 学习进度相关类型定义

export interface LearningProgress {
  userId: string                      // 用户ID
  totalArticles: number               // 总文章数
  articlesRead: number                // 已读文章数
  wordsLearned: number                // 已学单词数
  studyTimeMinutes: number            // 学习时间（分钟）
  streak: number                      // 连续学习天数
  lastStudyDate: string               // 最后学习日期
  weeklyGoal: number                  // 周学习目标
  monthlyStats: MonthlyStats          // 月度统计
}

export interface MonthlyStats {
  month: string                       // 月份标识
  articlesRead: number                // 该月已读文章数
  wordsLearned: number                // 该月已学单词数
  studyTime: number                   // 该月学习时间
  averageScore: number                // 平均得分
}

// Article Types
// 文章相关类型定义

export interface Article {
  id: string                          // 文章唯一ID
  title: string                       // 文章标题
  content: string                     // 文章内容
  difficulty: 'beginner' | 'intermediate' | 'advanced'  // 难度级别
  category: string                    // 文章分类
  tags: string[]                      // 标签数组
  audioUrl?: string                   // 音频文件URL（可选）
  srtUrl?: string                     // 字幕文件URL（可选）
  estimatedReadTime: number           // 预估阅读时间（分钟）
  wordCount: number                   // 单词总数
  createdAt: string                   // 创建时间
  updatedAt: string                   // 更新时间
}

// Word Frequency Types
// 词频分析相关类型定义

export interface WordEntry {
  word: string                        // 单词
  frequency: number                   // 出现频次
  articles: string[]                  // 包含该词的文章ID列表
  stemmed?: string                    // 词干形式（可选）
  partOfSpeech?: string               // 词性（可选）
}

export interface WordAnalysis {
  totalWords: number                  // 总单词数
  uniqueWords: number                 // 唯一单词数
  averageWordLength: number           // 平均单词长度
  topWords: WordEntry[]               // 高频词列表
  difficultyScore: number             // 难度分数
}

export interface SearchResult {
  word: string                        // 搜索的单词
  frequency: number                   // 频次
  articles: ArticleMatch[]            // 匹配的文章
  contexts: string[]                  // 上下文片段
}

export interface ArticleMatch {
  articleId: string                   // 文章ID
  title: string                       // 文章标题
  matches: number                     // 匹配次数
  contexts: string[]                  // 上下文片段
}

// Audio Sync Types
// 音频同步相关类型定义

export interface SRTCue {
  id: string                          // 字幕条目ID
  startTime: number                   // 开始时间（秒）
  endTime: number                     // 结束时间（秒）
  text: string                        // 字幕文本
  index: number                       // 索引位置
}

export interface AudioState {
  isPlaying: boolean                  // 是否正在播放
  currentTime: number                 // 当前播放时间
  duration: number                    // 总时长
  volume: number                      // 音量（0-1）
  playbackRate: number                // 播放速率
  isLoading: boolean                  // 是否加载中
  error?: string                      // 错误信息（可选）
}

// Glossary Types
// 词典系统相关类型定义

export interface WordDefinition {
  word: string                        // 单词
  phonetic?: string                   // 音标（可选）
  definitions: Definition[]           // 释义列表
  etymology?: string                  // 词源（可选）
  frequency?: number                  // 使用频率（可选）
  difficulty?: 'easy' | 'medium' | 'hard'  // 难度级别（可选）
}

export interface Definition {
  partOfSpeech: string                // 词性
  meaning: string                     // 释义
  example?: string                    // 例句（可选）
  synonyms?: string[]                 // 同义词（可选）
  antonyms?: string[]                 // 反义词（可选）
}

// Search & Highlight Types
// 搜索和高亮相关类型定义

export interface SearchOptions {
  query: string                       // 搜索查询
  caseSensitive: boolean              // 是否区分大小写
  wholeWords: boolean                 // 是否全词匹配
  useRegex: boolean                   // 是否使用正则表达式
  mode: 'intelligent' | 'exact'      // 搜索模式
}

export interface HighlightMatch {
  index: number                       // 匹配索引
  text: string                        // 匹配文本
  startOffset: number                 // 开始偏移量
  endOffset: number                   // 结束偏移量
  element: HTMLElement                // DOM元素
}

// API Response Types
// API响应相关类型定义

export interface ApiResponse<T = any> {
  success: boolean                    // 请求是否成功
  data?: T                           // 返回数据（可选）
  error?: string                     // 错误信息（可选）
  message?: string                   // 提示信息（可选）
  timestamp: string                  // 时间戳
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number                      // 当前页码
    limit: number                     // 每页数量
    total: number                     // 总记录数
    totalPages: number                // 总页数
    hasNext: boolean                  // 是否有下一页
    hasPrev: boolean                  // 是否有上一页
  }
}

// Error Types
// 错误处理相关类型定义

export interface AppError {
  code: string                        // 错误代码
  message: string                     // 错误信息
  details?: any                       // 错误详情（可选）
  timestamp: string                   // 错误时间戳
}

// Navigation Types
// 导航相关类型定义

export interface NavItem {
  id: string                          // 导航项ID
  label: string                       // 显示标签
  path: string                        // 路由路径
  icon?: string                       // 图标（可选）
  children?: NavItem[]                // 子导航项（可选）
  requiresAuth?: boolean              // 是否需要认证（可选）
  requiresPro?: boolean               // 是否需要专业版（可选）
}

// Component Props Types
// 组件属性相关类型定义

export interface LoadingProps {
  size?: 'small' | 'medium' | 'large' // 加载器大小
  color?: string                      // 颜色
  text?: string                       // 加载文本
}

export interface ModalProps {
  isOpen: boolean                     // 是否打开
  title?: string                      // 标题（可选）
  size?: 'small' | 'medium' | 'large' | 'full'  // 尺寸（可选）
  persistent?: boolean                // 是否持久化（可选）
}

// Utility Types
// 工具类型定义

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Constants
// 常量配置：订阅功能权限映射

export const SUBSCRIPTION_FEATURES: Record<SubscriptionTier, FeatureAccess> = {
  free: {
    articles: { limit: 5, unlimited: false },
    glossary: { level: 'basic', contextAware: false, audioDefinitions: false },
    audioSync: { precision: 'paragraph', visualizer: false, speedControl: false },
    wordFrequency: { searchMode: 'intelligent', crossArticle: false, analytics: false },
    search: { highlightLimit: 10, crossReference: false, smartSuggestions: false },
    export: { formats: ['txt'], annotations: false }
  },
  pro: {
    articles: { limit: Infinity, unlimited: true },
    glossary: { level: 'advanced', contextAware: true, audioDefinitions: true },
    audioSync: { precision: 'sentence', visualizer: true, speedControl: true },
    wordFrequency: { searchMode: 'both', crossArticle: true, analytics: true },
    search: { highlightLimit: Infinity, crossReference: true, smartSuggestions: true },
    export: { formats: ['txt', 'pdf', 'epub'], annotations: true }
  }
}