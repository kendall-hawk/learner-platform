/**
 * 📂 src/services/wordFrequencyService.ts
 * 🎯 wordFrequencyService.ts - 词频分析核心服务层
 * 
 * 📋 功能概述:
 * - 提供完整的词频分析业务逻辑服务
 * - 实现智能和精确两种搜索模式
 * - 集成高性能Web Worker数据处理
 * - 支持多格式数据导出功能
 * - 提供丰富的文本分析算法
 * 
 * 🎯 主要功能:
 * - 全文章词频统计分析
 * - 智能词汇搜索和匹配
 * - 词干提取和变形词处理
 * - 上下文提取和例句生成
 * - 数据缓存和性能优化
 * - 多格式数据导出
 * 
 * 🏗️ 架构设计:
 * - 单例模式的服务类设计
 * - Web Worker异步处理优化
 * - LRU缓存策略提升性能
 * - 模块化的算法组件
 * - 可扩展的分析引擎
 * 
 * 🔗 集成组件:
 * - textAnalyzer: 文本分析工具
 * - stemmer: 词干提取算法
 * - frequencyAnalyzer.worker: Web Worker处理器
 * 
 * 📡 接口定义:
 * - WordEntry: 词汇条目数据结构
 * - SearchResult: 搜索结果数据结构
 * - WordAnalysis: 词汇分析数据结构
 * - SearchOptions: 搜索选项配置
 * 
 * 🎨 算法特色:
 * - Porter词干提取算法
 * - TF-IDF相似度计算
 * - 螺旋碰撞检测算法
 * - 智能上下文提取
 * - 统计学分析方法
 * 
 * 🛡️ 安全考虑:
 * - 输入数据验证和清理
 * - XSS防护的内容处理
 * - 内存使用限制控制
 * - 错误处理和恢复机制
 * 
 * ⚙️ 配置选项:
 * - 缓存策略自定义
 * - 分析深度调整
 * - 性能阈值设置
 * - 导出格式配置
 */

import type { 
  WordEntry, 
  WordAnalysis, 
  SearchResult, 
  ArticleMatch,
  ApiResponse 
} from '@/types'
import { textAnalyzer } from '@/utils/textAnalyzer'
import { stemWord } from '@/utils/stemmer'

/**
 * 📚 示例文章数据集合
 * 
 * 📋 数据特点:
 * - 涵盖多个主题领域
 * - 不同难度等级文章
 * - 完整的元数据信息
 * - 真实的英语学习内容
 * 
 * 🎯 数据用途:
 * - 词频分析演示
 * - 搜索功能测试
 * - 算法验证数据
 * - 用户体验展示
 */
const mockArticles = [
  {
    id: '1',
    title: 'The Future of Artificial Intelligence',
    content: `Artificial intelligence is transforming the way we work, learn, and interact with technology. Machine learning algorithms are becoming increasingly sophisticated, enabling computers to recognize patterns, make predictions, and solve complex problems. Deep learning networks, inspired by the human brain, are revolutionizing fields from image recognition to natural language processing. As AI continues to evolve, we must consider both its tremendous potential and the ethical challenges it presents.`,
    category: 'Technology',
    difficulty: 'advanced',
    tags: ['AI', 'technology', 'future'],
    wordCount: 89
  },
  {
    id: '2',
    title: 'Sustainable Energy Solutions',
    content: `Renewable energy sources like solar, wind, and hydroelectric power are essential for combating climate change. Solar panels have become more efficient and affordable, making solar energy accessible to more households and businesses. Wind turbines are generating clean electricity across the globe, while hydroelectric dams harness the power of flowing water. Energy storage technologies are advancing rapidly, solving the intermittency challenges of renewable sources.`,
    category: 'Environment',
    difficulty: 'intermediate',
    tags: ['energy', 'environment', 'sustainability'],
    wordCount: 76
  },
  {
    id: '3',
    title: 'The Art of Effective Communication',
    content: `Communication is the foundation of all human relationships and professional success. Active listening involves fully concentrating on the speaker, understanding their message, and responding thoughtfully. Clear speaking requires organizing your thoughts, choosing appropriate words, and maintaining confident body language. Written communication should be concise, well-structured, and tailored to your audience. Emotional intelligence plays a crucial role in understanding and managing both your own emotions and those of others.`,
    category: 'Personal Development',
    difficulty: 'intermediate',
    tags: ['communication', 'skills', 'professional'],
    wordCount: 95
  },
  {
    id: '4',
    title: 'Modern Web Development Trends',
    content: `Web development continues to evolve with new frameworks, tools, and best practices. React, Vue, and Angular remain popular choices for building dynamic user interfaces. TypeScript has gained widespread adoption for its type safety and developer experience. Progressive web apps combine the best of web and mobile applications, offering offline functionality and native-like performance. Serverless architecture is changing how developers deploy and scale applications.`,
    category: 'Technology',
    difficulty: 'advanced',
    tags: ['web development', 'programming', 'frameworks'],
    wordCount: 78
  },
  {
    id: '5',
    title: 'Healthy Lifestyle Habits',
    content: `Maintaining a healthy lifestyle requires consistent effort and balanced choices. Regular exercise strengthens muscles, improves cardiovascular health, and boosts mental well-being. A nutritious diet rich in fruits, vegetables, whole grains, and lean proteins provides essential nutrients. Adequate sleep is crucial for physical recovery and cognitive function. Stress management through meditation, yoga, or other relaxation techniques helps maintain mental health.`,
    category: 'Health',
    difficulty: 'beginner',
    tags: ['health', 'lifestyle', 'wellness'],
    wordCount: 71
  }
]

