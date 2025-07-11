<!--
/**3. src/views/Dashboard.vue
 * 📊 Dashboard.vue - 用户仪表板
 * 
 * 📋 功能概述:
 * - 用户登录后的主页面，展示学习进度和统计数据
 * - 提供快速访问常用功能的入口
 * - 显示订阅状态和升级提示
 * - 个性化推荐和学习目标管理
 * - 响应式设计，完美适配各种设备
 * 
 * 🎯 主要功能:
 * - 学习统计数据展示（文章、单词、时间、连续天数）
 * - 最近阅读文章列表
 * - 快速操作入口（词频分析、文章浏览等）
 * - 每周学习目标进度跟踪
 * - 学习连续天数日历展示
 * - 订阅状态管理和升级提示
 * 
 * 🔗 依赖组件:
 * - MainLayout: 主布局组件
 * - FeatureGate: 功能门控组件
 * 
 * 📱 响应式设计:
 * - 移动端友好的卡片布局
 * - 自适应网格系统
 * - 触摸友好的交互元素
 */
-->

<template>
  <MainLayout>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <!-- 👋 欢迎标题区域 -->
      <div class="mb-8">
        <div class="flex items-center justify-between flex-wrap gap-4">
          <!-- 欢迎信息 -->
          <div>
            <h1 class="text-3xl font-bold text-gray-900">
              Welcome back, {{ authStore.userName }}!
            </h1>
            <p class="text-gray-600 mt-1">
              Continue your English learning journey
            </p>
          </div>
          
          <!-- 🎫 订阅状态和升级按钮 -->
          <div class="flex items-center space-x-4">
            <!-- 订阅状态徽章 -->
            <div 
              class="px-3 py-1 rounded-full text-sm font-medium"
              :class="subscriptionBadgeClasses"
            >
              {{ subscriptionStore.getStatusBadge.text }}
            </div>
            
            <!-- 升级按钮 - 仅免费用户显示 -->
            <button
              v-if="subscriptionStore.isFree"
              @click="$router.push('/subscription')"
              class="btn-primary text-sm"
            >
              Upgrade to Pro
            </button>
          </div>
        </div>
      </div>

      <!-- 📊 学习统计数据概览 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        <!-- 📚 已读文章数统计 -->
        <div class="card card-body">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpenIcon class="w-5 h-5 text-blue-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Articles Read</p>
              <p class="text-2xl font-bold text-gray-900">{{ progress.articlesRead }}</p>
            </div>
          </div>
          <!-- 增长趋势指示 -->
          <div class="mt-4">
            <div class="flex items-center text-sm">
              <span class="text-green-600">+{{ progress.articlesRead }} this month</span>
            </div>
          </div>
        </div>

        <!-- 🎓 学习单词数统计 -->
        <div class="card card-body">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <AcademicCapIcon class="w-5 h-5 text-green-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Words Learned</p>
              <p class="text-2xl font-bold text-gray-900">{{ progress.wordsLearned }}</p>
            </div>
          </div>
          <!-- 本周增长数据 -->
          <div class="mt-4">
            <div class="flex items-center text-sm">
              <span class="text-green-600">+{{ Math.floor(progress.wordsLearned * 0.3) }} this week</span>
            </div>
          </div>
        </div>

        <!-- ⏰ 学习时长统计 -->
        <div class="card card-body">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <ClockIcon class="w-5 h-5 text-purple-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Study Time</p>
              <p class="text-2xl font-bold text-gray-900">{{ studyHours }}h</p>
            </div>
          </div>
          <!-- 本周时长数据 -->
          <div class="mt-4">
            <div class="flex items-center text-sm">
              <span class="text-green-600">{{ Math.floor(progress.studyTimeMinutes / 60 * 0.25) }}h this week</span>
            </div>
          </div>
        </div>

        <!-- 🔥 学习连续天数 -->
        <div class="card card-body">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <FireIcon class="w-5 h-5 text-orange-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm font-medium text-gray-600">Streak</p>
              <p class="text-2xl font-bold text-gray-900">{{ progress.streak }}</p>
            </div>
          </div>
          <div class="mt-4">
            <div class="flex items-center text-sm">
              <span class="text-gray-600">days in a row</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 📋 主要内容网格布局 -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <!-- 📖 最近文章 - 占用2/3宽度 -->
        <div class="lg:col-span-2">
          <div class="card">
            <div class="card-body">
              <div class="flex items-center justify-between mb-6">
                <h2 class="text-xl font-semibold text-gray-900">Continue Reading</h2>
                <router-link 
                  to="/articles" 
                  class="text-primary-600 hover:text-primary-700 text-sm font-medium"
                >
                  View all
                </router-link>
              </div>

              <!-- 📚 文章列表 -->
              <div class="space-y-4">
                <div 
                  v-for="article in recentArticles" 
                  :key="article.id"
                  class="flex items-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all cursor-pointer group"
                  @click="$router.push(`/article/${article.id}`)"
                >
                  <div class="flex-1">
                    <!-- 文章标题 -->
                    <h3 class="font-medium text-gray-900 group-hover:text-primary-700">
                      {{ article.title }}
                    </h3>
                    <!-- 文章元信息 -->
                    <p class="text-sm text-gray-600 mt-1">
                      {{ article.category }} • {{ article.estimatedReadTime }} min read
                    </p>
                    <!-- 难度和字数标签 -->
                    <div class="flex items-center mt-2">
                      <div 
                        class="px-2 py-1 text-xs rounded-full"
                        :class="getDifficultyClasses(article.difficulty)"
                      >
                        {{ article.difficulty }}
                      </div>
                      <div class="ml-2 text-xs text-gray-500">
                        {{ article.wordCount }} words
                      </div>
                    </div>
                  </div>
                  <!-- 箭头图标 -->
                  <ArrowRightIcon class="w-5 h-5 text-gray-400 group-hover:text-primary-600" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 🎯 侧边栏 - 占用1/3宽度 -->
        <div class="space-y-6">
          
          <!-- ⚡ 快速操作面板 -->
          <div class="card card-body">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div class="space-y-3">
              
              <!-- 词频分析入口 -->
              <router-link
                to="/word-frequency"
                class="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <ChartBarIcon class="w-5 h-5 text-purple-600 mr-3" />
                <span class="group-hover:text-gray-900">Word Analysis</span>
              </router-link>
              
              <!-- 📚 文章浏览 - 使用功能门控 -->
              <FeatureGate feature="unlimited_articles">
                <router-link
                  to="/articles"
                  class="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
                >
                  <BookOpenIcon class="w-5 h-5 text-blue-600 mr-3" />
                  <span class="group-hover:text-gray-900">Browse Articles</span>
                </router-link>
                
                <!-- 🚪 功能门控 - 免费用户显示升级提示 -->
                <template #fallback>
                  <button
                    @click="$router.push('/subscription')"
                    class="flex items-center p-3 text-gray-500 bg-gray-50 rounded-lg cursor-not-allowed w-full"
                  >
                    <BookOpenIcon class="w-5 h-5 text-gray-400 mr-3" />
                    <span>Browse Articles</span>
                    <LockClosedIcon class="w-4 h-4 text-gray-400 ml-auto" />
                  </button>
                </template>
              </FeatureGate>

              <!-- 👤 用户设置入口 -->
              <router-link
                to="/profile"
                class="flex items-center p-3 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors group"
              >
                <UserIcon class="w-5 h-5 text-green-600 mr-3" />
                <span class="group-hover:text-gray-900">Settings</span>
              </router-link>
            </div>
          </div>

          <!-- 🎯 每周学习目标 -->
          <div class="card card-body">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Weekly Goal</h3>
            <div class="space-y-3">
              <!-- 进度百分比显示 -->
              <div class="flex justify-between text-sm">
                <span class="text-gray-600">Study Time</span>
                <span class="font-medium">{{ weeklyProgress }}%</span>
              </div>
              <!-- 进度条 -->
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div 
                  class="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  :style="{ width: `${Math.min(weeklyProgress, 100)}%` }"
                ></div>
              </div>
              <!-- 详细进度信息 -->
              <p class="text-xs text-gray-600">
                {{ Math.floor(weeklyStudyTime) }} / {{ progress.weeklyGoal }} minutes this week
              </p>
            </div>
          </div>

          <!-- 🔥 学习连续天数详情 -->
          <div class="card card-body">
            <h3 class="text-lg font-medium text-gray-900 mb-4">Learning Streak</h3>
            <div class="text-center">
              <!-- 连续天数大数字显示 -->
              <div class="text-3xl font-bold text-orange-600 mb-2">
                {{ progress.streak }}
              </div>
              <p class="text-sm text-gray-600 mb-4">days in a row</p>
              
              <!-- 📅 连续天数日历视图 -->
              <div class="grid grid-cols-7 gap-1">
                <div 
                  v-for="day in streakDays" 
                  :key="day.date"
                  class="w-6 h-6 rounded text-xs flex items-center justify-center"
                  :class="day.hasStudied ? 'bg-orange-200 text-orange-800' : 'bg-gray-100 text-gray-400'"
                  :title="day.date"
                >
                  {{ day.day }}
                </div>
              </div>
            </div>
          </div>

          <!-- 💎 升级提示 - 仅免费用户显示 -->
          <div v-if="subscriptionStore.isFree" class="card card-body bg-gradient-to-r from-primary-50 to-purple-50 border-primary-200">
            <div class="text-center">
              <StarIcon class="w-8 h-8 text-yellow-500 mx-auto mb-3" />
              <h3 class="text-lg font-medium text-gray-900 mb-2">Unlock Pro Features</h3>
              <p class="text-sm text-gray-600 mb-4">
                Get unlimited articles, advanced analytics, and more!
              </p>
              <button
                @click="$router.push('/subscription')"
                class="btn-primary w-full text-sm"
              >
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
/**
 * 📝 组件逻辑
 * 
 * 🎯 主要功能:
 * - 展示用户学习进度和统计数据
 * - 管理订阅状态显示
 * - 提供快速操作入口
 * - 计算和展示各种学习指标
 * - 生成连续学习天数日历
 */

