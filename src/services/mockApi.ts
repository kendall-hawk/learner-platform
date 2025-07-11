/**
 * 🔧 第12个文件：src/services/mockApi.ts
 * 
 * 📁 文件位置: src/services/mockApi.ts
 * 🎯 核心功能: Mock API服务，模拟后端接口和数据库操作
 * 🔧 关键作用: 提供完整的用户认证、订阅管理、进度跟踪功能
 * 
 * 📋 服务模块说明：
 * - 用户管理: 登录、注册、资料更新、令牌刷新
 * - 订阅系统: 状态查询、升级、取消、账单门户
 * - 数据持久化: 模拟数据库存储和用户会话
 * - 验证逻辑: 邮箱格式、密码强度、权限检查
 * - 错误模拟: 真实的API错误和边界情况处理
 */

import type { 
  User, 
  LoginCredentials, 
  SignupCredentials, 
  AuthResponse, 
  Subscription,
  LearningProgress,
  ApiResponse 
} from '@/types'

// Mock delay to simulate network requests
// 模拟网络延迟 - 让Mock API更接近真实网络环境
const delay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms))

// Mock user database
// 模拟用户数据库 - 预设测试用户数据
const mockUsers: User[] = [
  {
    id: 'user_demo',
    email: 'demo@example.com',
    name: 'Demo User',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=demo',
    createdAt: '2024-01-15T10:00:00Z',
    lastLogin: new Date().toISOString(),
    preferences: {
      language: 'en',
      theme: 'light',
      notifications: true,
      autoPlay: true,
      highlightLevel: 'advanced'
    }
  },
  {
    id: 'user_john',
    email: 'john@example.com',
    name: 'John Smith',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
    createdAt: '2024-02-01T14:30:00Z',
    lastLogin: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
    preferences: {
      language: 'en',
      theme: 'dark',
      notifications: false,
      autoPlay: false,
      highlightLevel: 'basic'
    }
  }
]

// Mock subscriptions database
// 模拟订阅数据库 - 用户订阅状态映射
const mockSubscriptions: Record<string, Subscription> = {
  'user_demo': {
    id: 'sub_demo',
    userId: 'user_demo',
    tier: 'free',
    status: 'active',
    currentPeriodStart: new Date().toISOString(),
    currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    cancelAtPeriodEnd: false
  },
  'user_john': {
    id: 'sub_john',
    userId: 'user_john',
    tier: 'pro',
    status: 'active',
    currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
    cancelAtPeriodEnd: false,
    stripeSubscriptionId: 'sub_stripe_john'
  }
}

// Mock learning progress database
// 模拟学习进度数据库 - 用户学习数据
const mockProgress: Record<string, LearningProgress> = {
  'user_demo': {
    userId: 'user_demo',
    totalArticles: 125,
    articlesRead: 15,
    wordsLearned: 230,
    studyTimeMinutes: 1250,
    streak: 5,
    lastStudyDate: new Date().toISOString(),
    weeklyGoal: 300,
    monthlyStats: {
      month: '2024-07',
      articlesRead: 15,
      wordsLearned: 230,
      studyTime: 1250,
      averageScore: 85
    }
  },
  'user_john': {
    userId: 'user_john',
    totalArticles: 125,
    articlesRead: 45,
    wordsLearned: 680,
    studyTimeMinutes: 3200,
    streak: 12,
    lastStudyDate: new Date(Date.now() - 86400000).toISOString(),
    weeklyGoal: 500,
    monthlyStats: {
      month: '2024-07',
      articlesRead: 45,
      wordsLearned: 680,
      studyTime: 3200,
      averageScore: 92
    }
  }
}

// Current session storage
// 当前会话存储 - 跟踪登录状态
let currentUser: User | null = null
let currentToken: string | null = null

// Utility functions
// 工具函数 - 令牌生成和验证逻辑

