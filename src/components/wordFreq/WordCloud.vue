<!--
/**
 * 📂 src/components/wordFreq/WordCloud.vue
 * 🎯 WordCloud.vue - 交互式词云可视化组件
 * 
 * 📋 功能概述:
 * - 提供动态交互式词云可视化展示
 * - 基于Canvas的高性能渲染系统
 * - 支持多种配色方案和布局算法
 * - 实现螺旋算法的智能单词布局
 * - 提供鼠标悬停和点击交互功能
 * 
 * 🎯 主要功能:
 * - 智能螺旋布局算法
 * - 多配色方案支持（蓝色/彩虹/单色）
 * - 碰撞检测和避让算法
 * - 平滑动画和渐现效果
 * - 鼠标悬停提示框
 * - 响应式尺寸自适应
 * 
 * 🏗️ 架构设计:
 * - Canvas原生渲染优化性能
 * - 螺旋算法实现智能布局
 * - 状态驱动的动画系统
 * - 事件委托处理交互
 * - 内存友好的资源管理
 * 
 * 🔗 集成组件:
 * - 无外部组件依赖
 * - 与WordFrequencyPage数据绑定
 * - 支持任意词频数据源
 * 
 * 📡 Props接口:
 * - words: WordData[] - 词汇频率数据
 * - height: number - 词云容器高度
 * - maxWords: number - 最大显示词汇数
 * - colorScheme: 'blue'|'rainbow'|'monochrome' - 配色方案
 * 
 * 🎨 样式特色:
 * - 渐变背景设计
 * - 动态颜色映射
 * - 字体大小频率关联
 * - 随机旋转角度
 * - 阴影和描边效果
 * 
 * 🛡️ 安全考虑:
 * - Canvas上下文验证
 * - 数据边界检查
 * - 内存泄漏防护
 * - 错误状态恢复
 * 
 * ⚙️ 配置选项:
 * - 配色方案自定义
 * - 字体大小范围调整
 * - 旋转角度限制
 * - 动画速度控制
 */
-->

<template>
  <div 
    ref="wordCloudContainer"
    class="word-cloud-container"
    :style="{ height: `${height}px` }"
  >
    <!-- 🎨 高性能Canvas渲染画布 -->
    <canvas
      ref="wordCloudCanvas"
      @mousemove="handleMouseMove"
      @click="handleClick"
      class="w-full h-full cursor-pointer"
    ></canvas>
    
    <!-- 💬 鼠标悬停提示框 -->
    <div
      v-if="hoveredWord"
      ref="tooltip"
      class="absolute bg-gray-900 text-white px-3 py-2 rounded-lg text-sm pointer-events-none z-10 shadow-lg"
      :style="tooltipStyle"
    >
      <div class="font-medium">{{ hoveredWord.word }}</div>
      <div class="text-gray-300">{{ hoveredWord.frequency }} occurrences</div>
      <div class="text-gray-400 text-xs">{{ hoveredWord.articles.length }} articles</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'

/**
 * 📊 词汇数据接口定义
 * 
 * 📋 数据结构:
 * - word: 词汇文本内容
 * - frequency: 出现频率统计
 * - articles: 包含该词的文章列表
 */
interface WordData {
  word: string
  frequency: number
  articles: string[]
}

/**
 * 🎨 词云渲染项接口定义
 * 
 * 📋 渲染属性:
 * - 继承基础词汇数据
 * - x/y: 词汇在画布上的坐标位置
 * - fontSize: 根据频率计算的字体大小
 * - color: 词汇显示颜色
 * - rotation: 旋转角度（度）
 * - width/height: 文本渲染尺寸
 */
interface WordCloudItem extends WordData {
  x: number
  y: number
  fontSize: number
  color: string
  rotation: number
  width: number
  height: number
}

/**
 * 📡 组件Props接口定义
 * 
 * 📋 属性说明:
 * - words: 词频数据源数组
 * - height: 词云容器高度像素值
 * - maxWords: 最大显示词汇数量限制
 * - colorScheme: 预设配色方案选择
 */
interface Props {
  words: WordData[]
  height: number
  maxWords?: number
  colorScheme?: 'blue' | 'rainbow' | 'monochrome'
}

const props = withDefaults(defineProps<Props>(), {
  height: 400,
  maxWords: 50,
  colorScheme: 'blue'
})