import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useSubscriptionStore } from '@/stores/subscription'
import MainLayout from '@/layouts/MainLayout.vue'
import FeatureGate from '@/components/subscription/FeatureGate.vue'

// 🔗 Heroicons图标组件导入
import {
  BookOpenIcon,
  AcademicCapIcon,
  ClockIcon,
  FireIcon,
  ChartBarIcon,
  UserIcon,
  ArrowRightIcon,
  StarIcon,
  LockClosedIcon
} from '@heroicons/vue/24/outline'

// 📊 Store状态管理
const authStore = useAuthStore()
const subscriptionStore = useSubscriptionStore()

// 📋 Mock学习进度数据
// 在真实应用中，这些数据会从API获取
const progress = ref({
  articlesRead: 15,      // 已读文章数
  wordsLearned: 230,     // 学习单词数
  studyTimeMinutes: 1250, // 学习时长（分钟）
  streak: 5,             // 连续学习天数
  weeklyGoal: 300        // 每周目标时长（分钟）
})

// 📚 Mock最近文章数据
const recentArticles = ref([
  {
    id: '1',
    title: 'The Future of Renewable Energy',
    category: 'Science',
    difficulty: 'intermediate',
    estimatedReadTime: 8,
    wordCount: 1420
  },
  {
    id: '2',
    title: 'Understanding Cultural Differences',
    category: 'Culture',
    difficulty: 'advanced',
    estimatedReadTime: 12,
    wordCount: 2100
  },
  {
    id: '3',
    title: 'Healthy Cooking Tips',
    category: 'Lifestyle',
    difficulty: 'beginner',
    estimatedReadTime: 5,
    wordCount: 890
  }
])

