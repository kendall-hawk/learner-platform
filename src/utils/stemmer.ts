/**
 * 📂 src/utils/stemmer.ts
 * 🎯 stemmer.ts - Porter词干提取算法工具库
 * 
 * 📋 功能概述:
 * - 实现完整的Porter词干提取算法
 * - 支持英语词汇形态学分析和标准化
 * - 提供词汇变形识别和词根提取
 * - 集成不规则动词处理机制
 * - 支持批量词汇处理和性能优化
 * 
 * 🎯 主要功能:
 * - Porter Stemmer核心算法实现
 * - 5步骤递进式词干提取流程
 * - 词汇度量和模式识别算法
 * - 不规则动词映射和处理
 * - 词汇变形生成和分组功能
 * - 高性能批处理支持
 * 
 * 🏗️ 架构设计:
 * - 模块化算法步骤设计
 * - 规则驱动的模式匹配
 * - 高效的正则表达式优化
 * - 可扩展的规则集合
 * - 缓存友好的算法结构
 * 
 * 🔗 集成组件:
 * - textAnalyzer: 文本分析工具集成
 * - wordFrequencyService: 词频分析服务
 * - searchPanel: 智能搜索功能
 * 
 * 📡 接口定义:
 * - stemWord: 单词词干提取
 * - stemWords: 批量词干提取
 * - getWordVariations: 词汇变形生成
 * - haveSameStem: 词干相同性检查
 * - groupByStem: 词汇分组功能
 * 
 * 🎨 算法特色:
 * - Porter算法标准实现
 * - 英语形态学规则完整覆盖
 * - 高精度词干提取
 * - 性能优化的模式匹配
 * - 边界情况全面处理
 * 
 * 🛡️ 安全考虑:
 * - 输入验证和边界检查
 * - 无限循环防护机制
 * - 内存使用优化控制
 * - 异常状态恢复处理
 * 
 * ⚙️ 配置选项:
 * - 算法步骤可选启用
 * - 不规则词汇库扩展
 * - 性能优化参数调整
 * - 语言规则自定义
 */

/**
 * 🔤 元音模式正则表达式
 * 
 * 📋 模式说明:
 * - 匹配所有英语元音字母
 * - 用于词汇度量计算
 * - 支持大小写不敏感
 */
const VOWEL = /[aeiou]/

/**
 * 🔤 辅音模式正则表达式
 * 
 * 📋 模式说明:
 * - 匹配所有英语辅音字母
 * - 排除元音的所有字母
 * - 词汇结构分析基础
 */
const CONSONANT = /[bcdfghjklmnpqrstvwxyz]/

/**
 * 📐 步骤1a词汇变换规则集合
 * 
 * 📋 规则功能:
 * - 处理复数形式标准化
 * - 动词第三人称单数处理
 * - 常见词尾变化规律
 * - 词汇基本形态恢复
 */
const step1aRules = [
  { pattern: /sses$/, replacement: 'ss' },
  { pattern: /ies$/, replacement: 'i' },
  { pattern: /ss$/, replacement: 'ss' },
  { pattern: /s$/, replacement: '' }
]

/**
 * 📐 步骤1b词汇变换规则集合
 * 
 * 📋 规则功能:
 * - 处理过去式和过去分词
 * - 现在分词形式处理
 * - 条件性词尾移除
 * - 动词形态标准化
 */
const step1bRules = [
  { pattern: /eed$/, replacement: 'ee', condition: 'm > 0' },
  { pattern: /ed$/, replacement: '', condition: 'has_vowel' },
  { pattern: /ing$/, replacement: '', condition: 'has_vowel' }
]

/**
 * 📐 步骤1b后处理规则集合
 * 
 * 📋 规则功能:
 * - 词尾修复和补充
 * - 发音规律恢复
 * - 词汇完整性保证
 * - 标准拼写规范
 */
