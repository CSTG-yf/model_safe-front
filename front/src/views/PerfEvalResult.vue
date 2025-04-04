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
        <CheckCircleFilled style="font-size: 48px; color: #52c41a" />
      </div>
      <div class="result-title">
        <h3>评估完成</h3>
        <p>已完成模型评估，可保存仪表盘或查看详细数据</p>
      </div>
    </div>

    <!-- 第一行指标展示 -->
    <div class="result-stats">
      <a-row :gutter="16">
        <a-col :span="6">
          <a-card class="metric-card">
            <div class="card-content">
              <div class="card-title">幻觉准确率</div>
              <div ref="hallucinationChart" class="gauge-chart"></div>
              <div class="indicator good">
                <span class="indicator-dot"></span>
                <span class="indicator-text">良好</span>
              </div>
            </div>
          </a-card>
        </a-col>

        <a-col :span="6">
          <a-card class="metric-card">
            <div class="card-content">
              <div class="card-title">毒性准确率</div>
              <div ref="toxicityChart" class="gauge-chart"></div>
              <div class="indicator good">
                <span class="indicator-dot"></span>
                <span class="indicator-text">良好</span>
              </div>
            </div>
          </a-card>
        </a-col>

        <a-col :span="6">
          <a-card class="metric-card">
            <div class="card-content">
              <div class="card-title">专业能力</div>
              <div ref="professionalChart" class="gauge-chart"></div>
              <div class="indicator good">
                <span class="indicator-dot"></span>
                <span class="indicator-text">良好</span>
              </div>
            </div>
          </a-card>
        </a-col>

        <a-col :span="6">
          <a-card class="metric-card token-card">
            <div class="card-content">
              <div class="card-title">Token消耗</div>
              <div :class="['token-value', tokenClass]">
                {{ formatTokenNumber(resultData.total_tokens) }}
              </div>
              <div class="token-details">
                <div class="token-progress-container">
                  <div
                    class="token-progress-bar"
                    :style="{
                      width: `${Math.min(resultData.total_tokens / 40, 100)}%`,
                      backgroundColor: tokenBarColor,
                    }"
                  ></div>
                </div>
                <div class="token-tip">
                  <span class="token-icon">
                    <span v-if="tokenClass === 'success'" class="success-icon"
                      >✓</span
                    >
                    <span v-else class="error-icon">!</span>
                  </span>
                  <span>{{ tokenTipText }}</span>
                </div>
              </div>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 第二行图表区域 - 修改为使用同样的Row和Col结构 -->
    <div class="charts-row">
      <a-row :gutter="16">
        <a-col :span="12">
          <a-card class="chart-card" title="越狱攻击评估">
            <div class="card-subtitle">分数越低表示抗越狱性能越好</div>
            <div ref="jailbreakChart" class="large-chart"></div>
          </a-card>
        </a-col>

        <a-col :span="12">
          <a-card class="chart-card" title="综合能力雷达图">
            <div class="card-subtitle">各能力维度评分</div>
            <div ref="radarChart" class="large-chart"></div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 保存按钮 -->
    <div class="footer-area">
      <a-button type="primary" @click="saveModalVisible = true"
        >保存评估</a-button
      >
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
import { ref, onMounted, nextTick, computed, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useCounterStore } from "@/stores/counterStore";
import { message } from "ant-design-vue";
import { CheckCircleFilled } from "@ant-design/icons-vue";
import axios from "axios";
import * as echarts from "echarts";

// 图表引用
const hallucinationChart = ref(null);
const toxicityChart = ref(null);
const professionalChart = ref(null);
const jailbreakChart = ref(null);
const radarChart = ref(null);

// 初始化图表实例
const charts = {
  hallucination: null,
  toxicity: null,
  professional: null,
  jailbreak: null,
  radar: null,
};

// 响应式数据
const resultData = ref({
  project_score: {},
  jailbreak_evaluation: [],
  hallucination_accuracy: 0,
  toxicity_accuracy: 0,
  total_tokens: 0,
});

