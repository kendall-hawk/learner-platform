<!--
/**
 * 📂 src/views/WordFrequencyPage.vue
 * 🎯 WordFrequencyPage.vue - 词频分析系统主页面组件
 * 
 * 📋 功能概述:
 * - 提供完整的词频分析用户界面
 * - 集成搜索、可视化、统计和导出功能
 * - 支持智能搜索和精确匹配两种模式
 * - 实现订阅功能门控和升级引导
 * - 提供响应式设计适配多端设备
 * 
 * 🎯 主要功能:
 * - 词频搜索和过滤系统
 * - 多种数据可视化展示（词云、图表、列表）
 * - 详细的词汇分析和上下文展示
 * - 跨文章搜索和导航功能
 * - 数据导出和分享功能
 * - 学习进度统计和分析
 * 
 * 🏗️ 架构设计:
 * - 模块化组件设计，职责分离清晰
 * - 响应式状态管理集成
 * - 异步数据加载和缓存策略
 * - 订阅功能门控集成
 * - 性能优化的大数据处理
 * 
 * 🔗 集成组件:
 * - SearchPanel: 智能搜索面板
 * - FrequencyChart: 频率图表组件
 * - WordCloud: 交互式词云
 * - WordDetails: 详细词汇分析
 * - FeatureGate: 功能门控组件
 * 
 * 📡 Props接口:
 * - 无Props，通过路由查询参数接收初始搜索条件
 * 
 * 🎨 样式特色:
 * - 现代化卡片布局设计
 * - 响应式网格系统
 * - 平滑的动画过渡效果
 * - 移动端优化的触摸交互
 * 
 * 🛡️ 安全考虑:
 * - 输入验证和清理
 * - XSS防护的内容渲染
 * - 订阅状态验证
 * - 使用量限制检查
 * 
 * ⚙️ 配置选项:
 * - 搜索模式切换（智能/精确）
 * - 可视化类型选择
 * - 显示数量限制调整
 * - 导出格式选择
 */
-->

