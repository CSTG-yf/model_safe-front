<template>
  <div class="console-container">
    <!-- 顶部区域：左侧标题 + 右侧日期时间段选择器 -->
    <div class="header-area">
      <div class="title">
        <h2>控制台</h2>
        <div>Deepseek - V3</div>
      </div>
      <div>
        <!-- 使用 <a-range-picker> 来替换原生 input -->
        <a-range-picker
            v-model:value="dateRange"
            showTime
            format="YYYY-MM-DD HH:mm:ss"
        />
      </div>
    </div>

    <!-- 上方三卡片 (约占 40% 高度) -->
    <div class="top-row">
      <div class="card">
        <h3>接入量</h3>
        <div class="number">8846</div>
      </div>
      <div class="card">
        <h3>模型量</h3>
        <div class="number">6560</div>
      </div>
      <div class="card">
        <h3>内存消耗比</h3>
        <div class="number">78%</div>
      </div>
    </div>

    <!-- 下方 2 个图表 (约占 60% 高度) -->
    <div class="bottom-row">
      <div class="chart-card">
        <h3>性能 / 安全趋势</h3>
        <div class="chart-placeholder">Line Chart</div>
      </div>
      <div class="chart-card">
        <h3>计算概览</h3>
        <div class="chart-placeholder">Bar Chart</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
// 如果你在 main.js 全局 use(Antd) 并 import 'ant-design-vue/dist/antd.css'，
// 无需在此处额外局部注册组件
const dateRange = ref([]) // 用于存储用户选择的时间区间
</script>

<style scoped>
/* 让 console-container 占满父容器 */
.console-container {
  display: flex;
  flex-direction: column;
  height: 100%; /* 父容器需 height: 100% & flex context */
  padding: 16px;
  box-sizing: border-box;
  gap: 16px; /* 行间距 */
  background: #f4f5f7;
}

/* 顶部区域 */
.header-area {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-area .title h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
}

/* 上下行布局：top-row + bottom-row
   分割可用空间： top-row 占 40% 高度, bottom-row 占 60% */
.top-row {
  display: flex;
  flex: 0 0 40%;
  gap: 16px;
}
.bottom-row {
  display: flex;
  flex: 1; /* 剩余 60% 空间 */
  gap: 16px;
}

/* 卡片样式 */
.card {
  flex: 1;
  background: #fff;
  border-radius: 4px;
  padding: 16px;
  box-sizing: border-box;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.card h3 {
  margin: 0 0 8px;
}
.number {
  font-size: 24px;
  font-weight: 600;
}

/* 下方图表卡 */
.chart-card {
  flex: 1;
  background: #fff;
  border-radius: 4px;
  padding: 16px;
  box-sizing: border-box;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);

  display: flex;
  flex-direction: column;
}

.chart-placeholder {
  flex: 1; /* 填满剩余空间 */
  margin-top: 8px;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  font-size: 14px;
}
</style>