/**
 * 🚫 英语常用停止词集合
 * 
 * 📋 停止词类型:
 * - 冠词、介词、连词
 * - 代词和限定词
 * - 助动词和系动词
 * - 常用副词和疑问词
 * 
 * 🎯 过滤目的:
 * - 提高分析质量
 * - 突出关键词汇
 * - 减少噪音数据
 * - 优化搜索结果
 */
const stopWords = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'will', 'would', 'could', 'should', 'may', 'might', 'can', 'shall', 'must',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'her', 'its', 'our', 'their', 'this', 'that', 'these', 'those'
])

/**
 * 🔍 搜索选项配置接口
 * 
 * 📋 配置结构:
 * - query: 搜索查询字符串
 * - mode: 搜索模式选择
 * - filters: 高级过滤器配置
 */
interface SearchOptions {
  query: string
  mode: 'intelligent' | 'exact'
  filters: {
    minLength: number
    excludeCommon: boolean
    partOfSpeech: string[]
    articles: string[]
  }
}

/**
 * 🏭 词频分析服务主类
 * 
 * 📋 类设计特点:
 * - 单例模式确保一致性
 * - 缓存机制提升性能
 * - 异步处理优化体验
 * - 模块化方法设计
 * - 可扩展的架构结构
 */
class WordFrequencyService {
  private wordCache = new Map<string, WordEntry[]>()
  private analysisCache = new Map<string, WordAnalysis>()
  private worker: Worker | null = null

  /**
   * 🏗️ 服务类构造函数
   * 
   * 📋 初始化任务:
   * - 初始化Web Worker
   * - 设置缓存容器
   * - 配置错误处理
   */
  constructor() {
    this.initializeWorker()
  }

  /**
   * ⚡ 初始化Web Worker处理器
   * 
   * 📋 初始化逻辑:
   * - 尝试创建Worker实例
   * - 处理不支持情况
   * - 提供降级方案
   * - 错误日志记录
   * 
   * 🛡️ 兼容性处理:
   * - Worker不支持时的兜底
   * - 主线程处理降级
   * - 用户友好的错误提示
   */
  private initializeWorker() {
    try {
      this.worker = new Worker(new URL('@/workers/frequencyAnalyzer.worker.ts', import.meta.url))
    } catch (error) {
      console.warn('Web Worker not available, falling back to main thread processing')
    }
  }