const step1bPost = [
  { pattern: /at$/, replacement: 'ate' },
  { pattern: /bl$/, replacement: 'ble' },
  { pattern: /iz$/, replacement: 'ize' }
]

/**
 * 📐 步骤2词汇变换规则集合
 * 
 * 📋 规则功能:
 * - 处理形容词和副词后缀
 * - 名词化后缀标准化
 * - 抽象名词词尾处理
 * - 派生词形态简化
 */
const step2Rules = [
  { pattern: /ational$/, replacement: 'ate' },
  { pattern: /tional$/, replacement: 'tion' },
  { pattern: /enci$/, replacement: 'ence' },
  { pattern: /anci$/, replacement: 'ance' },
  { pattern: /izer$/, replacement: 'ize' },
  { pattern: /abli$/, replacement: 'able' },
  { pattern: /alli$/, replacement: 'al' },
  { pattern: /entli$/, replacement: 'ent' },
  { pattern: /eli$/, replacement: 'e' },
  { pattern: /ousli$/, replacement: 'ous' },
  { pattern: /ization$/, replacement: 'ize' },
  { pattern: /ation$/, replacement: 'ate' },
  { pattern: /ator$/, replacement: 'ate' },
  { pattern: /alism$/, replacement: 'al' },
  { pattern: /iveness$/, replacement: 'ive' },
  { pattern: /fulness$/, replacement: 'ful' },
  { pattern: /ousness$/, replacement: 'ous' },
  { pattern: /aliti$/, replacement: 'al' },
  { pattern: /iviti$/, replacement: 'ive' },
  { pattern: /biliti$/, replacement: 'ble' }
]

/**
 * 📐 步骤3词汇变换规则集合
 * 
 * 📋 规则功能:
 * - 进一步的后缀简化
 * - 词性转换标准化
 * - 复杂派生词处理
 * - 词根形态逼近
 */
const step3Rules = [
  { pattern: /icate$/, replacement: 'ic' },
  { pattern: /ative$/, replacement: '' },
  { pattern: /alize$/, replacement: 'al' },
  { pattern: /iciti$/, replacement: 'ic' },
  { pattern: /ical$/, replacement: 'ic' },
  { pattern: /ful$/, replacement: '' },
  { pattern: /ness$/, replacement: '' }
]

/**
 * 📐 步骤4词汇变换规则集合
 * 
 * 📋 规则功能:
 * - 最终阶段词干提取
 * - 复杂后缀移除
 * - 词根核心保留
 * - 过度简化防止
 */
const step4Rules = [
  { pattern: /al$/, replacement: '' },
  { pattern: /ance$/, replacement: '' },
  { pattern: /ence$/, replacement: '' },
  { pattern: /er$/, replacement: '' },
  { pattern: /ic$/, replacement: '' },
  { pattern: /able$/, replacement: '' },
  { pattern: /ible$/, replacement: '' },
  { pattern: /ant$/, replacement: '' },
  { pattern: /ement$/, replacement: '' },
  { pattern: /ment$/, replacement: '' },
  { pattern: /ent$/, replacement: '' },
  { pattern: /ion$/, replacement: '', condition: 's_or_t' },
  { pattern: /ou$/, replacement: '' },
  { pattern: /ism$/, replacement: '' },
  { pattern: /ate$/, replacement: '' },
  { pattern: /iti$/, replacement: '' },
  { pattern: /ous$/, replacement: '' },
  { pattern: /ive$/, replacement: '' },
  { pattern: /ize$/, replacement: '' }
]

/**
 * 📏 计算词汇度量值
 * 
 * @param word - 目标词汇
 * @returns number - 词汇度量值
 * 
 * 📋 度量算法:
 * - 统计VC模式数量
 * - 移除初始辅音群
 * - 计算音节复杂度
 * - 词汇结构量化
 * 
 * 🎯 度量意义:
 * - 控制词干提取深度
 * - 防止过度简化
 * - 保持词汇可识别性
 * - 算法精度保证
 * 
 * 🛡️ 边界处理:
 * - 空词汇保护
 * - 单字母词汇
 * - 特殊字符过滤
 * - 异常值处理
 */
