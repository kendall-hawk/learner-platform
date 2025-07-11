/**
 * 🎨 第4个文件：tailwind.config.js
 * 
 * 📁 文件位置: 项目根目录/tailwind.config.js
 * 🎯 核心功能: TailwindCSS样式框架配置，定制主题和动画
 * 🔧 关键作用: 配置样式扫描路径、自定义颜色、字体、动画效果
 * 
 * 📋 配置模块说明：
 * - 内容扫描: 指定需要处理CSS的文件路径
 * - 主题扩展: 自定义颜色系统（primary/success色彩）
 * - 字体配置: Inter字体作为默认无衬线字体
 * - 动画系统: 淡入、滑动、脉冲等过渡动画
 * - 关键帧: 自定义动画的具体实现
 */

/** @type {import('tailwindcss').Config} */
export default {
  // 内容扫描配置 - 告诉Tailwind在哪些文件中查找CSS类名
  content: [
    "./index.html",                    // HTML入口文件
    "./src/**/*.{vue,js,ts,jsx,tsx}",  // src目录下所有Vue/JS/TS文件
  ],
  
  theme: {
    extend: {
      // 自定义颜色系统
      colors: {
        // 主品牌色系 - 蓝色渐变（从浅到深）
        primary: {
          50: '#eff6ff',   // 最浅蓝色（背景色）
          100: '#dbeafe',  // 浅蓝色
          200: '#bfdbfe',  // 
          300: '#93c5fd',  // 
          400: '#60a5fa',  // 
          500: '#3b82f6',  // 标准蓝色（主色调）
          600: '#2563eb',  // 深蓝色（按钮等）
          700: '#1d4ed8',  // 
          800: '#1e40af',  // 
          900: '#1e3a8a',  // 最深蓝色
        },
        // 成功状态色系 - 绿色渐变
        success: {
          50: '#f0fdf4',   // 最浅绿色
          100: '#dcfce7',  // 浅绿色
          200: '#bbf7d0',  // 
          300: '#86efac',  // 
          400: '#4ade80',  // 
          500: '#22c55e',  // 标准绿色（成功状态）
          600: '#16a34a',  // 深绿色
          700: '#15803d',  // 
          800: '#166534',  // 
          900: '#14532d',  // 最深绿色
        }
      },
      
      // 字体配置
      fontFamily: {
        // 无衬线字体：Inter作为主字体，回退到系统字体
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      
      // 自定义动画配置
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',      // 淡入动画（0.3秒）
        'slide-up': 'slideUp 0.3s ease-out',       // 滑动向上（0.3秒）
        'pulse-slow': 'pulse 3s infinite',         // 慢速脉冲（3秒循环）
      },
      
      // 关键帧定义 - 具体的动画实现
      keyframes: {
        // 淡入动画：从透明到不透明
        fadeIn: {
          '0%': { opacity: '0' },      // 起始：完全透明
          '100%': { opacity: '1' },    // 结束：完全不透明
        },
        // 滑动向上动画：从下方滑入
        slideUp: {
          '0%': { 
            transform: 'translateY(10px)',  // 起始：向下偏移10px
            opacity: '0' 
          },
          '100%': { 
            transform: 'translateY(0)',     // 结束：回到原位
            opacity: '1' 
          },
        }
      }
    },
  },
  
  // 插件配置（当前为空，可扩展）
  plugins: [],
}