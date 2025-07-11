<!--
/**6. src/components/subscription/PricingCard.vue
 * 💳 PricingCard.vue - 定价卡片组件
 * 
 * 📋 功能概述:
 * - 展示订阅计划的定价信息和功能列表
 * - 支持热门标签和当前计划状态显示
 * - 动态CTA按钮状态（选择/管理/当前计划）
 * - 响应式设计，支持悬停效果
 * - 集成订阅状态管理
 * 
 * 🎯 主要功能:
 * - 定价信息展示（价格、周期、标题）
 * - 功能列表展示（带勾选图标）
 * - 热门计划标签显示
 * - 当前订阅状态检测
 * - CTA按钮动态文本和状态
 * - 卡片悬停和选中效果
 * 
 * 📡 Props:
 * - plan: string - 计划标识符 ('free' | 'pro')
 * - title: string - 计划标题
 * - subtitle: string - 计划副标题
 * - price: number - 价格（数字）
 * - features: string[] - 功能列表
 * - ctaText: string - CTA按钮文本
 * - isPopular?: boolean - 是否为热门计划
 * 
 * 🔄 Emits:
 * - select: [plan: string] - 计划选择事件
 * 
 * 🎨 样式特色:
 * - 热门计划特殊边框和标签
 * - 当前计划灰色不可点击状态
 * - 悬停效果和阴影变化
 * - 响应式布局适配
 */
-->

<template>
  <div 
    class="relative bg-white rounded-xl shadow-lg border-2 transition-all duration-300 hover:shadow-xl"
    :class="{ 
      'border-primary-500 ring-2 ring-primary-200': isPopular,
      'border-gray-200 hover:border-primary-300': !isPopular
    }"
  >
    <!-- 🏆 热门标签 - 仅热门计划显示 -->
    <div 
      v-if="isPopular" 
      class="absolute -top-3 left-1/2 transform -translate-x-1/2"
    >
      <span class="bg-primary-600 text-white px-4 py-1 text-sm font-medium rounded-full">
        Most Popular
      </span>
    </div>

    <!-- 📋 卡片内容区域 -->
    <div class="p-8">
      
      <!-- 📝 计划标题区域 -->
      <div class="text-center mb-8">
        <h3 class="text-2xl font-bold text-gray-900 mb-2">{{ title }}</h3>
        <p class="text-gray-600">{{ subtitle }}</p>
      </div>

      <!-- 💰 价格展示区域 -->
      <div class="text-center mb-8">
        <div class="flex items-center justify-center">
          <!-- 价格数字 -->
          <span class="text-5xl font-bold text-gray-900">${{ price }}</span>
          <!-- 计费周期 - 仅付费计划显示 -->
          <span v-if="price > 0" class="text-gray-600 ml-2">/month</span>
        </div>
        <!-- 计费说明 - 仅付费计划显示 -->
        <div v-if="price > 0" class="text-sm text-gray-500 mt-1">
          Billed monthly • Cancel anytime
        </div>
      </div>

      <!-- ✅ 功能列表展示 -->
      <div class="space-y-4 mb-8">
        <div 
          v-for="feature in features" 
          :key="feature"
          class="flex items-start"
        >
          <!-- 勾选图标 -->
          <CheckIcon class="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
          <!-- 功能描述文本 -->
          <span class="text-gray-700">{{ feature }}</span>
        </div>
      </div>

      <!-- 🎯 CTA按钮 - 根据状态显示不同样式和文本 -->
      <button
        @click="handleSelect"
        class="w-full py-3 px-4 text-center font-medium rounded-lg transition-all duration-200"
        :class="buttonClasses"
        :disabled="isCurrentPlan"
      >
        {{ buttonText }}
      </button>

      <!-- ✅ 当前计划指示器 -->
      <div v-if="isCurrentPlan" class="text-center mt-3">
        <span class="text-sm text-green-600 font-medium">
          ✓ Your current plan
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 📝 组件逻辑
 * 
 * 🎯 主要功能:
 * - 检测当前用户订阅状态
 * - 动态计算按钮文本和样式
 * - 处理计划选择事件
 * - 管理组件状态和交互
 */

import { computed } from 'vue'
import { useSubscriptionStore } from '@/stores/subscription'
import { CheckIcon } from '@heroicons/vue/24/outline'

/**
 * 📡 组件Props定义
 */
interface Props {
  plan: string           // 计划标识符 ('free' | 'pro')
  title: string          // 计划标题
  subtitle: string       // 计划副标题描述
  price: number          // 月价格（数字）
  features: string[]     // 功能特性列表
  ctaText: string        // CTA按钮默认文本
  isPopular?: boolean    // 是否为热门推荐计划
}

const props = defineProps<Props>()

/**
 * 🔄 组件Emits定义
 */
const emit = defineEmits<{
  select: [plan: string]  // 计划选择事件，传递plan参数
}>()

// 📊 订阅状态管理
const subscriptionStore = useSubscriptionStore()

/**
 * ✅ 判断是否为用户当前订阅计划
 */
const isCurrentPlan = computed(() => {
  if (props.plan === 'free') {
    // 免费计划：检查用户是否为免费层级
    return subscriptionStore.tier === 'free'
  }
  // 付费计划：检查用户是否为专业层级
  return subscriptionStore.tier === 'pro'
})

/**
 * 📝 动态按钮文本
 * 根据当前计划状态显示不同文本
 */
const buttonText = computed(() => {
  if (isCurrentPlan.value) {
    // 当前计划显示状态文本
    return props.plan === 'free' ? 'Current Plan' : 'Manage Plan'
  }
  // 非当前计划显示CTA文本
  return props.ctaText
})

/**
 * 🎨 动态按钮样式类
 * 根据计划状态和热门程度应用不同样式
 */
const buttonClasses = computed(() => {
  if (isCurrentPlan.value) {
    // 当前计划：灰色不可点击样式
    return 'bg-gray-100 text-gray-600 cursor-not-allowed'
  }
  
  if (props.isPopular) {
    // 热门计划：主色调高亮样式
    return 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl transform hover:scale-105'
  }
  
  // 普通计划：边框样式
  return 'bg-white text-primary-600 border-2 border-primary-600 hover:bg-primary-50'
})

/**
 * 🎯 处理计划选择点击事件
 */
const handleSelect = () => {
  // 当前计划不处理选择事件
  if (isCurrentPlan.value) return
  
  // 发出计划选择事件
  emit('select', props.plan)
}
</script>