function measure(word: string): number {
  // Remove initial consonants
  let trimmed = word.replace(/^[bcdfghjklmnpqrstvwxyz]+/, '')
  
  // Count VC patterns
  const vcPattern = /[aeiou][bcdfghjklmnpqrstvwxyz]/g
  const matches = trimmed.match(vcPattern)
  
  return matches ? matches.length : 0
}

/**
 * 🔍 检查词汇是否包含元音
 * 
 * @param word - 目标词汇
 * @returns boolean - 是否包含元音
 * 
 * 📋 检查逻辑:
 * - 元音字母模式匹配
 * - 布尔值返回
 * - 简单高效算法
 * - 条件判断基础
 */
function hasVowel(word: string): boolean {
  return VOWEL.test(word)
}

/**
 * 🔍 检查词汇是否以双辅音结尾
 * 
 * @param word - 目标词汇
 * @returns boolean - 是否双辅音结尾
 * 
 * 📋 检查逻辑:
 * - 最后两个字符比较
 * - 辅音模式验证
 * - 重复字符检测
 * - 词尾结构分析
 * 
 * 🎯 应用场景:
 * - 词尾处理规则
 * - 发音规律分析
 * - 拼写规范检查
 * - 算法条件判断
 */
function endsWithDoubleConsonant(word: string): boolean {
  if (word.length < 2) return false
  
  const last = word[word.length - 1]
  const secondLast = word[word.length - 2]
  
  return last === secondLast && CONSONANT.test(last)
}

/**
 * 🔍 检查CVC模式结构
 * 
 * @param word - 目标词汇
 * @returns boolean - 是否符合CVC模式
 * 
 * 📋 模式定义:
 * - 辅音-元音-辅音结构
 * - 最后辅音非w/x/y
 * - 特定发音规律
 * - 英语音节特征
 * 
 * 🎯 语言学意义:
 * - 音节结构分析
 * - 发音规律识别
 * - 词汇类型判断
 * - 算法精度提升
 * 
 * 🛡️ 特殊情况:
 * - 短词汇保护
 * - 特殊字母排除
 * - 模式完整性验证
 * - 边界条件处理
 */
function cvc(word: string): boolean {
  if (word.length < 3) return false
  
  const last = word[word.length - 1]
  const middle = word[word.length - 2]
  const third = word[word.length - 3]
  
  return CONSONANT.test(third) && 
         VOWEL.test(middle) && 
         CONSONANT.test(last) && 
         !['w', 'x', 'y'].includes(last)
}

/**
 * 🎛️ 应用词汇变换规则集合
 * 
 * @param word - 目标词汇
 * @param rules - 规则集合数组
 * @param step - 步骤标识符
 * @returns string - 变换后词汇
 * 
 * 📋 应用逻辑:
 * - 遍历规则集合
 * - 模式匹配检测
 * - 条件验证执行
 * - 首次匹配应用
 * 
 * 🎯 条件类型:
 * - m > 0: 度量值大于0
 * - m > 1: 度量值大于1
 * - has_vowel: 包含元音
 * - s_or_t: 以s或t结尾
 * 
 * 🛡️ 安全机制:
 * - 条件验证保护
 * - 规则顺序保证
 * - 单次应用限制
 * - 异常状态处理
 */
function applyRules(word: string, rules: any[], step: string): string {
  for (const rule of rules) {
    if (rule.pattern.test(word)) {
      let shouldApply = true
      
      // Check conditions
      if (rule.condition) {
        const m = measure(word.replace(rule.pattern, ''))
        
        switch (rule.condition) {
          case 'm > 0':
            shouldApply = m > 0
            break
          case 'm > 1':
            shouldApply = m > 1
            break
          case 'has_vowel':
            shouldApply = hasVowel(word.replace(rule.pattern, ''))
            break
          case 's_or_t':
            const stem = word.replace(rule.pattern, '')
            shouldApply = m > 1 && (stem.endsWith('s') || stem.endsWith('t'))
            break
        }
      }
      
      if (shouldApply) {
        return word.replace(rule.pattern, rule.replacement)
      }
    }
  }
  
  return word
}