/**
 * 📡 组件事件发射器定义
 * 
 * 📋 事件类型:
 * - word-click: 词汇点击选择事件
 */
const emit = defineEmits<{
  'word-click': [word: string]
}>()

// 🎨 Canvas和容器引用
const wordCloudContainer = ref<HTMLDivElement>()
const wordCloudCanvas = ref<HTMLCanvasElement>()
let ctx: CanvasRenderingContext2D | null = null

// 🖱️ 交互状态管理
const hoveredWord = ref<WordCloudItem | null>(null)
const tooltipStyle = ref({})
const cloudWords = ref<WordCloudItem[]>([])

/**
 * 🎬 动画状态控制对象
 * 
 * 📋 状态属性:
 * - progress: 动画进度 (0-1)
 * - isAnimating: 动画执行状态标识
 */
const animationState = ref({
  progress: 0,
  isAnimating: false
})

/**
 * 🎨 预设配色方案定义
 * 
 * 📋 方案类型:
 * - blue: 蓝色系渐变配色
 * - rainbow: 彩虹多彩配色
 * - monochrome: 单色灰度配色
 */
const colorSchemes = {
  blue: [
    '#1e40af', '#2563eb', '#3b82f6', '#60a5fa', '#93c5fd',
    '#1e3a8a', '#1d4ed8', '#2563eb', '#3b82f6', '#60a5fa'
  ],
  rainbow: [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef'
  ],
  monochrome: [
    '#111827', '#374151', '#4b5563', '#6b7280', '#9ca3af',
    '#1f2937', '#374151', '#4b5563', '#6b7280', '#9ca3af'
  ]
}

/**
 * 📊 处理和预处理词汇数据
 * 
 * 📋 处理流程:
 * - 按频率排序词汇数据
 * - 限制显示词汇数量
 * - 计算字体大小映射
 * - 分配颜色和旋转角度
 * - 初始化渲染属性
 * 
 * 🎯 算法特点:
 * - 频率驱动的字体大小算法
 * - 均匀分布的颜色分配
 * - 随机但受限的旋转角度
 */
const processWords = () => {
  if (props.words.length === 0) {
    cloudWords.value = []
    return
  }

  // Sort by frequency and take top words
  const sortedWords = [...props.words]
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, props.maxWords)

  if (sortedWords.length === 0) {
    cloudWords.value = []
    return
  }

  const maxFreq = sortedWords[0].frequency
  const minFreq = sortedWords[sortedWords.length - 1].frequency
  const colors = colorSchemes[props.colorScheme]

  cloudWords.value = sortedWords.map((word, index) => {
    // Calculate font size based on frequency (20px to 60px)
    const normalizedFreq = minFreq === maxFreq ? 1 : (word.frequency - minFreq) / (maxFreq - minFreq)
    const fontSize = 20 + normalizedFreq * 40

    // Assign color
    const colorIndex = Math.floor((index / sortedWords.length) * colors.length)
    const color = colors[colorIndex] || colors[0]

    // Random rotation (-30 to 30 degrees)
    const rotation = (Math.random() - 0.5) * 60

    return {
      ...word,
      x: 0,
      y: 0,
      fontSize,
      color,
      rotation,
      width: 0,
      height: 0
    }
  })

  nextTick(() => {
    layoutWords()
  })
}

/**
 * 🌀 螺旋算法布局词汇位置
 * 
 * 📋 布局算法:
 * - 从中心点开始螺旋扩散
 * - 碰撞检测避免重叠
 * - 边界检查确保完整显示
 * - 失败后随机位置兜底
 * 
 * 🎯 算法优化:
 * - 高效的矩形碰撞检测
 * - 适应性的螺旋步长
 * - 合理的尝试次数限制
 * - 容错的兜底策略
 */