const route = useRoute();
const router = useRouter();
const counterStore = useCounterStore();
const saveModalVisible = ref(false);
const evalName = ref("");

// Token样式计算
const tokenClass = computed(() => {
  return resultData.value.total_tokens > 3000 ? "error" : "success";
});

// Token相关计算
const tokenBarColor = computed(() => {
  return resultData.value.total_tokens > 3000 ? "#ff4d4f" : "#52c41a";
});

const tokenTipText = computed(() => {
  return resultData.value.total_tokens > 3000 ? "超出推荐值" : "良好";
});

// 格式化Token数字
const formatTokenNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// 专业分计算
const professionalScore = computed(() => {
  const scores = Object.entries(resultData.value.project_score)
    .filter(([key]) => !key.startsWith("A"))
    .map(([, value]) => value);
  return scores.length
    ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
    : 0;
});

// 初始化仪表盘
const initGaugeChart = (dom, title, value, max) => {
  const chart = echarts.init(dom);
  const percent = ((value / max) * 100).toFixed(1);

  const option = {
    series: [
      {
        type: "gauge",
        radius: "100%",
        startAngle: 210,
        endAngle: -30,
        pointer: {
          show: false,
        },
        progress: {
          show: true,
          overlap: false,
          roundCap: true,
          clip: false,
          itemStyle: {
            color: {
              type: "linear",
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: "#36CBCB",
                },
                {
                  offset: 1,
                  color: "#52c41a",
                },
              ],
            },
          },
        },
        axisLine: {
          lineStyle: {
            width: 15,
            color: [[1, "#E3E6EB"]],
          },
        },
        splitLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          show: false,
        },
        anchor: {
          show: false,
        },
        title: {
          show: false,
        },
        detail: {
          valueAnimation: true,
          offsetCenter: [0, "0%"],
          fontSize: 24,
          fontWeight: "bold",
          formatter: `${percent}%`,
          color: "#36CBCB",
        },
        data: [
          {
            value: percent,
          },
        ],
      },
    ],
  };

  chart.setOption(option);
  return chart;
};

// 初始化柱状图 - 越狱评估 (分数低表示性能好)
const initBarChart = (dom) => {
  const chart = echarts.init(dom);
  const data = resultData.value.jailbreak_evaluation.map(
    (item) => item.avg_score
  );

  // 翻转分数的评估逻辑 - 把低分显示为好的绿色
  const barColors = data.map((score) => {
    return score < 4 ? "#52c41a" : score < 7 ? "#faad14" : "#f5222d";
  });

  const option = {
    tooltip: {
      trigger: "axis",
      formatter: "{b}: {c} 分<br/>(分数越低风险越小)",
    },
    grid: {
      left: "3%",
      right: "4%",
      bottom: "3%",
      top: "3%",
      containLabel: true,
    },
    xAxis: {
      type: "category",
      data: resultData.value.jailbreak_evaluation.map((item) => item.title),
      axisLabel: {
        interval: 0,
        rotate: 0,
      },
    },
    yAxis: {
      type: "value",
      max: 10,
      name: "风险评分",
      nameTextStyle: {
        padding: [0, 0, 0, 30],
      },
      axisLabel: {
        formatter: "{value} 分",
      },
    },
    series: [
      {
        data: data.map((value, index) => ({
          value: value,
          itemStyle: { color: barColors[index] },
        })),
        type: "bar",
        barWidth: "40%",
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)",
          },
        },
        label: {
          show: true,
          position: "top",
          formatter: "{c} 分",
        },
      },
    ],
  };

  chart.setOption(option);
  return chart;
};

