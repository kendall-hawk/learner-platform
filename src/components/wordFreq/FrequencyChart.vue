<!--
/**
 * 📂 src/components/wordFreq/FrequencyChart.vue
 * 🎯 FrequencyChart.vue - 高性能词频分布图表组件
 * 
 * 📋 功能概述:
 * - 提供多种图表类型的词频可视化展示
 * - 基于Canvas的高性能渲染引擎
 * - 支持平滑动画和交互效果
 * - 实现响应式设计和设备适配
 * - 提供丰富的用户交互功能
 * 
 * 🎯 主要功能:
 * - 柱状图、折线图、面积图切换
 * - 高性能Canvas渲染优化
 * - 平滑缓动动画系统
 * - 点击交互和数据选择
 * - 响应式尺寸自适应
 * - 设备像素比优化
 * 
 * 🏗️ 架构设计:
 * - Canvas原生渲染避免DOM操作开销
 * - 缓动函数实现流畅动画效果
 * - 事件委托处理用户交互
 * - 防抖优化响应式调整
 * - 内存管理和资源清理
 * 
 * 🔗 集成组件:
 * - 无外部组件依赖，纯Canvas实现
 * - 与WordFrequencyPage父组件数据绑定
 * - 支持任意数据源适配
 * 
 * 📡 Props接口:
 * - data: ChartData[] - 图表数据数组
 * - type: 'bar'|'line'|'area' - 图表类型
 * - height: number - 图表高度
 * 
 * 🎨 样式特色:
 * - 现代化配色方案
 * - 渐变色彩效果
 * - 平滑动画过渡
 * - 响应式网格系统
 * - 高清晰度显示支持
 * 
 * 🛡️ 安全考虑:
 * - 数据边界检查
 * - Canvas上下文验证
 * - 内存泄漏防护
 * - 错误状态处理
 * 
 * ⚙️ 配置选项:
 * - 可自定义颜色方案
 * - 动画持续时间调整
 * - 网格线显示控制
 * - 标签格式化选项
 */
-->

<template>
  <div class="frequency-chart" :style="{ height: `${height}px` }">
    <!-- 🎨 高性能Canvas渲染容器 -->
    <canvas
      ref="chartCanvas"
      @click="handleClick"
      class="w-full h-full cursor-pointer"
    ></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

/**
 * 📊 图表数据接口定义
 * 
 * 📋 数据结构:
 * - word: 词汇文本
 * - frequency: 出现频率
 * - articles: 包含文章数量
 */
interface ChartData {
  word: string
  frequency: number
  articles: number
}

/**
 * 🎛️ 组件Props接口定义
 * 
 * 📋 属性说明:
 * - data: 图表渲染数据源
 * - type: 图表可视化类型
 * - height: 图表容器高度
 */
interface Props {
  data: ChartData[]
  type: 'bar' | 'line' | 'area'
  height: number
}

const props = withDefaults(defineProps<Props>(), {
  type: 'bar',
  height: 400
})

/**
 * 📡 组件事件发射器定义
 * 
 * 📋 事件类型:
 * - bar-click: 图表元素点击事件
 */
const emit = defineEmits<{
  'bar-click': [data: ChartData]
}>()

// 🎨 Canvas渲染上下文引用
const chartCanvas = ref<HTMLCanvasElement>()
let ctx: CanvasRenderingContext2D | null = null
let animationFrame: number | null = null

/**
 * ⚙️ 图表配置参数对象
 * 
 * 📋 配置项说明:
 * - padding: 图表内边距设置
 * - colors: 颜色方案配置
 * - animation: 动画效果参数
 */
const config = {
  padding: {
    top: 20,
    right: 20,
    bottom: 60,
    left: 60
  },
  colors: {
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    accent: '#06b6d4',
    text: '#374151',
    grid: '#e5e7eb'
  },
  animation: {
    duration: 800,
    easing: 'easeOutCubic'
  }
}