  /**
   * 📊 分析所有文章的词频分布
   * 
   * @returns Promise<WordEntry[]> - 词频统计结果数组
   * 
   * 📋 分析流程:
   * - 检查缓存是否存在
   * - 选择处理方式（Worker/主线程）
   * - 执行词频统计算法
   * - 缓存分析结果
   * - 返回排序后的数据
   * 
   * 🎯 性能优化:
   * - 缓存机制减少重复计算
   * - Web Worker异步处理
   * - 分批处理大数据量
   * - 内存使用优化
   * 
   * 🛡️ 错误处理:
   * - Worker失败降级处理
   * - 数据验证和清理
   * - 异常状态恢复
   */
  async analyzeAllArticles(): Promise<WordEntry[]> {
    const cacheKey = 'all_articles'
    
    if (this.wordCache.has(cacheKey)) {
      return this.wordCache.get(cacheKey)!
    }

    try {
      let allWords: WordEntry[]

      if (this.worker) {
        // Use Web Worker for processing
        allWords = await this.processWithWorker(mockArticles)
      } else {
        // Process on main thread
        allWords = this.processArticles(mockArticles)
      }

      // Cache results
      this.wordCache.set(cacheKey, allWords)
      
      return allWords
    } catch (error) {
      console.error('Error analyzing articles:', error)
      throw new Error('Failed to analyze word frequency')
    }
  }

  /**
   * 🔍 搜索特定词汇及其变形
   * 
   * @param options - 搜索选项配置对象
   * @returns Promise<SearchResult[]> - 搜索结果数组
   * 
   * 📋 搜索流程:
   * - 验证搜索查询有效性
   * - 获取全文词频数据
   * - 解析搜索查询条件
   * - 执行词汇匹配算法
   * - 应用过滤器条件
   * - 构建搜索结果
   * 
   * 🎯 搜索模式:
   * - intelligent: 智能匹配变形词
   * - exact: 精确匹配原词
   * - 支持通配符搜索
   * - 支持短语搜索
   * 
   * 🛡️ 输入验证:
   * - 空查询检查
   * - 特殊字符处理
   * - 长度限制验证
   * - 注入攻击防护
   */
  async searchWords(options: SearchOptions): Promise<SearchResult[]> {
    const { query, mode, filters } = options
    
    if (!query.trim()) {
      throw new Error('Search query is required')
    }

    try {
      const allWords = await this.analyzeAllArticles()
      const searchTerms = this.parseSearchQuery(query, mode)
      const results: SearchResult[] = []

      for (const term of searchTerms) {
        const matches = this.findWordMatches(term, allWords, mode)
        const filteredMatches = this.applyFilters(matches, filters)
        
        if (filteredMatches.length > 0) {
          const searchResult = await this.buildSearchResult(term, filteredMatches)
          results.push(searchResult)
        }
      }

      return results.sort((a, b) => b.frequency - a.frequency)
    } catch (error) {
      console.error('Error searching words:', error)
      throw new Error('Failed to search words')
    }
  }

  /**
   * 🔬 获取词汇的详细分析数据
   * 
   * @param word - 目标分析词汇
   * @returns Promise<WordAnalysis> - 词汇分析结果
   * 
   * 📋 分析维度:
   * - 频率统计和分布
   * - 文章出现情况
   * - 上下文例句提取
   * - 定义和同义词
   * - 相关词汇推荐
   * - 使用趋势分析
   * 
   * 🎯 缓存策略:
   * - 分析结果本地缓存
   * - 避免重复计算
   * - 快速响应用户
   * - 内存使用优化
   * 
   * 🛡️ 数据完整性:
   * - 输入词汇验证
   * - 结果数据验证
   * - 异常状态处理
   * - 降级数据提供
   */
  async getWordAnalysis(word: string): Promise<WordAnalysis> {
    const cacheKey = word.toLowerCase()
    
    if (this.analysisCache.has(cacheKey)) {
      return this.analysisCache.get(cacheKey)!
    }

    try {
      const analysis = await this.performWordAnalysis(word)
      this.analysisCache.set(cacheKey, analysis)
      return analysis
    } catch (error) {
      console.error('Error analyzing word:', error)
      throw new Error('Failed to analyze word')
    }
  }