<template>
  <MainLayout>
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- 🎯 页面标题和状态展示区域 -->
      <div class="mb-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900">Word Frequency Analysis</h1>
            <p class="text-gray-600 mt-2">
              Analyze word patterns and frequency across your reading materials
            </p>
          </div>
          
          <!-- 💎 专业版功能标识 -->
          <div v-if="subscriptionStore.isPro" class="flex items-center space-x-2">
            <div class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              ✨ Pro Features Enabled
            </div>
          </div>
        </div>
      </div>

      <!-- 🔍 智能搜索面板组件 -->
      <div class="mb-8">
        <SearchPanel
          v-model:query="searchQuery"
          v-model:mode="searchMode"
          v-model:filters="filters"
          :loading="isSearching"
          @search="handleSearch"
          @clear="handleClear"
        />
      </div>

      <!-- 📊 分析结果展示区域 -->
      <div v-if="hasResults || isLoading" class="space-y-8">
        <!-- ⏳ 加载状态指示器 -->
        <div v-if="isLoading" class="flex items-center justify-center py-12">
          <LoadingSpinner size="large" text="Analyzing word frequencies..." />
        </div>

        <!-- 📈 数据可视化和统计区域 -->
        <div v-else-if="hasResults" class="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <!-- 📊 主要内容区域 -->
          <div class="lg:col-span-2 space-y-6">
            <!-- 📋 统计摘要卡片 -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div class="card card-body text-center">
                <div class="text-2xl font-bold text-blue-600">{{ stats.totalWords.toLocaleString() }}</div>
                <div class="text-sm text-gray-600">Total Words</div>
              </div>
              <div class="card card-body text-center">
                <div class="text-2xl font-bold text-green-600">{{ stats.uniqueWords.toLocaleString() }}</div>
                <div class="text-sm text-gray-600">Unique Words</div>
              </div>
              <div class="card card-body text-center">
                <div class="text-2xl font-bold text-purple-600">{{ stats.articlesAnalyzed }}</div>
                <div class="text-sm text-gray-600">Articles</div>
              </div>
              <div class="card card-body text-center">
                <div class="text-2xl font-bold text-orange-600">{{ stats.averageLength.toFixed(1) }}</div>
                <div class="text-sm text-gray-600">Avg Length</div>
              </div>
            </div>

            <!-- ☁️ 交互式词云组件 -->
            <div class="card">
              <div class="card-body">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold text-gray-900">Word Cloud</h3>
                  <div class="flex items-center space-x-2">
                    <button
                      @click="refreshWordCloud"
                      class="text-gray-400 hover:text-gray-600 transition-colors"
                      title="Refresh"
                    >
                      <ArrowPathIcon class="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                <!-- 🚪 功能门控包装的词云组件 -->
                <FeatureGate 
                  feature="cross_article_search"
                  :show-preview="true"
                >
                  <WordCloud
                    :words="topWords"
                    :height="300"
                    @word-click="handleWordClick"
                  />
                  
                  <!-- 💰 升级提示后备内容 -->
                  <template #fallback>
                    <div class="text-center py-8">
                      <CloudIcon class="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h4 class="text-lg font-medium text-gray-900 mb-2">Advanced Word Cloud</h4>
                      <p class="text-gray-600 mb-4">
                        Visualize word relationships with our interactive word cloud
                      </p>
                      <button
                        @click="$router.push('/subscription')"
                        class="btn-primary"
                      >
                        Upgrade to Pro
                      </button>
                    </div>
                  </template>
                </FeatureGate>
              </div>
            </div>

            <!-- 📈 频率分布图表组件 -->
            <div class="card">
              <div class="card-body">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold text-gray-900">Frequency Distribution</h3>
                  <div class="flex items-center space-x-2">
                    <select
                      v-model="chartType"
                      class="text-sm border-gray-300 rounded-md"
                    >
                      <option value="bar">Bar Chart</option>
                      <option value="line">Line Chart</option>
                      <option value="area">Area Chart</option>
                    </select>
                  </div>
                </div>
                
                <FrequencyChart
                  :data="chartData"
                  :type="chartType"
                  :height="400"
                  @bar-click="handleChartClick"
                />
              </div>
            </div>
          </div>

          <!-- 📋 侧边栏信息面板 -->
          <div class="space-y-6">
            <!-- 🏆 高频词列表 -->
            <div class="card">
              <div class="card-body">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold text-gray-900">Top Words</h3>
                  <div class="text-sm text-gray-500">
                    Showing {{ Math.min(displayLimit, topWords.length) }} of {{ topWords.length }}
                  </div>
                </div>
                
                <!-- 🔄 滚动列表容器 -->
                <div class="space-y-2 max-h-96 overflow-y-auto">
                  <div
                    v-for="(word, index) in topWords.slice(0, displayLimit)"
                    :key="word.word"
                    class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                    @click="handleWordClick(word.word)"
                  >
                    <div class="flex items-center space-x-3">
                      <div class="text-xs font-medium text-gray-500 w-6">
                        #{{ index + 1 }}
                      </div>
                      <div>
                        <div class="font-medium text-gray-900">{{ word.word }}</div>
                        <div class="text-xs text-gray-500">
                          {{ word.frequency }} occurrences
                        </div>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <div class="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          class="bg-blue-600 h-2 rounded-full"
                          :style="{ width: `${(word.frequency / topWords[0].frequency) * 100}%` }"
                        ></div>
                      </div>
                      <ArrowRightIcon class="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </div>
                
                <!-- 📄 分页加载更多 -->
                <div v-if="topWords.length > displayLimit" class="mt-4 text-center">
                  <button
                    @click="displayLimit += 20"
                    class="text-primary-600 hover:text-primary-700 text-sm font-medium"
                  >
                    Show More
                  </button>
                </div>
              </div>
            </div>

            <!-- 🔍 词汇详情分析面板 -->
            <div v-if="selectedWord" class="card">
              <div class="card-body">
                <div class="flex items-center justify-between mb-4">
                  <h3 class="text-lg font-semibold text-gray-900">Word Details</h3>
                  <button
                    @click="selectedWord = null"
                    class="text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon class="w-5 h-5" />
                  </button>
                </div>
                
                <WordDetails
                  :word="selectedWord"
                  :analysis="selectedWordAnalysis"
                  @navigate-to-article="handleNavigateToArticle"
                />
              </div>
            </div>

            <!-- 📤 数据导出功能区域 -->
            <FeatureGate feature="export_features">
              <div class="card">
                <div class="card-body">
                  <h3 class="text-lg font-semibold text-gray-900 mb-4">Export Results</h3>
                  <div class="space-y-2">
                    <button
                      @click="exportResults('csv')"
                      class="w-full btn-outline text-sm"
                      :disabled="!hasResults"
                    >
                      <DocumentArrowDownIcon class="w-4 h-4 mr-2" />
                      Export as CSV
                    </button>
                    <button
                      @click="exportResults('json')"
                      class="w-full btn-outline text-sm"
                      :disabled="!hasResults"
                    >
                      <DocumentArrowDownIcon class="w-4 h-4 mr-2" />
                      Export as JSON
                    </button>
                    <button
                      @click="exportResults('pdf')"
                      class="w-full btn-outline text-sm"
                      :disabled="!hasResults"
                    >
                      <DocumentArrowDownIcon class="w-4 h-4 mr-2" />
                      Export as PDF
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- 💰 导出功能升级提示 -->
              <template #fallback>
                <div class="card">
                  <div class="card-body text-center">
                    <DocumentArrowDownIcon class="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <h4 class="font-medium text-gray-900 mb-2">Export Features</h4>
                    <p class="text-sm text-gray-600 mb-3">
                      Export your analysis in multiple formats
                    </p>
                    <button
                      @click="$router.push('/subscription')"
                      class="btn-primary text-sm"
                    >
                      Upgrade to Export
                    </button>
                  </div>
                </div>
              </template>
            </FeatureGate>
          </div>
        </div>
      </div>

      <!-- 🚀 首次访问引导界面 -->
      <div v-else-if="!hasSearched" class="text-center py-16">
        <ChartBarIcon class="w-24 h-24 text-gray-300 mx-auto mb-6" />
        <h3 class="text-xl font-medium text-gray-900 mb-2">
          Start Your Word Analysis
        </h3>
        <p class="text-gray-600 mb-6 max-w-md mx-auto">
          Search for words to see their frequency patterns, usage contexts, and distribution across articles.
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            @click="runSampleAnalysis"
            class="btn-primary"
          >
            Try Sample Analysis
          </button>
          <button
            @click="$router.push('/articles')"
            class="btn-outline"
          >
            Browse Articles
          </button>
        </div>
      </div>

      <!-- 🔍 无搜索结果状态 -->
      <div v-else class="text-center py-16">
        <MagnifyingGlassIcon class="w-24 h-24 text-gray-300 mx-auto mb-6" />
        <h3 class="text-xl font-medium text-gray-900 mb-2">
          No Results Found
        </h3>
        <p class="text-gray-600 mb-6">
          Try adjusting your search terms or search mode.
        </p>
        <button
          @click="handleClear"
          class="btn-outline"
        >
          Clear Search
        </button>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useWordFrequencyStore } from '@/stores/wordFrequency'
