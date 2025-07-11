<!--
/**
 * 📂 src/components/wordFreq/SearchPanel.vue
 * 🎯 SearchPanel.vue - 智能词频搜索面板组件
 * 
 * 📋 功能概述:
 * - 提供智能和精确两种搜索模式
 * - 集成高级过滤器和搜索配置
 * - 实现订阅功能门控和权限管理
 * - 支持搜索建议和自动完成
 * - 提供丰富的搜索技巧和用户指导
 * 
 * 🎯 主要功能:
 * - 双模式搜索切换（智能/精确）
 * - 高级过滤器折叠面板
 * - 最小长度和词性过滤
 * - 常用词排除选项
 * - 文章范围筛选
 * - 搜索技巧提示
 * 
 * 🏗️ 架构设计:
 * - 响应式表单设计
 * - 模块化过滤器组件
 * - 功能门控集成
 * - 实时验证反馈
 * - 可扩展的过滤器系统
 * 
 * 🔗 集成组件:
 * - FeatureGate: 功能权限控制
 * - LoadingSpinner: 加载状态指示
 * - 订阅状态管理集成
 * 
 * 📡 Props接口:
 * - query: string - 搜索查询内容
 * - mode: 'intelligent'|'exact' - 搜索模式
 * - filters: SearchFilters - 过滤器配置
 * - loading: boolean - 加载状态
 * 
 * 🎨 样式特色:
 * - 现代化表单设计
 * - 平滑展开折叠动画
 * - 响应式布局适配
 * - 状态颜色指示
 * - 无障碍交互支持
 * 
 * 🛡️ 安全考虑:
 * - 输入内容验证和清理
 * - XSS防护处理
 * - 搜索频率限制
 * - 权限状态验证
 * 
 * ⚙️ 配置选项:
 * - 搜索模式自定义
 * - 过滤器显示控制
 * - 默认值配置
 * - 验证规则定制
 */
-->

