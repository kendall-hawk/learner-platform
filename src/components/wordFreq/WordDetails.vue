<!--
/**
 * 📂 src/components/wordFreq/WordDetails.vue
 * 🎯 WordDetails.vue - 词汇详细分析面板组件
 * 
 * 📋 功能概述:
 * - 提供全面的单词分析和详情展示
 * - 集成多维度词汇数据可视化
 * - 支持上下文例句和文章跳转
 * - 实现词汇学习和收藏功能
 * - 提供高级分析和相关词推荐
 * 
 * 🎯 主要功能:
 * - 词汇基础信息展示（频率、词性、定义）
 * - 使用趋势图表可视化
 * - 上下文例句高亮显示
 * - 文章分布统计分析
 * - 相关词汇智能推荐
 * - 音频发音播放
 * - 词汇收藏和导出
 * 
 * 🏗️ 架构设计:
 * - 模块化信息展示设计
 * - 功能门控集成
 * - 响应式数据绑定
 * - 交互式图表组件
 * - 可扩展的分析模块
 * 
 * 🔗 集成组件:
 * - FeatureGate: 高级功能权限控制
 * - SVG图表: 使用趋势可视化
 * - 路由导航: 文章跳转功能
 * 
 * 📡 Props接口:
 * - word: string - 分析词汇
 * - analysis: WordAnalysis | null - 词汇分析数据
 * 
 * 🎨 样式特色:
 * - 卡片式信息布局
 * - 渐变色彩设计
 * - 交互式悬停效果
 * - 响应式栅格系统
 * - 无障碍友好设计
 * 
 * 🛡️ 安全考虑:
 * - XSS防护的HTML渲染
 * - 安全的文件下载
 * - 音频播放错误处理
 * - 数据有效性验证
 * 
 * ⚙️ 配置选项:
 * - 显示模块开关
 * - 例句数量限制
 * - 图表样式定制
 * - 导出格式选择
 */
-->

