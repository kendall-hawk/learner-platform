<!--
/**7. src/components/subscription/SubscriptionModal.vue
 * 🎯 SubscriptionModal.vue - 订阅升级弹窗组件
 * 
 * 📋 功能概述:
 * - 用户订阅升级的模态弹窗
 * - 包含订阅计划详情、支付表单、账单信息
 * - Mock支付流程，模拟真实支付体验
 * - 支持表单验证和错误处理
 * - 响应式设计，移动端友好
 * 
 * 🎯 主要功能:
 * - 订阅计划摘要展示
 * - Pro功能特性列表
 * - Mock信用卡支付表单
 * - 卡号、有效期、CVC格式化
 * - 实时表单验证
 * - 账单信息计算和展示
 * - 支付处理状态管理
 * - Demo模式提示
 * 
 * 📡 Props:
 * - isOpen: boolean - 弹窗显示状态
 * - selectedPlan?: string - 选中的订阅计划
 * 
 * 🔄 Emits:
 * - close: [] - 关闭弹窗事件
 * - success: [] - 订阅成功事件
 * 
 * 🔗 依赖组件:
 * - LoadingSpinner: 加载状态指示器
 * 
 * 💳 支付功能:
 * - 信用卡信息输入和验证
 * - 自动格式化（卡号空格、有效期斜线）
 * - Mock支付处理（90%成功率）
 * - 支付成功/失败处理
 */
-->

<template>
  <!-- 🌀 Teleport到body - 确保弹窗在顶层显示 -->
  <Teleport to="body">
    <!-- 🎭 弹窗过渡动画 -->
    <Transition name="modal">
      <div
        v-if="isOpen"
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        @click.self="$emit('close')"
      >
        <!-- 📱 弹窗主体 - 响应式设计 -->
        <div class="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          
          <!-- 📋 弹窗头部 - 固定在顶部 -->
          <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl">
            <div class="flex items-center justify-between">
              <h2 class="text-xl font-bold text-gray-900">
                Upgrade to Pro
              </h2>
              <!-- ❌ 关闭按钮 -->
              <button
                @click="$emit('close')"
                class="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon class="w-6 h-6" />
              </button>
            </div>
          </div>

          <!-- 📋 弹窗内容区域 -->
          <div class="px-6 py-6">
            
            <!-- 💎 订阅计划摘要 -->
            <div class="bg-primary-50 rounded-lg p-4 mb-6">
              <div class="flex items-center justify-between mb-3">
                <h3 class="font-semibold text-primary-900">Pro Monthly Plan</h3>
                <!-- 价格展示 -->
                <div class="text-right">
                  <div class="text-2xl font-bold text-primary-900">$9.99</div>
                  <div class="text-sm text-primary-700">/month</div>
                </div>
              </div>
              
              <div class="text-sm text-primary-700">
                Unlock all premium features and take your English learning to the next level.
              </div>
            </div>

            <!-- ✅ Pro功能特性列表 -->
            <div class="mb-6">
              <h4 class="font-medium text-gray-900 mb-3">What's included:</h4>
              <div class="space-y-2">
                <div 
                  v-for="feature in proFeatures" 
                  :key="feature"
                  class="flex items-center"
                >
                  <CheckIcon class="w-4 h-4 text-green-500 mr-2" />
                  <span class="text-sm text-gray-700">{{ feature }}</span>
                </div>
              </div>
            </div>

            <!-- 💳 支付方式表单 -->
            <div class="mb-6">
              <h4 class="font-medium text-gray-900 mb-3">Payment Method:</h4>
              
              <!-- 🔐 Mock信用卡表单 -->
              <div class="space-y-4">
                
                <!-- 信用卡号输入 -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Card Number
                  </label>
                  <input
                    v-model="paymentForm.cardNumber"
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    class="input"
                    maxlength="19"
                    @input="formatCardNumber"
                  />
                </div>
                
                <!-- 有效期和CVC -->
                <div class="grid grid-cols-2 gap-4">
                  <!-- 有效期输入 -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      Expiry
                    </label>
                    <input
                      v-model="paymentForm.expiry"
                      type="text"
                      placeholder="MM/YY"
                      class="input"
                      maxlength="5"
                      @input="formatExpiry"
                    />
                  </div>
                  <!-- CVC输入 -->
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">
                      CVC
                    </label>
                    <input
                      v-model="paymentForm.cvc"
                      type="text"
                      placeholder="123"
                      class="input"
                      maxlength="3"
                    />
                  </div>
                </div>

                <!-- 持卡人姓名 -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">
                    Cardholder Name
                  </label>
                  <input
                    v-model="paymentForm.name"
                    type="text"
                    placeholder="Full name on card"
                    class="input"
                  />
                </div>
              </div>
            </div>

            <!-- 💰 账单信息摘要 -->
            <div class="bg-gray-50 rounded-lg p-4 mb-6">
              <div class="flex justify-between items-center text-sm mb-2">
                <span class="text-gray-600">Pro Monthly Plan</span>
                <span class="font-medium">$9.99</span>
              </div>
              <div class="flex justify-between items-center text-sm mb-2">
                <span class="text-gray-600">Tax</span>
                <span class="font-medium">$0.00</span>
              </div>
              <!-- 总价 -->
              <div class="border-t border-gray-200 pt-2">
                <div class="flex justify-between items-center">
                  <span class="font-semibold text-gray-900">Total</span>
                  <span class="font-bold text-gray-900">$9.99</span>
                </div>
              </div>
            </div>

            <!-- 📜 服务条款说明 -->
            <div class="text-xs text-gray-500 mb-6">
              By subscribing, you agree to our Terms of Service and acknowledge that 
              your subscription will renew automatically until cancelled. You can cancel 
              anytime from your account settings.
            </div>

            <!-- 🎯 操作按钮组 -->
            <div class="space-y-3">
              <!-- 订阅确认按钮 -->
              <button
                @click="handleSubscribe"
                :disabled="isProcessing || !isPaymentFormValid"
                class="w-full btn-primary relative"
                :class="{ 
                  'opacity-50 cursor-not-allowed': isProcessing || !isPaymentFormValid
                }"
              >
                <!-- 正常状态 -->
                <span v-if="!isProcessing">Subscribe Now</span>
                <!-- 处理中状态 -->
                <div v-else class="flex items-center justify-center">
                  <LoadingSpinner size="small" color="white" />
                  <span class="ml-2">Processing...</span>
                </div>
              </button>

              <!-- 取消按钮 -->
              <button
                @click="$emit('close')"
                class="w-full btn-outline"
                :disabled="isProcessing"
              >
                Cancel
              </button>
            </div>

            <!-- 🎮 Demo模式提示 -->
            <div class="mt-4 p-3 bg-blue-50 rounded-lg">
              <p class="text-sm text-blue-700">
                <strong>Demo Mode:</strong> This is a simulated payment. No real charges will be made.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * 📝 组件逻辑
 * 
 * 🎯 主要功能:
 * - 管理支付表单状态和验证
 * - 处理信用卡信息格式化
 * - 执行Mock支付流程
 * - 处理支付成功/失败状态
 */