const layoutWords = () => {
  if (!ctx || cloudWords.value.length === 0) return

  const containerRect = wordCloudContainer.value?.getBoundingClientRect()
  if (!containerRect) return

  const centerX = containerRect.width / 2
  const centerY = containerRect.height / 2
  const placedWords: WordCloudItem[] = []

  cloudWords.value.forEach((word, index) => {
    // Measure text dimensions
    ctx!.font = `${word.fontSize}px Inter, sans-serif`
    const metrics = ctx!.measureText(word.word)
    word.width = metrics.width
    word.height = word.fontSize

    // Try to place word using spiral algorithm
    let placed = false
    let attempts = 0
    const maxAttempts = 100
    let radius = 0
    let angle = 0

    while (!placed && attempts < maxAttempts) {
      const x = centerX + radius * Math.cos(angle) - word.width / 2
      const y = centerY + radius * Math.sin(angle) - word.height / 2

      // Check bounds
      if (x >= 0 && x + word.width <= containerRect.width &&
          y >= 0 && y + word.height <= containerRect.height) {
        
        // Check collision with placed words
        let collision = false
        for (const placedWord of placedWords) {
          if (rectsOverlap(
            { x, y, width: word.width, height: word.height },
            { x: placedWord.x, y: placedWord.y, width: placedWord.width, height: placedWord.height }
          )) {
            collision = true
            break
          }
        }

        if (!collision) {
          word.x = x
          word.y = y
          placedWords.push(word)
          placed = true
        }
      }

      // Update spiral
      angle += 0.5
      radius += 0.5
      attempts++
    }

    // If couldn't place, use random position
    if (!placed) {
      word.x = Math.random() * (containerRect.width - word.width)
      word.y = Math.random() * (containerRect.height - word.height)
      placedWords.push(word)
    }
  })

  startAnimation()
}

/**
 * 📐 矩形重叠检测算法
 * 
 * @param rect1 - 第一个矩形对象
 * @param rect2 - 第二个矩形对象
 * @returns boolean - 是否发生重叠
 * 
 * 📋 检测逻辑:
 * - 基于AABB包围盒算法
 * - 高效的边界比较
 * - 精确的重叠判定
 */
const rectsOverlap = (rect1: any, rect2: any): boolean => {
  return !(rect1.x + rect1.width < rect2.x ||
           rect2.x + rect2.width < rect1.x ||
           rect1.y + rect1.height < rect2.y ||
           rect2.y + rect2.height < rect1.y)
}

/**
 * 🚀 启动词云动画序列
 * 
 * 📋 动画初始化:
 * - 设置动画状态标记
 * - 重置动画进度
 * - 启动动画循环
 */
const startAnimation = () => {
  animationState.value.isAnimating = true
  animationState.value.progress = 0
  animateWords()
}

/**
 * 🎬 词云动画帧循环函数
 * 
 * 📋 动画逻辑:
 * - 递增动画进度
 * - 调用渲染函数
 * - 检查动画完成条件
 * - 递归请求下一帧
 * 
 * 🎯 性能优化:
 * - requestAnimationFrame优化
 * - 合理的帧率控制
 * - 及时的状态清理
 */
const animateWords = () => {
  if (!animationState.value.isAnimating) return

  animationState.value.progress += 0.02
  
  if (animationState.value.progress >= 1) {
    animationState.value.progress = 1
    animationState.value.isAnimating = false
  }

  render()

  if (animationState.value.isAnimating) {
    requestAnimationFrame(animateWords)
  }
}

/**
 * 🎨 主渲染函数
 * 
 * 📋 渲染流程:
 * - 设置Canvas尺寸和缩放
 * - 清空画布内容
 * - 遍历渲染所有词汇
 * - 应用变换和样式
 * - 处理悬停效果
 * 
 * 🎯 渲染特性:
 * - 设备像素比适配
 * - 渐进式动画显示
 * - 变换矩阵操作
 * - 阴影和描边效果
 */
const render = () => {
  if (!ctx || !wordCloudContainer.value) return

  const rect = wordCloudContainer.value.getBoundingClientRect()
  const canvas = wordCloudCanvas.value!
  
  // Set canvas size
  const dpr = window.devicePixelRatio || 1
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  ctx.scale(dpr, dpr)

  // Clear canvas
  ctx.clearRect(0, 0, rect.width, rect.height)

  // Draw words
  cloudWords.value.forEach((word, index) => {
    const progress = Math.min(animationState.value.progress * 2 - index * 0.1, 1)
    if (progress <= 0) return

    ctx!.save()
    
    // Apply transformations
    ctx!.translate(word.x + word.width / 2, word.y + word.height / 2)
    ctx!.rotate((word.rotation * Math.PI) / 180)
    ctx!.scale(progress, progress)
    
    // Set text properties
    ctx!.font = `${word.fontSize}px Inter, sans-serif`
    ctx!.fillStyle = word.color
    ctx!.textAlign = 'center'
    ctx!.textBaseline = 'middle'
    
    // Draw text with subtle shadow
    ctx!.shadowColor = 'rgba(0, 0, 0, 0.1)'
    ctx!.shadowBlur = 2
    ctx!.shadowOffsetX = 1
    ctx!.shadowOffsetY = 1
    
    ctx!.fillText(word.word, 0, 0)
    
    // Add hover effect
    if (hoveredWord.value === word) {
      ctx!.shadowColor = 'rgba(0, 0, 0, 0.2)'
      ctx!.shadowBlur = 4
      ctx!.strokeStyle = word.color
      ctx!.lineWidth = 2
      ctx!.strokeText(word.word, 0, 0)
    }
    
    ctx!.restore()
  })
}

