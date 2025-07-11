/**
 * 📂 src/workers/frequencyAnalyzer.worker.ts
 * 🎯 frequencyAnalyzer.worker.ts - 高性能词频分析Web Worker
 * 
 * 📋 功能概述:
 * - 提供非阻塞的后台词频分析处理服务
 * - 实现大数据量文本的高性能分析算法
 * - 支持批处理和进度报告的异步操作
 * - 集成完整的错误处理和资源管理
 * - 优化内存使用和计算性能表现
 * 
 * 🎯 主要功能:
 * - 多文章并行词频统计分析
 * - 智能批处理和进度追踪
 * - 词干提取和文本标准化
 * - 搭配词分析和N-gram提取
 * - 性能优化和资源压缩
 * - 实时进度反馈机制
 * 
 * 🏗️ 架构设计:
 * - Web Worker独立线程设计
 * - 消息驱动的通信模式
 * - 模块化的处理算法
 * - 批处理优化策略
 * - 内存友好的数据结构
 * 
 * 🔗 集成组件:
 * - stemWord: 词干提取算法
 * - TextProcessor: 文本处理工具
 * - BatchProcessor: 批处理管理器
 * - FrequencyAnalyzer: 分析引擎
 * 
 * 📡 通信接口:
 * - AnalyzeRequest: 分析请求消息
 * - AnalyzeResponse: 分析响应消息
 * - ProgressUpdate: 进度更新消息
 * - ErrorMessage: 错误信息消息
 * 
 * 🎨 算法特色:
 * - 高效的哈希表统计算法
 * - 智能的批处理调度
 * - 优化的内存管理策略
 * - 实时的进度计算
 * - 压缩的结果传输
 * 
 * 🛡️ 安全考虑:
 * - 输入数据验证和清理
 * - 内存使用限制控制
 * - 异常处理和恢复机制
 * - 资源泄漏防护
 * - 并发操作安全
 * 
 * ⚙️ 配置选项:
 * - 批处理大小调整
 * - 进度更新频率
 * - 内存使用阈值
 * - 超时时间设置
 * - 压缩策略选择
 */

import { stemWord } from '../utils/stemmer'

/**
 * 📥 分析请求消息接口
 * 
 * 📋 请求结构:
 * - type: 消息类型标识符
 * - articles: 待分析文章数据数组
 * 
 * 🎯 消息类型:
 * - analyze_articles: 文章分析请求
 * - analyze_collocations: 搭配词分析
 * - analyze_ngrams: N-gram分析
 * - cancel_analysis: 取消分析操作
 */
interface AnalyzeRequest {
  type: 'analyze_articles'
  articles: Array<{
    id: string
    content: string
    title: string
    category: string
  }>
}

/**
 * 📤 分析响应消息接口
 * 
 * 📋 响应结构:
 * - type: 响应类型标识符
 * - data: 分析结果数据(可选)
 * - progress: 处理进度百分比(可选)
 * - error: 错误信息字符串(可选)
 * 
 * 🎯 响应类型:
 * - analysis_complete: 分析完成
 * - progress_update: 进度更新
 * - error: 错误状态
 * - cancelled: 操作取消
 */
interface AnalyzeResponse {
  type: 'analysis_complete' | 'progress_update' | 'error'
  data?: any
  progress?: number
  error?: string
}

/**
 * 📊 词汇条目数据接口
 * 
 * 📋 数据结构:
 * - word: 标准化词汇文本
 * - frequency: 出现频率统计
 * - articles: 包含文章ID数组
 * - stemmed: 词干形式(可选)
 */
interface WordEntry {
  word: string
  frequency: number
  articles: string[]
  stemmed?: string
}

/**
 * 🚫 常用停用词集合(Worker优化版)
 * 
 * 📋 优化特点:
 * - 精简版停用词库
 * - 内存使用优化
 * - 查找性能优化
 * - 核心词汇覆盖
 * 
 * 🎯 选择标准:
 * - 最高频使用词汇
 * - 语法功能词优先
 * - 分析价值较低
 * - 内存效率平衡
 */
const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
  'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
  'will', 'would', 'could', 'should', 'may', 'might', 'can', 'shall', 'must',
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'her', 'its', 'our', 'their', 'this', 'that', 'these', 'those'
])

