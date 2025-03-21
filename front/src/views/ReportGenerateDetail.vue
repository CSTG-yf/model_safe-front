<template>
  <div class="report-detail-container">
    <!-- 顶部标题与步骤条 -->
    <div class="header-area">
      <h2 class="page-title">报告详情</h2>
      <a-steps :current="3" class="step-bar">
        <a-step title="选择测试" />
        <a-step title="选择参数" />
        <a-step title="生成报告" />
        <a-step title="报告详情" />
      </a-steps>
    </div>

    <!-- 报告信息 -->
    <div class="report-info">
      <h3>{{ reportTitle }}</h3>
      <p>生成时间：{{ reportTime }}</p>
    </div>

    <!-- PDF 预览区域 -->
    <div class="pdf-preview">
      <iframe :src="pdfUrl" class="pdf-frame"></iframe>
    </div>

    <!-- 底部操作 -->
    <div class="footer-area">
      <a-button type="default" @click="goBack">返回</a-button>
      <a-button type="primary" class="export-btn" @click="exportReport">导出报告</a-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'

const router = useRouter()

// 模拟报告数据
const reportTitle = ref('模型评估报告 - 2024Q1')
const reportTime = ref('2024-06-15 10:00')

// 预览 PDF
const pdfUrl = ref('/static/sample-report.pdf') // 替换为真实 PDF 路径

// 返回
function goBack() {
  router.push('/project/report-generate-progress')
}

// 导出报告
function exportReport() {
  message.success('报告已导出！')
  // 这里可以触发文件下载，如 window.open(pdfUrl.value, '_blank')
}
</script>

<style scoped>
.report-detail-container {
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

/* 报告信息 */
.report-info {
  margin-bottom: 16px;
}
.report-info h3 {
  margin: 0;
  font-size: 20px;
}
.report-info p {
  margin: 4px 0;
  color: #666;
}

/* PDF 预览 */
.pdf-preview {
  flex: 1;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
}
.pdf-frame {
  width: 100%;
  height: 500px;
  border: none;
}

/* 底部操作 */
.footer-area {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
.export-btn {
  margin-left: 12px;
}
</style>
