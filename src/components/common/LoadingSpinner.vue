<!--
⚡ 第16个文件：src/components/common/LoadingSpinner.vue

📁 文件位置: src/components/common/LoadingSpinner.vue
🎯 核心功能: 通用加载组件，支持多种尺寸和样式的加载动画
🔧 关键作用: 提供统一的加载体验、支持无障碍访问、动画性能优化

📋 组件模块说明：
- 多尺寸支持: small、medium、large三种规格
- 自定义样式: 可配置颜色、文本、进度点
- 无障碍优化: 支持减少动画的用户偏好
- 性能优化: CSS动画替代JS动画，减少重绘
- 灵活布局: 支持全屏和内联两种显示模式
-->

<template>
  <div class="flex flex-col items-center justify-center" :class="containerClasses">
    <!-- Spinner -->
    <!-- 旋转加载器 -->
    <div class="relative">
      <div 
        class="animate-spin rounded-full border-solid"
        :class="spinnerClasses"
        :style="{ borderTopColor: color, borderRightColor: color }"
      ></div>
      
      <!-- Inner dot for large spinner -->
      <!-- 大尺寸加载器的内部装饰点 -->
      <div 
        v-if="size === 'large'"
        class="absolute inset-0 m-auto w-2 h-2 rounded-full animate-pulse"
        :style="{ backgroundColor: color }"
      ></div>
    </div>

    <!-- Loading Text -->
    <!-- 加载提示文本 -->
    <div 
      v-if="text && size !== 'small'"
      class="mt-3 text-center"
      :class="textClasses"
    >
      {{ text }}
    </div>

    <!-- Progress Dots -->
    <!-- 进度指示点（仅大尺寸显示） -->
    <div 
      v-if="showDots && size === 'large'"
      class="flex space-x-1 mt-4"
    >
      <div
        v-for="i in 3"
        :key="i"
        class="w-2 h-2 rounded-full animate-bounce"
        :style="{ 
          backgroundColor: color,
          animationDelay: `${(i - 1) * 0.1}s`
        }"
      ></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'small' | 'medium' | 'large'  // 加载器尺寸
  color?: string                        // 主色调
  text?: string                         // 加载提示文本
  showDots?: boolean                    // 是否显示进度点
  fullScreen?: boolean                  // 是否全屏显示
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  color: '#3b82f6', // primary-500
  text: '',
  showDots: false,
  fullScreen: false
})

// 容器样式计算
const containerClasses = computed(() => {
  const classes = []
  
  if (props.fullScreen) {
    classes.push('min-h-screen')
  }
  
  return classes.join(' ')
})

// 加载器样式计算
const spinnerClasses = computed(() => {
  const classes = ['border-2', 'border-gray-200']
  
  switch (props.size) {
    case 'small':
      classes.push('w-4', 'h-4')
      break
    case 'medium':
      classes.push('w-8', 'h-8')
      break
    case 'large':
      classes.push('w-12', 'h-12', 'border-4')
      break
  }
  
  return classes.join(' ')
})

// 文本样式计算
const textClasses = computed(() => {
  const classes = ['text-gray-600', 'font-medium']
  
  switch (props.size) {
    case 'medium':
      classes.push('text-sm')
      break
    case 'large':
      classes.push('text-base')
      break
  }
  
  return classes.join(' ')
})
</script>

<style scoped>
/* Custom animations */
/* 自定义动画定义 */
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes bounce {
  0%, 80%, 100% {
    transform: scale(0);
  }
  40% {
    transform: scale(1);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

.animate-bounce {
  animation: bounce 1.4s ease-in-out infinite both;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

/* Spinner variants */
/* 加载器变体样式 */
.spinner-variant-dots::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 4px;
  height: 4px;
  background-color: currentColor;
  border-radius: 50%;
  animation: pulse 1.5s ease-in-out infinite;
}

/* Loading states */
/* 加载状态动画 */
.loading-fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Accessibility improvements */
/* 无障碍访问优化 */
@media (prefers-reduced-motion: reduce) {
  .animate-spin {
    animation-duration: 2s;
  }
  
  .animate-bounce {
    animation: none;
    transform: scale(1);
  }
  
  .animate-pulse {
    animation: none;
    opacity: 1;
  }
}

/* High contrast mode */
/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .border-gray-200 {
    border-color: #000;
  }
}

/* Dark mode support (for future use) */
/* 深色模式支持（预留） */
@media (prefers-color-scheme: dark) {
  .border-gray-200 {
    border-color: #374151;
  }
  
  .text-gray-600 {
    color: #9ca3af;
  }
}
</style>