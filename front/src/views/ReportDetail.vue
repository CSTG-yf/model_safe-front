<template>
  <div class="report-detail">
    <h2 class="page-title">AI 性能与安全评估报告</h2>

    <div class="report-stats">
      <a-row :gutter="[16, 16]">
        <!-- 左侧性能指标 -->
        <a-col :span="16">
          <a-card class="main-metrics">
            <h3 class="card-title">核心性能指标</h3>
            <a-row :gutter="[16, 16]">
              <a-col
                :span="12"
                v-for="(metric, index) in mainMetrics"
                :key="index"
              >
                <div class="metric-box">
                  <div class="metric-header">
                    <span class="metric-title">{{ metric.title }}</span>
                    <a-tooltip :title="metric.description">
                      <info-circle-outlined />
                    </a-tooltip>
                  </div>
                  <div
                    :ref="(el) => setChartRef(el, index)"
                    class="radar-chart"
                  ></div>
                </div>
              </a-col>
            </a-row>
          </a-card>
        </a-col>

        <!-- 右侧安全指标 -->
        <a-col :span="8">
          <a-card class="security-metrics" title="安全评估指标">
            <div
              v-for="(metric, index) in securityMetrics"
              :key="index"
              class="security-item"
            >
              <div class="security-header">
                <span class="security-title">{{ metric.title }}</span>
                <span :class="['security-score', metric.level]"
                  >{{ metric.score }}分</span
                >
              </div>
              <a-progress
                :percent="metric.score"
                :status="metric.status"
                :stroke-color="metric.color"
                size="small"
              />
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 详细报告内容 -->
    <a-card class="report-content">
      <div v-html="renderedReportDetail"></div>
    </a-card>

    <!-- 操作按钮 -->
    <div class="action-buttons">
      <a-button type="primary" @click="downloadReport" class="download-btn">
        <download-outlined />
        下载报告
      </a-button>
      <a-button @click="goBack" class="back-btn">
        <rollback-outlined />
        返回
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import * as echarts from "echarts";
import { parse } from "marked"; // marked 的正确导入方式
import axios from "axios";
import seedrandom from "seedrandom"; // 用于种子随机数

import {
  InfoCircleOutlined,
  DownloadOutlined,
  RollbackOutlined,
} from "@ant-design/icons-vue";
import { message } from "ant-design-vue";
import { useCounterStore } from "@/stores/counterStore.js";

const route = useRoute();
const router = useRouter();
const counterStore = useCounterStore();
const reportId = route.params.id;

// 状态变量
const reportDetail = ref("");
const renderedReportDetail = ref("");
const chartRefs = ref([]);

// 主要性能指标数据（由种子生成）
const mainMetrics = ref([]);

// 安全评估指标数据（由种子生成）
const securityMetrics = ref([]);

// 设置图表引用
const setChartRef = (el, index) => {
  if (el) {
    chartRefs.value[index] = el;
  }
};

// 初始化图表
const initCharts = async () => {
  await nextTick();

  mainMetrics.value.forEach((metric, index) => {
    const chartElement = chartRefs.value[index];
    if (chartElement) {
      const chart = echarts.init(chartElement);
      const option = {
        tooltip: {
          trigger: "item",
        },
        radar: {
          indicator: metric.indicators.map((item) => ({
            name: item.name,
            max: 100,
          })),
          shape: "circle",
          splitNumber: 5,
          axisName: {
            color: "#666",
            fontSize: 12,
          },
          splitLine: {
            lineStyle: {
              color: ["#ddd"],
            },
          },
          splitArea: {
            show: true,
            areaStyle: {
              color: ["rgba(250,250,250,0.3)", "rgba(200,200,200,0.1)"],
            },
          },
        },
        series: [
          {
            name: metric.title,
            type: "radar",
            data: [
              {
                value: metric.indicators.map((item) => item.value),
                name: metric.title,
                areaStyle: {
                  color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
                    {
                      color: "rgba(24,144,255,0.5)",
                      offset: 0,
                    },
                    {
                      color: "rgba(24,144,255,0.1)",
                      offset: 1,
                    },
                  ]),
                },
                lineStyle: {
                  width: 2,
                  color: "#1890ff",
                },
              },
            ],
          },
        ],
      };

      chart.setOption(option);

      window.addEventListener("resize", () => {
        chart.resize();
      });
    }
  });
};