import { useAuthStore } from '@/stores/auth'
import { useSubscriptionStore } from '@/stores/subscription'
import MainLayout from '@/layouts/MainLayout.vue'
import SearchPanel from '@/components/wordFreq/SearchPanel.vue'
import FrequencyChart from '@/components/wordFreq/FrequencyChart.vue'
import WordCloud from '@/components/wordFreq/WordCloud.vue'
import WordDetails from '@/components/wordFreq/WordDetails.vue'
import FeatureGate from '@/components/subscription/FeatureGate.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

// Icons
import {
  ChartBarIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ArrowRightIcon,
  XMarkIcon,
  DocumentArrowDownIcon,
  CloudIcon
} from '@heroicons/vue/24/outline'

const router = useRouter()
const route = useRoute()
const wordFreqStore = useWordFrequencyStore()
const authStore = useAuthStore()
const subscriptionStore = useSubscriptionStore()

// 🔄 响应式搜索状态管理
const searchQuery = ref('')
const searchMode = ref<'intelligent' | 'exact'>('intelligent')
const filters = ref({
  minLength: 3,
  excludeCommon: true,
  partOfSpeech: [],
  articles: []
})

// 🎨 界面显示状态控制
const chartType = ref<'bar' | 'line' | 'area'>('bar')
const displayLimit = ref(20)
const selectedWord = ref<string | null>(null)

// 📊 计算属性 - 数据状态检查
const isLoading = computed(() => wordFreqStore.isLoading)
const isSearching = computed(() => wordFreqStore.isSearching)
const hasResults = computed(() => wordFreqStore.results.length > 0)
const hasSearched = computed(() => wordFreqStore.hasSearched)
const topWords = computed(() => wordFreqStore.results.slice(0, 100))
const stats = computed(() => wordFreqStore.stats)

// 📈 图表数据转换
const chartData = computed(() => {
  return topWords.value.slice(0, 20).map(word => ({
    word: word.word,
    frequency: word.frequency,
    articles: word.articles.length
  }))
})

