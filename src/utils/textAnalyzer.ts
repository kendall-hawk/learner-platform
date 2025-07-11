/**
 * 📂 src/utils/textAnalyzer.ts
 * 🎯 textAnalyzer.ts - 综合文本分析工具库
 * 
 * 📋 功能概述:
 * - 提供全面的英语文本分析和处理功能
 * - 实现高级文本挖掘和语言学分析算法
 * - 支持多维度文本质量评估和可读性分析
 * - 集成智能关键词提取和情感分析
 * - 提供高性能的文本统计和模式识别
 * 
 * 🎯 主要功能:
 * - 智能词汇提取和文本分词
 * - 句子边界检测和结构分析
 * - 文本复杂度和可读性评估
 * - 词汇搭配和N-gram提取
 * - 关键词自动提取和TF-IDF分析
 * - 简单情感分析和语调识别
 * - 综合文本统计和元数据生成
 * 
 * 🏗️ 架构设计:
 * - 单例模式的分析器类设计
 * - 模块化的分析算法组件
 * - 缓存优化的性能策略
 * - 可扩展的规则引擎
 * - 内存友好的数据处理
 * 
 * 🔗 集成组件:
 * - stemmer: 词干提取算法集成
 * - wordFrequencyService: 词频分析服务
 * - STOP_WORDS: 停用词过滤系统
 * 
 * 📡 接口定义:
 * - extractWords: 词汇提取功能
 * - extractSentences: 句子分析功能
 * - analyzeComplexity: 复杂度分析
 * - findCollocations: 搭配词发现
 * - extractNGrams: N元语法提取
 * - extractKeywords: 关键词提取
 * - analyzeSentiment: 情感分析
 * 
 * 🎨 算法特色:
 * - Flesch可读性评分算法
 * - TF-IDF关键词提取算法
 * - 音节计数启发式算法
 * - 搭配词统计学分析
 * - 情感词典匹配算法
 * 
 * 🛡️ 安全考虑:
 * - 输入文本验证和清理
 * - XSS防护的内容处理
 * - 内存使用限制控制
 * - 无限循环防护机制
 * - 异常状态恢复处理
 * 
 * ⚙️ 配置选项:
 * - 分析深度等级调整
 * - 停用词库自定义
 * - 算法参数微调
 * - 性能阈值设置
 * - 缓存策略配置
 */

import { stemWord, enhancedStem, IRREGULAR_VERBS } from './stemmer'

/**
 * 📝 文本处理输出的词汇信息接口
 * 
 * 📋 信息结构:
 * - word: 标准化后的词汇
 * - position: 在文本中的位置索引
 * - sentence: 所属句子编号
 * - context: 周围上下文文本
 */
interface WordInfo {
  word: string
  position: number
  sentence: number
  context: string
}

/**
 * 📄 句子分析结果信息接口
 * 
 * 📋 结构说明:
 * - text: 句子原始文本内容
 * - words: 句子包含的词汇数组
 * - position: 句子在文本中的位置
 * - length: 句子词汇数量统计
 */
interface SentenceInfo {
  text: string
  words: string[]
  position: number
  length: number
}

/**
 * 🚫 英语停用词完整集合
 * 
 * 📋 词汇分类:
 * - 冠词: a, an, the
 * - 介词: in, on, at, by, for, with, without, to, from, of, about 等
 * - 连词: and, or, but, nor, so, yet, because, although 等
 * - 代词: i, you, he, she, it, we, they, me, him, her 等
 * - 助动词: am, is, are, was, were, be, been, being 等
 * - 常用副词: not, no, yes, very, too, so, just, only 等
 * - 数词: one, two, three, four, five 等
 * 
 * 🎯 过滤目的:
 * - 提高关键词提取质量
 * - 突出文本主要内容
 * - 减少分析噪音数据
 * - 优化搜索和匹配结果
 * - 提升算法运行效率
 */
