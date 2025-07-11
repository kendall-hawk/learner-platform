<!--
/**8. src/components/subscription/FeatureGate.vue
 * 🚪 FeatureGate.vue - 功能门控组件
 * 
 * 📋 功能概述:
 * - 基于用户订阅等级控制功能访问权限
 * - 根据权限显示内容或升级提示
 * - 支持内容预览模式（模糊显示）
 * - 自定义升级提示信息和样式
 * - 响应式设计，支持多种布局
 * 
 * 🎯 主要功能:
 * - 订阅权限检查和访问控制
 * - 升级提示覆盖层展示
 * - 功能预览模式（模糊效果）
 * - 自定义升级信息和CTA
 * - 功能特性列表展示
 * - 路由跳转和升级引导
 * 
 * 📡 Props:
 * - feature: string - 功能标识符
 * - title?: string - 升级提示标题
 * - description?: string - 升级提示描述
 * - benefits?: string[] - 功能优势列表
 * - ctaText?: string - CTA按钮文本
 * - showPreview?: boolean - 是否显示内容预览
 * - showLearnMore?: boolean - 是否显示了解更多链接
 * 
 * 🎭 Slots:
 * - default: 需要权限保护的内容
 * - fallback: 无权限时的自定义内容
 * 
 * 🔗 依赖功能:
 * - useFeatureAccess: 功能访问权限Hook
 * - 路由跳转到订阅页面
 * 
 * 🎨 样式特色:
 * - 模糊效果预览模式
 * - 覆盖层渐变背景
 * - 锁定图标和星级图标
 * - 响应式布局适配
 */
-->

<template>
  <div>
    <!-- ✅ 有权限时直接显示内容 -->
    <slot v-if="hasAccess" />
    
    <!-- 🎛️ 无权限但有自定义fallback时显示 -->
    <div v-else-if="$slots.fallback">
      <slot name="fallback" />
    </div>
    
    <!-- 🚪 默认权限门控UI -->
    <div v-else class="relative">
      
      <!-- 📱 内容预览模式 - 模糊显示原内容 -->
      <div 
        v-if="showPreview"
        class="filter blur-sm opacity-50 pointer-events-none select-none"
      >
        <slot />
      </div>
      
      <!-- 🎯 升级提示覆盖层 -->
      <div 
        class="absolute inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm"
        :class="{ 'relative': !showPreview }"
      >
        <div class="text-center p-6 max-w-sm">
          
          <!-- 🔒 锁定图标 -->
          <div class="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <LockClosedIcon class="w-8 h-8 text-yellow-600" />
          </div>
          
          <!-- 📝 升级提示标题 -->
          <h3 class="text-lg font-semibold text-gray-900 mb-2">
            {{ title }}
          </h3>
          
          <!-- 📄 升级提示描述 -->
          <p class="text-gray-600 text-sm mb-4">
            {{ description }}
          </p>
          
          <!-- ⭐ 功能优势列表 - 仅有优势时显示 -->
          <div v-if="benefits.length > 0" class="text-left mb-4">
            <div 
              v-for="benefit in benefits" 
              :key="benefit"
              class="flex items-center text-sm text-gray-700 mb-1"
            >
              <StarIcon class="w-4 h-4 text-yellow-500 mr-2 flex-shrink-0" />
              {{ benefit }}
            </div>
          </div>
          
          <!-- 🎯 升级CTA按钮 -->
          <button
            @click="handleUpgrade"
            class="btn-primary w-full mb-2"
          >
            {{ ctaText }}
          </button>
          
          <!-- 📚 了解更多链接 - 可选显示 -->
          <button
            v-if="showLearnMore"
            @click="handleLearnMore"
            class="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            Learn more about Pro features
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 📝 组件逻辑
 * 
 * 🎯 主要功能:
 * - 检查用户功能访问权限
 * - 根据功能类型生成个性化提示信息
 * - 处理升级跳转和用户引导
 * - 管理组件显示状态
 */

