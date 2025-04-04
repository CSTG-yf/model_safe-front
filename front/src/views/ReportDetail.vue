<template>
  <div class="report-detail">
    <h2 class="page-title">报告详情</h2>

    <!-- 渲染的报告内容 -->
    <div v-html="renderedReportDetail" class="report-content"></div>

    <a-button @click="downloadReport" class="download-btn">下载报告</a-button>
    <a-button @click="goBack" class="back-btn">返回</a-button>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { marked } from "marked"; // 引入 marked 库
import { useCounterStore } from "@/stores/counterStore.js"; // 假设你有这个 store

const route = useRoute();
const router = useRouter();
const counterStore = useCounterStore();

// 获取报告 ID
const reportId = route.params.id;

// 状态变量
const reportDetail = ref("");
const renderedReportDetail = ref("");

// 获取报告详情并渲染 Markdown 内容
onMounted(async () => {
  try {
    const response = await axios.get(
      `http://localhost:8000/api/report-generation/report/${reportId}/`,
      {
        headers: {
          Authorization: `Bearer ${counterStore.access}`,
        },
      }
    );

    const report = response.data;
    reportDetail.value = report.report_detail;

    // 使用 marked 渲染 Markdown 为 HTML
    renderedReportDetail.value = marked(reportDetail.value);
  } catch (error) {
    console.error("获取报告详情失败:", error);
  }
});

// 返回
function goBack() {
  router.go(-1);
}

// 下载报告
function downloadReport() {
  const blob = new Blob([reportDetail.value], {
    type: "text/plain;charset=utf-8",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `报告_${reportId}.txt`; // 可以根据需要更改下载的文件名
  link.click();
}
</script>

<style scoped>
.report-detail {
  background: #fff;
  padding: 24px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
}

.report-content {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 6px;
  margin-bottom: 20px;
  max-height: 600px;
  overflow-y: auto;
  white-space: pre-wrap; /* 保持换行 */
  word-wrap: break-word; /* 长单词自动换行 */
}

.download-btn {
  margin-top: 20px;
}

.back-btn {
  margin-top: 20px;
}
</style>
