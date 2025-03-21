<template>
  <div class="eval-result-container">
    <!-- 顶部步骤条 + 标题 -->
    <div class="header-area">
      <h2 class="page-title">模型评估</h2>
      <a-steps :current="2" class="step-bar">
        <a-step title="选择测试" />
        <a-step title="生成仪表盘" />
        <a-step title="评估结果" />
      </a-steps>
    </div>

    <!-- 成功提示 -->
    <div class="result-header">
      <div class="result-icon">
        <CheckCircleFilled style="font-size: 48px; color: #52c41a;" />
      </div>
      <div class="result-title">
        <h3>评估完成</h3>
        <p>已完成模型评估，可保存仪表盘或查看详细数据</p>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="result-stats">
      <a-row :gutter="16">
        <a-col :span="8">
          <a-card class="stat-card">
            <div class="stat-value">126</div>
            <div class="stat-label">覆盖测试数</div>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card class="stat-card">
            <div class="stat-value success">89.3</div>
            <div class="stat-label">平均得分</div>
          </a-card>
        </a-col>
        <a-col :span="8">
          <a-card class="stat-card">
            <div class="stat-value error">低</div>
            <div class="stat-label">风险等级</div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 图表区域 -->
    <div class="charts-row">
      <!-- 评分分布概览 -->
      <a-card class="chart-card" title="评分分布概览">
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
              <div class="info-label">优良率</div>
              <div class="info-value">{{ passRate }}%</div>
            </div>
            <div class="info-item">
              <div class="info-dot error"></div>
              <div class="info-label">低分率</div>
              <div class="info-value">{{ 100 - passRate }}%</div>
            </div>
            <div class="info-item">
              <div class="info-dot"></div>
              <div class="info-label">评估时长</div>
              <div class="info-value">6分25秒</div>
            </div>
          </div>
        </div>
      </a-card>

      <!-- 领域分布分析 -->
      <a-card class="chart-card" title="领域分布分析">
        <div class="chart-container">
          <div class="bar-chart">
            <div class="bar-placeholder">图表加载中...</div>
          </div>
          <div class="chart-info">
            <div class="info-item">
              <div class="info-dot success"></div>
              <div class="info-label">数学领域</div>
              <div class="info-value">92分</div>
            </div>
            <div class="info-item">
              <div class="info-dot"></div>
              <div class="info-label">物理领域</div>
              <div class="info-value">87分</div>
            </div>
            <div class="info-item">
              <div class="info-dot error"></div>
              <div class="info-label">代码领域</div>
              <div class="info-value">76分</div>
            </div>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 保存按钮 -->
    <div class="footer-area">
      <a-button type="primary" @click="saveModalVisible = true">保存评估</a-button>
    </div>

    <!-- 保存弹窗 -->
    <a-modal
        v-model:open="saveModalVisible"
        title="保存评估仪表盘"
        ok-text="确认"
        cancel-text="取消"
        @ok="confirmSave"
    >
      <a-form layout="vertical">
        <a-form-item label="评估名称">
          <a-input v-model:value="evalName" placeholder="请输入评估名称" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { CheckCircleFilled } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'

// 模拟数据
const passRate = ref(89)
const saveModalVisible = ref(false)
const evalName = ref('')

// 保存操作
function confirmSave() {
  if (!evalName.value.trim()) {
    message.warning('请输入评估名称')
    return
  }
  message.success(`评估「${evalName.value}」已保存`)
  saveModalVisible.value = false
  evalName.value = ''
}
</script>

<style scoped>
.eval-result-container {
  background: #fff;
  padding: 24px;
  border-radius: 4px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 顶部进度条 + 标题 */
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

/* 成功提示 */
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
  margin-bottom: 24px;
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

/* 底部按钮 */
.footer-area {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
}
</style>