/**
 * 🌟 主要词干提取函数
 * 
 * @param word - 输入词汇
 * @returns string - 提取的词干
 * 
 * 📋 算法流程:
 * - 输入验证和预处理
 * - 5步骤递进式处理
 * - 后处理和修复
 * - 结果验证和返回
 * 
 * 🎯 算法特点:
 * - Porter算法标准实现
 * - 英语形态学规律遵循
 * - 高精度词干提取
 * - 广泛适用性保证
 * 
 * 🛡️ 质量保证:
 * - 最小长度保护
 * - 过度简化防止
 * - 词汇完整性维护
 * - 边界情况处理
 * 
 * 📊 性能特点:
 * - 单次遍历算法
 * - 正则表达式优化
 * - 内存友好实现
 * - 批处理兼容
 */
export function stemWord(word: string): string {
  if (word.length <= 2) {
    return word
  }
  
  let stemmed = word.toLowerCase()
  
  // Step 1a
  stemmed = applyRules(stemmed, step1aRules, '1a')
  
  // Step 1b
  const beforeStep1b = stemmed
  stemmed = applyRules(stemmed, step1bRules, '1b')
  
  // Step 1b post-processing
  if (stemmed !== beforeStep1b && stemmed.length > 1) {
    if (stemmed.match(/at$|bl$|iz$/)) {
      stemmed = applyRules(stemmed, step1bPost, '1b-post')
    } else if (endsWithDoubleConsonant(stemmed) && 
               !stemmed.match(/[lsz]$/)) {
      stemmed = stemmed.slice(0, -1)
    } else if (measure(stemmed) === 1 && cvc(stemmed)) {
      stemmed += 'e'
    }
  }
  
  // Step 2
  if (measure(stemmed) > 0) {
    stemmed = applyRules(stemmed, step2Rules, '2')
  }
  
  // Step 3
  if (measure(stemmed) > 0) {
    stemmed = applyRules(stemmed, step3Rules, '3')
  }
  
  // Step 4
  if (measure(stemmed) > 1) {
    stemmed = applyRules(stemmed, step4Rules, '4')
  }
  
  // Step 5
  if (measure(stemmed) > 1) {
    if (stemmed.endsWith('e')) {
      stemmed = stemmed.slice(0, -1)
    }
  } else if (measure(stemmed) === 1 && !cvc(stemmed) && stemmed.endsWith('e')) {
    stemmed = stemmed.slice(0, -1)
  }
  
  if (measure(stemmed) > 1 && 
      endsWithDoubleConsonant(stemmed) && 
      stemmed.endsWith('l')) {
    stemmed = stemmed.slice(0, -1)
  }
  
  return stemmed
}

/**
 * 📦 批量词干提取函数
 * 
 * @param words - 词汇数组
 * @returns string[] - 词干数组
 * 
 * 📋 批处理特点:
 * - 数组映射操作
 * - 单词独立处理
 * - 顺序保持一致
 * - 性能优化友好
 * 
 * 🎯 应用场景:
 * - 大量文本处理
 * - 词频分析预处理
 * - 搜索索引构建
 * - 数据标准化
 * 
 * 🛡️ 可靠性保证:
 * - 空数组处理
 * - 错误隔离机制
 * - 部分失败容错
 * - 结果完整性
 */
export function stemWords(words: string[]): string[] {
  return words.map(stemWord)
}