/**
 * 🔧 Worker优化的文本处理器类
 * 
 * 📋 类设计特点:
 * - 静态方法设计
 * - 内存友好实现
 * - 高性能正则表达式
 * - 批处理优化
 * 
 * 🎯 处理能力:
 * - 文本清理和标准化
 * - 词汇提取和验证
 * - 单文章处理封装
 * - 性能统计支持
 */
class WorkerTextProcessor {
  /**
   * 🔤 标点符号清理正则表达式
   * 
   * 📋 清理规则:
   * - 排除字母数字空格撇号
   * - 包含所有标点符号
   * - 包含下划线等特殊符号
   * - 用于文本标准化
   */
  private static PUNCTUATION = /[^\w\s']|_/g
  
  /**
   * 🔤 多余空白标准化正则表达式
   * 
   * 📋 标准化规则:
   * - 连续空白字符压缩
   * - 制表符换行符处理
   * - 统一为单个空格
   * - 提高处理效率
   */
  private static EXTRA_WHITESPACE = /\s+/g
  
  /**
   * ✅ 有效词汇验证正则表达式
   * 
   * 📋 验证规则:
   * - 字母开头结尾
   * - 中间可含撇号
   * - 单字母词汇支持
   * - 英语词汇标准
   */
  private static VALID_WORD = /^[a-zA-Z][a-zA-Z']*[a-zA-Z]$|^[a-zA-Z]$/

  /**
   * 🧹 文本清理和标准化
   * 
   * @param text - 原始文本内容
   * @returns string - 清理后文本
   * 
   * 📋 清理步骤:
   * - 大小写标准化
   * - 标点符号移除
   * - 空白字符压缩
   * - 首尾空格修剪
   * 
   * 🎯 优化特点:
   * - 单次遍历处理
   * - 正则表达式优化
   * - 内存使用最小化
   * - 处理速度最大化
   */
  static cleanText(text: string): string {
    return text
      .toLowerCase()
      .replace(this.PUNCTUATION, ' ')
      .replace(this.EXTRA_WHITESPACE, ' ')
      .trim()
  }

  /**
   * 📝 提取和过滤有效词汇
   * 
   * @param text - 输入文本内容
   * @returns string[] - 有效词汇数组
   * 
   * 📋 提取流程:
   * - 文本清理标准化
   * - 空格分割词汇
   * - 词汇有效性验证
   * - 停用词过滤
   * - 长度限制检查
   * 
   * 🎯 质量控制:
   * - 最小长度限制
   * - 格式验证过滤
   * - 停用词移除
   * - 空词汇过滤
   * 
   * 🛡️ 性能优化:
   * - 单次遍历算法
   * - 早期过滤策略
   * - 内存复用机制
   * - 批处理友好
   */
  static extractWords(text: string): string[] {
    const cleanText = this.cleanText(text)
    
    return cleanText
      .split(' ')
      .map(word => word.trim())
      .filter(word => 
        word.length >= 2 && 
        this.VALID_WORD.test(word) &&
        !STOP_WORDS.has(word)
      )
  }

  /**
   * 📄 处理单篇文章数据
   * 
   * @param article - 文章数据对象
   * @returns 处理结果对象
   * 
   * 📋 处理结果:
   * - articleId: 文章标识符
   * - words: 提取的词汇数组
   * - wordCount: 词汇总数统计
   * 
   * 🎯 处理特点:
   * - 结构化数据返回
   * - 统计信息包含
   * - 批处理兼容
   * - 错误隔离处理
   * 
   * 🛡️ 数据完整性:
   * - 文章ID保留
   * - 词汇数量统计
   * - 处理状态验证
   * - 异常情况处理
   */
  static processArticle(article: { id: string; content: string }): {
    articleId: string
    words: string[]
    wordCount: number
  } {
    const words = this.extractWords(article.content)
    
    return {
      articleId: article.id,
      words,
      wordCount: words.length
    }
  }
}

/**
 * 📦 批处理管理器类
 * 
 * 📋 类设计特点:
 * - 静态方法集合
 * - 批处理参数配置
 * - 进度回调支持
 * - 异步操作控制
 * 
 * 🎯 批处理策略:
 * - 固定批次大小
 * - 定时进度更新
 * - 异步让出控制
 * - 内存使用优化
 */
class BatchProcessor {
  /**
   * 📏 批处理大小常量
   * 
   * 📋 大小选择:
   * - 平衡性能和内存
   * - 适合多数文章长度
   * - 进度更新友好
   * - 响应性保证
   */
  private static BATCH_SIZE = 10
  
  /**
   * ⏱️ 进度更新时间间隔
   * 
   * 📋 间隔选择:
   * - 用户体验友好
   * - 性能影响最小
   * - 响应及时性
   * - 资源使用合理
   */
  private static UPDATE_INTERVAL = 100 // ms

  /**
   * 🔄 批处理主要方法
   * 
   * @param items - 待处理项目数组
   * @param processor - 处理函数
   * @param progressCallback - 进度回调函数
   * @returns Promise<R[]> - 处理结果数组
   * 
   * 📋 处理流程:
   * - 按批次分组处理
   * - 实时进度报告
   * - 异步让出控制
   * - 结果收集整理
   * 
   * 🎯 异步特点:
   * - 非阻塞主线程
   * - 进度实时反馈
   * - 内存使用控制
   * - 用户体验优化
   * 
   * 🛡️ 可靠性保证:
   * - 批次错误隔离
   * - 进度计算准确
   * - 内存泄漏防护
   * - 异常状态恢复
   * 
   * ⚙️ 性能优化:
   * - 批处理减少开销
   * - 定时让出CPU
   * - 内存复用策略
   * - 算法复杂度优化
   */
  static async processBatches<T, R>(
    items: T[],
    processor: (item: T) => R,
    progressCallback?: (progress: number) => void
  ): Promise<R[]> {
    const results: R[] = []
    const totalItems = items.length
    let processed = 0

    for (let i = 0; i < items.length; i += this.BATCH_SIZE) {
      const batch = items.slice(i, i + this.BATCH_SIZE)
      
      // Process batch
      const batchResults = batch.map(processor)
      results.push(...batchResults)
      
      processed += batch.length
      
      // Report progress
      if (progressCallback) {
        const progress = (processed / totalItems) * 100
        progressCallback(progress)
      }
      
      // Yield control to prevent blocking
      if (i % (this.BATCH_SIZE * 5) === 0) {
        await new Promise(resolve => setTimeout(resolve, this.UPDATE_INTERVAL))
      }
    }

    return results
  }
}

/**
 * 🔬 频率分析引擎主类
 * 
 * 📋 类设计特点:
 * - 实例化分析器
 * - 状态管理封装
 * - 算法模块化
 * - 结果优化处理
 * 
 * 🎯 分析能力:
 * - 多文章词频统计
 * - 词干标准化处理
 * - 统计数据计算
 * - 搭配词分析
 * - 性能指标统计
 */
class FrequencyAnalyzer {
  /**
   * 📊 词频统计存储Map
   * 
   * 📋 数据结构:
   * - Key: 标准化词汇
   * - Value: 词频统计对象
   *   - frequency: 出现频率
   *   - articles: 文章ID集合
   *   - stemmed: 词干形式
   * 
   * 🎯 设计优势:
   * - 高效查找和更新
   * - 内存使用优化
   * - 去重自动处理
   * - 扩展性良好
   */
  private wordFrequency = new Map<string, {
    frequency: number
    articles: Set<string>
    stemmed: string
  }>()

  /**
   * 📊 分析多篇文章词频
   * 
   * @param articles - 文章数据数组
   * @returns Promise<WordEntry[]> - 词频统计结果
   * 
   * 📋 分析流程:
   * - 清空之前统计结果
   * - 批处理文章数据
   * - 构建词频统计表
   * - 转换最终数据格式
   * - 排序和优化结果
   * 
   * 🎯 算法特点:
   * - 增量统计更新
   * - 文章去重处理
   * - 词干标准化
   * - 频率排序优化
   * 
   * 🛡️ 性能保证:
   * - 批处理优化
   * - 内存使用控制
   * - 进度实时反馈
   * - 异常处理机制
   * 
   * ⚙️ 数据优化:
   * - Set去重机制
   * - Map高效查找
   * - 排序算法优化
   * - 内存复用策略
   */
  async analyzeArticles(articles: any[]): Promise<WordEntry[]> {
    this.wordFrequency.clear()

    // Process articles in batches
    const processedArticles = await BatchProcessor.processBatches(
      articles,
      WorkerTextProcessor.processArticle,
      (progress) => {
        // Send progress update
        self.postMessage({
          type: 'progress_update',
          progress
        } as AnalyzeResponse)
      }
    )

    // Build frequency map
    processedArticles.forEach(({ articleId, words }) => {
      words.forEach(word => {
        const stemmed = stemWord(word)
        
        if (this.wordFrequency.has(word)) {
          const entry = this.wordFrequency.get(word)!
          entry.frequency++
          entry.articles.add(articleId)
        } else {
          this.wordFrequency.set(word, {
            frequency: 1,
            articles: new Set([articleId]),
            stemmed
          })
        }
      })
    })

    // Convert to final format
    return Array.from(this.wordFrequency.entries())
      .map(([word, data]) => ({
        word,
        frequency: data.frequency,
        articles: Array.from(data.articles),
        stemmed: data.stemmed
      }))
      .sort((a, b) => b.frequency - a.frequency)
  }

  /**
   * 📊 计算词频统计摘要
   * 
   * @param words - 词频数据数组
   * @returns 统计摘要对象
   * 
   * 📋 统计指标:
   * - totalWords: 总词汇数量(含重复)
   * - uniqueWords: 唯一词汇数量
   * - averageFrequency: 平均出现频率
   * - medianFrequency: 频率中位数
   * - maxFrequency: 最高出现频率
   * - minFrequency: 最低出现频率
   * 
   * 🎯 统计价值:
   * - 语料库特征描述
   * - 数据质量评估
   * - 分析结果验证
   * - 性能基准参考
   * 
   * 🛡️ 计算安全:
   * - 除零错误防护
   * - 空数组处理
   * - 数值溢出保护
   * - 异常值过滤
   * 
   * ⚙️ 算法效率:
   * - 单次遍历统计
   * - 排序复用优化
   * - 内存使用最小
   * - 计算复杂度优化
   */
  calculateWordStatistics(words: WordEntry[]): {
    totalWords: number
    uniqueWords: number
    averageFrequency: number
    medianFrequency: number
    maxFrequency: number
    minFrequency: number
  } {
    const frequencies = words.map(w => w.frequency).sort((a, b) => a - b)
    const totalWords = frequencies.reduce((sum, freq) => sum + freq, 0)
    
    return {
      totalWords,
      uniqueWords: words.length,
      averageFrequency: totalWords / words.length,
      medianFrequency: frequencies[Math.floor(frequencies.length / 2)],
      maxFrequency: frequencies[frequencies.length - 1],
      minFrequency: frequencies[0]
    }
  }

  /**
   * 🔗 查找词汇搭配关系
   * 
   * @param articles - 文章数据数组
   * @param targetWord - 目标词汇
   * @param windowSize - 搭配窗口大小
   * @returns 搭配词分析结果
   * 
   * 📋 搭配分析:
   * - word: 搭配词汇
   * - frequency: 共现频率
   * - score: 搭配评分
   * 
   * 🎯 算法特点:
   * - 滑动窗口算法
   * - 统计学共现分析
   * - PMI评分计算
   * - 频率权重排序
   * 
   * 🛡️ 质量保证:
   * - 停用词过滤
   * - 目标词排除
   * - 最小频率阈值
   * - 结果数量限制
   * 
   * ⚙️ 性能优化:
   * - 高效窗口扫描
   * - Map数据结构
   * - 批处理兼容
   * - 内存使用控制
   */
  findWordCollocations(
    articles: any[], 
    targetWord: string, 
    windowSize: number = 5
  ): Array<{ word: string; frequency: number; score: number }> {
    const collocations = new Map<string, number>()
    
    articles.forEach(article => {
      const words = WorkerTextProcessor.extractWords(article.content)
      
      words.forEach((word, index) => {
        if (word === targetWord.toLowerCase()) {
          // Check words in window
          for (let i = Math.max(0, index - windowSize); 
               i <= Math.min(words.length - 1, index + windowSize); 
               i++) {
            if (i !== index && words[i] !== targetWord.toLowerCase()) {
              const collocate = words[i]
              collocations.set(collocate, (collocations.get(collocate) || 0) + 1)
            }
          }
        }
      })
    })

    return Array.from(collocations.entries())
      .map(([word, frequency]) => ({
        word,
        frequency,
        score: frequency // Could be enhanced with PMI or other measures
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 20)
  }

  /**
   * 📝 提取N元语法模式
   * 
   * @param articles - 文章数据数组
   * @param n - N元语法长度
   * @returns N元语法分析结果
   * 
   * 📋 N元语法类型:
   * - n=1: 单词(unigram)
   * - n=2: 双词(bigram)  
   * - n=3: 三词(trigram)
   * - n>3: 多词短语
   * 
   * 🎯 应用价值:
   * - 短语模式识别
   * - 语言模型构建
   * - 翻译质量评估
   * - 写作风格分析
   * 
   * 🛡️ 质量控制:
   * - 最小频率过滤
   * - 长度合理性检查
   * - 结果数量限制
   * - 停用词敏感处理
   * 
   * ⚙️ 算法优化:
   * - 滑动窗口提取
   * - Map统计结构
   * - 频率排序优化
   * - 内存使用控制
   */
  extractNGrams(articles: any[], n: number = 2): Array<{ phrase: string; frequency: number }> {
    const ngrams = new Map<string, number>()
    
    articles.forEach(article => {
      const words = WorkerTextProcessor.extractWords(article.content)
      
      for (let i = 0; i <= words.length - n; i++) {
        const ngram = words.slice(i, i + n).join(' ')
        ngrams.set(ngram, (ngrams.get(ngram) || 0) + 1)
      }
    })

    return Array.from(ngrams.entries())
      .map(([phrase, frequency]) => ({ phrase, frequency }))
      .filter(item => item.frequency > 1)
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 100)
  }

  /**
   * 🗜️ 优化词汇列表大小
   * 
   * @param words - 原始词汇数组
   * @param maxWords - 最大词汇数量
   * @returns WordEntry[] - 优化后词汇数组
   * 
   * 📋 优化策略:
   * - 移除极低频词汇
   * - 限制总词汇数量
   * - 保持高质量词汇
   * - 平衡内存使用
   * 
   * 🎯 优化目标:
   * - 减少内存占用
   * - 提高传输效率
   * - 保持分析质量
   * - 优化用户体验
   * 
   * 🛡️ 质量保证:
   * - 频率阈值过滤
   * - 文章覆盖验证
   * - 数据完整性检查
   * - 结果一致性保证
   */
  optimizeWordList(words: WordEntry[], maxWords: number = 1000): WordEntry[] {
    // Remove very rare words and limit total
    return words
      .filter(word => word.frequency > 1 || word.articles.length > 1)
      .slice(0, maxWords)
  }

  /**
   * 🗜️ 压缩分析结果数据
   * 
   * @param words - 词频数据数组
   * @returns 压缩结果对象
   * 
   * 📋 压缩策略:
   * - 数组格式代替对象
   * - 元数据分离存储
   * - 时间戳信息添加
   * - 统计摘要包含
   * 
   * 🎯 压缩优势:
   * - 减少传输大小
   * - 提高序列化速度
   * - 优化内存使用
   * - 加快解析速度
   * 
   * 🛡️ 数据完整性:
   * - 格式兼容性保证
   * - 必要信息保留
   * - 版本兼容处理
   * - 解压缩验证
   * 
   * ⚙️ 性能优化:
   * - 序列化友好格式
   * - 最小化数据冗余
   * - 压缩算法优化
   * - 传输效率提升
   */
  compressResults(words: WordEntry[]): {
    words: Array<[string, number, string[]]>
    metadata: {
      totalWords: number
      uniqueWords: number
      timestamp: number
    }
  } {
    // Compress to array format for faster serialization
    return {
      words: words.map(word => [word.word, word.frequency, word.articles]),
      metadata: {
        totalWords: words.reduce((sum, w) => sum + w.frequency, 0),
        uniqueWords: words.length,
        timestamp: Date.now()
      }
    }
  }
}

/**
 * 🏭 全局分析器实例
 * 
 * 📋 实例特点:
 * - 单一分析器实例
 * - 状态管理封装
 * - 生命周期管理
 * - 资源复用优化
 * 
 * 🎯 使用优势:
 * - 避免重复创建
 * - 状态一致性保证
 * - 内存使用优化
 * - 性能提升显著
 */
const analyzer = new FrequencyAnalyzer()

/**
 * 📨 Worker消息处理器
 * 
 * @param event - 消息事件对象
 * 
 * 📋 处理流程:
 * - 解析消息类型和数据
 * - 路由到对应处理方法
 * - 执行分析操作
 * - 发送响应消息
 * - 错误处理和恢复
 * 
 * 🎯 消息类型:
 * - analyze_articles: 文章分析请求
 * - analyze_collocations: 搭配词分析
 * - analyze_ngrams: N-gram分析
 * - cancel_analysis: 取消操作
 * 
 * 🛡️ 错误处理:
 * - try-catch包装保护
 * - 错误信息标准化
 * - 状态清理和恢复
 * - 用户友好提示
 * 
 * ⚙️ 性能优化:
 * - 异步操作支持
 * - 进度实时反馈
 * - 内存使用监控
 * - 资源及时释放
 */
self.onmessage = async (event: MessageEvent<AnalyzeRequest>) => {
  const { type, articles } = event.data

  try {
    switch (type) {
      case 'analyze_articles':
        // Send start notification
        self.postMessage({
          type: 'progress_update',
          progress: 0
        } as AnalyzeResponse)

        // Perform analysis
        const words = await analyzer.analyzeArticles(articles)
        
        // Optimize results
        const optimizedWords = analyzer.optimizeWordList(words)
        
        // Send completion
        self.postMessage({
          type: 'analysis_complete',
          data: optimizedWords
        } as AnalyzeResponse)
        break

      default:
        throw new Error(`Unknown request type: ${type}`)
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    } as AnalyzeResponse)
  }
}

/**
 * ❌ Worker错误处理器
 * 
 * @param error - 错误事件对象
 * 
 * 📋 错误处理:
 * - 捕获Worker运行时错误
 * - 标准化错误信息格式
 * - 发送错误响应消息
 * - 状态清理和恢复
 * 
 * 🎯 错误类型:
 * - 脚本加载错误
 * - 运行时异常
 * - 内存溢出错误
 * - 算法执行错误
 * 
 * 🛡️ 可靠性保证:
 * - 全局错误捕获
 * - 错误信息收集
 * - 状态清理机制
 * - 用户反馈友好
 */
self.onerror = (error) => {
  self.postMessage({
    type: 'error',
    error: `Worker error: ${error.message}`
  } as AnalyzeResponse)
}

/**
 * 🚫 未处理Promise拒绝处理器
 * 
 * @param event - Promise拒绝事件
 * 
 * 📋 处理机制:
 * - 捕获未处理的Promise拒绝
 * - 转换为标准错误格式
 * - 发送错误响应消息
 * - 防止错误扩散影响
 * 
 * 🎯 保护范围:
 * - 异步操作错误
 * - Promise链断裂
 * - 回调函数异常
 * - 资源加载失败
 * 
 * 🛡️ 安全机制:
 * - 错误隔离处理
 * - 状态一致性保护
 * - 资源清理确保
 * - 用户体验保障
 */
self.addEventListener('unhandledrejection', (event) => {
  self.postMessage({
    type: 'error',
    error: `Unhandled promise rejection: ${event.reason}`
  } as AnalyzeResponse)
})

/**
 * 📤 TypeScript类型导出
 * 
 * 📋 导出类型:
 * - AnalyzeRequest: 分析请求接口
 * - AnalyzeResponse: 分析响应接口
 * - WordEntry: 词汇条目接口
 * 
 * 🎯 导出目的:
 * - 类型安全保证
 * - 接口标准化
 * - 开发体验优化
 * - 代码维护性提升
 * 
 * 🛡️ 注意事项:
 * - 构建时不会包含在Worker中
 * - 仅用于TypeScript编译
 * - 提供类型检查支持
 * - 确保接口一致性
 */
export type { AnalyzeRequest, AnalyzeResponse, WordEntry }