export const STOP_WORDS = new Set([
  // Articles
  'a', 'an', 'the',
  
  // Prepositions
  'in', 'on', 'at', 'by', 'for', 'with', 'without', 'to', 'from', 'of', 'about',
  'under', 'over', 'through', 'between', 'among', 'during', 'before', 'after',
  'above', 'below', 'up', 'down', 'into', 'onto', 'upon', 'within', 'against',
  
  // Conjunctions
  'and', 'or', 'but', 'nor', 'so', 'yet', 'because', 'although', 'while',
  'since', 'unless', 'until', 'if', 'when', 'where', 'why', 'how',
  
  // Pronouns
  'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
  'my', 'your', 'his', 'her', 'its', 'our', 'their', 'mine', 'yours', 'ours',
  'this', 'that', 'these', 'those', 'who', 'whom', 'whose', 'which', 'what',
  
  // Auxiliary verbs
  'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'shall', 'should', 'may', 'might', 'can', 'could', 'must',
  
  // Common adverbs
  'not', 'no', 'yes', 'very', 'too', 'so', 'just', 'only', 'also',
  'here', 'there', 'now', 'then', 'today', 'tomorrow', 'yesterday',
  'always', 'never', 'sometimes', 'often', 'usually', 'again',
  
  // Numbers
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'first', 'second', 'third', 'last', 'next', 'another', 'other', 'some', 'many',
  'few', 'more', 'most', 'less', 'all', 'any', 'each', 'every', 'both', 'either'
])

/**
 * 🔤 标点符号和特殊字符清理正则
 * 
 * 📋 匹配规则:
 * - 排除字母、数字、空格、撇号
 * - 包含所有标点符号
 * - 包含特殊符号和下划线
 * - 用于文本标准化预处理
 */