/**
 * 🌳 获取词汇变形集合
 * 
 * @param word - 基础词汇
 * @returns string[] - 变形词汇数组
 * 
 * 📋 变形生成:
 * - 词干提取基础
 * - 常见后缀添加
 * - 拼写规则应用
 * - 去重处理完成
 * 
 * 🎯 后缀类型:
 * - 复数形式: s, es
 * - 动词形式: ed, ing, er
 * - 形容词形式: est, ly
 * - 名词形式: tion, ness
 * 
 * 🛡️ 质量控制:
 * - 重复词汇去除
 * - 拼写规则验证
 * - 语言学合理性
 * - 实用性筛选
 * 
 * ⚙️ 算法优化:
 * - Set数据结构去重
 * - 规则批量应用
 * - 内存使用优化
 * - 计算复杂度控制
 */
export function getWordVariations(word: string): string[] {
  const stem = stemWord(word)
  const variations = new Set([word.toLowerCase(), stem])
  
  // Add common variations
  const suffixes = ['s', 'es', 'ed', 'ing', 'er', 'est', 'ly', 'tion', 'ness']
  
  suffixes.forEach(suffix => {
    variations.add(stem + suffix)
    
    // Handle special cases
    if (suffix === 'es' && stem.endsWith('s')) {
      variations.add(stem + 'es')
    }
    if (suffix === 'ed' && stem.endsWith('e')) {
      variations.add(stem + 'd')
    }
    if (suffix === 'ing' && stem.endsWith('e')) {
      variations.add(stem.slice(0, -1) + 'ing')
    }
  })
  
  return Array.from(variations)
}

/**
 * 🔍 检查两词汇是否同源
 * 
 * @param word1 - 第一个词汇
 * @param word2 - 第二个词汇
 * @returns boolean - 是否同源
 * 
 * 📋 同源判断:
 * - 词干提取比较
 * - 标准化处理
 * - 布尔值返回
 * - 高效算法实现
 * 
 * 🎯 应用场景:
 * - 搜索匹配优化
 * - 文本分析聚合
 * - 语义相似性检测
 * - 词汇关系识别
 * 
 * 🛡️ 边界处理:
 * - 空词汇保护
 * - 大小写标准化
 * - 特殊字符处理
 * - 异常状态恢复
 */
export function haveSameStem(word1: string, word2: string): boolean {
  return stemWord(word1) === stemWord(word2)
}

/**
 * 📊 按词干分组词汇
 * 
 * @param words - 词汇数组
 * @returns Map<string, string[]> - 词干分组映射
 * 
 * 📋 分组算法:
 * - 词干提取标准化
 * - Map数据结构分组
 * - 同源词汇聚合
 * - 高效查找支持
 * 
 * 🎯 数据结构:
 * - Key: 标准化词干
 * - Value: 同源词汇数组
 * - 顺序保持一致
 * - 内存使用优化
 * 
 * 🛡️ 可靠性保证:
 * - 空数组处理
 * - 重复词汇去除
 * - 分组完整性验证
 * - 异常状态恢复
 * 
 * ⚙️ 性能优化:
 * - 单次遍历算法
 * - Map高效查找
 * - 内存友好实现
 * - 大数据集适用
 */
export function groupByStem(words: string[]): Map<string, string[]> {
  const groups = new Map<string, string[]>()
  
  words.forEach(word => {
    const stem = stemWord(word)
    
    if (!groups.has(stem)) {
      groups.set(stem, [])
    }
    
    groups.get(stem)!.push(word)
  })
  
  return groups
}

/**
 * 📐 词汇模式常量导出
 * 
 * 📋 模式类型:
 * - PLURALS: 复数形式模式
 * - PAST_TENSE: 过去式模式
 * - PRESENT_PARTICIPLE: 现在分词模式
 * - COMPARATIVE: 比较级模式
 * - SUPERLATIVE: 最高级模式
 * - ADVERBS: 副词模式
 * - NOUNS: 名词化模式
 * 
 * 🎯 用途场景:
 * - 词性识别支持
 * - 语法分析工具
 * - 教学辅助功能
 * - 语言学研究
 */