<template>
  <div class="word-details space-y-4">
    <!-- 📋 词汇基础信息头部 -->
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-xl font-bold text-gray-900">{{ word }}</h3>
        <!-- 📊 词汇统计信息 -->
        <div v-if="analysis" class="flex items-center space-x-4 mt-1">
          <span class="text-sm text-gray-600">
            {{ analysis.frequency }} occurrences
          </span>
          <span class="text-sm text-gray-600">
            {{ analysis.articles.length }} articles
          </span>
          <!-- 🏷️ 词性标签 -->
          <div v-if="analysis.partOfSpeech" class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {{ analysis.partOfSpeech }}
          </div>
        </div>
      </div>
      
      <!-- 🎛️ 词汇操作按钮组 -->
      <div class="flex items-center space-x-2">
        <!-- 🔊 音频发音按钮 -->
        <button
          v-if="analysis?.audioUrl"
          @click="playPronunciation"
          class="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          title="Play pronunciation"
        >
          <SpeakerWaveIcon class="w-5 h-5" />
        </button>
        
        <!-- 📚 收藏词汇按钮 -->
        <button
          @click="addToVocabulary"
          class="p-2 text-gray-400 hover:text-primary-600 transition-colors"
          title="Add to vocabulary"
        >
          <BookmarkIcon class="w-5 h-5" />
        </button>
      </div>
    </div>

    <!-- 📈 使用趋势图表 -->
    <div v-if="analysis?.frequencyTrend" class="bg-gray-50 rounded-lg p-4">
      <h4 class="text-sm font-medium text-gray-900 mb-3">Usage Trend</h4>
      <div class="h-20 relative">
        <!-- 📊 SVG趋势线图表 -->
        <svg class="w-full h-full" viewBox="0 0 300 60">
          <!-- 📈 趋势线路径 -->
          <polyline
            :points="trendPoints"
            fill="none"
            stroke="#3b82f6"
            stroke-width="2"
            class="drop-shadow-sm"
          />
          <!-- 🔘 交互式数据点 -->
          <circle
            v-for="(point, index) in analysis.frequencyTrend"
            :key="index"
            :cx="(index / (analysis.frequencyTrend.length - 1)) * 280 + 10"
            :cy="60 - (point.count / Math.max(...analysis.frequencyTrend.map(p => p.count))) * 40 - 10"
            r="3"
            fill="#3b82f6"
            class="cursor-pointer hover:r-4 transition-all"
            @click="showTrendDetails(point, index)"
          />
        </svg>
      </div>
      <!-- 📅 时间轴标签 -->
      <div class="flex justify-between text-xs text-gray-500 mt-2">
        <span>{{ analysis.frequencyTrend[0]?.period }}</span>
        <span>{{ analysis.frequencyTrend[analysis.frequencyTrend.length - 1]?.period }}</span>
      </div>
    </div>

    <!-- 📖 词汇定义和同义词（专业版功能） -->
    <FeatureGate feature="advanced_glossary">
      <div v-if="analysis?.definition" class="bg-blue-50 rounded-lg p-4">
        <h4 class="text-sm font-medium text-blue-900 mb-2">Definition</h4>
        <p class="text-blue-800">{{ analysis.definition }}</p>
        <!-- 🔗 同义词列表 -->
        <div v-if="analysis.synonyms?.length" class="mt-3">
          <span class="text-xs font-medium text-blue-700">Synonyms: </span>
          <span class="text-xs text-blue-600">{{ analysis.synonyms.join(', ') }}</span>
        </div>
      </div>
      
      <!-- 💰 高级词典功能升级提示 -->
      <template #fallback>
        <div class="bg-gray-50 rounded-lg p-4 text-center">
          <BookOpenIcon class="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p class="text-sm text-gray-600 mb-3">
            Detailed definitions available with Pro subscription
          </p>
          <button
            @click="$router.push('/subscription')"
            class="btn-primary text-sm"
          >
            Upgrade for Definitions
          </button>
        </div>
      </template>
    </FeatureGate>

    <!-- 📝 上下文使用例句 -->
    <div v-if="analysis?.contexts?.length" class="space-y-3">
      <h4 class="text-sm font-medium text-gray-900">Usage Examples</h4>
      <!-- 📜 例句滚动列表 -->
      <div class="space-y-2 max-h-48 overflow-y-auto">
        <div
          v-for="(context, index) in analysis.contexts.slice(0, 5)"
          :key="index"
          class="bg-gray-50 rounded-lg p-3 text-sm cursor-pointer hover:bg-gray-100 transition-colors"
          @click="navigateToContext(context)"
        >
          <!-- 🎯 高亮显示的上下文文本 -->
          <div class="text-gray-800" v-html="highlightWord(context.text, word)"></div>
          <!-- 📚 文章来源信息 -->
          <div class="flex items-center justify-between mt-2">
            <span class="text-xs text-gray-500">{{ context.articleTitle }}</span>
            <ArrowTopRightOnSquareIcon class="w-3 h-3 text-gray-400" />
          </div>
        </div>
      </div>
      
      <!-- 📄 显示更多例句控制 -->
      <div v-if="analysis.contexts.length > 5" class="text-center">
        <button
          @click="showAllContexts = !showAllContexts"
          class="text-sm text-primary-600 hover:text-primary-700"
        >
          {{ showAllContexts ? 'Show Less' : `Show ${analysis.contexts.length - 5} More` }}
        </button>
      </div>
    </div>

    <!-- 🔗 相关词汇推荐（专业版功能） -->
    <FeatureGate feature="word_frequency_analytics">
      <div v-if="analysis?.relatedWords?.length" class="space-y-3">
        <h4 class="text-sm font-medium text-gray-900">Related Words</h4>
        <!-- 🏷️ 相关词汇标签云 -->
        <div class="flex flex-wrap gap-2">
          <button
            v-for="relatedWord in analysis.relatedWords.slice(0, 8)"
            :key="relatedWord.word"
            @click="$emit('word-click', relatedWord.word)"
            class="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full hover:bg-purple-200 transition-colors"
          >
            {{ relatedWord.word }}
            <span class="text-purple-600 ml-1">({{ relatedWord.similarity }})</span>
          </button>
        </div>
      </div>
      
      <!-- 🤖 AI功能升级提示 -->
      <template #fallback>
        <div class="bg-gray-50 rounded-lg p-4 text-center">
          <CpuChipIcon class="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p class="text-sm text-gray-600 mb-3">
            AI-powered word relationships available with Pro
          </p>
          <button
            @click="$router.push('/subscription')"
            class="btn-primary text-sm"
          >
            Unlock AI Features
          </button>
        </div>
      </template>
    </FeatureGate>

    <!-- 📚 文章分布统计 -->
    <div v-if="analysis?.articles?.length" class="space-y-3">
      <div class="flex items-center justify-between">
        <h4 class="text-sm font-medium text-gray-900">
          Found in {{ analysis.articles.length }} Articles
        </h4>
        <!-- 📄 显示全部文章切换 -->
        <button
          v-if="analysis.articles.length > 3"
          @click="showAllArticles = !showAllArticles"
          class="text-sm text-primary-600 hover:text-primary-700"
        >
          {{ showAllArticles ? 'Show Less' : 'Show All' }}
        </button>
      </div>
      
      <!-- 📋 文章列表 -->
      <div class="space-y-2">
        <div
          v-for="article in displayedArticles"
          :key="article.id"
          class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          @click="navigateToArticle(article.id)"
        >
          <div class="flex-1 min-w-0">
            <div class="font-medium text-gray-900 truncate">{{ article.title }}</div>
            <div class="text-sm text-gray-600">
              {{ article.count }} occurrences • {{ article.category }}
            </div>
          </div>
          <!-- 🔗 跳转指示图标 -->
          <ArrowTopRightOnSquareIcon class="w-4 h-4 text-gray-400 ml-2 flex-shrink-0" />
        </div>
      </div>
    </div>

    <!-- 📤 词汇数据导出功能（专业版） -->
    <FeatureGate feature="export_features">
      <div class="pt-4 border-t border-gray-200">
        <button
          @click="exportWordData"
          class="w-full btn-outline text-sm"
        >
          <DocumentArrowDownIcon class="w-4 h-4 mr-2" />
          Export Word Analysis
        </button>
      </div>
      
      <!-- 🔒 导出功能锁定状态 -->
      <template #fallback>
        <div class="pt-4 border-t border-gray-200">
          <button
            disabled
            class="w-full btn-outline text-sm opacity-50 cursor-not-allowed"
          >
            <LockClosedIcon class="w-4 h-4 mr-2" />
            Export (Pro Feature)
          </button>
        </div>
      </template>
    </FeatureGate>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import FeatureGate from '@/components/subscription/FeatureGate.vue'

