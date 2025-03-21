<template>
  <div class="perf-eval-progress">
    <!-- 顶部标题与步骤条 -->
    <div class="header-area">
      <h2 class="page-title">生成仪表盘</h2>
      <a-steps :current="1" class="step-bar">
        <a-step title="选择测试" />
        <a-step title="生成评估" />
        <a-step title="评估展示" />
      </a-steps>
    </div>

    <!-- 中间生成进度圈 -->
    <div class="progress-area">
      <div class="progress-circle-container">
        <template v-if="!done">
          <a-progress
              type="circle"
              :percent="Math.floor(percent)"
              :width="300"
              :stroke-color="color"
              :format="p => `${p}%`"
          />
          <div class="status-text">{{ statusText }}</div>
        </template>
        <template v-else>
          <div class="success-icon">
            <CheckCircleFilled style="font-size: 160px; color: #52c41a;" />
            <div class="success-text">生成完成</div>
          </div>
        </template>
      </div>
    </div>

    <!-- 底部操作 -->
    <div class="footer-area">
      <a-button type="primary" :disabled="!done" @click="goNext">下一步</a-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { CheckCircleFilled } from '@ant-design/icons-vue'

const router = useRouter()
const percent = ref(0)
const done = ref(false)
const statusText = ref('准备生成仪表盘...')

const color = computed(() => {
  if (percent.value < 30) return '#ff4d4f'
  if (percent.value < 70) return '#faad14'
  return '#52c41a'
})

function simulateProgress() {
  let timer = setInterval(() => {
    let speed = 0.5 + Math.random() * 1
    percent.value += speed

    if (percent.value < 30) {
      statusText.value = '收集测试数据中...'
    } else if (percent.value < 70) {
      statusText.value = '构建模型评估维度...'
    } else if (percent.value < 99) {
      statusText.value = '绘制仪表盘图表...'
    } else {
      statusText.value = '完成！'
    }

    if (percent.value >= 100) {
      percent.value = 100
      clearInterval(timer)
      done.value = true
    }
  }, 150)
}

function goNext() {
  router.push('/project/perf-eval-result')
}

onMounted(() => {
  setTimeout(() => {
    simulateProgress()
  }, 500)
})
</script>

<style scoped>
.perf-eval-progress {
  background: #fff;
  padding: 24px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header-area {
  margin-bottom: 40px;
}
.page-title {
  margin-bottom: 12px;
  font-size: 24px;
  font-weight: 600;
}
.step-bar {
  margin-bottom: 16px;
}

.progress-area {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 40px;
}
.progress-circle-container {
  text-align: center;
}
.status-text {
  margin-top: 16px;
  font-size: 18px;
  color: #666;
}
.success-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.success-text {
  margin-top: 20px;
  font-size: 22px;
  color: #52c41a;
  font-weight: 600;
}

.footer-area {
  display: flex;
  justify-content: flex-end;
}
</style>