// 初始化雷达图 - 考虑到越狱分数低表示性能好
const initRadarChart = (dom) => {
  const chart = echarts.init(dom);

  // 计算越狱评分
  // 反转越狱分数的逻辑：10 - 越狱分数，这样分数低的越狱能力在雷达图上会显示为更好（更外围）
  const jailbreakScore =
    resultData.value.jailbreak_evaluation[0]?.avg_score || 0;
  const adjustedJailbreakScore = 10 - jailbreakScore;

  const option = {
    color: ["#36CBCB"],
    tooltip: {
      trigger: "item",
    },
    legend: {
      show: false,
    },
    radar: {
      indicator: [
        { name: "幻觉准确率", max: 100 },
        { name: "毒性准确率", max: 100 },
        { name: "专业能力", max: 100 },
        { name: "抗越狱能力", max: 10, color: "#333" },
      ],
      shape: "circle",
      splitNumber: 5,
      axisNameGap: 15,
      splitArea: {
        areaStyle: {
          color: ["#f5f5f5", "#e9e9e9", "#d9d9d9", "#c9c9c9", "#b9b9b9"],
          shadowColor: "rgba(0, 0, 0, 0.2)",
          shadowBlur: 10,
        },
      },
      axisLine: {
        lineStyle: {
          color: "rgba(0, 0, 0, 0.2)",
        },
      },
      splitLine: {
        lineStyle: {
          color: "rgba(0, 0, 0, 0.2)",
        },
      },
    },
    series: [
      {
        name: "模型能力",
        type: "radar",
        data: [
          {
            value: [
              resultData.value.hallucination_accuracy * 100,
              resultData.value.toxicity_accuracy * 100,
              professionalScore.value * 20,
              adjustedJailbreakScore, // 这里改用调整后的分数
            ],
            name: "模型能力",
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: "rgba(54, 203, 203, 0.8)",
                },
                {
                  offset: 1,
                  color: "rgba(82, 196, 26, 0.3)",
                },
              ]),
            },
            symbol: "circle",
            symbolSize: 6,
            lineStyle: {
              width: 2,
            },
          },
        ],
      },
    ],
  };

  chart.setOption(option);
  return chart;
};

// 获取评估结果
async function fetchEvalResults() {
  try {
    const response = await axios.get(
      `http://localhost:8000/api/model-evaluation/overall-result/${route.query.evalId}/`,
      {
        headers: {
          Authorization: `Bearer ${counterStore.access}`,
          "Content-Type": "application/json",
        },
      }
    );

    resultData.value = response.data;

    await nextTick();

    // 初始化所有图表
    charts.hallucination = initGaugeChart(
      hallucinationChart.value,
      "幻觉准确率",
      resultData.value.hallucination_accuracy,
      1
    );

    charts.toxicity = initGaugeChart(
      toxicityChart.value,
      "毒性准确率",
      resultData.value.toxicity_accuracy,
      1
    );

    charts.professional = initGaugeChart(
      professionalChart.value,
      "专业能力",
      professionalScore.value,
      5
    );

    charts.jailbreak = initBarChart(jailbreakChart.value);
    charts.radar = initRadarChart(radarChart.value);
  } catch (error) {
    console.error("获取评估结果失败:", error);
    message.error("获取评估结果失败");
  }
}

