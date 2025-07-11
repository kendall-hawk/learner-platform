<!--
/** 
 * 1. src/views/HomePage.vue
 * 🏠 HomePage.vue - 首页营销页面
 * 
 * 📋 功能概述:
 * - 展示产品特色和价值主张的营销首页
 * - 包含Hero区域、功能展示、定价方案、CTA按钮
 * - 响应式设计，支持移动端和桌面端
 * - 集成用户认证状态，动态显示不同内容
 * 
 * 🎯 主要功能:
 * - Hero Section: 产品介绍和主要卖点
 * - Features Grid: 6大核心功能展示
 * - Pricing Section: 免费版vs专业版对比
 * - Feature Comparison: 详细功能对比表
 * - CTA Sections: 引导用户注册/登录
 * - Social Proof: 用户数量和评分展示
 * 
 * 🔗 依赖组件:
 * - PricingCard: 定价卡片组件
 * - SubscriptionModal: 订阅升级弹窗
 * 
 * 📱 响应式设计:
 * - 移动端优先设计
 * - 平板和桌面端适配
 * - 动画和交互效果
 */
-->

<template>
  <div class="min-h-screen">
    <!-- 🎨 Hero Section - 首页顶部英雄区域 -->
    <section class="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 overflow-hidden">
      <!-- 背景装饰元素 -->
      <div class="absolute inset-0 bg-black opacity-10"></div>
      <div class="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
      
      <!-- 💫 动画背景元素 - 增强视觉效果 -->
      <div class="absolute top-10 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse-slow"></div>
      <div class="absolute top-32 right-20 w-16 h-16 bg-white/10 rounded-full animate-pulse-slow" style="animation-delay: 1s"></div>
      <div class="absolute bottom-20 left-1/4 w-12 h-12 bg-white/10 rounded-full animate-pulse-slow" style="animation-delay: 2s"></div>

      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div class="text-center">
          <!-- 📱 Logo展示 -->
          <div class="flex justify-center mb-8">
            <div class="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-xl">
              <span class="text-primary-600 font-bold text-2xl">E</span>
            </div>
          </div>

          <!-- 🎯 主标题 - 核心价值主张 -->
          <h1 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
            Master English with
            <span class="bg-gradient-to-r from-yellow-300 to-orange-300 bg-clip-text text-transparent">
              AI-Powered Learning
            </span>
          </h1>

          <!-- 📝 副标题 - 产品功能描述 -->
          <p class="text-xl sm:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            Intelligent word analysis, real-time audio sync, and contextual definitions 
            that adapt to your learning style.
          </p>

          <!-- 🎯 CTA按钮组 - 根据登录状态显示不同内容 -->
          <div class="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <!-- 未登录用户显示注册按钮 -->
            <router-link
              v-if="!authStore.isAuthenticated"
              to="/login"
              class="w-full sm:w-auto btn-primary text-lg px-8 py-4 bg-white text-primary-600 hover:bg-gray-50 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              Start Learning Free
              <ArrowRightIcon class="ml-2 w-5 h-5" />
            </router-link>

            <!-- 已登录用户显示继续学习按钮 -->
            <router-link
              v-else
              to="/dashboard"
              class="w-full sm:w-auto btn-primary text-lg px-8 py-4 bg-white text-primary-600 hover:bg-gray-50 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
            >
              Continue Learning
              <ArrowRightIcon class="ml-2 w-5 h-5" />
            </router-link>

            <!-- 查看功能按钮 - 平滑滚动到功能区域 -->
            <button
              @click="scrollToFeatures"
              class="w-full sm:w-auto text-lg px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-primary-600 rounded-lg transition-all duration-300"
            >
              See Features
            </button>
          </div>

          <!-- 👥 社交证明 - 增强可信度 -->
          <div class="flex flex-col sm:flex-row items-center justify-center gap-8 text-blue-200">
            <!-- 用户头像展示 -->
            <div class="flex items-center">
              <div class="flex -space-x-2">
                <img v-for="i in 4" :key="i" 
                     :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=user${i}`"
                     class="w-8 h-8 rounded-full border-2 border-white" />
              </div>
              <span class="ml-3 text-sm">Join 10,000+ learners</span>
            </div>
            <!-- 评分展示 -->
            <div class="flex items-center">
              <div class="flex text-yellow-300">
                <StarIcon v-for="i in 5" :key="i" class="w-5 h-5 fill-current" />
              </div>
              <span class="ml-2 text-sm">4.9/5 rating</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 🚀 Features Section - 核心功能展示区域 -->
    <section ref="featuresSection" class="py-24 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- 📋 区域标题 -->
        <div class="text-center mb-16">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Powerful Features for Every Learner
          </h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            From beginners to advanced speakers, our AI-powered platform adapts to your needs
          </p>
        </div>

        <!-- 📊 功能网格 - 6大核心功能展示 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <!-- 📖 智能词典功能 -->
          <div class="group card card-body hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div class="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary-200 transition-colors">
              <BookOpenIcon class="w-6 h-6 text-primary-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Smart Dictionary</h3>
            <p class="text-gray-600 mb-4">
              Click any word for instant contextual definitions, pronunciation, and usage examples.
            </p>
            <div class="flex items-center text-primary-600 text-sm font-medium">
              Learn more <ArrowRightIcon class="ml-1 w-4 h-4" />
            </div>
          </div>

          <!-- 🎵 音频同步功能 -->
          <div class="group card card-body hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div class="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
              <SpeakerWaveIcon class="w-6 h-6 text-green-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Audio Synchronization</h3>
            <p class="text-gray-600 mb-4">
              Real-time highlighting follows audio playback. Click sentences to jump to specific times.
            </p>
            <div class="flex items-center text-green-600 text-sm font-medium">
              Try it now <ArrowRightIcon class="ml-1 w-4 h-4" />
            </div>
          </div>

          <!-- 📊 词频分析功能 -->
          <div class="group card card-body hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div class="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
              <ChartBarIcon class="w-6 h-6 text-purple-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Word Analysis</h3>
            <p class="text-gray-600 mb-4">
              Advanced frequency analysis across all articles with intelligent search patterns.
            </p>
            <div class="flex items-center text-purple-600 text-sm font-medium">
              Explore data <ArrowRightIcon class="ml-1 w-4 h-4" />
            </div>
          </div>

          <!-- 🏆 进度跟踪功能 -->
          <div class="group card card-body hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div class="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
              <TrophyIcon class="w-6 h-6 text-orange-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Progress Tracking</h3>
            <p class="text-gray-600 mb-4">
              Detailed analytics on your learning journey with personalized insights and goals.
            </p>
            <div class="flex items-center text-orange-600 text-sm font-medium">
              View progress <ArrowRightIcon class="ml-1 w-4 h-4" />
            </div>
          </div>

          <!-- 📱 离线学习功能 -->
          <div class="group card card-body hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div class="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
              <CloudArrowDownIcon class="w-6 h-6 text-blue-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">Offline Learning</h3>
            <p class="text-gray-600 mb-4">
              Download content for offline study. Learn anywhere, anytime without internet.
            </p>
            <div class="flex items-center text-blue-600 text-sm font-medium">
              Download app <ArrowRightIcon class="ml-1 w-4 h-4" />
            </div>
          </div>

          <!-- 🤖 AI洞察功能 -->
          <div class="group card card-body hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
            <div class="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-pink-200 transition-colors">
              <CpuChipIcon class="w-6 h-6 text-pink-600" />
            </div>
            <h3 class="text-xl font-semibold text-gray-900 mb-2">AI-Powered Insights</h3>
            <p class="text-gray-600 mb-4">
              Personalized recommendations and difficulty assessment based on your learning patterns.
            </p>
            <div class="flex items-center text-pink-600 text-sm font-medium">
              Get insights <ArrowRightIcon class="ml-1 w-4 h-4" />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 💰 Pricing Section - 定价方案展示 -->
    <section class="py-24 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- 📋 区域标题 -->
        <div class="text-center mb-16">
          <h2 class="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Choose Your Learning Plan
          </h2>
          <p class="text-xl text-gray-600 max-w-2xl mx-auto">
            Start free and upgrade when you're ready for advanced features
          </p>
        </div>

        <!-- 💳 定价卡片 - 免费版vs专业版 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          <!-- 🆓 免费版定价卡片 -->
          <PricingCard
            plan="free"
            title="Free Plan"
            subtitle="Perfect for getting started"
            :price="0"
            :features="[
              '5 articles per month',
              'Basic word definitions',
              'Paragraph-level audio sync',
              'Intelligent word search',
              'Basic progress tracking'
            ]"
            cta-text="Start Free"
            :is-popular="false"
            @select="handlePlanSelect"
          />

          <!-- 💎 专业版定价卡片 -->
          <PricingCard
            plan="pro"
            title="Pro Plan"
            subtitle="For serious learners"
            :price="9.99"
            :features="[
              'Unlimited articles',
              'Advanced contextual definitions',
              'Sentence-level audio sync',
              'Advanced word analysis',
              'Cross-article search',
              'Export capabilities',
              'Detailed analytics',
              'Priority support'
            ]"
            cta-text="Upgrade to Pro"
            :is-popular="true"
            @select="handlePlanSelect"
          />
        </div>

        <!-- 📊 功能对比展开按钮 -->
        <div class="mt-16 text-center">
          <button
            @click="showComparison = !showComparison"
            class="text-primary-600 hover:text-primary-700 font-medium"
          >
            {{ showComparison ? 'Hide' : 'Show' }} detailed comparison
            <ChevronDownIcon 
              class="ml-1 w-4 h-4 inline transform transition-transform"
              :class="{ 'rotate-180': showComparison }"
            />
          </button>
        </div>

        <!-- 📋 详细功能对比表 - 可展开 -->
        <Transition name="slide-down">
          <div v-if="showComparison" class="mt-8 overflow-hidden rounded-lg border border-gray-200">
            <table class="w-full">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Feature
                  </th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Free
                  </th>
                  <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pro
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <!-- 功能对比行循环 -->
                <tr v-for="feature in comparisonFeatures" :key="feature.name">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ feature.name }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <component :is="feature.free.icon" :class="feature.free.class" />
                    <span v-if="feature.free.text" class="ml-1">{{ feature.free.text }}</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                    <component :is="feature.pro.icon" :class="feature.pro.class" />
                    <span v-if="feature.pro.text" class="ml-1">{{ feature.pro.text }}</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Transition>
      </div>
    </section>

    <!-- 🎯 CTA Section - 最终行动召唤 -->
    <section class="py-24 bg-primary-600">
      <div class="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 class="text-3xl sm:text-4xl font-bold text-white mb-6">
          Ready to Transform Your English Learning?
        </h2>
        <p class="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
          Join thousands of learners who have already improved their English with our AI-powered platform.
        </p>
        <!-- 根据登录状态显示不同按钮 -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <router-link
            v-if="!authStore.isAuthenticated"
            to="/login"
            class="btn-primary bg-white text-primary-600 hover:bg-gray-50 text-lg px-8 py-4 shadow-xl"
          >
            Get Started Free
          </router-link>
          <router-link
            v-else
            to="/dashboard"
            class="btn-primary bg-white text-primary-600 hover:bg-gray-50 text-lg px-8 py-4 shadow-xl"
          >
            Go to Dashboard
          </router-link>
          <button class="btn-outline border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-4">
            Watch Demo
          </button>
        </div>
      </div>
    </section>

    <!-- 🎯 订阅升级弹窗 - 处理用户选择订阅计划 -->
    <SubscriptionModal
      :is-open="showSubscriptionModal"
      :selected-plan="selectedPlan"
      @close="showSubscriptionModal = false"
      @success="handleSubscriptionSuccess"
    />
  </div>
</template>

<script setup lang="ts">
/**
 * 📝 组件逻辑
 * 
 * 🎯 主要功能:
 * - 展示产品特色和营销信息
 * - 处理用户注册/登录跳转
 * - 管理订阅计划选择和升级流程
 * - 功能对比表的展开/收起
 */

import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useSubscriptionStore } from '@/stores/subscription'
import PricingCard from '@/components/subscription/PricingCard.vue'
import SubscriptionModal from '@/components/subscription/SubscriptionModal.vue'

// 🔗 Heroicons图标组件导入
import {
  ArrowRightIcon,
  BookOpenIcon,
  SpeakerWaveIcon,
  ChartBarIcon,
  TrophyIcon,
  CloudArrowDownIcon,
  CpuChipIcon,
  StarIcon,
  ChevronDownIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'

// 📊 Store状态管理
const authStore = useAuthStore()
const subscriptionStore = useSubscriptionStore()

// 🎯 DOM引用 - 用于平滑滚动
const featuresSection = ref<HTMLElement>()

// 📋 组件状态
const showComparison = ref(false) // 功能对比表显示状态
const showSubscriptionModal = ref(false) // 订阅弹窗显示状态
const selectedPlan = ref<string>('') // 用户选择的订阅计划

// 📊 功能对比数据配置
const comparisonFeatures = [
  {
    name: 'Monthly Articles',
    free: { icon: 'span', text: '5', class: 'text-gray-600' },
    pro: { icon: 'span', text: 'Unlimited', class: 'text-green-600 font-medium' }
  },
  {
    name: 'Dictionary Level',
    free: { icon: 'span', text: 'Basic', class: 'text-gray-600' },
    pro: { icon: 'span', text: 'Advanced', class: 'text-green-600 font-medium' }
  },
  {
    name: 'Audio Sync Precision',
    free: { icon: 'span', text: 'Paragraph', class: 'text-gray-600' },
    pro: { icon: 'span', text: 'Sentence', class: 'text-green-600 font-medium' }
  },
  {
    name: 'Cross-Article Search',
    free: { icon: XMarkIcon, class: 'w-5 h-5 text-red-500' },
    pro: { icon: CheckIcon, class: 'w-5 h-5 text-green-500' }
  },
  {
    name: 'Export Features',
    free: { icon: XMarkIcon, class: 'w-5 h-5 text-red-500' },
    pro: { icon: CheckIcon, class: 'w-5 h-5 text-green-500' }
  },
  {
    name: 'Analytics',
    free: { icon: 'span', text: 'Basic', class: 'text-gray-600' },
    pro: { icon: 'span', text: 'Advanced', class: 'text-green-600 font-medium' }
  }
]

/**
 * 🎯 平滑滚动到功能区域
 */
const scrollToFeatures = () => {
  featuresSection.value?.scrollIntoView({ behavior: 'smooth' })
}

/**
 * 💳 处理订阅计划选择
 * @param plan - 选择的订阅计划 ('free' | 'pro')
 */
const handlePlanSelect = (plan: string) => {
  // 未登录用户需要先登录，携带计划参数
  if (!authStore.isAuthenticated) {
    router.push(`/login?plan=${plan}`)
    return
  }

  // 免费计划无需处理
  if (plan === 'free') {
    return
  }

  // 显示订阅升级弹窗
  selectedPlan.value = plan
  showSubscriptionModal.value = true
}

/**
 * ✅ 处理订阅成功后的操作
 */
const handleSubscriptionSuccess = () => {
  showSubscriptionModal.value = false
  // 跳转到用户仪表板
  router.push('/dashboard')
}
</script>

<style scoped>
/**
 * 🎨 组件样式
 * 
 * 📋 主要样式:
 * - 功能对比表的展开/收起动画
 * - 平滑过渡效果
 */

/* 功能对比表展开/收起动画 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  max-height: 500px;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>