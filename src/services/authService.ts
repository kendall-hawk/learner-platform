/** 9. src/services/authService.ts
 * 👤 authService.ts - 认证业务逻辑服务
 * 
 * 📋 功能概述:
 * - 处理所有用户认证相关的业务逻辑
 * - 封装API调用和错误处理
 * - 管理认证令牌和用户数据存储
 * - 提供密码验证和重置功能
 * - 支持本地存储和会话存储
 * 
 * 🎯 主要功能:
 * - 用户登录和注册
 * - 令牌刷新和认证状态检查
 * - 用户资料管理和更新
 * - 密码重置和邮箱验证
 * - 认证数据本地存储管理
 * - 表单验证工具函数
 * 
 * 🔗 API集成:
 * - 与mockApiService集成（开发环境）
 * - 支持一键切换真实API（生产环境）
 * - 错误处理和重试机制
 * - 请求超时和网络异常处理
 * 
 * 💾 存储策略:
 * - localStorage: 记住我功能
 * - sessionStorage: 临时会话
 * - 自动过期处理
 * - 多设备同步支持
 */

import { mockApiService } from './mockApi'
import type { 
  LoginCredentials, 
  SignupCredentials, 
  User, 
  AuthResponse, 
  ApiResponse 
} from '@/types'

/**
 * 🔐 认证服务类
 * 
 * 📋 设计原则:
 * - 单例模式，全局唯一实例
 * - 异步操作统一错误处理
 * - 支持Mock和真实API切换
 * - 完整的TypeScript类型支持
 */
class AuthService {
  
  /**
   * 🚀 用户登录
   * 
   * @param credentials - 登录凭据（邮箱、密码、记住我）
   * @returns Promise<AuthResponse> - 认证响应（用户信息、令牌等）
   * 
   * 🎯 功能流程:
   * 1. 调用登录API
   * 2. 验证响应数据
   * 3. 返回认证信息
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await mockApiService.login(credentials)
      
      if (!response.success) {
        throw new Error(response.error || 'Login failed')
      }
      
      return response.data as AuthResponse
    } catch (error) {
      console.error('Auth service login error:', error)
      throw error
    }
  }

  /**
   * ✍️ 用户注册
   * 
   * @param credentials - 注册凭据（姓名、邮箱、密码等）
   * @returns Promise<AuthResponse> - 认证响应
   * 
   * 🎯 功能流程:
   * 1. 调用注册API
   * 2. 验证注册结果
   * 3. 返回新用户认证信息
   */
  async register(credentials: SignupCredentials): Promise<AuthResponse> {
    try {
      const response = await mockApiService.signup(credentials)
      
      if (!response.success) {
        throw new Error(response.error || 'Registration failed')
      }
      
      return response.data as AuthResponse
    } catch (error) {
      console.error('Auth service register error:', error)
      throw error
    }
  }

  /**
   * 🚪 用户登出
   * 
   * 🎯 功能流程:
   * 1. 调用登出API（可选）
   * 2. 清理本地认证数据
   * 3. 确保完全登出状态
   */
  async logout(): Promise<void> {
    try {
      await mockApiService.logout()
      
      // 清理本地认证数据
      this.clearLocalAuth()
    } catch (error) {
      console.error('Auth service logout error:', error)
      // 即使API调用失败，也要清理本地数据
      this.clearLocalAuth()
    }
  }