import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useFeatureAccess } from '@/composables/useFeatureAccess'
import { LockClosedIcon, StarIcon } from '@heroicons/vue/24/outline'

/**
 * 📡 组件Props定义
 */
interface Props {
  feature: string              // 功能标识符，用于权限检查
  title?: string              // 自定义升级提示标题
  description?: string        // 自定义升级提示描述
  benefits?: string[]         // 自定义功能优势列表
  ctaText?: string           // 自定义CTA按钮文本
  showPreview?: boolean      // 是否显示内容预览（模糊效果）
  showLearnMore?: boolean    // 是否显示了解更多链接
}

/**
 * 🎛️ Props默认值设置
 */
const props = withDefaults(defineProps<Props>(), {
  title: 'Upgrade to Pro',
  description: 'This feature is available with a Pro subscription.',
  benefits: () => [],
  ctaText: 'Upgrade Now',
  showPreview: false,
  showLearnMore: true
})

// 🛠️ Vue Router
const router = useRouter()

// 🔑 功能访问权限Hook
const { canAccess } = useFeatureAccess()

/**
 * ✅ 计算用户是否有当前功能的访问权限
 */
const hasAccess = computed(() => canAccess(props.feature))

/**
 * 📋 功能特定的升级提示信息配置
 * 根据不同功能类型提供个性化的提示内容
 */
const featureMessages = {
  // 📚 无限文章访问
  unlimited_articles: {
    title: 'Unlock Unlimited Articles',
    description: 'Access our full library of English learning content.',
    benefits: ['Read unlimited articles', 'No monthly limits', 'New content weekly']
  },
  // 📖 高级词典功能
  advanced_glossary: {
    title: 'Advanced Dictionary Features',
    description: 'Get contextual definitions and pronunciation guides.',
    benefits: ['Context-aware definitions', 'Audio pronunciations', 'Etymology & word origins']
  },
  // 🎵 句级音频同步
  sentence_audio_sync: {
    title: 'Precise Audio Synchronization',
    description: 'Follow along with sentence-level audio highlighting.',
    benefits: ['Sentence-level precision', 'Better pronunciation practice', 'Improved comprehension']
  },
  // 🔍 跨文章搜索
  cross_article_search: {
    title: 'Advanced Search & Analysis',
    description: 'Search and analyze words across all articles.',
    benefits: ['Cross-article word search', 'Usage pattern analysis', 'Advanced filtering']
  },
  // 📤 导出功能
  export_features: {
    title: 'Export & Sharing',
    description: 'Export articles and progress in multiple formats.',
    benefits: ['PDF & EPUB export', 'Print-friendly formats', 'Share with others']
  },
  // 📊 详细分析
  analytics: {
    title: 'Detailed Analytics',
    description: 'Track your learning progress with advanced insights.',
    benefits: ['Detailed progress reports', 'Learning pattern analysis', 'Personalized recommendations']
  }
}

/**
 * 📝 动态计算当前功能的升级提示信息
 * 优先使用Props传入的自定义信息，否则使用预设配置
 */
const currentMessages = computed(() => {
  const feature = props.feature as keyof typeof featureMessages
  return featureMessages[feature] || {
    title: props.title,
    description: props.description,
    benefits: props.benefits
  }
})

/**
 * 📝 最终显示的标题（Props优先）
 */
const title = computed(() => props.title || currentMessages.value.title)

/**
 * 📝 最终显示的描述（Props优先）
 */
const description = computed(() => props.description || currentMessages.value.description)

/**
 * ⭐ 最终显示的优势列表（Props优先）
 */
const benefits = computed(() => props.benefits.length > 0 ? props.benefits : currentMessages.value.benefits)

/**
 * 🎯 处理升级按钮点击
 * 跳转到订阅页面，携带功能参数用于统计分析
 */
const handleUpgrade = () => {
  router.push(`/subscription?feature=${props.feature}`)
}

/**
 * 📚 处理了解更多按钮点击
 * 跳转到订阅页面的功能介绍部分
 */
const handleLearnMore = () => {
  router.push('/subscription')
}
</script>