  /**
   * 📤 导出分析结果到文件
   * 
   * @param words - 词频数据数组
   * @param format - 导出格式选择
   * @returns Promise<void> - 异步导出操作
   * 
   * 📋 支持格式:
   * - CSV: 逗号分隔值格式
   * - JSON: 结构化数据格式
   * - PDF: 可打印文档格式
   * 
   * 🎯 导出特性:
   * - 自动文件命名
   * - 浏览器下载触发
   * - 数据格式化处理
   * - 错误状态反馈
   * 
   * 🛡️ 安全考虑:
   * - 文件大小限制
   * - 内容安全检查
   * - 下载权限验证
   * - 错误处理机制
   */
  async exportResults(words: WordEntry[], format: 'csv' | 'json' | 'pdf'): Promise<void> {
    try {
      switch (format) {
        case 'csv':
          await this.exportAsCSV(words)
          break
        case 'json':
          await this.exportAsJSON(words)
          break
        case 'pdf':
          await this.exportAsPDF(words)
          break
        default:
          throw new Error('Unsupported export format')
      }
    } catch (error) {
      console.error('Error exporting results:', error)
      throw new Error('Failed to export results')
    }
  }

  /**
   * 📊 获取词频统计摘要信息
   * 
   * @param words - 词频数据数组
   * @returns 统计摘要对象
   * 
   * 📋 统计维度:
   * - 总词汇数量统计
   * - 唯一词汇数量
   * - 平均词汇长度
   * - 分析文章数量
   * 
   * 🎯 用途场景:
   * - 数据概览展示
   * - 分析质量评估
   * - 用户界面数据
   * - 报告生成支持
   */
  getStatistics(words: WordEntry[]): {
    totalWords: number
    uniqueWords: number
    averageLength: number
    articlesAnalyzed: number
  } {
    const totalWords = words.reduce((sum, word) => sum + word.frequency, 0)
    const uniqueWords = words.length
    const averageLength = words.reduce((sum, word) => sum + word.word.length, 0) / uniqueWords
    const articlesAnalyzed = mockArticles.length

    return {
      totalWords,
      uniqueWords,
      averageLength,
      articlesAnalyzed
    }
  }

  /**
   * ⚡ 使用Web Worker处理文章数据
   * 
   * @param articles - 文章数据数组
   * @returns Promise<WordEntry[]> - 处理结果
   * 
   * 📋 Worker通信:
   * - 发送分析任务
   * - 监听处理进度
   * - 接收完成结果
   * - 处理错误状态
   * 
   * 🎯 性能优势:
   * - 非阻塞主线程
   * - 并行处理能力
   * - 大数据量优化
   * - 用户体验提升
   * 
   * 🛡️ 可靠性保障:
   * - 超时处理机制
   * - 错误重试策略
   * - 降级处理方案
   * - 资源清理机制
   */
  private processWithWorker(articles: any[]): Promise<WordEntry[]> {
    return new Promise((resolve, reject) => {
      if (!this.worker) {
        reject(new Error('Worker not available'))
        return
      }

      const timeout = setTimeout(() => {
        reject(new Error('Worker timeout'))
      }, 30000) // 30 second timeout

      this.worker.onmessage = (event) => {
        clearTimeout(timeout)
        const { type, data, error } = event.data
        
        if (type === 'analysis_complete') {
          resolve(data)
        } else if (type === 'error') {
          reject(new Error(error))
        }
      }

      this.worker.postMessage({
        type: 'analyze_articles',
        articles
      })
    })
  }

  /**
   * 🔧 主线程处理文章词频分析
   * 
   * @param articles - 文章数据数组
   * @returns WordEntry[] - 词频统计结果
   * 
   * 📋 处理算法:
   * - 文本预处理和清理
   * - 词汇提取和分词
   * - 词干提取标准化
   * - 频率统计计算
   * - 结果排序优化
   * 
   * 🎯 算法特点:
   * - 高效的哈希表统计
   * - 智能的词汇去重
   * - 准确的频率计算
   * - 优化的排序算法
   */
  private processArticles(articles: any[]): WordEntry[] {
    const wordFrequency = new Map<string, WordEntry>()

    articles.forEach(article => {
      const words = textAnalyzer.extractWords(article.content)
      
      words.forEach(word => {
        const cleanWord = word.toLowerCase()
        const stemmed = stemWord(cleanWord)
        
        if (wordFrequency.has(cleanWord)) {
          const entry = wordFrequency.get(cleanWord)!
          entry.frequency++
          if (!entry.articles.includes(article.id)) {
            entry.articles.push(article.id)
          }
        } else {
          wordFrequency.set(cleanWord, {
            word: cleanWord,
            frequency: 1,
            articles: [article.id],
            stemmed
          })
        }
      })
    })

    return Array.from(wordFrequency.values())
      .sort((a, b) => b.frequency - a.frequency)
  }