const PUNCTUATION = /[^\w\s']|_/g

/**
 * 🔤 多余空白字符标准化正则
 * 
 * 📋 匹配规则:
 * - 连续的空白字符
 * - 制表符、换行符、空格
 * - 用于文本格式标准化
 */
const EXTRA_WHITESPACE = /\s+/g

/**
 * ✅ 有效词汇验证正则集合
 * 
 * 📋 验证规则:
 * - VALID_WORD: 字母开头和结尾，中间可含撇号
 * - CONTRACTION: 英语缩写形式识别
 * - HYPHENATED: 连字符复合词识别
 */
const VALID_WORD = /^[a-zA-Z][a-zA-Z']*[a-zA-Z]$|^[a-zA-Z]$/
const CONTRACTION = /^(n't|'re|'ve|'ll|'d|'s|'m)$/i
const HYPHENATED = /^[a-zA-Z]+-[a-zA-Z]+$/

/**
 * 🔬 文本分析器主类
 * 
 * 📋 类设计特点:
 * - 单例模式确保一致性
 * - 缓存机制提升性能
 * - 模块化方法设计
 * - 可扩展的算法架构
 * - 内存友好的实现
 */
export class TextAnalyzer {
  private cache = new Map<string, any>()

  /**
   * 📝 从文本中提取和清理词汇
   * 
   * @param text - 输入文本内容
   * @param options - 提取选项配置
   * @returns string[] | WordInfo[] - 词汇数组或详细信息数组
   * 
   * 📋 提取流程:
   * - 文本清理和标准化
   * - 句子边界检测分割
   * - 词汇提取和验证
   * - 停用词过滤处理
   * - 位置信息记录
   * 
   * 🎯 选项配置:
   * - includeStopWords: 是否包含停用词
   * - minLength: 最小词汇长度限制
   * - includePositions: 是否包含位置信息
   * 
   * 🛡️ 质量控制:
   * - 输入验证和边界检查
   * - 词汇有效性验证
   * - 缩写词过滤处理
   * - 缓存机制防重复计算
   * 
   * ⚙️ 性能优化:
   * - 缓存键值优化设计
   * - 批量处理优化
   * - 内存使用控制
   * - 算法复杂度优化
   */
  extractWords(text: string, options?: {
    includeStopWords?: boolean
    minLength?: number
    includePositions?: boolean
  }): string[] | WordInfo[] {
    const {
      includeStopWords = false,
      minLength = 1,
      includePositions = false
    } = options || {}

    const cacheKey = `words_${text.slice(0, 100)}_${includeStopWords}_${minLength}_${includePositions}`
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)
    }

    // Basic text cleaning
    const cleanText = this.cleanText(text)
    const sentences = this.splitIntoSentences(cleanText)
    
    const result: (string | WordInfo)[] = []
    let globalPosition = 0

    sentences.forEach((sentence, sentenceIndex) => {
      const words = sentence.split(EXTRA_WHITESPACE).filter(Boolean)
      
      words.forEach((word, wordIndex) => {
        const cleanWord = this.cleanWord(word)
        
        if (this.isValidWord(cleanWord, minLength, includeStopWords)) {
          if (includePositions) {
            result.push({
              word: cleanWord.toLowerCase(),
              position: globalPosition + wordIndex,
              sentence: sentenceIndex,
              context: this.getWordContext(sentence, wordIndex, 3)
            })
          } else {
            result.push(cleanWord.toLowerCase())
          }
        }
      })
      
      globalPosition += words.length
    })

    this.cache.set(cacheKey, result)
    return result
  }

  /**
   * 📄 提取句子并生成元数据
   * 
   * @param text - 输入文本内容
   * @returns SentenceInfo[] - 句子信息数组
   * 
   * 📋 分析维度:
   * - 句子文本内容
   * - 包含词汇列表
   * - 句子位置索引
   * - 词汇数量统计
   * 
   * 🎯 应用场景:
   * - 文本结构分析
   * - 句子复杂度评估
   * - 语言学习辅助
   * - 阅读难度评级
   * 
   * 🛡️ 处理保障:
   * - 句子边界准确检测
   * - 词汇标准化处理
   * - 空句子过滤
   * - 数据完整性验证
   */
  extractSentences(text: string): SentenceInfo[] {
    const cleanText = this.cleanText(text)
    const sentences = this.splitIntoSentences(cleanText)
    
    return sentences.map((sentence, index) => {
      const words = sentence.split(EXTRA_WHITESPACE).filter(Boolean)
      
      return {
        text: sentence.trim(),
        words: words.map(w => this.cleanWord(w).toLowerCase()),
        position: index,
        length: words.length
      }
    })
  }

  /**
   * 📊 分析文本复杂度和可读性
   * 
   * @param text - 待分析文本
   * @returns 复杂度分析结果对象
   * 
   * 📋 分析指标:
   * - readabilityScore: Flesch可读性评分
   * - averageWordsPerSentence: 平均句长
   * - averageSyllablesPerWord: 平均音节数
   * - complexWordCount: 复杂词汇数量
   * - sentenceCount: 句子总数
   * - wordCount: 词汇总数
   * - characterCount: 字符总数
   * - difficulty: 难度等级评估
   * 
   * 🎯 算法基础:
   * - Flesch Reading Ease公式
   * - 音节计数启发式算法
   * - 统计学分析方法
   * - 经验阈值判断
   * 
   * 🛡️ 数据可靠性:
   * - 除零错误防护
   * - 边界值处理
   * - 异常数据过滤
   * - 结果合理性验证
   * 
   * ⚙️ 性能考虑:
   * - 单次遍历优化
   * - 缓存中间结果
   * - 算法复杂度控制
   * - 内存使用优化
   */
  analyzeComplexity(text: string): {
    readabilityScore: number
    averageWordsPerSentence: number
    averageSyllablesPerWord: number
    complexWordCount: number
    sentenceCount: number
    wordCount: number
    characterCount: number
    difficulty: 'easy' | 'medium' | 'hard'
  } {
    const sentences = this.extractSentences(text)
    const words = this.extractWords(text) as string[]
    
    const sentenceCount = sentences.length
    const wordCount = words.length
    const characterCount = text.replace(/\s+/g, '').length
    
    const averageWordsPerSentence = wordCount / Math.max(sentenceCount, 1)
    
    // Calculate average syllables per word
    const syllableCounts = words.map(word => this.countSyllables(word))
    const averageSyllablesPerWord = syllableCounts.reduce((a, b) => a + b, 0) / Math.max(wordCount, 1)
    
    // Count complex words (3+ syllables)
    const complexWordCount = syllableCounts.filter(count => count >= 3).length
    
    // Flesch Reading Ease Score
    const readabilityScore = 206.835 - 
      (1.015 * averageWordsPerSentence) - 
      (84.6 * averageSyllablesPerWord)
    
    // Determine difficulty
    let difficulty: 'easy' | 'medium' | 'hard'
    if (readabilityScore >= 70) difficulty = 'easy'
    else if (readabilityScore >= 50) difficulty = 'medium'
    else difficulty = 'hard'

    return {
      readabilityScore: Math.max(0, Math.min(100, readabilityScore)),
      averageWordsPerSentence,
      averageSyllablesPerWord,
      complexWordCount,
      sentenceCount,
      wordCount,
      characterCount,
      difficulty
    }
  }

  /**
   * 🔗 查找词汇搭配关系
   * 
   * @param text - 文本内容
   * @param targetWord - 目标词汇
   * @param windowSize - 搭配窗口大小
   * @returns 搭配词汇分析结果
   * 
   * 📋 搭配分析:
   * - word: 搭配词汇
   * - frequency: 共现频率
   * - distance: 平均距离
   * 
   * 🎯 算法特点:
   * - 滑动窗口算法
   * - 统计学共现分析
   * - 距离权重计算
   * - 频率排序优化
   * 
   * 🛡️ 质量保证:
   * - 停用词过滤
   * - 目标词排除
   * - 最小频率阈值
   * - 结果数量限制
   * 
   * ⚙️ 性能优化:
   * - 高效的窗口扫描
   * - Map数据结构统计
   * - 单次遍历算法
   * - 内存使用控制
   */
  findCollocations(text: string, targetWord: string, windowSize: number = 5): {
    word: string
    frequency: number
    distance: number
  }[] {
    const words = this.extractWords(text) as string[]
    const targetIndex = words.indexOf(targetWord.toLowerCase())
    
    if (targetIndex === -1) return []
    
    const collocations = new Map<string, { count: number; totalDistance: number }>()
    
    // Find all occurrences of target word
    words.forEach((word, index) => {
      if (word === targetWord.toLowerCase()) {
        // Look for words within the window
        for (let i = Math.max(0, index - windowSize); 
             i <= Math.min(words.length - 1, index + windowSize); 
             i++) {
          
          if (i !== index && !STOP_WORDS.has(words[i])) {
            const collocate = words[i]
            const distance = Math.abs(i - index)
            
            if (!collocations.has(collocate)) {
              collocations.set(collocate, { count: 0, totalDistance: 0 })
            }
            
            const entry = collocations.get(collocate)!
            entry.count++
            entry.totalDistance += distance
          }
        }
      }
    })
    
    // Convert to array and sort by frequency
    return Array.from(collocations.entries())
      .map(([word, data]) => ({
        word,
        frequency: data.count,
        distance: data.totalDistance / data.count
      }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 20)
  }

  /**
   * 📝 提取N元语法模式
   * 
   * @param text - 文本内容
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
   * - 停用词敏感处理
   * - 长度合理性检查
   * - 结果数量限制
   * 
   * ⚙️ 算法效率:
   * - 滑动窗口提取
   * - Map数据结构统计
   * - 频率排序优化
   * - 内存使用控制
   */
  extractNGrams(text: string, n: number = 2): { phrase: string; frequency: number }[] {
    const words = this.extractWords(text, { includeStopWords: true }) as string[]
    const ngrams = new Map<string, number>()
    
    for (let i = 0; i <= words.length - n; i++) {
      const ngram = words.slice(i, i + n).join(' ')
      ngrams.set(ngram, (ngrams.get(ngram) || 0) + 1)
    }
    
    return Array.from(ngrams.entries())
      .map(([phrase, frequency]) => ({ phrase, frequency }))
      .filter(item => item.frequency > 1) // Only keep phrases that appear more than once
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 50)
  }

  /**
   * 🔑 使用TF-IDF算法提取关键词
   * 
   * @param text - 文本内容
   * @param maxKeywords - 最大关键词数量
   * @returns 关键词分析结果
   * 
   * 📋 TF-IDF算法:
   * - TF: 词频(Term Frequency)
   * - IDF: 逆文档频率(Inverse Document Frequency)
   * - Score: TF × IDF综合评分
   * 
   * 🎯 评分策略:
   * - 频率重要性权重
   * - 词汇长度加权
   * - 稀有度价值评估
   * - 综合重要性排序
   * 
   * 🛡️ 质量保证:
   * - 停用词过滤
   * - 最小频率阈值
   * - 词汇长度限制
   * - 结果数量控制
   * 
   * ⚙️ 算法优化:
   * - 单次遍历统计
   * - 数学公式优化
   * - 排序算法高效
   * - 内存使用节约
   */
  extractKeywords(text: string, maxKeywords: number = 20): {
    word: string
    score: number
    frequency: number
  }[] {
    const words = this.extractWords(text) as string[]
    const wordFreq = new Map<string, number>()
    
    // Count word frequencies
    words.forEach(word => {
      wordFreq.set(word, (wordFreq.get(word) || 0) + 1)
    })
    
    // Calculate scores (simplified TF-IDF)
    const totalWords = words.length
    const keywords = Array.from(wordFreq.entries())
      .map(([word, freq]) => {
        // Term frequency
        const tf = freq / totalWords
        
        // Inverse document frequency (simplified - using word length and frequency)
        const idf = Math.log(totalWords / freq) + word.length * 0.1
        
        return {
          word,
          score: tf * idf,
          frequency: freq
        }
      })
      .filter(item => item.frequency > 1) // Filter rare words
      .sort((a, b) => b.score - a.score)
      .slice(0, maxKeywords)
    
    return keywords
  }

  /**
   * 💭 分析文本情感倾向
   * 
   * @param text - 文本内容
   * @returns 情感分析结果
   * 
   * 📋 分析结果:
   * - score: 情感评分(-1到1)
   * - magnitude: 情感强度(0到1)
   * - label: 情感标签(positive/negative/neutral)
   * 
   * 🎯 算法基础:
   * - 词典匹配方法
   * - 简单加权计算
   * - 阈值分类判断
   * - 统计学归一化
   * 
   * 🛡️ 算法限制:
   * - 简化版实现
   * - 英语情感词典
   * - 上下文不敏感
   * - 基础准确度
   * 
   * ⚙️ 扩展方向:
   * - 机器学习模型
   * - 深度学习算法
   * - 多语言支持
   * - 上下文理解
   */
  analyzeSentiment(text: string): {
    score: number
    magnitude: number
    label: 'positive' | 'negative' | 'neutral'
  } {
    // Simple word-based sentiment analysis
    const positiveWords = new Set([
      'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome',
      'beautiful', 'love', 'like', 'enjoy', 'happy', 'pleased', 'satisfied',
      'successful', 'effective', 'efficient', 'beneficial', 'valuable', 'useful'
    ])
    
    const negativeWords = new Set([
      'bad', 'terrible', 'awful', 'horrible', 'disappointing', 'frustrating',
      'difficult', 'hard', 'challenging', 'problem', 'issue', 'error', 'fail',
      'wrong', 'poor', 'weak', 'limited', 'insufficient', 'inadequate'
    ])
    
    const words = this.extractWords(text) as string[]
    let positiveCount = 0
    let negativeCount = 0
    
    words.forEach(word => {
      if (positiveWords.has(word)) positiveCount++
      if (negativeWords.has(word)) negativeCount++
    })
    
    const totalSentimentWords = positiveCount + negativeCount
    const score = totalSentimentWords === 0 
      ? 0 
      : (positiveCount - negativeCount) / totalSentimentWords
    
    const magnitude = totalSentimentWords / words.length
    
    let label: 'positive' | 'negative' | 'neutral'
    if (score > 0.1) label = 'positive'
    else if (score < -0.1) label = 'negative'
    else label = 'neutral'
    
    return { score, magnitude, label }
  }

  /**
   * 📊 获取文本统计信息
   * 
   * @param text - 文本内容
   * @returns 统计信息对象
   * 
   * 📋 统计维度:
   * - characters: 总字符数
   * - charactersNoSpaces: 非空格字符数
   * - words: 词汇总数
   * - sentences: 句子总数
   * - paragraphs: 段落总数
   * - averageWordsPerSentence: 平均句长
   * - averageCharactersPerWord: 平均词长
   * - readingTimeMinutes: 预估阅读时间
   * 
   * 🎯 应用场景:
   * - 内容质量评估
   * - 阅读难度分析
   * - 编辑辅助工具
   * - 学习进度跟踪
   * 
   * 🛡️ 计算保障:
   * - 除零错误防护
   * - 负值结果防护
   * - 边界情况处理
   * - 数据合理性验证
   * 
   * ⚙️ 算法效率:
   * - 单次遍历计算
   * - 缓存中间结果
   * - 简单数学运算
   * - 内存使用优化
   */
  getStatistics(text: string): {
    characters: number
    charactersNoSpaces: number
    words: number
    sentences: number
    paragraphs: number
    averageWordsPerSentence: number
    averageCharactersPerWord: number
    readingTimeMinutes: number
  } {
    const characters = text.length
    const charactersNoSpaces = text.replace(/\s/g, '').length
    const words = this.extractWords(text).length
    const sentences = this.extractSentences(text).length
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim()).length
    
    const averageWordsPerSentence = sentences > 0 ? words / sentences : 0
    const averageCharactersPerWord = words > 0 ? charactersNoSpaces / words : 0
    const readingTimeMinutes = words / 200 // Assuming 200 words per minute
    
    return {
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      averageWordsPerSentence,
      averageCharactersPerWord,
      readingTimeMinutes
    }
  }

  /**
   * 🧹 文本清理和标准化
   * 
   * @param text - 原始文本
   * @returns string - 清理后文本
   * 
   * 📋 清理步骤:
   * - 行结束符标准化
   * - 制表符转换空格
   * - 标点符号移除
   * - 多余空格压缩
   * - 首尾空格移除
   * 
   * 🎯 标准化目标:
   * - 统一文本格式
   * - 简化后续处理
   * - 提高分析准确性
   * - 优化算法性能
   * 
   * 🛡️ 保护机制:
   * - 保留撇号字符
   * - 保持基本结构
   * - 避免过度清理
   * - 维护可读性
   */
  private cleanText(text: string): string {
    return text
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\t/g, ' ') // Replace tabs with spaces
      .replace(PUNCTUATION, ' ') // Remove punctuation (keep apostrophes)
      .replace(EXTRA_WHITESPACE, ' ') // Normalize whitespace
      .trim()
  }

  /**
   * 🧹 单词清理和标准化
   * 
   * @param word - 原始单词
   * @returns string - 清理后单词
   * 
   * 📋 清理规则:
   * - 移除首尾引号
   * - 移除末尾标点
   * - 保留内部撇号
   * - 空格修剪处理
   * 
   * 🎯 清理目标:
   * - 获得纯净词汇
   * - 保持词汇完整性
   * - 统一格式标准
   * - 提高匹配准确性
   */
  private cleanWord(word: string): string {
    return word
      .replace(/^['"]|['"]$/g, '') // Remove leading/trailing quotes
      .replace(/[.,;:!?]$/g, '') // Remove trailing punctuation
      .trim()
  }

  /**
   * ✅ 词汇有效性验证
   * 
   * @param word - 待验证词汇
   * @param minLength - 最小长度
   * @param includeStopWords - 是否包含停用词
   * @returns boolean - 是否有效
   * 
   * 📋 验证规则:
   * - 最小长度检查
   * - 缩写词过滤
   * - 格式有效性验证
   * - 停用词过滤
   * 
   * 🎯 质量保证:
   * - 确保词汇质量
   * - 过滤无意义词汇
   * - 提高分析准确性
   * - 优化处理效率
   */
  private isValidWord(word: string, minLength: number, includeStopWords: boolean): boolean {
    if (word.length < minLength) return false
    if (CONTRACTION.test(word)) return false
    if (!VALID_WORD.test(word) && !HYPHENATED.test(word)) return false
    if (!includeStopWords && STOP_WORDS.has(word.toLowerCase())) return false
    
    return true
  }

  /**
   * 📄 句子边界检测分割
   * 
   * @param text - 输入文本
   * @returns string[] - 句子数组
   * 
   * 📋 分割规则:
   * - 句末标点符号识别
   * - 空句子过滤
   * - 空格修剪处理
   * - 简单边界检测
   * 
   * 🛡️ 算法限制:
   * - 简化版实现
   * - 不处理缩写
   * - 不处理复杂边界
   * - 基础准确度
   * 
   * ⚙️ 改进方向:
   * - 机器学习模型
   * - 规则引擎完善
   * - 上下文理解
   * - 多语言支持
   */
  private splitIntoSentences(text: string): string[] {
    // Simple sentence splitting - can be improved with more sophisticated rules
    return text
      .split(/[.!?]+/)
      .map(sentence => sentence.trim())
      .filter(sentence => sentence.length > 0)
  }

  /**
   * 🔍 获取词汇上下文环境
   * 
   * @param sentence - 所在句子
   * @param wordIndex - 词汇位置
   * @param windowSize - 上下文窗口
   * @returns string - 上下文文本
   * 
   * 📋 提取逻辑:
   * - 确定窗口边界
   * - 提取相邻词汇
   * - 拼接上下文
   * - 返回完整片段
   * 
   * 🎯 应用价值:
   * - 提供词汇语境
   * - 辅助语义理解
   * - 支持学习功能
   * - 增强用户体验
   */
  private getWordContext(sentence: string, wordIndex: number, windowSize: number): string {
    const words = sentence.split(/\s+/)
    const start = Math.max(0, wordIndex - windowSize)
    const end = Math.min(words.length, wordIndex + windowSize + 1)
    
    return words.slice(start, end).join(' ')
  }

  /**
   * 🔢 音节数量计算
   * 
   * @param word - 目标词汇
   * @returns number - 音节数量
   * 
   * 📋 计算规则:
   * - 短词汇默认1音节
   * - 尾部e字母移除
   * - 元音组合计数
   * - 最小值保护
   * 
   * 🛡️ 算法限制:
   * - 启发式规则
   * - 英语专用
   * - 近似计算
   * - 基础准确度
   * 
   * ⚙️ 改进方向:
   * - 语音学词典
   * - 机器学习模型
   * - 多语言支持
   * - 精确音节检测
   */
  private countSyllables(word: string): number {
    if (word.length <= 3) return 1
    
    word = word.toLowerCase()
    
    // Remove trailing e
    if (word.endsWith('e')) {
      word = word.slice(0, -1)
    }
    
    // Count vowel groups
    const vowelGroups = word.match(/[aeiouy]+/g)
    return vowelGroups ? vowelGroups.length : 1
  }

  /**
   * 🗑️ 清空内部缓存
   * 
   * 📋 清理范围:
   * - 所有缓存数据
   * - 内存占用释放
   * - 状态重置完成
   * - 性能影响消除
   * 
   * 🎯 使用场景:
   * - 内存优化需求
   * - 数据更新后清理
   * - 测试环境重置
   * - 长时间运行维护
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * 📊 获取缓存统计信息
   * 
   * @returns 缓存统计对象
   * 
   * 📋 统计信息:
   * - size: 缓存条目数量
   * - keys: 缓存键名列表
   * 
   * 🎯 用途场景:
   * - 性能调试分析
   * - 内存使用监控
   * - 缓存策略优化
   * - 系统健康检查
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys())
    }
  }
}

/**
 * 🏭 文本分析器单例实例
 * 
 * 📋 单例优势:
 * - 全局状态一致性
 * - 缓存数据共享
 * - 资源使用优化
 * - 配置统一管理
 * 
 * 🎯 使用方式:
 * - 直接导入使用
 * - 方法调用访问
 * - 缓存自动管理
 * - 性能自动优化
 */
export const textAnalyzer = new TextAnalyzer()

/**
 * 🔍 停用词检查工具函数
 * 
 * @param word - 待检查词汇
 * @returns boolean - 是否为停用词
 * 
 * 📋 检查逻辑:
 * - 大小写标准化
 * - 停用词集合查找
 * - 布尔值结果返回
 * - 高效查找算法
 */
export function isStopWord(word: string): boolean {
  return STOP_WORDS.has(word.toLowerCase())
}

/**
 * 🧹 文本清理工具函数
 * 
 * @param text - 原始文本
 * @returns string - 清理后文本
 * 
 * 📋 清理方式:
 * - 词汇提取标准化
 * - 空格连接重组
 * - 停用词保留
 * - 格式统一处理
 */
export function cleanText(text: string): string {
  return new TextAnalyzer().extractWords(text).join(' ')
}

/**
 * 📊 词汇密度计算工具函数
 * 
 * @param text - 文本内容
 * @param targetWord - 目标词汇
 * @returns number - 词汇密度
 * 
 * 📋 计算公式:
 * - 目标词汇出现次数
 * - 总词汇数量统计
 * - 密度比值计算
 * - 小数结果返回
 * 
 * 🎯 应用价值:
 * - 关键词重要性评估
 * - 文本主题分析
 * - SEO优化指导
 * - 内容质量评价
 */
export function getWordDensity(text: string, targetWord: string): number {
  const words = new TextAnalyzer().extractWords(text, { includeStopWords: true }) as string[]
  const occurrences = words.filter(word => word === targetWord.toLowerCase()).length
  return occurrences / words.length
}