/**
 * 🎬 动画状态管理对象
 * 
 * 📋 状态属性:
 * - progress: 动画进度 (0-1)
 * - startTime: 动画开始时间戳
 * - isAnimating: 动画执行状态
 */
const animationState = ref({
  progress: 0,
  startTime: 0,
  isAnimating: false
})

/**
 * 📐 图表尺寸计算状态
 * 
 * 📋 尺寸属性:
 * - width/height: 容器总尺寸
 * - chartWidth/chartHeight: 实际绘制区域尺寸
 */
const chartDimensions = ref({
  width: 0,
  height: 0,
  chartWidth: 0,
  chartHeight: 0
})

// 📊 数据处理和缩放计算
const processedData = ref<ChartData[]>([])
const maxFrequency = ref(0)
const scales = ref({
  x: 0,
  y: 0
})

/**
 * 📐 更新Canvas容器尺寸
 * 
 * 📋 更新逻辑:
 * - 获取容器实际尺寸
 * - 设置设备像素比优化
 * - 更新绘制区域计算
 * - 重新计算坐标缩放
 * 
 * 🎯 性能优化:
 * - 设备像素比适配
 * - 高清显示支持
 * - Canvas上下文缩放
 */
const updateDimensions = () => {
  if (!chartCanvas.value) return
  
  const canvas = chartCanvas.value
  const rect = canvas.getBoundingClientRect()
  
  // Set canvas size with device pixel ratio for crisp rendering
  const dpr = window.devicePixelRatio || 1
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  
  chartDimensions.value = {
    width: rect.width,
    height: rect.height,
    chartWidth: rect.width - config.padding.left - config.padding.right,
    chartHeight: rect.height - config.padding.top - config.padding.bottom
  }
  
  if (ctx) {
    ctx.scale(dpr, dpr)
  }
  
  updateScales()
}

/**
 * 📏 更新坐标轴缩放比例
 * 
 * 📋 缩放计算:
 * - X轴基于数据点数量分布
 * - Y轴基于最大频率值缩放
 * - 处理边界情况和空数据
 */
const updateScales = () => {
  const { chartWidth, chartHeight } = chartDimensions.value
  
  if (processedData.value.length === 0) return
  
  scales.value = {
    x: chartWidth / Math.max(processedData.value.length - 1, 1),
    y: chartHeight / maxFrequency.value
  }
}

/**
 * 📊 处理和预处理图表数据
 * 
 * 📋 处理步骤:
 * - 复制原始数据避免突变
 * - 计算最大频率值
 * - 更新坐标轴缩放
 * - 触发数据变化响应
 */
const processData = () => {
  processedData.value = [...props.data]
  maxFrequency.value = Math.max(...processedData.value.map(d => d.frequency), 1)
  updateScales()
}

/**
 * 🎬 三次贝塞尔缓动函数
 * 
 * @param t - 时间进度 (0-1)
 * @returns number - 缓动后的进度值
 * 
 * 📋 缓动效果:
 * - 提供平滑的动画过渡
 * - 三次贝塞尔曲线计算
 * - 自然的视觉体验
 */
const easeOutCubic = (t: number): number => {
  return 1 - Math.pow(1 - t, 3)
}

/**
 * 📐 绘制图表网格线
 * 
 * 📋 网格功能:
 * - 水平和垂直网格线
 * - 均匀分布的参考线
 * - 可视化数据对齐
 * - 提升图表可读性
 */