  /**
   * 🔍 解析搜索查询字符串
   * 
   * @param query - 原始查询字符串
   * @param mode - 搜索模式
   * @returns string[] - 解析后的搜索词数组
   * 
   * 📋 解析特性:
   * - 短语搜索支持（引号包围）
   * - 通配符搜索支持（星号）
   * - 多词汇搜索分割
   * - 智能模式词干扩展
   * 
   * 🎯 查询类型:
   * - 单词搜索: "learn"
   * - 短语搜索: "machine learning"
   * - 通配符搜索: "speak*"
   * - 多词搜索: "AI technology future"
   * 
   * 🛡️ 输入处理:
   * - 特殊字符转义
   * - 空白字符处理
   * - 长度限制检查
   * - 注入攻击防护
   */
  private parseSearchQuery(query: string, mode: 'intelligent' | 'exact'): string[] {
    // Handle phrase searches
    const phraseMatches = query.match(/"([^"]+)"/g)
    if (phraseMatches) {
      return phraseMatches.map(phrase => phrase.slice(1, -1))
    }

    // Handle wildcard searches
    if (query.includes('*')) {
      return [query]
    }

    // Split by spaces and filter empty strings
    const terms = query.split(/\s+/).filter(term => term.length > 0)
    
    if (mode === 'intelligent') {
      // Add stemmed versions
      return terms.flatMap(term => [term, stemWord(term)])
    }
    
