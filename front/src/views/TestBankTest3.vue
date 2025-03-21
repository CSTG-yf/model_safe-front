<template>
  <div class="test-result-container">
    <!-- 顶部标题 + 进度条 -->
    <div class="header-area">
      <h2 class="page-title">测试执行</h2>
      <!-- 步骤条：共3步，这里处于第3步 -->
      <a-steps :current="2" class="step-bar">
        <a-step title="选择题库" />
        <a-step title="进行测试" />
        <a-step title="测试完成" />
      </a-steps>
    </div>

    <!-- 测试结果区域 -->
    <div class="result-area">
      <div class="result-header">
        <div class="result-icon">
          <CheckCircleFilled style="font-size: 48px; color: #52c41a;" />
        </div>
        <div class="result-title">
          <h3>测试执行成功</h3>
          <p>已完成所有测试用例，点击查看详细报告</p>
        </div>
      </div>

      <!-- 测试基本信息编辑 -->
      <a-card class="test-info-card" title="测试基本信息">
        <a-form layout="vertical">
          <a-form-item label="测试ID">
            <a-input v-model:value="testId" disabled />
          </a-form-item>
          <a-form-item label="测试名称" required>
            <a-input v-model:value="testName" placeholder="请输入测试名称" />
          </a-form-item>
          <a-form-item label="测试备注">
            <a-textarea v-model:value="testDesc" :rows="3" placeholder="请输入测试备注" />
          </a-form-item>
        </a-form>
      </a-card>

      <!-- 测试统计卡片 -->
      <div class="result-stats">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-card class="stat-card">
              <div class="stat-value">{{ totalCases }}</div>
              <div class="stat-label">测试用例总数</div>
            </a-card>
          </a-col>
          <a-col :span="8">
            <a-card class="stat-card">
              <div class="stat-value success">{{ passedCases }}</div>
              <div class="stat-label">通过用例</div>
            </a-card>
          </a-col>
          <a-col :span="8">
            <a-card class="stat-card">
              <div class="stat-value error">{{ failedCases }}</div>
              <div class="stat-label">失败用例</div>
            </a-card>
          </a-col>
        </a-row>
      </div>

      <!-- 测试结果图表 -->
      <a-card class="chart-card" title="测试结果分布">
        <div class="chart-container">
          <div class="pie-chart">
            <a-progress 
              type="circle" 
              :percent="passRate" 
              :width="160"
              :format="percent => `${percent}%`"
              :stroke-color="{
                '0%': '#108ee9',
                '100%': '#52c41a',
              }"
            />
          </div>
          <div class="chart-info">
            <div class="info-item">
              <div class="info-dot success"></div>
              <div class="info-label">通过率</div>
              <div class="info-value">{{ passRate }}%</div>
            </div>
            <div class="info-item">
              <div class="info-dot error"></div>
              <div class="info-label">失败率</div>
              <div class="info-value">{{ failRate }}%</div>
            </div>
            <div class="info-item">
              <div class="info-dot"></div>
              <div class="info-label">总耗时</div>
              <div class="info-value">{{ testDuration }}</div>
            </div>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 底部按钮区域 -->
    <div class="footer-area">
      <a-button @click="goToReview">前往人工复核</a-button>
      <a-button type="primary" class="finish-btn" @click="finishTest">
        测试完成
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Steps, Button, Card, Row, Col, Progress, Form, Input } from 'ant-design-vue'
import { CheckCircleFilled } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 测试基本信息
const testId = ref('TEST-20240601-001')
const testName = ref('模型鲁棒性测试')
const testDesc = ref('')

// 测试结果统计数据
const totalCases = ref(120)
const passedCases = ref(108)
const failedCases = ref(12)
const testDuration = ref('5分32秒')

// 通过率和失败率
const passRate = computed(() => Math.round((passedCases.value / totalCases.value) * 100))
const failRate = computed(() => 100 - passRate.value)

// 查看测试报告
function goToReview() {
  // 跳转到人工复核页面
  router.push(`/project/test-review/1`)
}

// 完成测试
function finishTest() {
  // 跳转到测试管理页面
  router.push('/project/test-manage')
}
</script>

<style scoped>
.test-result-container {
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
  margin-bottom: 24px;
}
.page-title {
  margin: 0 0 12px;
  font-size: 24px;
  font-weight: 600;
}
.step-bar {
  margin-bottom: 16px;
}

/* 结果区域 */
.result-area {
  flex: 1;
  overflow: auto;
}

.result-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 4px;
}

.result-icon {
  margin-right: 16px;
}

.result-title h3 {
  margin: 0;
  font-size: 18px;
  color: #52c41a;
}

.result-title p {
  margin: 4px 0 0;
  color: #666;
}

/* 统计卡片 */
.result-stats {
  margin-bottom: 24px;
}

.stat-card {
  text-align: center;
  padding: 16px;
  height: 100%;
}

.stat-value {
  font-size: 36px;
  font-weight: 600;
  color: #1890ff;
  margin-bottom: 8px;
}

.stat-value.success {
  color: #52c41a;
}

.stat-value.error {
  color: #f5222d;
}

.stat-label {
  color: #666;
}

/* 图表卡片 */
.chart-card {
  margin-bottom: 24px;
}

/* 测试信息卡片 */
.test-info-card {
  margin-bottom: 24px;
}

.chart-container {
  display: flex;
  padding: 16px;
}

.pie-chart {
  display: flex;
  justify-content: center;
  flex: 1;
}

.chart-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.info-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: #1890ff;
  margin-right: 8px;
}

.info-dot.success {
  background-color: #52c41a;
}

.info-dot.error {
  background-color: #f5222d;
}

.info-label {
  width: 80px;
  color: #666;
}

.info-value {
  font-weight: 600;
}

/* 底部按钮区域 */
.footer-area {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

.finish-btn {
  margin-left: 16px;
  min-width: 100px;
}
</style> 