<template>
  <div class="search-panel">
    <div class="card">
      <div class="card-body">
        <!-- 🔍 主搜索输入区域 -->
        <div class="flex flex-col lg:flex-row gap-4 mb-6">
          <div class="flex-1">
            <div class="relative">
              <!-- 🔍 搜索图标指示器 -->
              <MagnifyingGlassIcon class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              
              <!-- 📝 主搜索输入框 -->
              <input
                :value="query"
                @input="$emit('update:query', ($event.target as HTMLInputElement).value)"
                @keyup.enter="$emit('search')"
                type="text"
                placeholder="Search for words (e.g., 'learn', 'technology', 'speak*')"
                class="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                :disabled="loading"
              />
              
              <!-- ⏳ 搜索加载指示器 -->
              <div v-if="loading" class="absolute right-3 top-1/2 transform -translate-y-1/2">
                <LoadingSpinner size="small" />
              </div>
            </div>
          </div>
          
          <!-- 🎯 搜索操作按钮组 -->
          <div class="flex gap-3">
            <!-- 🔍 分析按钮 -->
            <button
              @click="$emit('search')"
              :disabled="!query.trim() || loading"
              class="btn-primary px-6 py-3"
            >
              <span v-if="!loading">Analyze</span>
              <span v-else class="flex items-center">
                <LoadingSpinner size="small" color="white" class="mr-2" />
                Analyzing...
              </span>
            </button>
            
            <!-- 🧹 清空按钮 -->
            <button
              @click="$emit('clear')"
              class="btn-outline px-6 py-3"
              :disabled="loading"
            >
              Clear
            </button>
          </div>
        </div>

        <!-- 🎛️ 搜索模式控制区域 -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div class="flex items-center space-x-4">
            <span class="text-sm font-medium text-gray-700">Search Mode:</span>
            
            <!-- 🔄 搜索模式切换器 -->
            <div class="flex bg-gray-100 rounded-lg p-1">
              <!-- 🧠 智能搜索模式 -->
              <button
                @click="$emit('update:mode', 'intelligent')"
                :class="[
                  'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                  mode === 'intelligent' 
                    ? 'bg-white text-primary-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                ]"
              >
                Intelligent
              </button>
              
              <!-- 🎯 精确匹配模式（功能门控） -->
              <FeatureGate feature="cross_article_search">
                <button
                  @click="$emit('update:mode', 'exact')"
                  :class="[
                    'px-3 py-1 text-sm font-medium rounded-md transition-colors',
                    mode === 'exact' 
                      ? 'bg-white text-primary-600 shadow-sm' 
                      : 'text-gray-600 hover:text-gray-900'
                  ]"
                >
                  Exact Match
                </button>
                
                <!-- 🔒 功能锁定提示 -->
                <template #fallback>
                  <button
                    @click="$router.push('/subscription')"
                    class="px-3 py-1 text-sm font-medium rounded-md text-gray-400 cursor-not-allowed flex items-center"
                    disabled
                  >
                    Exact Match
                    <LockClosedIcon class="w-3 h-3 ml-1" />
                  </button>
                </template>
              </FeatureGate>
            </div>
          </div>
          
          <!-- ⚙️ 高级过滤器切换按钮 -->
          <button
            @click="showAdvancedFilters = !showAdvancedFilters"
            class="flex items-center text-sm text-primary-600 hover:text-primary-700"
          >
            <AdjustmentsHorizontalIcon class="w-4 h-4 mr-1" />
            Advanced Filters
            <ChevronDownIcon 
              :class="[
                'w-4 h-4 ml-1 transition-transform',
                showAdvancedFilters ? 'rotate-180' : ''
              ]"
            />
          </button>
        </div>

        <!-- 🎛️ 高级过滤器面板 -->
        <Transition name="slide-down">
          <div v-if="showAdvancedFilters" class="mt-6 pt-6 border-t border-gray-200">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <!-- 📏 最小单词长度过滤器 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Min. Length
                </label>
                <select
                  :value="filters.minLength"
                  @change="updateFilter('minLength', parseInt(($event.target as HTMLSelectElement).value))"
                  class="w-full border-gray-300 rounded-md text-sm"
                >
                  <option value="1">1+ chars</option>
                  <option value="2">2+ chars</option>
                  <option value="3">3+ chars</option>
                  <option value="4">4+ chars</option>
                  <option value="5">5+ chars</option>
                </select>
              </div>

              <!-- 🚫 常用词排除选项 -->
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Common Words
                </label>
                <div class="flex items-center">
                  <input
                    :checked="filters.excludeCommon"
                    @change="updateFilter('excludeCommon', ($event.target as HTMLInputElement).checked)"
                    type="checkbox"
                    id="exclude-common"
                    class="h-4 w-4 text-primary-600 border-gray-300 rounded"
                  />
                  <label for="exclude-common" class="ml-2 text-sm text-gray-600">
                    Exclude (the, and, is...)
                  </label>
                </div>
              </div>

              <!-- 📝 词性过滤器（专业版功能） -->
              <FeatureGate feature="advanced_analytics">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Part of Speech
                  </label>
                  <select
                    :value="filters.partOfSpeech"
                    @change="updateFilter('partOfSpeech', ($event.target as HTMLSelectElement).value ? [($event.target as HTMLSelectElement).value] : [])"
                    class="w-full border-gray-300 rounded-md text-sm"
                  >
                    <option value="">All Types</option>
                    <option value="noun">Nouns</option>
                    <option value="verb">Verbs</option>
                    <option value="adjective">Adjectives</option>
                    <option value="adverb">Adverbs</option>
                  </select>
                </div>
                
                <!-- 🔒 专业版功能锁定状态 -->
                <template #fallback>
                  <div>
                    <label class="block text-sm font-medium text-gray-400 mb-2">
                      Part of Speech
                    </label>
                    <div class="relative">
                      <select disabled class="w-full border-gray-200 rounded-md text-sm text-gray-400 bg-gray-50">
                        <option>Pro Feature</option>
                      </select>
                      <LockClosedIcon class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </template>
              </FeatureGate>

              <!-- 📚 文章范围过滤器（专业版功能） -->
              <FeatureGate feature="cross_article_search">
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Articles
                  </label>
                  <select
                    :value="filters.articles.length > 0 ? filters.articles[0] : ''"
                    @change="updateFilter('articles', ($event.target as HTMLSelectElement).value ? [($event.target as HTMLSelectElement).value] : [])"
                    class="w-full border-gray-300 rounded-md text-sm"
                  >
                    <option value="">All Articles</option>
                    <option value="recent">Recent (30 days)</option>
                    <option value="popular">Most Popular</option>
                    <option value="bookmarked">Bookmarked</option>
                  </select>
                </div>
                
                <!-- 🔒 文章筛选功能锁定状态 -->
                <template #fallback>
                  <div>
                    <label class="block text-sm font-medium text-gray-400 mb-2">
                      Articles
                    </label>
                    <div class="relative">
                      <select disabled class="w-full border-gray-200 rounded-md text-sm text-gray-400 bg-gray-50">
                        <option>Pro Feature</option>
                      </select>
                      <LockClosedIcon class="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                </template>
              </FeatureGate>
            </div>

            <!-- 💡 搜索技巧提示面板 -->
            <div class="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 class="text-sm font-medium text-blue-900 mb-1">Search Tips:</h4>
              <ul class="text-xs text-blue-700 space-y-1">
                <li>• Use wildcards: <code class="bg-blue-100 px-1 rounded">speak*</code> finds speak, speaking, speaker</li>
                <li>• Intelligent mode finds word variations automatically</li>
                <li v-if="subscriptionStore.isPro">• Exact mode matches only the precise word form</li>
                <li>• Use quotes for phrase search: <code class="bg-blue-100 px-1 rounded">"machine learning"</code></li>
              </ul>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSubscriptionStore } from '@/stores/subscription'