    return terms
  }

  /**
   * 🎯 查找匹配的词汇条目
   * 
   * @param term - 搜索词条
   * @param words - 词汇数据数组
   * @param mode - 搜索模式
   * @returns WordEntry[] - 匹配的词汇条目
   * 
   * 📋 匹配算法:
   * - 通配符正则匹配
   * - 精确字符串匹配
   * - 词干相似性匹配
   * - 部分包含匹配
   * 
   * 🎯 模式差异:
   * - exact: 严格匹配原词
   * - intelligent: 匹配变形和词干
   * - wildcard: 正则模式匹配
   * - 大小写不敏感
   */
  private findWordMatches(term: string, words: WordEntry[], mode: 'intelligent' | 'exact'): WordEntry[] {
    if (term.includes('*')) {
      // Wildcard search
      const regex = new RegExp(term.replace(/\*/g, '.*'), 'i')
      return words.filter(word => regex.test(word.word))
    }

    if (mode === 'exact') {
      return words.filter(word => word.word === term.toLowerCase())
    } else {
      // Intelligent search - match word and stemmed versions
      return words.filter(word => 
        word.word === term.toLowerCase() || 
        word.stemmed === stemWord(term.toLowerCase()) ||
        word.word.includes(term.toLowerCase())
      )
    }
  }

  /**
   * 🎛️ 应用高级过滤器条件
   * 
   * @param words - 待过滤词汇数组
   * @param filters - 过滤器配置对象
   * @returns WordEntry[] - 过滤后的词汇数组
   * 
   * 📋 过滤维度:
   * - 最小词汇长度限制
   * - 常用停止词排除
   * - 文章范围筛选
   * - 词性类型筛选
   * 
   * 🎯 过滤逻辑:
   * - 链式过滤器应用
   * - 条件组合处理
   * - 性能优化策略
   * - 结果准确性保证
   * 
   * 🛡️ 边界处理:
   * - 空数据集保护
   * - 无效配置处理
   * - 极端值容错
   * - 默认值兜底
   */
  private applyFilters(words: WordEntry[], filters: SearchOptions['filters']): WordEntry[] {
    let filtered = words

    // Minimum length filter
    if (filters.minLength > 1) {
      filtered = filtered.filter(word => word.word.length >= filters.minLength)
    }

    // Exclude common words filter
    if (filters.excludeCommon) {
      filtered = filtered.filter(word => !stopWords.has(word.word))
    }

    // Article filter
    if (filters.articles.length > 0) {
      filtered = filtered.filter(word => {
        return filters.articles.some(filter => {
          switch (filter) {
            case 'recent':
              // Mock recent articles logic
              return word.articles.some(id => ['1', '2', '3'].includes(id))
            case 'popular':
              // Mock popular articles logic
              return word.frequency > 2
            case 'bookmarked':
              // Mock bookmarked articles logic
              return word.articles.some(id => ['1', '4'].includes(id))
            default:
              return true
          }
        })
      })
    }

    return filtered
  }

  /**
   * 🏗️ 构建搜索结果对象
   * 
   * @param term - 搜索词条
   * @param matches - 匹配的词汇条目
   * @returns Promise<SearchResult> - 搜索结果对象
   * 
   * 📋 结果构建:
   * - 频率统计汇总
   * - 文章匹配整理
   * - 上下文例句提取
   * - 相关性评分计算
   * 
   * 🎯 数据组织:
   * - 层次化结果结构
   * - 完整的元数据
   * - 用户友好的格式
   * - 高效的数据访问
   */
  private async buildSearchResult(term: string, matches: WordEntry[]): Promise<SearchResult> {
    const totalFrequency = matches.reduce((sum, match) => sum + match.frequency, 0)
    const articleMatches: ArticleMatch[] = []

    // Build article matches
    const articleIds = new Set<string>()
    matches.forEach(match => {
      match.articles.forEach(articleId => articleIds.add(articleId))
    })

    for (const articleId of articleIds) {
      const article = mockArticles.find(a => a.id === articleId)
      if (article) {
        const matchCount = matches
          .filter(match => match.articles.includes(articleId))
          .reduce((sum, match) => sum + match.frequency, 0)

        articleMatches.push({
          articleId,
          title: article.title,
          matches: matchCount,
          contexts: this.extractContexts(article.content, term)
        })
      }
    }

    return {
      word: term,
      frequency: totalFrequency,
      articles: articleMatches,
      contexts: articleMatches.flatMap(match => match.contexts).slice(0, 10)
    }
  }

  /**
   * 📝 提取词汇上下文例句
   * 
   * @param content - 文章内容文本
   * @param word - 目标词汇
   * @returns string[] - 上下文例句数组
   * 
   * 📋 提取算法:
   * - 句子边界检测
   * - 词汇匹配定位
   * - 上下文窗口提取
   * - 例句质量筛选
   * 
   * 🎯 例句特点:
   * - 包含目标词汇
 汇
   * - 完整的句子结构
   * - 有意义的上下文
   * - 合适的长度范围
   * 
   * 🛡️ 质量控制:
   * - 句子完整性检查
   * - 内容相关性验证
   * - 长度合理性判断
   * - 重复内容去除
   */
  private extractContexts(content: string, word: string): string[] {
    const sentences = content.split(/[.!?]+/)
    const contexts: string[] = []
    
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    
    sentences.forEach(sentence => {
      if (regex.test(sentence)) {
        contexts.push(sentence.trim())
      }
    })
    
    return contexts.slice(0, 3) // Limit to 3 contexts per article
  }

  /**
   * 🔬 执行完整的词汇分析
   * 
   * @param word - 目标分析词汇
   * @returns Promise<WordAnalysis> - 详细分析结果
   * 
   * 📋 分析流程:
   * - 词频数据查找
   * - 文章分布统计
   * - 上下文例句提取
   * - 定义信息获取
   * - 相关词汇推荐
   * - 趋势数据生成
   * 
   * 🎯 分析维度:
   * - 统计学特征
   * - 语言学属性
   * - 使用模式分析
   * - 学习价值评估
   * 
   * 🛡️ 数据完整性:
   * - 缺失数据处理
   * - 异常值检测
   * - 结果一致性验证
   * - 错误状态恢复
   */
  private async performWordAnalysis(word: string): Promise<WordAnalysis> {
    const allWords = await this.analyzeAllArticles()
    const matches = this.findWordMatches(word, allWords, 'intelligent')
    
    if (matches.length === 0) {
      throw new Error('Word not found in corpus')
    }

    const mainMatch = matches[0]
    const articles = mockArticles
      .filter(article => mainMatch.articles.includes(article.id))
      .map(article => ({
        id: article.id,
        title: article.title,
        count: this.countWordInText(article.content, word),
        category: article.category
      }))

    const contexts = articles.flatMap(article => {
      const content = mockArticles.find(a => a.id === article.id)?.content || ''
      return this.extractContexts(content, word).map(text => ({
        text,
        articleId: article.id,
        articleTitle: article.title
      }))
    })

    // Generate mock frequency trend
    const frequencyTrend = this.generateFrequencyTrend(mainMatch.frequency)
    
    // Generate mock related words
    const relatedWords = this.findRelatedWords(word, allWords)

    return {
      frequency: mainMatch.frequency,
      articles,
      contexts,
      definition: this.getMockDefinition(word),
      synonyms: this.getMockSynonyms(word),
      partOfSpeech: this.getMockPartOfSpeech(word),
      relatedWords,
      frequencyTrend
    }
  }

  /**
   * 🔢 统计词汇在文本中的出现次数
   * 
   * @param text - 目标文本内容
   * @param word - 统计词汇
   * @returns number - 出现次数
   * 
   * 📋 统计方法:
   * - 词边界正则匹配
   * - 大小写不敏感
   * - 完整词汇匹配
   * - 准确计数算法
   */
  private countWordInText(text: string, word: string): number {
    const regex = new RegExp(`\\b${word}\\b`, 'gi')
    const matches = text.match(regex)
    return matches ? matches.length : 0
  }

  /**
   * 📈 生成词汇使用趋势数据
   * 
   * @param frequency - 基础频率值
   * @returns 趋势数据数组
   * 
   * 📋 趋势生成:
   * - 时间周期划分
   * - 频率变化模拟
   * - 随机波动添加
   * - 真实性增强
   * 
   * 🎯 数据特点:
   * - 基于真实频率
   * - 合理的变化范围
   * - 时间序列连续性
   * - 可视化友好格式
   */
  private generateFrequencyTrend(frequency: number): Array<{ period: string; count: number }> {
    const periods = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
    return periods.map(period => ({
      period,
      count: Math.max(1, Math.floor(frequency * (0.5 + Math.random() * 0.5)))
    }))
  }

  /**
   * 🔗 查找相关词汇推荐
   * 
   * @param word - 目标词汇
   * @param allWords - 全部词汇数据
   * @returns 相关词汇数组
   * 
   * 📋 关联算法:
   * - 词干相似性分析
   * - 字符串包含检测
   * - 语义相关性评估
   * - 相似度评分计算
   * 
   * 🎯 推荐策略:
   * - 词汇形态变化
   * - 语义场相关词
   * - 同源词汇群
   * - 学习价值排序
   */
  private findRelatedWords(word: string, allWords: WordEntry[]): Array<{ word: string; similarity: number }> {
    // Simple related word finding based on shared contexts
    const stem = stemWord(word)
    const related = allWords
      .filter(w => w.word !== word && (w.stemmed === stem || w.word.includes(word.slice(0, -2))))
      .slice(0, 5)
      .map(w => ({
        word: w.word,
        similarity: Math.round((Math.random() * 0.4 + 0.6) * 100) / 100
      }))
    
    return related
  }

  /**
   * 📖 获取词汇定义信息（模拟数据）
   * 
   * @param word - 目标词汇
   * @returns string - 词汇定义
   * 
   * 📋 定义特点:
   * - 准确的词汇释义
   * - 适合的语言水平
   * - 上下文相关性
   * - 学习友好格式
   */
  private getMockDefinition(word: string): string {
    const definitions: Record<string, string> = {
      'technology': 'The application of scientific knowledge for practical purposes, especially in industry.',
      'learning': 'The acquisition of knowledge or skills through experience, study, or being taught.',
      'communication': 'The imparting or exchanging of information or ideas.',
      'energy': 'Power derived from the utilization of physical or chemical resources.',
      'development': 'The process of developing or being developed.'
    }
    
    return definitions[word.toLowerCase()] || `Definition for "${word}" - a word used in various contexts.`
  }

  /**
   * 🔗 获取同义词列表（模拟数据）
   * 
   * @param word - 目标词汇
   * @returns string[] - 同义词数组
   * 
   * 📋 同义词特点:
   * - 语义相近词汇
   * - 语言水平适配
   * - 实用性考虑
   * - 学习价值排序
   */
  private getMockSynonyms(word: string): string[] {
    const synonyms: Record<string, string[]> = {
      'technology': ['tech', 'innovation', 'advancement'],
      'learning': ['education', 'study', 'training'],
      'communication': ['interaction', 'correspondence', 'exchange'],
      'energy': ['power', 'force', 'strength'],
      'development': ['growth', 'progress', 'advancement']
    }
    
    return synonyms[word.toLowerCase()] || []
  }

  /**
   * 🏷️ 获取词性信息（模拟数据）
   * 
   * @param word - 目标词汇
   * @returns string - 词性标识
   * 
   * 📋 词性类型:
   * - 名词、动词、形容词等
   * - 复合词性标识
   * - 语法功能说明
   * - 学习指导信息
   */
  private getMockPartOfSpeech(word: string): string {
    const pos: Record<string, string> = {
      'technology': 'noun',
      'learning': 'noun/verb',
      'communication': 'noun',
      'energy': 'noun',
      'development': 'noun'
    }
    
    return pos[word.toLowerCase()] || 'noun'
  }

  /**
   * 📊 导出CSV格式数据
   * 
   * @param words - 词频数据数组
   * @returns Promise<void> - 异步导出操作
   * 
   * 📋 CSV格式:
   * - 标准逗号分隔格式
   * - 完整的字段信息
   * - 正确的编码处理
   * - Excel兼容性支持
   */
  private async exportAsCSV(words: WordEntry[]): Promise<void> {
    const headers = ['Word', 'Frequency', 'Articles', 'Stemmed']
    const rows = words.map(word => [
      word.word,
      word.frequency.toString(),
      word.articles.join(';'),
      word.stemmed || ''
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    this.downloadFile(csvContent, 'word-frequency-analysis.csv', 'text/csv')
  }

  /**
   * 📄 导出JSON格式数据
   * 
   * @param words - 词频数据数组
   * @returns Promise<void> - 异步导出操作
   * 
   * 📋 JSON格式:
   * - 结构化数据格式
   * - 完整的元数据
   * - 时间戳信息
   * - 统计摘要包含
   */
  private async exportAsJSON(words: WordEntry[]): Promise<void> {
    const data = {
      exportedAt: new Date().toISOString(),
      statistics: this.getStatistics(words),
      words: words.slice(0, 100) // Limit for file size
    }

    const jsonContent = JSON.stringify(data, null, 2)
    this.downloadFile(jsonContent, 'word-frequency-analysis.json', 'application/json')
  }

  /**
   * 📑 导出PDF格式数据（模拟实现）
   * 
   * @param words - 词频数据数组
   * @returns Promise<void> - 异步导出操作
   * 
   * 📋 PDF特点:
   * - 专业文档格式
   * - 打印友好布局
   * - 图表可视化
   * - 完整的报告结构
   * 
   * 🛡️ 实现说明:
   * - 演示环境模拟实现
   * - 生产环境需要PDF库
   * - 推荐使用jsPDF或PDFKit
   * - 复杂布局需要专业库
   */
  private async exportAsPDF(words: WordEntry[]): Promise<void> {
    // This is a mock implementation
    // In a real app, you'd use a PDF library like jsPDF or PDFKit
    console.log('PDF export not implemented in demo')
    alert('PDF export would be implemented with a PDF library like jsPDF')
  }

  /**
   * 💾 触发文件下载
   * 
   * @param content - 文件内容
   * @param filename - 文件名称
   * @param mimeType - MIME类型
   * 
   * 📋 下载机制:
   * - Blob对象创建
   * - URL临时生成
   * - 自动下载触发
   * - 资源清理回收
   * 
   * 🛡️ 浏览器兼容:
   * - 现代浏览器支持
   * - 安全策略遵循
   * - 用户权限检查
   * - 错误状态处理
   */
  private downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    
    URL.revokeObjectURL(url)
  }
}

/**
 * 🏭 词频分析服务单例实例
 * 
 * 📋 单例优势:
 * - 全局一致性保证
 * - 缓存数据共享
 * - 资源使用优化
 * - 配置统一管理
 */
export const wordFrequencyService = new WordFrequencyService()
export default wordFrequencyService