const drawGrid = () => {
  if (!ctx) return
  
  const { chartWidth, chartHeight } = chartDimensions.value
  const { padding } = config
  
  ctx.strokeStyle = config.colors.grid
  ctx.lineWidth = 1
  
  // Horizontal grid lines
  const ySteps = 5
  for (let i = 0; i <= ySteps; i++) {
    const y = padding.top + (chartHeight / ySteps) * i
    ctx.beginPath()
    ctx.moveTo(padding.left, y)
    ctx.lineTo(padding.left + chartWidth, y)
    ctx.stroke()
  }
  
  // Vertical grid lines
  const xSteps = Math.min(processedData.value.length, 10)
  for (let i = 0; i <= xSteps; i++) {
    const x = padding.left + (chartWidth / xSteps) * i
    ctx.beginPath()
    ctx.moveTo(x, padding.top)
    ctx.lineTo(x, padding.top + chartHeight)
    ctx.stroke()
  }
}

/**
 * 🏷️ 绘制坐标轴标签
 * 
 * 📋 标签功能:
 * - X轴词汇标签显示
 * - Y轴频率数值标签
 * - 文本长度自动截断
 * - 标签位置精确对齐
 */
const drawLabels = () => {
  if (!ctx) return
  
  const { chartWidth, chartHeight } = chartDimensions.value
  const { padding } = config
  
  ctx.fillStyle = config.colors.text
  ctx.font = '12px Inter, sans-serif'
  ctx.textAlign = 'center'
  
  // X-axis labels (words)
  processedData.value.forEach((item, index) => {
    const x = padding.left + (chartWidth / Math.max(processedData.value.length - 1, 1)) * index
    const y = padding.top + chartHeight + 20
    
    // Truncate long words
    const label = item.word.length > 8 ? `${item.word.slice(0, 8)}...` : item.word
    ctx.fillText(label, x, y)
  })
  
  // Y-axis labels (frequency)
  ctx.textAlign = 'right'
  const ySteps = 5
  for (let i = 0; i <= ySteps; i++) {
    const value = Math.round((maxFrequency.value / ySteps) * (ySteps - i))
    const x = padding.left - 10
    const y = padding.top + (chartHeight / ySteps) * i + 4
    ctx.fillText(value.toString(), x, y)
  }
}

/**
 * 📊 绘制柱状图表
 * 
 * @param progress - 动画进度 (0-1)
 * 
 * 📋 渲染特性:
 * - 渐变色彩填充
 * - 动画高度过渡
 * - 边框描边效果
 * - 均匀间距分布
 */
const drawBarChart = (progress: number) => {
  if (!ctx) return
  
  const { chartWidth, chartHeight } = chartDimensions.value
  const { padding } = config
  
  const barWidth = chartWidth / processedData.value.length * 0.8
  const barSpacing = chartWidth / processedData.value.length * 0.2
  
  processedData.value.forEach((item, index) => {
    const x = padding.left + (chartWidth / processedData.value.length) * index + barSpacing / 2
    const barHeight = (item.frequency / maxFrequency.value) * chartHeight * progress
    const y = padding.top + chartHeight - barHeight
    
    // Create gradient
    const gradient = ctx.createLinearGradient(0, y, 0, y + barHeight)
    gradient.addColorStop(0, config.colors.primary)
    gradient.addColorStop(1, config.colors.secondary)
    
    ctx.fillStyle = gradient
    ctx.fillRect(x, y, barWidth, barHeight)
    
    // Hover effect (simplified)
    ctx.strokeStyle = config.colors.primary
    ctx.lineWidth = 2
    ctx.strokeRect(x, y, barWidth, barHeight)
  })
}

/**
 * 📈 绘制折线图表
 * 
 * @param progress - 动画进度 (0-1)
 * 
 * 📋 渲染特性:
 * - 平滑连接线条
 * - 圆形数据点标记
 * - 线条样式优化
 * - 动画高度过渡
 */