import { ref, computed } from 'vue'
import { useSubscriptionStore } from '@/stores/subscription'
import LoadingSpinner from '@/components/common/LoadingSpinner.vue'
import { CheckIcon, XMarkIcon } from '@heroicons/vue/24/outline'

/**
 * 📡 组件Props定义
 */
interface Props {
  isOpen: boolean          // 弹窗显示状态
  selectedPlan?: string    // 选中的订阅计划
}

defineProps<Props>()

/**
 * 🔄 组件Emits定义
 */
const emit = defineEmits<{
  close: []    // 关闭弹窗事件
  success: []  // 订阅成功事件
}>()

// 📊 订阅状态管理
const subscriptionStore = useSubscriptionStore()

// 🎛️ 组件状态
const isProcessing = ref(false) // 支付处理状态

// 💳 支付表单数据
const paymentForm = ref({
  cardNumber: '',   // 信用卡号
  expiry: '',       // 有效期
  cvc: '',          // CVC安全码
  name: ''          // 持卡人姓名
})

/**
 * ✅ Pro版功能特性列表
 */
const proFeatures = [
  'Unlimited articles access',
  'Advanced contextual definitions',
  'Sentence-level audio synchronization',
  'Cross-article word search',
  'Detailed learning analytics',
  'Export capabilities (PDF, EPUB)',
  'Priority customer support',
  'No advertisements'
]

/**
 * ✅ 支付表单验证状态
 * 所有必填字段都有效时表单才有效
 */
const isPaymentFormValid = computed(() => {
  return paymentForm.value.cardNumber.length >= 16 &&
         paymentForm.value.expiry.length === 5 &&
         paymentForm.value.cvc.length === 3 &&
         paymentForm.value.name.trim().length > 0
})

/**
 * 💳 信用卡号格式化函数
 * 自动添加空格分隔，格式：1234 5678 9012 3456
 */
const formatCardNumber = (event: Event) => {
  const input = event.target as HTMLInputElement
  let value = input.value.replace(/\s/g, '').replace(/[^0-9]/gi, '')
  const matches = value.match(/\d{4,16}/g)
  const match = matches && matches[0] || ''
  const parts = []

  // 每4位添加一个空格
  for (let i = 0, len = match.length; i < len; i += 4) {
    parts.push(match.substring(i, i + 4))
  }

  if (parts.length) {
    paymentForm.value.cardNumber = parts.join(' ')
  } else {
    paymentForm.value.cardNumber = value
  }
}

/**
 * 📅 有效期格式化函数
 * 自动添加斜线分隔，格式：MM/YY
 */
const formatExpiry = (event: Event) => {
  const input = event.target as HTMLInputElement
  let value = input.value.replace(/\D/g, '')
  
  // 在第2位后添加斜线
  if (value.length >= 2) {
    value = value.substring(0, 2) + '/' + value.substring(2, 4)
  }
  
  paymentForm.value.expiry = value
}

/**
 * 🚀 处理订阅确认
 * Mock支付流程，模拟真实支付体验
 */
const handleSubscribe = async () => {
  if (!isPaymentFormValid.value) return

  isProcessing.value = true

  try {
    // 🎭 模拟支付处理延迟
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 🎲 Mock支付成功/失败（90%成功率）
    if (Math.random() < 0.9) {
      // 支付成功 - 更新订阅状态
      await subscriptionStore.upgrade('pro_monthly')
      emit('success')
    } else {
      // 支付失败 - 抛出错误
      throw new Error('Payment failed. Please check your card details and try again.')
    }
  } catch (error) {
    // 显示支付错误信息
    alert(error instanceof Error ? error.message : 'Payment failed')
  } finally {
    isProcessing.value = false
  }
}
</script>

<style scoped>
/**
 * 🎨 组件样式
 * 
 * 📋 主要样式:
 * - 弹窗进入/退出过渡动画
 * - 缩放和透明度变化
 */

/* 弹窗过渡动画 */
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>