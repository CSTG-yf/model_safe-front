<template>
  <div class="report-detail">
    <h2 class="page-title">报告详情</h2>
    <p>报告 ID：{{ reportId }}</p>
    <div class="placeholder">这里将展示 PDF 或其他报告内容...</div>
    <a-button @click="goBack" class="back-btn">返回</a-button>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const reportId = route.params.id

function goBack() {
  router.push('/project/report-manage')
}
</script>

<style scoped>
.report-detail {
  background: #fff;
  padding: 24px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 16px;
}

.placeholder {
  background: #f0f0f0;
  padding: 50px;
  text-align: center;
  font-size: 16px;
  color: #666;
  margin: 20px 0;
}

.back-btn {
  margin-top: 20px;
}
</style>