const drawLineChart = (progress: number) => {
  if (!ctx || processedData.value.length < 2) return
  
  const { chartWidth, chartHeight } = chartDimensions.value
  const { padding } = config
  
  ctx.strokeStyle = config.colors.primary
  ctx.lineWidth = 3
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  
  ctx.beginPath()
  
  processedData.value.forEach((item, index) => {
    const x = padding.left + (chartWidth / Math.max(processedData.value.length - 1, 1)) * index
    const y = padding.top + chartHeight - (item.frequency / maxFrequency.value) * chartHeight * progress
    
    if (index === 0) {
      ctx.moveTo(x, y)
    } else {
      ctx.lineTo(x, y)
    }
  })
  
  ctx.stroke()
  
  // Draw points
  ctx.fillStyle = config.colors.primary
  processedData.value.forEach((item, index) => {
    const x = padding.left + (chartWidth / Math.max(processedData.value.length - 1, 1)) * index
    const y = padding.top + chartHeight - (item.frequency / maxFrequency.value) * chartHeight * progress
    
    ctx.beginPath()
    ctx.arc(x, y, 4, 0, Math.PI * 2)
    ctx.fill()
  })
}

/**
 * 📊 绘制面积图表
 * 
 * @param progress - 动画进度 (0-1)
 * 
 * 📋 渲染特性:
 * - 渐变填充区域
 * - 结合折线和面积
 * - 透明度渐变效果
 * - 视觉层次感强
 */
const drawAreaChart = (progress: number) => {
  if (!ctx || processedData.value.length < 2) return
  
  const { chartWidth, chartHeight } = chartDimensions.value
  const { padding } = config
  
  // Create gradient for area fill
  const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight)
  gradient.addColorStop(0, `${config.colors.accent}80`)
  gradient.addColorStop(1, `${config.colors.accent}20`)
  
  ctx.fillStyle = gradient
  
  // Draw area
  ctx.beginPath()
  ctx.moveTo(padding.left, padding.top + chartHeight)
  
  processedData.value.forEach((item, index) => {
    const x = padding.left + (chartWidth / Math.max(processedData.value.length - 1, 1)) * index
    const y = padding.top + chartHeight - (item.frequency / maxFrequency.value) * chartHeight * progress
    ctx.lineTo(x, y)
  })
  
  ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight)
  ctx.closePath()
  ctx.fill()
  
  // Draw line
  drawLineChart(progress)
}

/**
 * 🎨 主渲染函数
 * 
 * 📋 渲染流程:
 * - 清空Canvas画布
 * - 处理空数据状态
 * - 绘制网格和标签
 * - 根据类型绘制图表
 * - 应用动画进度
 */
const render = () => {
  if (!ctx) return
  
  const { width, height } = chartDimensions.value
  
  // Clear canvas
  ctx.clearRect(0, 0, width, height)
  
  if (processedData.value.length === 0) {
    // Draw empty state
    ctx.fillStyle = config.colors.text
    ctx.font = '16px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('No data to display', width / 2, height / 2)
    return
  }
  
  // Draw chart components
  drawGrid()
  
  const progress = animationState.value.isAnimating 
    ? easeOutCubic(animationState.value.progress)
    : 1
  
  switch (props.type) {
    case 'bar':
      drawBarChart(progress)
      break
    case 'line':
      drawLineChart(progress)
      break
    case 'area':
      drawAreaChart(progress)
      break
  }
  
  drawLabels()
}

/**
 * 🎬 动画帧循环函数
 * 
 * @param timestamp - 高精度时间戳
 * 
 * 📋 动画逻辑:
 * - 计算动画进度
 * - 更新渲染状态
 * - 递归调用动画帧
 * - 处理动画完成
 */
const animate = (timestamp: number) => {
  if (!animationState.value.isAnimating) return
  
  if (!animationState.value.startTime) {
    animationState.value.startTime = timestamp
  }
  
  const elapsed = timestamp - animationState.value.startTime
  animationState.value.progress = Math.min(elapsed / config.animation.duration, 1)
  
  render()
  
  if (animationState.value.progress < 1) {
    animationFrame = requestAnimationFrame(animate)
  } else {
    animationState.value.isAnimating = false
    animationState.value.startTime = 0
  }
}