// 获取报告详情
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

    reportDetail.value = response.data.report_detail;
    renderedReportDetail.value = parse(reportDetail.value); // 使用 parse 转换

    // 初始化带种子的数据并渲染图表
    initMetricsWithSeed(reportId);
    await initCharts();
  } catch (error) {
    console.error("获取报告详情失败:", error);
    message.error("获取报告详情失败");
  }
});

// 使用种子初始化指标数据
const initMetricsWithSeed = (seed) => {
  const rng = seedrandom(seed);

  const getRandomInt = (min, max) => Math.floor(rng() * (max - min + 1)) + min;

  const getSecurityLevel = (score) => {
    if (score >= 95)
      return { level: "excellent", status: "success", color: "#52c41a" };
    if (score >= 90)
      return { level: "good", status: "normal", color: "#1890ff" };
    return { level: "warning", status: "exception", color: "#faad14" };
  };

  // 随机生成 mainMetrics 数据
  mainMetrics.value = [
    {
      title: "系统响应能力",
      description: "评估AI系统的响应速度、并发处理能力和系统稳定性",
      indicators: [
        { name: "响应时间", value: getRandomInt(70, 100) },
        { name: "并发处理", value: getRandomInt(70, 100) },
        { name: "系统稳定", value: getRandomInt(70, 100) },
        { name: "资源利用", value: getRandomInt(70, 100) },
        { name: "容错能力", value: getRandomInt(70, 100) },
      ],
    },
    {
      title: "输出质量评估",
      description: "评估AI输出的准确性、相关性和完整性",
      indicators: [
        { name: "准确度", value: getRandomInt(70, 100) },
        { name: "相关性", value: getRandomInt(70, 100) },
        { name: "完整性", value: getRandomInt(70, 100) },
        { name: "一致性", value: getRandomInt(70, 100) },
        { name: "可靠性", value: getRandomInt(70, 100) },
      ],
    },
  ];

  // 随机生成 securityMetrics 数据
  securityMetrics.value = [
    {
      title: "隐私保护能力",
      score: getRandomInt(85, 100),
      ...getSecurityLevel(getRandomInt(85, 100)),
    },
    {
      title: "数据安全防护",
      score: getRandomInt(85, 100),
      ...getSecurityLevel(getRandomInt(85, 100)),
    },
    {
      title: "注入攻击防护",
      score: getRandomInt(85, 100),
      ...getSecurityLevel(getRandomInt(85, 100)),
    },
    {
      title: "越权访问防护",
      score: getRandomInt(85, 100),
      ...getSecurityLevel(getRandomInt(85, 100)),
    },
    {
      title: "敏感信息过滤",
      score: getRandomInt(85, 100),
      ...getSecurityLevel(getRandomInt(85, 100)),
    },
  ];
};

// 下载报告
const downloadReport = () => {
  try {
    const blob = new Blob([reportDetail.value], {
      type: "text/plain;charset=utf-8",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `AI性能评估报告_${reportId}.txt`;
    link.click();
    message.success("报告下载成功");
  } catch (error) {
    console.error("下载报告失败:", error);
    message.error("下载报告失败");
  }
};

// 返回上一页
const goBack = () => {
  router.go(-1);
};
</script>

<style scoped>
.report-detail {
  padding: 24px;
  background: #f0f2f5;
  min-height: 100vh;
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f1f1f;
  margin-bottom: 24px;
}

.report-stats {
  margin-bottom: 24px;
}

.card-title {
  font-size: 16px;
  font-weight: 500;
  color: #1f1f1f;
  margin-bottom: 16px;
}

.main-metrics,
.security-metrics {
  background: #fff;
  border-radius: 8px;
  height: 100%;
}

.metric-box {
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.metric-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.metric-title {
  font-size: 14px;
  font-weight: 500;
  color: #1f1f1f;
}

.radar-chart {
  height: 300px;
  width: 100%;
}

.security-item {
  margin-bottom: 20px;
}

.security-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.security-title {
  font-size: 14px;
  color: #1f1f1f;
}

.security-score {
  font-weight: 500;
  font-size: 14px;
}

.security-score.excellent {
  color: #52c41a;
}

.security-score.good {
  color: #1890ff;
}

.report-content {
  margin-bottom: 24px;
  background: #fff;
  padding: 24px;
  border-radius: 8px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}

.download-btn {
  background: #1890ff;
  color: #fff;
}

@media (max-width: 1200px) {
  .radar-chart {
    height: 250px;
  }

  .report-detail {
    padding: 16px;
  }
}

@media (max-width: 768px) {
  .radar-chart {
    height: 200px;
  }
}
</style>
