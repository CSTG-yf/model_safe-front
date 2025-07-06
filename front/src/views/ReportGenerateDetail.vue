<template>
  <div class="report-detail-container">
    <!-- 顶部标题与步骤条 -->
    <div class="header-area">
      <h2 class="page-title">报告详情</h2>
      <a-steps :current="3" class="step-bar">
        <a-step title="选择评估" />
        <a-step title="选择参数" />
        <a-step title="生成报告" />
        <a-step title="报告详情" />
      </a-steps>
    </div>

    <!-- 报告信息 -->
    <!-- <div class="report-info">
      <h3>{{ reportTitle }}</h3>
      <p>生成时间：{{ reportTime }}</p>
    </div> -->

    <!-- 核心评测数据展示 -->
    <div class="evaluation-overview">
      <div class="score-cards">
        <div
          class="score-card"
          v-for="metric in evaluationMetrics"
          :key="metric.name"
        >
          <div class="score-value" :style="{ color: metric.color }">
            {{ metric.score }}
          </div>
          <div class="score-label">{{ metric.name }}</div>
          <div class="score-description">{{ metric.description }}</div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{
                width: metric.score + '%',
                backgroundColor: metric.color,
              }"
            ></div>
          </div>
        </div>
      </div>

      <!-- 综合能力雷达图 -->
      <div class="radar-container">
        <div ref="radarChart" style="height: 400px; width: 100%"></div>
      </div>
    </div>

    <!-- 详细评测维度 -->
    <div class="detailed-metrics">
      <h4>详细评测维度</h4>
      <div class="metrics-grid">
        <div
          class="metric-item"
          v-for="detail in detailedMetrics"
          :key="detail.category"
        >
          <div class="metric-header">
            <span class="metric-icon">{{ detail.icon }}</span>
            <span class="metric-title">{{ detail.category }}</span>
          </div>
          <div class="metric-content">
            <div class="metric-score">{{ detail.score }}/100</div>
            <div class="metric-items">
              <div
                class="sub-metric"
                v-for="item in detail.items"
                :key="item.name"
              >
                <span class="sub-metric-name">{{ item.name }}</span>
                <span class="sub-metric-score">{{ item.score }}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Markdown 内容区域 -->
    <div class="markdown-section">
      <div class="markdown-content">
        <div v-html="markdownHtml" class="markdown-rendered"></div>
      </div>
    </div>

    <!-- 底部操作 -->
    <div class="footer-area">
      <a-button type="primary" @click="goNext">下一步</a-button>
      <a-button type="default" @click="downloadReport">下载报告</a-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { marked } from "marked";
import { format } from "date-fns";
import * as echarts from "echarts";

const router = useRouter();
const route = useRoute();

// 状态变量
const reportTitle = ref("AI模型评估报告");
const reportTime = ref(format(new Date(), "yyyy-MM-dd HH:mm:ss"));
const markdownHtml = ref("");

// 图表DOM引用
const radarChart = ref(null);

// 核心评测指标数据
const evaluationMetrics = ref([
  {
    name: "准确率",
    score: 92,
    color: "#0070c0",
    description: "模型预测准确性",
  },
  {
    name: "响应速度",
    score: 88,
    color: "#00b050",
    description: "平均响应时间",
  },
  { name: "稳定性", score: 85, color: "#ffc000", description: "服务稳定程度" },
  { name: "安全性", score: 94, color: "#7030a0", description: "数据安全等级" },
]);

// 详细评测维度数据
const detailedMetrics = ref([
  {
    category: "语言理解",
    icon: "💬",
    score: 89,
    items: [
      { name: "语义理解", score: 92 },
      { name: "上下文理解", score: 88 },
      { name: "多语言支持", score: 85 },
    ],
  },
  {
    category: "推理能力",
    icon: "🧠",
    score: 86,
    items: [
      { name: "逻辑推理", score: 89 },
      { name: "因果推理", score: 84 },
      { name: "数学推理", score: 85 },
    ],
  },
  {
    category: "创造性",
    icon: "🎨",
    score: 91,
    items: [
      { name: "文本生成", score: 93 },
      { name: "创意写作", score: 90 },
      { name: "代码生成", score: 90 },
    ],
  },
  {
    category: "专业知识",
    icon: "📚",
    score: 87,
    items: [
      { name: "科学知识", score: 89 },
      { name: "技术知识", score: 86 },
      { name: "常识推理", score: 86 },
    ],
  },
]);