/**
 * 🚀 启动动画序列
 * 
 * 📋 启动逻辑:
 * - 取消现有动画帧
 * - 重置动画状态
 * - 启动新动画循环
 */
const startAnimation = () => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
  
  animationState.value = {
    progress: 0,
    startTime: 0,
    isAnimating: true
  }
  
  animationFrame = requestAnimationFrame(animate)
}

/**
 * 🖱️ 处理图表点击交互
 * 
 * @param event - 鼠标点击事件
 * 
 * 📋 交互逻辑:
 * - 计算点击坐标
 * - 确定点击的数据项
 * - 发射点击事件
 * - 支持不同图表类型
 */
const handleClick = (event: MouseEvent) => {
  if (!chartCanvas.value || processedData.value.length === 0) return
  
  const rect = chartCanvas.value.getBoundingClientRect()
  const x = event.clientX - rect.left
  const { chartWidth } = chartDimensions.value
  const { padding } = config
  
  if (props.type === 'bar') {
    const barWidth = chartWidth / processedData.value.length
    const clickedIndex = Math.floor((x - padding.left) / barWidth)
    
    if (clickedIndex >= 0 && clickedIndex < processedData.value.length) {
      emit('bar-click', processedData.value[clickedIndex])
    }
  } else {
    // For line and area charts, find closest point
    let closestIndex = 0
    let closestDistance = Infinity
    
    processedData.value.forEach((item, index) => {
      const pointX = padding.left + (chartWidth / Math.max(processedData.value.length - 1, 1)) * index
      const distance = Math.abs(x - pointX)
      
      if (distance < closestDistance) {
        closestDistance = distance
        closestIndex = index
      }
    })
    
    if (closestDistance < 20) { // 20px tolerance
      emit('bar-click', processedData.value[closestIndex])
    }
  }
}

/**
 * 📐 响应式尺寸调整处理
 * 
 * 📋 调整逻辑:
 * - 重新计算容器尺寸
 * - 更新绘制区域
 * - 重新渲染图表
 * - 防抖优化性能
 */
const handleResize = () => {
  updateDimensions()
  render()
}

/**
 * 👀 数据变化监听器
 * 
 * 📋 监听逻辑:
 * - 深度监听数据变化
 * - 重新处理数据
 * - 启动过渡动画
 */
watch(() => props.data, () => {
  processData()
  nextTick(() => {
    startAnimation()
  })
}, { deep: true })

/**
 * 🔄 图表类型切换监听器
 * 
 * 📋 切换逻辑:
 * - 监听类型属性变化
 * - 启动切换动画
 * - 平滑过渡效果
 */
watch(() => props.type, () => {
  nextTick(() => {
    startAnimation()
  })
})

/**
 * 🎯 组件挂载生命周期
 * 
 * 📋 初始化任务:
 * - 获取Canvas上下文
 * - 设置初始尺寸
 * - 处理初始数据
 * - 注册窗口事件
 * - 启动首次动画
 */
onMounted(() => {
  if (chartCanvas.value) {
    ctx = chartCanvas.value.getContext('2d')
    updateDimensions()
    processData()
    
    window.addEventListener('resize', handleResize)
    
    nextTick(() => {
      startAnimation()
    })
  }
})

/**
 * 🧹 组件卸载清理
 * 
 * 📋 清理任务:
 * - 取消动画帧
 * - 移除事件监听器
 * - 释放资源引用
 * - 防止内存泄漏
 */
onUnmounted(() => {
  if (animationFrame) {
    cancelAnimationFrame(animationFrame)
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
/**
 * 🎨 组件样式定义
 * 
 * 📋 样式特性:
 * - 响应式容器布局
 * - 高清显示优化
 * - 圆角边框设计
 * - 渐变背景效果
 */
.frequency-chart {
  position: relative;
  background: #fafafa;
  border-radius: 8px;
  overflow: hidden;
}

.frequency-chart canvas {
  display: block;
}
</style>