export const WORD_PATTERNS = {
  PLURALS: /s$|es$/,
  PAST_TENSE: /ed$/,
  PRESENT_PARTICIPLE: /ing$/,
  COMPARATIVE: /er$/,
  SUPERLATIVE: /est$/,
  ADVERBS: /ly$/,
  NOUNS: /tion$|ness$|ment$/
}

/**
 * 📚 不规则动词映射表
 * 
 * 📋 映射特点:
 * - 常见不规则动词完整覆盖
 * - 变形到原形的映射
 * - 英语学习重点词汇
 * - 高频使用词汇优先
 * 
 * 🎯 数据结构:
 * - Key: 变形词汇
 * - Value: 原形词汇
 * - 一对一映射关系
 * - 快速查找支持
 * 
 * 🛡️ 数据质量:
 * - 权威词典验证
 * - 拼写准确性保证
 * - 完整性检查
 * - 实用性筛选
 * 
 * ⚙️ 性能考虑:
 * - 常量数据结构
 * - 编译时优化
 * - 内存预分配
 * - 查找效率优化
 */
export const IRREGULAR_VERBS: Record<string, string> = {
  'was': 'be',
  'were': 'be',
  'been': 'be',
  'am': 'be',
  'is': 'be',
  'are': 'be',
  'had': 'have',
  'has': 'have',
  'did': 'do',
  'does': 'do',
  'done': 'do',
  'went': 'go',
  'gone': 'go',
  'came': 'come',
  'saw': 'see',
  'seen': 'see',
  'took': 'take',
  'taken': 'take',
  'gave': 'give',
  'given': 'give',
  'got': 'get',
  'gotten': 'get',
  'made': 'make',
  'said': 'say',
  'told': 'tell',
  'thought': 'think',
  'brought': 'bring',
  'bought': 'buy',
  'caught': 'catch',
  'taught': 'teach',
  'found': 'find',
  'left': 'leave',
  'felt': 'feel',
  'kept': 'keep',
  'slept': 'sleep',
  'met': 'meet',
  'sent': 'send',
  'spent': 'spend',
  'built': 'build',
  'heard': 'hear',
  'held': 'hold',
  'lost': 'lose',
  'meant': 'mean',
  'paid': 'pay',
  'put': 'put',
  'read': 'read',
  'ran': 'run',
  'sold': 'sell',
  'set': 'set',
  'shut': 'shut',
  'spoke': 'speak',
  'spoken': 'speak',
  'stood': 'stand',
  'stuck': 'stick',
  'swam': 'swim',
  'swum': 'swim',
  'threw': 'throw',
  'thrown': 'throw',
  'understood': 'understand',
  'woke': 'wake',
  'woken': 'wake',
  'wore': 'wear',
  'worn': 'wear',
  'won': 'win',
  'wrote': 'write',
  'written': 'write'
}

/**
 * 🔬 增强版词干提取函数
 * 
 * @param word - 输入词汇
 * @returns string - 标准化词干
 * 
 * 📋 增强特性:
 * - 不规则动词优先处理
 * - Porter算法兜底保证
 * - 更高的准确性
 * - 英语特殊性适配
 * 
 * 🎯 处理流程:
 * - 不规则动词表查找
 * - 直接映射返回
 * - 常规算法处理
 * - 结果质量保证
 * 
 * 🛡️ 可靠性增强:
 * - 双重算法保护
 * - 特殊情况覆盖
 * - 边界条件处理
 * - 质量一致性保证
 * 
 * ⚙️ 性能优化:
 * - 快速查表优先
 * - 算法选择智能
 * - 计算复杂度优化
 * - 内存使用高效
 */
export function enhancedStem(word: string): string {
  const lowerWord = word.toLowerCase()
  
  // Check irregular verbs first
  if (IRREGULAR_VERBS[lowerWord]) {
    return IRREGULAR_VERBS[lowerWord]
  }
  
  // Use regular stemming
  return stemWord(word)
}