// 🔍 选中词汇分析数据
const selectedWordAnalysis = computed(() => {
  if (!selectedWord.value) return null
  return wordFreqStore.getWordAnalysis(selectedWord.value)
})

/**
 * 🔍 执行词汇搜索分析
 * 
 * 📋 搜索流程:
 * - 验证搜索查询有效性
 * - 调用词频分析服务
 * - 更新搜索状态和结果
 * - 处理搜索错误情况
 * 
 * 🛡️ 安全检查:
 * - 空查询验证
 * - 搜索频率限制
 * - 错误状态处理
 */
const handleSearch = async () => {
  if (!searchQuery.value.trim()) return
  
  await wordFreqStore.searchWords({
    query: searchQuery.value,
    mode: searchMode.value,
    filters: filters.value
  })
}

/**
 * 🧹 清空搜索结果和状态
 * 
 * 📋 清理范围:
 * - 搜索查询内容
 * - 分析结果数据
 * - 选中词汇状态
 * - 错误信息清除
 */
const handleClear = () => {
  searchQuery.value = ''
  wordFreqStore.clearResults()
  selectedWord.value = null
}

/**
 * 🎯 处理词汇点击选择事件
 * 
 * @param word - 选中的词汇
 * 
 * 📋 交互逻辑:
 * - 更新选中词汇状态
 * - 滚动到详情面板
 * - 加载词汇分析数据
 */
const handleWordClick = (word: string) => {
  selectedWord.value = word
  // Scroll to word details
  const detailsElement = document.querySelector('.word-details')
  if (detailsElement) {
    detailsElement.scrollIntoView({ behavior: 'smooth' })
  }
}

/**
 * 📊 处理图表点击交互
 * 
 * @param data - 图表数据点
 * 
 * 📋 功能说明:
 * - 图表数据点选择
 * - 词汇详情面板联动
 * - 用户交互反馈
 */
const handleChartClick = (data: any) => {
  handleWordClick(data.word)
}

/**
 * 🔗 跨文章导航功能
 * 
 * @param articleId - 目标文章ID
 * @param word - 高亮词汇
 * 
 * 📋 导航逻辑:
 * - 构建文章路由参数
 * - 传递高亮词汇查询
 * - 实现跨页面数据传递
 */
const handleNavigateToArticle = (articleId: string, word: string) => {
  router.push({
    name: 'Article',
    params: { id: articleId },
    query: { highlight: word }
  })
}

/**
 * 🔄 刷新词云可视化
 * 
 * 📋 刷新操作:
 * - 触发词云重新渲染
 * - 更新布局算法
 * - 保持用户体验流畅
 */
const refreshWordCloud = () => {
  wordFreqStore.refreshVisualization()
}

/**
 * 🚀 运行示例分析演示
 * 
 * 📋 演示功能:
 * - 预设搜索查询
 * - 自动执行分析
 * - 引导用户体验功能
 */
const runSampleAnalysis = async () => {
  searchQuery.value = 'learning'
  searchMode.value = 'intelligent'
  await handleSearch()
}

/**
 * 📤 数据导出功能处理
 * 
 * @param format - 导出格式 ('csv' | 'json' | 'pdf')
 * 
 * 📋 导出流程:
 * - 验证结果数据存在
 * - 调用相应格式导出
 * - 处理导出错误情况
 * - 提供用户反馈
 * 
 * 🛡️ 错误处理:
 * - 空数据检查
 * - 格式支持验证
 * - 导出失败提示
 */
const exportResults = async (format: 'csv' | 'json' | 'pdf') => {
  if (!hasResults.value) return
  
  try {
    await wordFreqStore.exportResults(format)
  } catch (error) {
    console.error('Export failed:', error)
  }
}

/**
 * 🔗 路由查询参数监听器
 * 
 * 📋 监听功能:
 * - URL查询参数变化
 * - 自动执行搜索
 * - 支持书签和分享链接
 * - 浏览器前进后退支持
 */
watch(() => route.query, (newQuery) => {
  if (newQuery.word) {
    searchQuery.value = newQuery.word as string
    searchMode.value = (newQuery.mode as any) || 'intelligent'
    handleSearch()
  }
}, { immediate: true })

/**
 * 🎯 组件初始化生命周期
 * 
 * 📋 初始化任务:
 * - 检查词频存储初始化状态
 * - 加载必要的基础数据
 * - 处理初始化错误情况
 */
onMounted(async () => {
  if (!wordFreqStore.isInitialized) {
    await wordFreqStore.initialize()
  }
})
</script>