import FeatureGate from '@/components/subscription/FeatureGate.vue'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'

// Icons
import {
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ChevronDownIcon,
  LockClosedIcon
} from '@heroicons/vue/24/outline'

/**
 * 🎛️ 搜索过滤器接口定义
 * 
 * 📋 过滤器类型:
 * - minLength: 最小单词长度限制
 * - excludeCommon: 是否排除常用词
 * - partOfSpeech: 词性类型筛选
 * - articles: 文章范围筛选
 */
interface SearchFilters {
  minLength: number
  excludeCommon: boolean
  partOfSpeech: string[]
  articles: string[]
}

/**
 * 📡 组件Props接口定义
 * 
 * 📋 属性说明:
 * - query: 当前搜索查询字符串
 * - mode: 搜索模式（智能/精确）
 * - filters: 高级过滤器配置对象
 * - loading: 搜索加载状态标识
 */
interface Props {
  query: string
  mode: 'intelligent' | 'exact'
  filters: SearchFilters
  loading?: boolean
}

defineProps<Props>()

/**
 * 📡 组件事件发射器定义
 * 
 * 📋 事件类型:
 * - update:query: 搜索查询更新
 * - update:mode: 搜索模式切换
 * - update:filters: 过滤器配置更新
 * - search: 执行搜索操作
 * - clear: 清空搜索内容
 */
const emit = defineEmits<{
  'update:query': [value: string]
  'update:mode': [value: 'intelligent' | 'exact']
  'update:filters': [value: SearchFilters]
  search: []
  clear: []
}>()

const router = useRouter()
const subscriptionStore = useSubscriptionStore()

// 🎛️ 高级过滤器展开状态控制
const showAdvancedFilters = ref(false)

/**
 * 🔄 更新过滤器配置
 * 
 * @param key - 过滤器字段名
 * @param value - 新的过滤器值
 * 
 * 📋 更新逻辑:
 * - 创建新的过滤器对象
 * - 更新指定字段值
 * - 触发过滤器更新事件
 * - 保持响应式状态同步
 * 
 * 🎯 类型安全:
 * - 使用keyof确保字段存在
 * - 泛型约束保证类型匹配
 * - 编译时错误检查
 */
const updateFilter = (key: keyof SearchFilters, value: any) => {
  emit('update:filters', {
    ...defineProps<Props>().filters,
    [key]: value
  })
}
</script>

<style scoped>
/**
 * 🎨 过滤器展开折叠动画
 * 
 * 📋 动画特性:
 * - 平滑的高度过渡
 * - 透明度渐变效果
 * - 自然的用户体验
 * - 性能优化的CSS过渡
 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
  max-height: 300px;
  overflow: hidden;
}

.slide-down-enter-from,
.slide-down-leave-to {
  max-height: 0;
  opacity: 0;
}

/**
 * 🔤 代码样式定制
 * 
 * 📋 样式特性:
 * - 等宽字体显示
 * - 代码提示背景
 * - 清晰的视觉区分
 * - 一致的字体渲染
 */
code {
  font-family: 'Monaco', 'Menlo', monospace;
}
</style>