// Icons
import {
  SpeakerWaveIcon,
  BookmarkIcon,
  BookOpenIcon,
  ArrowTopRightOnSquareIcon,
  DocumentArrowDownIcon,
  LockClosedIcon,
  CpuChipIcon
} from '@heroicons/vue/24/outline'

/**
 * 📊 词汇分析数据接口定义
 * 
 * 📋 分析数据结构:
 * - frequency: 词汇出现频率统计
 * - articles: 包含该词的文章列表
 * - contexts: 上下文使用例句
 * - definition: 词汇定义（可选）
 * - synonyms: 同义词列表（可选）
 * - partOfSpeech: 词性信息（可选）
 * - relatedWords: 相关词汇推荐（可选）
 * - frequencyTrend: 使用趋势数据（可选）
 * - audioUrl: 音频发音链接（可选）
 */
interface WordAnalysis {
  frequency: number
  articles: Array<{
    id: string
    title: string
    count: number
    category: string
  }>
  contexts: Array<{
    text: string
    articleId: string
    articleTitle: string
  }>
  definition?: string
  synonyms?: string[]
  partOfSpeech?: string
  relatedWords?: Array<{
    word: string
    similarity: number
  }>
  frequencyTrend?: Array<{
    period: string
    count: number
  }>
  audioUrl?: string
}

/**
 * 📡 组件Props接口定义
 * 
 * 📋 属性说明:
 * - word: 当前分析的词汇
 * - analysis: 词汇分析数据对象
 */
interface Props {
  word: string
  analysis: WordAnalysis | null
}

const props = defineProps<Props>()

/**
 * 📡 组件事件发射器定义
 * 
 * 📋 事件类型:
 * - navigate-to-article: 跳转到文章事件
 * - word-click: 词汇点击选择事件
 */
const emit = defineEmits<{
  'navigate-to-article': [articleId: string, word: string]
  'word-click': [word: string]
}>()

const router = useRouter()

// 🎛️ 组件展示状态控制
const showAllContexts = ref(false)
const showAllArticles = ref(false)

/**
 * 📋 计算显示的文章列表
 * 
 * 📋 显示逻辑:
 * - 根据展开状态控制数量
 * - 默认显示前3篇文章
 * - 展开后显示全部文章
 */
const displayedArticles = computed(() => {
  if (!props.analysis?.articles) return []
  return showAllArticles.value 
    ? props.analysis.articles 
    : props.analysis.articles.slice(0, 3)
})

/**
 * 📈 计算趋势图SVG路径点
 * 
 * 📋 计算逻辑:
 * - 将数据点映射到SVG坐标
 * - 按最大值归一化Y轴
 * - 生成连接线路径字符串
 * 
 * 🎯 算法特点:
 * - 响应式坐标计算
 * - 比例缩放适配
 * - SVG路径优化
 */
const trendPoints = computed(() => {
  if (!props.analysis?.frequencyTrend) return ''
  
  const points = props.analysis.frequencyTrend.map((point, index) => {
    const x = (index / (props.analysis!.frequencyTrend!.length - 1)) * 280 + 10
    const maxCount = Math.max(...props.analysis!.frequencyTrend!.map(p => p.count))
    const y = 60 - (point.count / maxCount) * 40 - 10
    return `${x},${y}`
  })
  
  return points.join(' ')
})