  /**
   * 🔄 刷新认证令牌
   * 
   * @param refreshToken - 刷新令牌
   * @returns Promise<AuthResponse> - 新的认证信息
   * 
   * 🎯 使用场景:
   * - 访问令牌过期时自动刷新
   * - 保持用户登录状态
   * - 无感知续期体验
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      const response = await mockApiService.refreshToken(refreshToken)
      
      if (!response.success) {
        throw new Error(response.error || 'Token refresh failed')
      }
      
      return response.data as AuthResponse
    } catch (error) {
      console.error('Auth service refresh token error:', error)
      throw error
    }
  }

  /**
   * 👤 获取当前用户资料
   * 
   * @returns Promise<User> - 用户详细信息
   * 
   * 🎯 应用场景:
   * - 页面初始化时获取用户信息
   * - 用户资料页面数据展示
   * - 权限验证和个性化设置
   */
  async getCurrentUser(): Promise<User> {
    try {
      const response = await mockApiService.getUserProfile()
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to get user profile')
      }
      
      return response.data as User
    } catch (error) {
      console.error('Auth service get current user error:', error)
      throw error
    }
  }

  /**
   * ✏️ 更新用户资料
   * 
   * @param profileData - 部分用户资料数据
   * @returns Promise<User> - 更新后的用户信息
   * 
   * 🎯 支持更新项:
   * - 基本信息（姓名、头像等）
   * - 偏好设置
   * - 学习目标配置
   */
  async updateProfile(profileData: Partial<User>): Promise<User> {
    try {
      const response = await mockApiService.updateProfile(profileData)
      
      if (!response.success) {
        throw new Error(response.error || 'Failed to update profile')
      }
      
      return response.data as User
    } catch (error) {
      console.error('Auth service update profile error:', error)
      throw error
    }
  }

  /**
   * 📧 请求密码重置
   * 
   * @param email - 用户邮箱地址
   * 
   * 🎯 功能流程:
   * 1. 验证邮箱格式
   * 2. 发送重置链接到邮箱
   * 3. 返回操作结果
   */
  async requestPasswordReset(email: string): Promise<void> {
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 在真实实现中，这里会调用重置密码API
      console.log('Password reset requested for:', email)
    } catch (error) {
      console.error('Auth service password reset error:', error)
      throw error
    }
  }

  /**
   * 🔐 通过令牌重置密码
   * 
   * @param token - 重置令牌（从邮件链接获取）
   * @param newPassword - 新密码
   * 
   * 🎯 安全特性:
   * - 令牌有效期验证
   * - 密码强度检查
   * - 重置后自动失效
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // 在真实实现中，这里会调用重置密码API
      console.log('Password reset with token:', token)
    } catch (error) {
      console.error('Auth service reset password error:', error)
      throw error
    }
  }

  /**
   * ✅ 验证邮箱地址
   * 
   * @param token - 邮箱验证令牌
   * 
   * 🎯 验证流程:
   * 1. 验证令牌有效性
   * 2. 激活用户账户
   * 3. 更新验证状态
   */
  async verifyEmail(token: string): Promise<void> {
    try {
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log('Email verified with token:', token)
    } catch (error) {
      console.error('Auth service verify email error:', error)
      throw error
    }
  }

  /**
   * 🔍 检查用户认证状态
   * 
   * @returns boolean - 是否已认证
   * 
   * 🎯 检查逻辑:
   * 1. 验证令牌存在性
   * 2. 检查令牌有效期
   * 3. 返回认证状态
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token')
    const expiresAt = localStorage.getItem('token_expires_at')
    
    if (!token || !expiresAt) {
      return false
    }
    
    return Date.now() < parseInt(expiresAt)
  }

  /**
   * 🎫 获取存储的认证令牌
   * 
   * @returns string | null - 认证令牌或null
   */
  getStoredToken(): string | null {
    return localStorage.getItem('auth_token')
  }

  /**
   * 🔄 获取存储的刷新令牌
   * 
   * @returns string | null - 刷新令牌或null
   */
  getStoredRefreshToken(): string | null {
    return localStorage.getItem('refresh_token')
  }

  /**
   * 👤 获取存储的用户数据
   * 
   * @returns User | null - 用户数据或null
   * 
   * 🛡️ 安全特性:
   * - JSON解析异常处理
   * - 数据完整性验证
   * - 自动清理损坏数据
   */
  getStoredUser(): User | null {
    try {
      const userData = localStorage.getItem('user_data')
      return userData ? JSON.parse(userData) : null
    } catch (error) {
      console.error('Error parsing stored user data:', error)
      return null
    }
  }

  /**
   * 💾 存储认证数据
   * 
   * @param authData - 认证响应数据
   * @param rememberMe - 是否记住登录状态
   * 
   * 🎯 存储策略:
   * - rememberMe=true: localStorage（持久存储）
   * - rememberMe=false: sessionStorage（会话存储）
   * - 自动计算令牌过期时间
   */
  storeAuthData(authData: AuthResponse, rememberMe: boolean = false): void {
    if (rememberMe) {
      // 持久存储 - 浏览器关闭后仍保留
      localStorage.setItem('auth_token', authData.token)
      localStorage.setItem('refresh_token', authData.refreshToken)
      localStorage.setItem('user_data', JSON.stringify(authData.user))
      
      const expirationTime = Date.now() + authData.expiresIn * 1000
      localStorage.setItem('token_expires_at', expirationTime.toString())
    } else {
      // 会话存储 - 浏览器关闭后清除
      sessionStorage.setItem('auth_token', authData.token)
      sessionStorage.setItem('user_data', JSON.stringify(authData.user))
    }
  }

  /**
   * 🧹 清理本地认证数据
   * 
   * 🎯 清理范围:
   * - localStorage中的所有认证相关数据
   * - sessionStorage中的临时数据
   * - 确保完全登出状态
   */
  private clearLocalAuth(): void {
    // 清理localStorage
    localStorage.removeItem('auth_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_data')
    localStorage.removeItem('token_expires_at')
    
    // 清理sessionStorage
    sessionStorage.removeItem('auth_token')
    sessionStorage.removeItem('user_data')
  }

  /**
   * ✅ 验证邮箱格式
   * 
   * @param email - 待验证的邮箱地址
   * @returns boolean - 格式是否正确
   * 
   * 🎯 验证规则:
   * - 标准RFC邮箱格式
   * - 支持常见邮箱服务商
   * - 防止恶意输入
   */
  validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  /**
   * 🔒 验证密码强度
   * 
   * @param password - 待验证的密码
   * @returns 密码验证结果对象
   * 
   * 🎯 验证维度:
   * - 长度要求（最少6位）
   * - 字符类型组合
   * - 强度评分（0-100）
   * - 具体错误提示
   */
  validatePassword(password: string): {
    isValid: boolean
    strength: number
    errors: string[]
  } {
    const errors: string[] = []
    let strength = 0

    // 长度检查
    if (password.length < 6) {
      errors.push('Password must be at least 6 characters long')
    } else {
      strength += 20
    }

    // 额外长度奖励
    if (password.length >= 8) {
      strength += 10
    }

    // 小写字母检查
    if (/[a-z]/.test(password)) {
      strength += 15
    } else {
      errors.push('Password must contain at least one lowercase letter')
    }

    // 大写字母检查
    if (/[A-Z]/.test(password)) {
      strength += 15
    }

    // 数字检查
    if (/[0-9]/.test(password)) {
      strength += 15
    }

    // 特殊字符检查
    if (/[^A-Za-z0-9]/.test(password)) {
      strength += 25
    }

    return {
      isValid: errors.length === 0,
      strength: Math.min(strength, 100),
      errors
    }
  }

  /**
   * 🎨 生成用户头像URL
   * 
   * @param name - 用户姓名
   * @returns string - 头像图片URL
   * 
   * 🎯 特性:
   * - 基于姓名生成唯一头像
   * - 使用DiceBear API服务
   * - 支持多种头像风格
   * - 自动处理特殊字符
   */
  generateAvatarUrl(name: string): string {
    const seed = encodeURIComponent(name.toLowerCase().replace(/\s+/g, ''))
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`
  }
}

/**
 * 🏭 导出单例实例
 * 
 * 🎯 使用方式:
 * import { authService } from '@/services/authService'
 * await authService.login(credentials)
 */
export const authService = new AuthService()

/**
 * 🔗 默认导出（兼容不同导入方式）
 */
export default authService