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

    <!-- Markdown 内容区域 -->
    <div class="markdown-content">
      <div v-html="markdownHtml" class="markdown-rendered"></div>
    </div>

    <!-- 底部操作 -->
    <div class="footer-area">
      <a-button type="primary" @click="goNext">下一步</a-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { marked } from "marked"; // 导入 marked 库
import { format } from "date-fns";

const router = useRouter();
const route = useRoute();

// 状态变量
const reportTitle = ref("AI模型评估报告");
const reportTime = ref(format(new Date(), "yyyy-MM-dd HH:mm:ss"));
const markdownHtml = ref("");

// 从 URL 查询参数中获取 markdown 内容
onMounted(() => {
  const reportDetail = route.query.reportDetail;

  // 如果有 reportDetail 参数，转换它为 HTML
  if (reportDetail) {
    // 将 Markdown 内容转换为 HTML
    markdownHtml.value = marked(reportDetail);
  } else {
    markdownHtml.value = "<p>未提供报告内容。</p>";
  }
});

// 返回上一页
function goNext() {
  router.push(`/project/${route.params.projectId}/report-manage`);
}
</script>

<style scoped>
.report-detail-container {
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header-area {
  margin-bottom: 24px;
}

.page-title {
  margin-bottom: 16px;
  font-size: 24px;
  font-weight: 600;
  color: #1f1f1f;
}

.step-bar {
  margin-bottom: 24px;
}

/* 报告信息 */
.report-info {
  margin-bottom: 20px;
  padding: 16px;
  background-color: #f5f5f5;
  border-radius: 6px;
}

.report-info h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  color: #1f1f1f;
}

.report-info p {
  margin: 4px 0;
  color: #666;
}

/* Markdown 内容 */
.markdown-content {
  flex: 1;
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 6px;
  overflow-y: auto;
}

.markdown-rendered {
  white-space: pre-wrap; /* 保持换行 */
  word-wrap: break-word; /* 长单词自动换行 */
}

/* 底部操作 */
.footer-area {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