const generateToken = (userId: string): string => {
  return btoa(`${userId}:${Date.now()}:${Math.random()}`)
}

const generateRefreshToken = (userId: string): string => {
  return btoa(`refresh:${userId}:${Date.now()}:${Math.random()}`)
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const findUserByEmail = (email: string): User | undefined => {
  return mockUsers.find(user => user.email.toLowerCase() === email.toLowerCase())
}

const findUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id)
}

// Mock API Service
// Mock API服务 - 模拟所有后端接口
export const mockApiService = {
  // Authentication
  // 认证相关接口

  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    await delay(800) // Simulate network delay
    
    if (!validateEmail(credentials.email)) {
      return {
        success: false,
        error: 'Invalid email format',
        timestamp: new Date().toISOString()
      }
    }
    
    const user = findUserByEmail(credentials.email)
    
    if (!user) {
      return {
        success: false,
        error: 'User not found',
        timestamp: new Date().toISOString()
      }
    }
    
    // For demo purposes, accept any password for existing users
    // Demo目的：对现有用户接受任意密码
    if (credentials.password.length < 3) {
      return {
        success: false,
        error: 'Invalid password',
        timestamp: new Date().toISOString()
      }
    }
    
    const token = generateToken(user.id)
    const refreshToken = generateRefreshToken(user.id)
    
    // Update last login
    // 更新最后登录时间
    user.lastLogin = new Date().toISOString()
    currentUser = user
    currentToken = token
    
    return {
      success: true,
      data: {
        user,
        token,
        refreshToken,
        expiresIn: 3600 // 1 hour
      },
      timestamp: new Date().toISOString()
    }
  },

  async signup(credentials: SignupCredentials): Promise<ApiResponse<AuthResponse>> {
    await delay(1000)
    
    if (!validateEmail(credentials.email)) {
      return {
        success: false,
        error: 'Invalid email format',
        timestamp: new Date().toISOString()
      }
    }
    
    if (credentials.password !== credentials.confirmPassword) {
      return {
        success: false,
        error: 'Passwords do not match',
        timestamp: new Date().toISOString()
      }
    }
    
    if (credentials.password.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters',
        timestamp: new Date().toISOString()
      }
    }
    
    if (findUserByEmail(credentials.email)) {
      return {
        success: false,
        error: 'Email already registered',
        timestamp: new Date().toISOString()
      }
    }
    
    // Create new user
    // 创建新用户
    const newUser: User = {
      id: `user_${Date.now()}`,
      email: credentials.email,
      name: credentials.name,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${credentials.name}`,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      preferences: {
        language: 'en',
        theme: 'light',
        notifications: true,
        autoPlay: true,
        highlightLevel: 'basic'
      }
    }
    
    // Add to mock database
    // 添加到模拟数据库
    mockUsers.push(newUser)
    
    // Create free subscription
    // 创建免费订阅
    mockSubscriptions[newUser.id] = {
      id: `sub_${Date.now()}`,
      userId: newUser.id,
      tier: 'free',
      status: 'active',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      cancelAtPeriodEnd: false
    }
    
    // Create initial progress
    // 创建初始学习进度
    mockProgress[newUser.id] = {
      userId: newUser.id,
      totalArticles: 125,
      articlesRead: 0,
      wordsLearned: 0,
      studyTimeMinutes: 0,
      streak: 0,
      lastStudyDate: new Date().toISOString(),
      weeklyGoal: 200,
      monthlyStats: {
        month: new Date().toISOString().substring(0, 7),
        articlesRead: 0,
        wordsLearned: 0,
        studyTime: 0,
        averageScore: 0
      }
    }
    
    const token = generateToken(newUser.id)
    const refreshToken = generateRefreshToken(newUser.id)
    
    currentUser = newUser
    currentToken = token
    
    return {
      success: true,
      data: {
        user: newUser,
        token,
        refreshToken,
        expiresIn: 3600
      },
      timestamp: new Date().toISOString()
    }
  },

  async logout(): Promise<ApiResponse<void>> {
    await delay(300)
    
    currentUser = null
    currentToken = null
    
    return {
      success: true,
      message: 'Logged out successfully',
      timestamp: new Date().toISOString()
    }
  },

  async refreshToken(refreshToken: string): Promise<ApiResponse<AuthResponse>> {
    await delay(500)
    
    // For demo purposes, always allow refresh if there's a current user
    // Demo目的：如果有当前用户则总是允许刷新
    if (!currentUser) {
      return {
        success: false,
        error: 'Invalid refresh token',
        timestamp: new Date().toISOString()
      }
    }
    
    const newToken = generateToken(currentUser.id)
    const newRefreshToken = generateRefreshToken(currentUser.id)
    
    currentToken = newToken
    
    return {
      success: true,
      data: {
        user: currentUser,
        token: newToken,
        refreshToken: newRefreshToken,
        expiresIn: 3600
      },
      timestamp: new Date().toISOString()
    }
  },

  async getUserProfile(): Promise<ApiResponse<User>> {
    await delay(400)
    
    if (!currentToken || !currentUser) {
      return {
        success: false,
        error: 'Unauthorized',
        timestamp: new Date().toISOString()
      }
    }
    
    return {
      success: true,
      data: currentUser,
      timestamp: new Date().toISOString()
    }
  },

  async updateProfile(profileData: Partial<User>): Promise<ApiResponse<User>> {
    await delay(600)
    
    if (!currentUser) {
      return {
        success: false,
        error: 'Unauthorized',
        timestamp: new Date().toISOString()
      }
    }
    
    // Update user data
    // 更新用户数据
    Object.assign(currentUser, profileData)
    
    // Update in mock database
    // 更新模拟数据库
    const userIndex = mockUsers.findIndex(user => user.id === currentUser!.id)
    if (userIndex !== -1) {
      mockUsers[userIndex] = currentUser
    }
    
    return {
      success: true,
      data: currentUser,
      timestamp: new Date().toISOString()
    }
  },

  // Subscription Management
  // 订阅管理接口

  async getSubscriptionStatus(): Promise<ApiResponse<Subscription>> {
    await delay(400)
    
    if (!currentUser) {
      return {
        success: false,
        error: 'Unauthorized',
        timestamp: new Date().toISOString()
      }
    }
    
    const subscription = mockSubscriptions[currentUser.id]
    
    if (!subscription) {
      // Return default free subscription
      // 返回默认免费订阅
      const freeSubscription: Subscription = {
        id: `sub_free_${currentUser.id}`,
        userId: currentUser.id,
        tier: 'free',
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false
      }
      
      mockSubscriptions[currentUser.id] = freeSubscription
      
      return {
        success: true,
        data: freeSubscription,
        timestamp: new Date().toISOString()
      }
    }
    
    return {
      success: true,
      data: subscription,
      timestamp: new Date().toISOString()
    }
  },

  async upgradeSubscription(planId: string): Promise<ApiResponse<Subscription>> {
    await delay(1500) // Simulate payment processing
    
    if (!currentUser) {
      return {
        success: false,
        error: 'Unauthorized',
        timestamp: new Date().toISOString()
      }
    }
    
    // Simulate payment success (90% success rate for demo)
    // 模拟支付成功（Demo用90%成功率）
    if (Math.random() < 0.1) {
      return {
        success: false,
        error: 'Payment failed. Please try again.',
        timestamp: new Date().toISOString()
      }
    }
    
    const subscription = mockSubscriptions[currentUser.id] || {
      id: `sub_${Date.now()}`,
      userId: currentUser.id,
      tier: 'free',
      status: 'active',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date().toISOString(),
      cancelAtPeriodEnd: false
    }
    
    // Upgrade to pro
    // 升级到专业版
    subscription.tier = 'pro'
    subscription.status = 'active'
    subscription.currentPeriodStart = new Date().toISOString()
    subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    subscription.cancelAtPeriodEnd = false
    subscription.stripeSubscriptionId = `sub_stripe_${Date.now()}`
    
    mockSubscriptions[currentUser.id] = subscription
    
    return {
      success: true,
      data: subscription,
      timestamp: new Date().toISOString()
    }
  },

  async cancelSubscription(): Promise<ApiResponse<Subscription>> {
    await delay(800)
    
    if (!currentUser) {
      return {
        success: false,
        error: 'Unauthorized',
        timestamp: new Date().toISOString()
      }
    }
    
    const subscription = mockSubscriptions[currentUser.id]
    
    if (!subscription || subscription.tier === 'free') {
      return {
        success: false,
        error: 'No active subscription to cancel',
        timestamp: new Date().toISOString()
      }
    }
    
    subscription.cancelAtPeriodEnd = true
    
    return {
      success: true,
      data: subscription,
      timestamp: new Date().toISOString()
    }
  },

  async reactivateSubscription(): Promise<ApiResponse<Subscription>> {
    await delay(600)
    
    if (!currentUser) {
      return {
        success: false,
        error: 'Unauthorized',
        timestamp: new Date().toISOString()
      }
    }
    
    const subscription = mockSubscriptions[currentUser.id]
    
    if (!subscription) {
      return {
        success: false,
        error: 'No subscription found',
        timestamp: new Date().toISOString()
      }
    }
    
    subscription.cancelAtPeriodEnd = false
    subscription.status = 'active'
    
    return {
      success: true,
      data: subscription,
      timestamp: new Date().toISOString()
    }
  },

  async getBillingPortalUrl(): Promise<ApiResponse<{ url: string }>> {
    await delay(500)
    
    if (!currentUser) {
      return {
        success: false,
        error: 'Unauthorized',
        timestamp: new Date().toISOString()
      }
    }
    
    // Return mock Stripe billing portal URL
    // 返回模拟Stripe账单门户URL
    return {
      success: true,
      data: {
        url: `https://billing.stripe.com/session/${currentUser.id}_mock_session`
      },
      timestamp: new Date().toISOString()
    }
  },

  // Learning Progress
  // 学习进度接口

  async getLearningProgress(): Promise<ApiResponse<LearningProgress>> {
    await delay(400)
    
    if (!currentUser) {
      return {
        success: false,
        error: 'Unauthorized',
        timestamp: new Date().toISOString()
      }
    }
    
    const progress = mockProgress[currentUser.id]
    
    if (!progress) {
      return {
        success: false,
        error: 'Progress data not found',
        timestamp: new Date().toISOString()
      }
    }
    
    return {
      success: true,
      data: progress,
      timestamp: new Date().toISOString()
    }
  },

  async updateProgress(progressUpdate: Partial<LearningProgress>): Promise<ApiResponse<LearningProgress>> {
    await delay(300)
    
    if (!currentUser) {
      return {
        success: false,
        error: 'Unauthorized',
        timestamp: new Date().toISOString()
      }
    }
    
    const progress = mockProgress[currentUser.id]
    
    if (!progress) {
      return {
        success: false,
        error: 'Progress data not found',
        timestamp: new Date().toISOString()
      }
    }
    
    Object.assign(progress, progressUpdate)
    mockProgress[currentUser.id] = progress
    
    return {
      success: true,
      data: progress,
      timestamp: new Date().toISOString()
    }
  }
}

// Export helper function to check current auth state
// 导出工具函数检查当前认证状态
export const getCurrentMockUser = () => currentUser
export const getCurrentMockToken = () => currentToken

// Export mock data for testing
// 导出模拟数据用于测试
export const getMockUsers = () => [...mockUsers]
export const getMockSubscriptions = () => ({ ...mockSubscriptions })
export const getMockProgress = () => ({ ...mockProgress })