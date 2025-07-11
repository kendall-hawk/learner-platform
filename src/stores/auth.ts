/**
 * 🔐 第13个文件：src/stores/auth.ts
 * 
 * 📁 文件位置: src/stores/auth.ts
 * 🎯 核心功能: Pinia用户认证状态管理，处理登录、注册、令牌管理
 * 🔧 关键作用: 全局用户状态、自动令牌刷新、本地存储持久化
 * 
 * 📋 状态模块说明：
 * - 用户状态: 用户信息、认证状态、加载状态
 * - 令牌管理: 访问令牌、刷新令牌、过期时间处理
 * - 本地存储: 记住登录状态的持久化机制
 * - 自动刷新: 令牌即将过期时自动续期
 * - 错误处理: 认证失败和网络错误的统一处理
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginCredentials, SignupCredentials, AuthResponse } from '@/types'
import { mockApiService } from '@/services/mockApi'

export const useAuthStore = defineStore('auth', () => {
  // State
  // 状态定义 - 响应式数据
  const user = ref<User | null>(null)          // 当前用户信息
  const token = ref<string | null>(null)        // 访问令牌
  const refreshToken = ref<string | null>(null) // 刷新令牌
  const isLoading = ref(false)                  // 加载状态
  const error = ref<string | null>(null)       // 错误信息

  // Getters
  // 计算属性 - 基于状态的派生数据
  const isAuthenticated = computed(() => !!token.value && !!user.value)  // 是否已认证
  const isGuest = computed(() => !isAuthenticated.value)                  // 是否为访客
  const userName = computed(() => user.value?.name || 'Guest')            // 用户名（默认Guest）
  const userEmail = computed(() => user.value?.email || '')               // 用户邮箱

  // Actions
  // 动作方法 - 状态变更逻辑

  const login = async (credentials: LoginCredentials): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await mockApiService.login(credentials)
      
      if (response.success && response.data) {
        const authData = response.data as AuthResponse
        
        // Store auth data
        // 存储认证数据
        user.value = authData.user
        token.value = authData.token
        refreshToken.value = authData.refreshToken
        
        // Persist to localStorage if remember me is checked
        // 如果勾选记住登录则持久化到本地存储
        if (credentials.rememberMe) {
          localStorage.setItem('auth_token', authData.token)
          localStorage.setItem('refresh_token', authData.refreshToken)
          localStorage.setItem('user_data', JSON.stringify(authData.user))
        }
        
        // Set token expiration
        // 设置令牌过期时间
        const expirationTime = Date.now() + authData.expiresIn * 1000
        localStorage.setItem('token_expires_at', expirationTime.toString())
        
        console.log('Login successful:', authData.user.email)
      } else {
        throw new Error(response.error || 'Login failed')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Login failed'
      console.error('Login error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const signup = async (credentials: SignupCredentials): Promise<void> => {
    isLoading.value = true
    error.value = null

    try {
      const response = await mockApiService.signup(credentials)
      
      if (response.success && response.data) {
        const authData = response.data as AuthResponse
        
        // Auto-login after successful signup
        // 注册成功后自动登录
        user.value = authData.user
        token.value = authData.token
        refreshToken.value = authData.refreshToken
        
        // Store in localStorage
        // 存储到本地存储
        localStorage.setItem('auth_token', authData.token)
        localStorage.setItem('refresh_token', authData.refreshToken)
        localStorage.setItem('user_data', JSON.stringify(authData.user))
        
        console.log('Signup successful:', authData.user.email)
      } else {
        throw new Error(response.error || 'Signup failed')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Signup failed'
      console.error('Signup error:', err)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const logout = async (): Promise<void> => {
    isLoading.value = true

    try {
      // Call logout API if token exists
      // 如果令牌存在则调用登出API
      if (token.value) {
        await mockApiService.logout()
      }
    } catch (err) {
      console.warn('Logout API call failed:', err)
      // Continue with local logout even if API fails
      // 即使API失败也继续本地登出
    } finally {
      // Clear all auth data
      // 清除所有认证数据
      user.value = null
      token.value = null
      refreshToken.value = null
      error.value = null
      
      // Clear localStorage
      // 清除本地存储
      localStorage.removeItem('auth_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('user_data')
      localStorage.removeItem('token_expires_at')
      
      isLoading.value = false
      console.log('Logout completed')
    }
  }

  const refreshAuthToken = async (): Promise<boolean> => {
    if (!refreshToken.value) {
      return false
    }

    try {
      const response = await mockApiService.refreshToken(refreshToken.value)
      
      if (response.success && response.data) {
        const authData = response.data as AuthResponse
        
        token.value = authData.token
        refreshToken.value = authData.refreshToken
        
        // Update localStorage
        // 更新本地存储
        localStorage.setItem('auth_token', authData.token)
        localStorage.setItem('refresh_token', authData.refreshToken)
        
        const expirationTime = Date.now() + authData.expiresIn * 1000
        localStorage.setItem('token_expires_at', expirationTime.toString())
        
        return true
      }
    } catch (err) {
      console.error('Token refresh failed:', err)
      await logout() // Force logout on refresh failure
    }
    
    return false
  }

  const fetchUserProfile = async (): Promise<void> => {
    if (!token.value) {
      throw new Error('No authentication token')
    }

    isLoading.value = true

    try {
      const response = await mockApiService.getUserProfile()
      
      if (response.success && response.data) {
        user.value = response.data as User
        localStorage.setItem('user_data', JSON.stringify(user.value))
      } else {
        throw new Error(response.error || 'Failed to fetch user profile')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to fetch profile'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateProfile = async (profileData: Partial<User>): Promise<void> => {
    if (!user.value) {
      throw new Error('No user logged in')
    }

    isLoading.value = true

    try {
      const response = await mockApiService.updateProfile(profileData)
      
      if (response.success && response.data) {
        user.value = response.data as User
        localStorage.setItem('user_data', JSON.stringify(user.value))
      } else {
        throw new Error(response.error || 'Failed to update profile')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to update profile'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const initializeAuth = async (): Promise<void> => {
    // Check for stored auth data
    // 检查存储的认证数据
    const storedToken = localStorage.getItem('auth_token')
    const storedRefreshToken = localStorage.getItem('refresh_token')
    const storedUserData = localStorage.getItem('user_data')
    const tokenExpiresAt = localStorage.getItem('token_expires_at')

    if (storedToken && storedUserData) {
      // Check if token is expired
      // 检查令牌是否过期
      const isExpired = tokenExpiresAt && Date.now() > parseInt(tokenExpiresAt)

      if (isExpired && storedRefreshToken) {
        // Try to refresh token
        // 尝试刷新令牌
        refreshToken.value = storedRefreshToken
        const refreshed = await refreshAuthToken()
        
        if (!refreshed) {
          // Refresh failed, clear all data
          // 刷新失败，清除所有数据
          await logout()
          return
        }
      } else if (!isExpired) {
        // Token is still valid
        // 令牌仍然有效
        token.value = storedToken
        refreshToken.value = storedRefreshToken
        
        try {
          user.value = JSON.parse(storedUserData) as User
        } catch (err) {
          console.error('Failed to parse stored user data:', err)
          await logout()
          return
        }
      } else {
        // Token expired and no refresh token
        // 令牌过期且无刷新令牌
        await logout()
        return
      }

      // Verify token with API
      // 通过API验证令牌
      try {
        await fetchUserProfile()
      } catch (err) {
        console.error('Token verification failed:', err)
        await logout()
      }
    }
  }

  const clearError = () => {
    error.value = null
  }

  // Check if token needs refresh soon (within 5 minutes)
  // 检查令牌是否即将需要刷新（5分钟内）
  const needsTokenRefresh = computed(() => {
    const expiresAt = localStorage.getItem('token_expires_at')
    if (!expiresAt) return false
    
    const expirationTime = parseInt(expiresAt)
    const fiveMinutesFromNow = Date.now() + 5 * 60 * 1000
    
    return fiveMinutesFromNow > expirationTime
  })

  // Auto-refresh token when needed
  // 需要时自动刷新令牌
  const startTokenRefreshTimer = () => {
    setInterval(async () => {
      if (isAuthenticated.value && needsTokenRefresh.value) {
        await refreshAuthToken()
      }
    }, 60000) // Check every minute
  }

  return {
    // State
    // 状态
    user,
    token,
    refreshToken,
    isLoading,
    error,
    
    // Getters
    // 计算属性
    isAuthenticated,
    isGuest,
    userName,
    userEmail,
    needsTokenRefresh,
    
    // Actions
    // 动作方法
    login,
    signup,
    logout,
    refreshAuthToken,
    fetchUserProfile,
    updateProfile,
    initializeAuth,
    clearError,
    startTokenRefreshTimer
  }
})