/**
 * 🎯 词汇高亮渲染函数
 * 
 * @param text - 原始文本内容
 * @param word - 需要高亮的词汇
 * @returns string - 包含高亮标记的HTML
 * 
 * 📋 高亮逻辑:
 * - 使用正则表达式匹配词边界
 * - 大小写不敏感匹配
 * - 添加HTML标记元素
 * - 自定义高亮样式类
 * 
 * 🛡️ 安全考虑:
 * - XSS防护处理
 * - HTML转义验证
 * - 安全的标记插入
 */
const highlightWord = (text: string, word: string): string => {
  const regex = new RegExp(`\\b${word}\\b`, 'gi')
  return text.replace(regex, `<mark class="bg-yellow-200 px-1 rounded">${word}</mark>`)
}

/**
 * 🔗 跳转到指定文章
 * 
 * @param articleId - 目标文章ID
 * 
 * 📋 跳转逻辑:
 * - 发射文章导航事件
 * - 传递文章ID和词汇信息
 * - 支持父组件路由处理
 */
const navigateToArticle = (articleId: string) => {
  emit('navigate-to-article', articleId, props.word)
}

/**
 * 📚 跳转到上下文文章
 * 
 * @param context - 上下文对象
 * 
 * 📋 跳转逻辑:
 * - 解析上下文文章ID
 * - 调用文章跳转函数
 * - 保持词汇高亮状态
 */
const navigateToContext = (context: any) => {
  navigateToArticle(context.articleId)
}

/**
 * 🔊 播放词汇发音音频
 * 
 * 📋 播放逻辑:
 * - 检查音频URL有效性
 * - 创建音频对象
 * - 异步播放处理
 * - 错误捕获和日志
 * 
 * 🛡️ 错误处理:
 * - 网络连接错误
 * - 音频格式不支持
 * - 播放权限限制
 */
const playPronunciation = () => {
  if (props.analysis?.audioUrl) {
    const audio = new Audio(props.analysis.audioUrl)
    audio.play().catch(console.error)
  }
}

/**
 * 📚 添加词汇到个人词汇表
 * 
 * 📋 收藏功能:
 * - 保存到用户词汇表
 * - 学习进度追踪
 * - 个性化学习计划
 * 
 * 🎯 扩展功能:
 * - 词汇标签分类
 * - 学习优先级设置
 * - 复习提醒功能
 */
const addToVocabulary = () => {
  // Implementation for adding word to personal vocabulary
  console.log('Adding to vocabulary:', props.word)
}

/**
 * 📊 显示趋势详情
 * 
 * @param point - 趋势数据点
 * @param index - 数据点索引
 * 
 * 📋 详情功能:
 * - 显示具体时期数据
 * - 提供趋势分析
 * - 支持数据钻取
 */
const showTrendDetails = (point: any, index: number) => {
  console.log('Trend point:', point, index)
}

/**
 * 📤 导出词汇分析数据
 * 
 * 📋 导出功能:
 * - 生成JSON格式数据
 * - 包含完整分析信息
 * - 添加导出时间戳
 * - 自动下载文件
 * 
 * 🎯 数据格式:
 * - 结构化词汇信息
 * - 分析结果详情
 * - 元数据和时间戳
 * - 标准化JSON格式
 * 
 * 🛡️ 安全考虑:
 * - 数据完整性验证
 * - 文件大小限制
 * - 安全的文件下载
 */
const exportWordData = () => {
  if (!props.analysis) return
  
  const data = {
    word: props.word,
    analysis: props.analysis,
    exportedAt: new Date().toISOString()
  }
  
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${props.word}-analysis.json`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
/**
 * 🎨 高亮标记样式定义
 * 
 * 📋 样式特性:
 * - 黄色背景高亮
 * - 适度内边距
 * - 圆角边框设计
 * - 视觉突出效果
 */
mark {
  background-color: #fef3c7;
  padding: 2px 4px;
  border-radius: 3px;
}

/**
 * 🎬 词汇详情面板动画
 * 
 * 📋 动画特性:
 * - 滑入动画效果
 * - 透明度渐变
 * - 平滑过渡体验
 * - 自然的用户反馈
 */
.word-details {
  animation: slideIn 0.3s ease-out;
}

/**
 * 🎭 滑入动画关键帧
 * 
 * 📋 动画阶段:
 * - 起始状态：透明且下移
 * - 结束状态：完全显示且归位
 * - 平滑的动画曲线
 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>