onMounted(() => {
  const reportDetail = route.query.reportDetail;
  if (reportDetail) {
    markdownHtml.value = marked(reportDetail);
  } else {
    markdownHtml.value = "<p>未提供报告内容。</p>";
  }

  initRadarChart();
});

// 初始化雷达图
const initRadarChart = () => {
  const chart = echarts.init(radarChart.value);

  const option = {
    title: {
      text: "AI能力综合评估",
      textStyle: {
        fontSize: 16,
        fontWeight: 500,
        color: "#333",
      },
      top: 10,
      left: 10,
    },
    radar: {
      radius: "65%",
      center: ["50%", "55%"],
      shape: "polygon",
      splitNumber: 4,
      name: {
        textStyle: {
          color: "#666",
          fontSize: 13,
          padding: [3, 5],
        },
      },
      indicator: [
        { name: "语言理解", max: 100 },
        { name: "推理能力", max: 100 },
        { name: "创造性", max: 100 },
        { name: "专业知识", max: 100 },
        { name: "响应速度", max: 100 },
        { name: "安全性", max: 100 },
      ],
      splitLine: {
        lineStyle: {
          color: "#e8e8e8",
        },
      },
      splitArea: {
        show: true,
        areaStyle: {
          color: ["#f5f5f5", "#fff"],
        },
      },
      axisLine: {
        lineStyle: {
          color: "#e8e8e8",
        },
      },
    },
    series: [
      {
        type: "radar",
        symbolSize: 6,
        symbol: "circle",
        lineStyle: {
          width: 2,
          color: "#1890ff",
        },
        itemStyle: {
          color: "#1890ff",
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: "rgba(24,144,255,0.3)",
            },
            {
              offset: 1,
              color: "rgba(24,144,255,0.1)",
            },
          ]),
        },
        data: [
          {
            value: [89, 86, 91, 87, 88, 94],
            name: "能力评估",
          },
        ],
      },
    ],
    animation: true,
    animationDuration: 1000,
    animationEasing: "cubicOut",
  };

  chart.setOption(option);

  // 监听窗口大小变化
  window.addEventListener("resize", () => {
    chart.resize();
  });

  return chart;
};

// 返回上一页
function goNext() {
  router.push(`/project/${route.params.projectId}/report-manage`);
}

// 下载报告
function downloadReport() {
  const reportDetail = route.query.reportDetail || "未提供报告内容";
  const blob = new Blob([reportDetail], { type: "text/plain;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `报告_${route.params.projectId}.txt`;
  link.click();
}
</script>

<style>
html,
body,
#app {
  height: 100%;
}

.report-detail-container {
  height: 100vh;
  overflow-y: auto;
  background: #fff;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 24px;
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

.evaluation-overview {
  display: flex;
  gap: 24px;
  margin-bottom: 32px;
  min-height: 400px;
}

.score-cards {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.score-card {
  background: #fff;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  transition: transform 0.2s;
}

.score-card:hover {
  transform: translateY(-2px);
}

.score-value {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
}

.score-label {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.score-description {
  font-size: 12px;
  color: #666;
  margin-bottom: 12px;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: #f0f0f0;
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s;
}

.radar-container {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.detailed-metrics {
  margin-bottom: 32px;
}

.detailed-metrics h4 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1f1f1f;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.metric-item {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
}

.metric-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.metric-icon {
  font-size: 24px;
  margin-right: 12px;
}

.metric-title {
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.metric-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.metric-score {
  font-size: 24px;
  font-weight: 700;
  color: #0070c0;
}

.metric-items {
  flex: 1;
  margin-left: 16px;
}

.sub-metric {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
}

.sub-metric-name {
  color: #666;
}

.sub-metric-score {
  color: #333;
  font-weight: 500;
}

.markdown-section {
  flex: 1;
  min-height: 600px;
  margin-bottom: 20px;
}

.markdown-content {
  height: 100%;
  padding: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  overflow-y: auto;
}

.markdown-rendered {
  white-space: pre-wrap;
  word-wrap: break-word;
}

.footer-area {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;
  padding: 16px 0;
  border-top: 1px solid #f0f0f0;
}

@media (max-width: 768px) {
  .evaluation-overview {
    flex-direction: column;
  }

  .score-cards {
    grid-template-columns: 1fr;
  }
}
</style>