// 保存操作
async function confirmSave() {
  if (!evalName.value.trim()) {
    message.warning("请输入评估名称");
    return;
  }

  try {
    const payload = {
      overall_result_id: route.query.evalId,
      name: evalName.value,
    };

    await axios.put(
      `http://localhost:8000/api/model-evaluation/overall-result/${route.query.evalId}/`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${counterStore.access}`,
          "Content-Type": "application/json",
        },
      }
    );

    message.success(`评估「${evalName.value}」已保存`);
    saveModalVisible.value = false;
    router.push(`/project/${route.params.projectId}/console`);
  } catch (error) {
    console.error("保存失败:", error);
    message.error("保存失败");
  }
}

// 窗口resize处理
const handleResize = () => {
  Object.values(charts).forEach((chart) => {
    if (chart) {
      chart.resize();
    }
  });
};

// 生命周期
onMounted(() => {
  fetchEvalResults();
  window.addEventListener("resize", handleResize);
});

// 清理
onBeforeUnmount(() => {
  window.removeEventListener("resize", handleResize);
  Object.values(charts).forEach((chart) => {
    if (chart) {
      chart.dispose();
    }
  });
});
</script>

<style scoped>
.eval-result-container {
  background: #fff;
  padding: 32px;
  border-radius: 8px;
  min-height: 100vh; /* 确保白色背景至少填满整个视口高度 */
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
}

/* 顶部进度条 + 标题 */
.header-area {
  margin-bottom: 32px;
}
.page-title {
  margin: 0 0 16px;
  font-size: 28px;
  font-weight: 600;
  color: #1f1f1f;
}
.step-bar {
  margin-bottom: 24px;
}

/* 成功提示 */
.result-header {
  display: flex;
  align-items: center;
  margin-bottom: 32px;
  padding: 20px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(82, 196, 26, 0.1);
}
.result-icon {
  margin-right: 20px;
}
.result-title h3 {
  margin: 0;
  font-size: 20px;
  color: #52c41a;
}
.result-title p {
  margin: 8px 0 0;
  color: #666;
  font-size: 15px;
}

/* 新的指标卡片样式 */
.metric-card {
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}
.metric-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}
.card-content {
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}
.card-title {
  font-size: 16px;
  color: #333;
  margin-bottom: 10px;
  text-align: center;
  font-weight: 500;
}
.gauge-chart {
  height: 140px;
  margin-bottom: 8px;
}
.indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
}
.indicator.good {
  color: #52c41a;
}
.indicator.warning {
  color: #faad14;
}
.indicator.bad {
  color: #f5222d;
}
.indicator-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}
.indicator.good .indicator-dot {
  background-color: #52c41a;
}
.indicator.warning .indicator-dot {
  background-color: #faad14;
}
.indicator.bad .indicator-dot {
  background-color: #f5222d;
}
.indicator-text {
  font-size: 14px;
}

/* Token卡片特殊样式 */
.token-card {
  background: linear-gradient(145deg, #ffffff, #f5f5f5);
}
.token-value {
  font-size: 32px;
  font-weight: 600;
  text-align: center;
  margin: 10px 0;
}
.token-value.success {
  color: #36cbcb;
}
.token-value.error {
  color: #f5222d;
}
.token-details {
  margin-top: 10px;
}
.token-progress-container {
  height: 6px;
  background-color: #f0f0f0;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 10px;
}
.token-progress-bar {
  height: 100%;
  border-radius: 3px;
  transition: width 0.5s ease-in-out;
}
.token-tip {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #666;
  font-size: 14px;
}
.token-icon {
  margin-right: 5px;
  font-size: 16px;
}
.success-icon {
  color: #52c41a;
}
.error-icon {
  color: #f5222d;
}

/* 图表区域样式 */
.charts-row {
  flex: 1;
  margin-bottom: 32px;
}
.chart-card {
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.3s;
}
.chart-card:hover {
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}
.large-chart {
  height: 350px;
  width: 100%;
}
.card-subtitle {
  font-size: 14px;
  color: #8c8c8c;
  margin-top: -16px;
  margin-bottom: 16px;
  padding: 0 24px;
}

/* 底部按钮 */
.footer-area {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
  padding-top: 24px;
  padding-bottom: 24px; /* 确保底部有足够的空间 */
}
.footer-area button {
  padding: 8px 24px;
  height: auto;
  font-size: 16px;
  border-radius: 6px;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .charts-row :deep(.ant-row) {
    flex-direction: column;
  }

  .charts-row :deep(.ant-col) {
    width: 100%;
    max-width: 100%;
  }

  .result-stats :deep(.ant-col) {
    margin-bottom: 16px;
  }
}

@media (max-width: 768px) {
  .eval-result-container {
    padding: 16px;
  }

  .result-stats :deep(.ant-row) {
    flex-direction: column;
  }

  .result-stats :deep(.ant-col) {
    width: 100%;
    max-width: 100%;
    margin-bottom: 16px;
  }

  .gauge-chart {
    height: 120px;
  }

  .large-chart {
    height: 300px;
  }
}
</style>
