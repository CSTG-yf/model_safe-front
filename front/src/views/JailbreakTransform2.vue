<template>
  <div class="test-progress-container">
    <!-- 顶部标题 + 进度条 -->
    <div class="header-area">
      <h2 class="page-title">越狱变形测试</h2>
      <!-- 步骤条：共3步，这里处于第2步 -->
      <a-steps :current="1" class="step-bar">
        <a-step title="选择变形方法" />
        <a-step title="进行越狱测试" />
        <a-step title="测试完成" />
      </a-steps>
    </div>

    <!-- 中间测试进度显示区域 -->
    <div class="test-progress-area">
      <div class="progress-circle-container">
        <!-- 测试中显示进度圈，测试完成显示成功图标 -->
        <template v-if="!testCompleted">
          <a-progress
            type="circle"
            :percent="Math.floor(testProgress)"
            :width="320"
            :stroke-color="progressColor"
            :stroke-width="10"
            :format="percent => `${percent}%`"
          />
          <div class="progress-status">{{ testStatus }}</div>
        </template>
        <template v-else>
          <div class="success-icon">
            <CheckCircleFilled style="font-size: 160px; color: #52c41a;" />
            <div class="success-text">越狱测试已完成!</div>
          </div>
        </template>
      </div>
    </div>

    <!-- 底部操作区域 -->
    <div class="footer-area">
      <a-button 
        type="primary" 
        class="next-btn" 
        @click="goNextStep" 
        :disabled="!testCompleted"
      >
        下一步
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Steps, Button, Progress } from 'ant-design-vue'
import { CheckCircleFilled } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 测试进度
const testProgress = ref(0)
// 测试状态文本
const testStatus = ref('正在进行越狱测试...')
// 测试是否完成
const testCompleted = ref(false)

// 测试进度颜色
const progressColor = computed(() => {
  if (testProgress.value < 30) return '#ff4d4f'
  if (testProgress.value < 70) return '#faad14'
  return '#52c41a'
})

// 模拟测试进度
function startTestProgress() {
  let timer = null
  let speed = 1

  timer = setInterval(() => {
    // 进度增量随机变化，模拟真实测试进度
    if (testProgress.value < 30) {
      speed = Math.random() * 1 + 0.5
    } else if (testProgress.value < 60) {
      speed = Math.random() * 0.8 + 0.3
    } else if (testProgress.value < 90) {
      speed = Math.random() * 0.5 + 0.1
    } else {
      speed = 0.1
    }

    testProgress.value += speed
    
    // 更新状态文本
    if (testProgress.value < 30) {
      testStatus.value = '正在初始化越狱测试环境...'
    } else if (testProgress.value < 60) {
      testStatus.value = '正在执行越狱变形测试...'
    } else if (testProgress.value < 90) {
      testStatus.value = '正在分析越狱测试结果...'
    } else {
      testStatus.value = '即将完成越狱测试...'
    }

    // 当进度达到100%时停止
    if (testProgress.value >= 100) {
      clearInterval(timer)
      testProgress.value = 100
      testCompleted.value = true
      testStatus.value = '越狱测试已完成!'
    }
  }, 150)
}

// 跳转到下一步
function goNextStep() {
  if (testCompleted.value) {
    router.push('/project/jailbreak-transform3')
  }
}

// 页面加载时自动开始测试进度
onMounted(() => {
  // 延迟半秒开始，提高用户体验
  setTimeout(() => {
    startTestProgress()
  }, 500)
})
</script>

<style scoped>
.test-progress-container {
  background: #fff;
  padding: 24px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 标题 + 进度条 */
.header-area {
  margin-bottom: 40px;
}
.page-title {
  margin: 0 0 12px;
  font-size: 24px;
  font-weight: 600;
}
.step-bar {
  margin-bottom: 16px;
}

/* 测试进度区域 */
.test-progress-area {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 40px;
}

.progress-circle-container {
  text-align: center;
  position: relative;
}

.progress-status {
  margin-top: 20px;
  font-size: 18px;
  color: #666;
}

.success-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.success-text {
  margin-top: 20px;
  font-size: 24px;
  font-weight: 600;
  color: #52c41a;
}

/* 底部按钮区域 */
.footer-area {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
}

.next-btn {
  min-width: 100px;
}
</style> 