/**
 * 💰 计算学习时长（小时）
 */
const studyHours = computed(() => {
  return Math.floor(progress.value.studyTimeMinutes / 60)
})

/**
 * 📊 计算本周学习时长
 * Mock数据：假设25%的总时长是本周完成的
 */
const weeklyStudyTime = computed(() => {
  return progress.value.studyTimeMinutes * 0.25
})

/**
 * 🎯 计算每周目标完成百分比
 */
const weeklyProgress = computed(() => {
  return Math.min((weeklyStudyTime.value / progress.value.weeklyGoal) * 100, 100)
})

/**
 * 🎨 订阅状态徽章样式
 */
const subscriptionBadgeClasses = computed(() => {
  const badge = subscriptionStore.getStatusBadge
  const baseClasses = 'px-3 py-1 rounded-full text-sm font-medium'
  
  switch (badge.color) {
    case 'green':
      return `${baseClasses} bg-green-100 text-green-800`
    case 'blue':
      return `${baseClasses} bg-blue-100 text-blue-800`
    case 'orange':
      return `${baseClasses} bg-orange-100 text-orange-800`
    case 'red':
      return `${baseClasses} bg-red-100 text-red-800`
    default:
      return `${baseClasses} bg-gray-100 text-gray-800`
  }
})

/**
 * 📅 生成连续学习天数日历数据
 * 显示过去7天的学习情况
 */
const streakDays = computed(() => {
  const days = []
  const today = new Date()
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    
    days.push({
      date: date.toLocaleDateString(),
      day: date.getDate(),
      hasStudied: i <= progress.value.streak - 1 // 根据连续天数判断是否学习
    })
  }
  
  return days
})

/**
 * 🎨 获取文章难度对应的样式类
 * @param difficulty - 文章难度级别
 */
const getDifficultyClasses = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner':
      return 'bg-green-100 text-green-800'
    case 'intermediate':
      return 'bg-yellow-100 text-yellow-800'
    case 'advanced':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

/**
 * 🔄 组件挂载时加载数据
 */
onMounted(() => {
  // 在真实应用中，这里会调用API加载用户进度数据
  // 例如：await progressService.getUserProgress()
})
</script>