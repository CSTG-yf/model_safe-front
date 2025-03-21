<template>
  <div class="console-container">
    <!-- 顶部区域：左侧标题 + 右侧评估结果选择器 -->
    <div class="header-area">
      <div class="title">
        <h2>控制台</h2>
        <div>Deepseek - V3</div>
      </div>
      <div>
        <!-- 使用下拉选择器替换时间选择器 -->
        <a-select
          v-model:value="selectedEvaluation"
          style="width: 250px"
          placeholder="请选择评估结果"
        >
          <a-select-option v-for="(item, index) in evaluationList" :key="index" :value="item.value">
            {{ item.label }}
          </a-select-option>
        </a-select>
      </div>
    </div>

    <!-- 统计卡片区域 -->
    <div class="result-stats">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-card class="stat-card">
            <div class="stat-value">8846</div>
            <div class="stat-label">接入量</div>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card class="stat-card">
            <div class="stat-value success">6560</div>
            <div class="stat-label">模型量</div>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card class="stat-card">
            <div class="stat-value">78%</div>
            <div class="stat-label">内存消耗比</div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 图表区域 -->
    <div class="charts-row">
      <!-- 性能/安全趋势图表 -->
      <a-card class="chart-card" title="性能 / 安全趋势">
        <div class="chart-container">
          <div class="pie-chart">
            <a-progress
              type="circle"
              :percent="performanceRate"
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
              <div class="info-label">性能达标率</div>
              <div class="info-value">{{ performanceRate }}%</div>
            </div>
            <div class="info-item">
              <div class="info-dot error"></div>
              <div class="info-label">性能问题</div>
              <div class="info-value">{{ 100 - performanceRate }}%</div>
            </div>
            <div class="info-item">
              <div class="info-dot"></div>
              <div class="info-label">安全得分</div>
              <div class="info-value">92分</div>
            </div>
          </div>
        </div>
      </a-card>

      <!-- 计算概览图表 -->
      <a-card class="chart-card" title="计算概览">
        <div class="chart-container">
          <div class="bar-chart">
            <div class="bar-placeholder">图表加载中...</div>
          </div>
          <div class="chart-info">
            <div class="info-item">
              <div class="info-dot"></div>
              <div class="info-label">CPU 使用</div>
              <div class="info-value">65%</div>
            </div>
            <div class="info-item">
              <div class="info-dot success"></div>
              <div class="info-label">内存使用</div>
              <div class="info-value">78%</div>
            </div>
            <div class="info-item">
              <div class="info-dot error"></div>
              <div class="info-label">GPU 负载</div>
              <div class="info-value">82%</div>
            </div>
          </div>
        </div>
      </a-card>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Row, Col, Card, Select, Progress } from 'ant-design-vue'

// 评估结果列表
const evaluationList = [
  { value: 'eval1', label: '2023年Q4评估报告' },
  { value: 'eval2', label: '2024年Q1评估报告' },
  { value: 'eval3', label: '安全性评估报告' },
  { value: 'eval4', label: '接入性能评估' },
  { value: 'eval5', label: '最新综合评估' }
]

// 选中的评估结果
const selectedEvaluation = ref('eval5')

// 性能达标率
const performanceRate = ref(85)
</script>

<style scoped>
.console-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 24px;
  box-sizing: border-box;
  gap: 24px;
  background: #f4f5f7;
}

/* 顶部区域 */
.header-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.header-area .title h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}
.header-area .title div {
  color: #666;
  font-size: 14px;
}

/* 统计卡片 */
.result-stats {
  margin-bottom: 8px;
}
.stat-card {
  text-align: center;
  padding: 16px;
  height: 100%;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transform: translateY(-2px);
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

/* 图表区域 */
.charts-row {
  display: flex;
  gap: 16px;
  flex: 1;
}
.chart-card {
  flex: 1;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  transition: all 0.3s;
}
.chart-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}
.chart-container {
  display: flex;
  padding: 16px;
  height: 100%;
}
.pie-chart, .bar-chart {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
}
.bar-placeholder {
  background: #f0f2f5;
  width: 100%;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  border-radius: 4px;
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
</style>
