<template>
  <div class="report-params-container">
    <!-- 顶部标题 + 步骤条 -->
    <div class="header-area">
      <h2 class="page-title">报告生成</h2>
      <a-steps :current="1" class="step-bar">
        <a-step title="选择测试" />
        <a-step title="选择参数" />
        <a-step title="生成报告" />
        <a-step title="报告详情" />
      </a-steps>
    </div>

    <!-- 参数选择区域 -->
    <a-form layout="vertical" class="param-form">
      <a-form-item label="评估指标">
        <a-checkbox-group v-model:value="selectedMetrics" :options="metricOptions" />
      </a-form-item>

      <a-form-item label="计算方式">
        <a-radio-group v-model:value="calculationMethod">
          <a-radio value="average">平均分</a-radio>
          <a-radio value="weighted">加权评分</a-radio>
        </a-radio-group>
      </a-form-item>

      <a-form-item label="时间范围">
        <a-range-picker v-model:value="timeRange" show-time format="YYYY-MM-DD HH:mm:ss" />
      </a-form-item>
    </a-form>

    <!-- 底部操作 -->
    <div class="footer-area">
      <a-button @click="goBack">上一步</a-button>
      <a-button type="primary" class="next-btn" @click="goNextStep">下一步</a-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 评估指标选项
const metricOptions = ref([
  { label: '准确率', value: 'accuracy' },
  { label: '召回率', value: 'recall' },
  { label: 'F1 分数', value: 'f1' },
  { label: '响应速度', value: 'response_time' }
])

// 选中的指标
const selectedMetrics = ref(['accuracy', 'recall'])

// 计算方式
const calculationMethod = ref('average')

// 时间范围
const timeRange = ref([])

// 上一步
function goBack() {
  router.push('/project/report-generate')
}

// 下一步
function goNextStep() {
  if (!selectedMetrics.value.length) {
    alert('请至少选择一个评估指标！')
    return
  }
  console.log('选中的评估指标:', selectedMetrics.value)
  console.log('计算方式:', calculationMethod.value)
  console.log('时间范围:', timeRange.value)

  // 跳转到“生成报告”界面
  router.push('/project/report-generate-progress')
}
</script>

<style scoped>
.report-params-container {
  background: #fff;
  padding: 24px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

/* 顶部区域 */
.header-area {
  margin-bottom: 16px;
}
.page-title {
  margin: 0 0 12px;
  font-size: 24px;
  font-weight: 600;
}
.step-bar {
  margin-bottom: 16px;
}

/* 表单样式 */
.param-form {
  margin-bottom: 24px;
}

/* 底部操作 */
.footer-area {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
}
.next-btn {
  margin-left: auto;
}
</style>