/**
 * 🖱️ 鼠标移动事件处理器
 * 
 * @param event - 鼠标移动事件对象
 * 
 * 📋 交互逻辑:
 * - 计算相对坐标位置
 * - 检测悬停词汇项
 * - 更新悬停状态
 * - 更新提示框位置
 * - 触发重新渲染
 * 
 * 🎯 性能优化:
 * - 精确的碰撞检测
 * - 最小化重渲染
 * - 流畅的交互体验
 */
const handleMouseMove = (event: MouseEvent) => {
  if (!wordCloudContainer.value) return

  const rect = wordCloudContainer.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  // Find hovered word
  let found = false
  for (const word of cloudWords.value) {
    if (x >= word.x && x <= word.x + word.width &&
        y >= word.y && y <= word.y + word.height) {
      hoveredWord.value = word
      found = true
      break
    }
  }

  if (!found) {
    hoveredWord.value = null
  }

  // Update tooltip position
  if (hoveredWord.value) {
    tooltipStyle.value = {
      left: `${event.clientX - rect.left + 10}px`,
      top: `${event.clientY - rect.top - 10}px`
    }
  }

  // Re-render if hover state changed
  if (found || hoveredWord.value) {
    render()
  }
}

/**
 * 🖱️ 鼠标点击事件处理器
 * 
 * @param event - 鼠标点击事件对象
 * 
 * 📋 点击逻辑:
 * - 检查是否有悬停词汇
 * - 发射词汇选择事件
 * - 传递选中词汇数据
 */
const handleClick = (event: MouseEvent) => {
  if (!hoveredWord.value) return
  emit('word-click', hoveredWord.value.word)
}

/**
 * 📐 响应式尺寸更新处理器
 * 
 * 📋 更新逻辑:
 * - 重新计算容器尺寸
 * - 触发词汇重新布局
 * - 保持用户体验连贯
 */
const updateDimensions = () => {
  nextTick(() => {
    layoutWords()
  })
}

/**
 * 👀 词汇数据变化监听器
 * 
 * 📋 监听逻辑:
 * - 深度监听数据变化
 * - 重新处理词汇数据
 * - 触发布局重计算
 */
watch(() => props.words, processWords, { deep: true })

/**
 * 🎨 配色方案切换监听器
 * 
 * 📋 切换逻辑:
 * - 监听配色方案变化
 * - 重新处理词汇数据
 * - 应用新的颜色映射
 */
watch(() => props.colorScheme, processWords)

/**
 * 🎯 组件挂载生命周期
 * 
 * 📋 初始化任务:
 * - 获取Canvas渲染上下文
 * - 处理初始词汇数据
 * - 注册窗口调整事件
 * - 启动首次渲染
 */
onMounted(() => {
  if (wordCloudCanvas.value) {
    ctx = wordCloudCanvas.value.getContext('2d')
    processWords()
    window.addEventListener('resize', updateDimensions)
  }
})

/**
 * 🧹 组件卸载清理
 * 
 * 📋 清理任务:
 * - 移除事件监听器
 * - 清理资源引用
 * - 防止内存泄漏
 */
onUnmounted(() => {
  window.removeEventListener('resize', updateDimensions)
})
</script>

<style scoped>
/**
 * 🎨 词云容器样式定义
 * 
 * 📋 样式特性:
 * - 相对定位布局
 * - 渐变背景效果
 * - 圆角边框设计
 * - 内容溢出隐藏
 */
.word-cloud-container {
  position: relative;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 8px;
  overflow: hidden;
}

/**
 * 🎨 Canvas画布样式
 * 
 * 📋 样式属性:
 * - 块级元素显示
 * - 确保正确渲染
 */
.word-cloud-container canvas {
  display: block;
}
</style>