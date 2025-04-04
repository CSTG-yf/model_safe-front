<template>
  <div class="test-result-container">
    <!-- 顶部标题 + 进度条 -->
    <div class="header-area">
      <h2 class="page-title">测试执行</h2>
      <a-steps :current="2" class="step-bar">
        <a-step title="选择题库" />
        <a-step title="进行测试" />
        <a-step title="测试完成" />
      </a-steps>
    </div>

    <!-- 测试结果区域 -->
    <div class="result-area">
      <div class="result-header">
        <div class="result-icon">
          <CheckCircleFilled style="font-size: 48px; color: #52c41a" />
        </div>
        <div class="result-title">
          <h3>测试执行成功</h3>
          <p>已完成所有测试用例，点击查看详细报告</p>
        </div>
      </div>

      <!-- 测试基本信息编辑 -->
      <a-card class="test-info-card" title="测试基本信息">
        <a-form layout="vertical">
          <a-form-item label="测试名称" required>
            <a-input v-model:value="testName" placeholder="请输入测试名称" />
          </a-form-item>
          <a-form-item label="测试备注">
            <a-textarea
              v-model:value="testDesc"
              :rows="3"
              placeholder="请输入测试备注"
            />
          </a-form-item>
        </a-form>
      </a-card>

      <!-- 测试统计卡片 -->
      <div class="result-stats">
        <a-row :gutter="16">
          <a-col :span="12">
            <a-card class="stat-card">
              <div class="stat-value">{{ totalSamples }}</div>
              <div class="stat-label">测试用例总数</div>
            </a-card>
          </a-col>
          <a-col :span="12">
            <a-card class="stat-card">
              <div class="stat-value success">{{ averageScore }}</div>
              <div class="stat-label">平均分</div>
            </a-card>
          </a-col>
        </a-row>
      </div>

      <!-- 测试成绩预览 -->
      <a-card class="chart-card" title="测试成绩预览">
        <div class="chart-container">
          <div class="charts-wrapper">
            <div class="chart-item">
              <a-progress
                type="circle"
                :percent="Math.floor((averageScore / 5) * 100)"
                :width="140"
                :format="(percent) => `${percent}%`"
                :stroke-color="'#1890ff'"
              />
              <div class="chart-label">平均分</div>
            </div>
            <div class="chart-item">
              <a-progress
                type="circle"
                :percent="Math.floor((toxicityAccuracy / 1) * 100)"
                :width="140"
                :format="(percent) => `${percent}%`"
                :stroke-color="'#f5222d'"
              />
              <div class="chart-label">毒性分</div>
            </div>
            <div class="chart-item">
              <a-progress
                type="circle"
                :percent="Math.floor((hallucinationAccuracy / 1) * 100)"
                :width="140"
                :format="(percent) => `${percent}%`"
                :stroke-color="'#52c41a'"
              />
              <div class="chart-label">幻觉分</div>
            </div>
          </div>
          <div class="chart-info">
            <div class="info-item">
              <div class="info-dot" style="background-color: #1890ff"></div>
              <div class="info-label">平均分</div>
              <div class="info-value">{{ averageScore }} / 5</div>
            </div>
            <div class="info-item">
              <div class="info-dot error"></div>
              <div class="info-label">毒性分</div>
              <div class="info-value">{{ toxicityAccuracy }} / 1</div>
            </div>
            <div class="info-item">
              <div class="info-dot success"></div>
              <div class="info-label">幻觉分</div>
              <div class="info-value">{{ hallucinationAccuracy }} / 1</div>
            </div>
          </div>
        </div>
      </a-card>
    </div>

    <!-- 底部按钮区域 -->
    <div class="footer-area">
      <a-button type="primary" class="finish-btn" @click="finishTest">
        下一步
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { CheckCircleFilled } from "@ant-design/icons-vue";
import {
  Button,
  Card,
  Row,
  Col,
  Progress,
  Input,
  Form,
  Textarea,
} from "ant-design-vue";
import axios from "axios";
import { message } from "ant-design-vue";
import { useCounterStore } from "@/stores/counterStore.js";

const router = useRouter();
const route = useRoute();
const counterStore = useCounterStore();

// 获取路由中的项目ID和评测ID
const projectId = route.params.projectId;
const evaluationId = route.query.evaluationId;

// 测试基本信息
const testName = ref("");
const testDesc = ref("");

// 测试统计数据
const totalSamples = ref(0);
const averageScore = ref(0);
const hallucinationAccuracy = ref(0);
const toxicityAccuracy = ref(0);

// 获取测试详情
async function fetchTestDetails() {
  try {
    const response = await axios.get(
      `http://localhost:8000/api/model-evaluation/${evaluationId}/detail/`,
      {
        headers: {
          Authorization: `Bearer ${counterStore.access}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.message === "评测详情获取成功") {
      const {
        total_samples,
        average_score,
        hallucination_accuracy,
        toxicity_accuracy,
      } = response.data.data;
      totalSamples.value = total_samples;
      averageScore.value = average_score;
      hallucinationAccuracy.value = hallucination_accuracy;
      toxicityAccuracy.value = toxicity_accuracy;
    } else {
      message.error("获取测试详情失败");
    }
  } catch (error) {
    console.error(error);
    message.error("获取测试详情失败");
  }
}

// 完成测试并跳转到测试管理页面
function finishTest() {
  // 保存测试名称和备注到后端
  axios
    .put(
      `http://localhost:8000/api/model-evaluation/${evaluationId}/detail/`,
      {
        name: testName.value,
        description: testDesc.value,
      },
      {
        headers: {
          Authorization: `Bearer ${counterStore.access}`,
          "Content-Type": "application/json",
        },
      }
    )
    .then(() => {
      // 跳转到测试管理页面
      router.push(`/project/${projectId}/test-manage`);
    })
    .catch((error) => {
      console.error(error);
      message.error("保存失败");
    });
}

// 页面加载时自动获取测试详情
onMounted(() => {
  if (!evaluationId || !projectId) {
    message.error("缺少必要参数");
    return;
  }
  fetchTestDetails();
});
</script>

<style scoped>
.test-result-container {
  background: #fff;
  padding: 24px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  height: 100%;
  display: flex;
  flex-direction: column;
}

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

.result-area {
  flex: 1;
  overflow: auto;
}

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

.result-stats {
  margin-bottom: 24px;
}

.stat-card {
  text-align: center;
  padding: 16px;
  height: 100%;
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

.stat-label {
  color: #666;
}

.chart-card {
  margin-bottom: 24px;
}

.test-info-card {
  margin-bottom: 24px;
}

.chart-container {
  display: flex;
  padding: 16px;
  align-items: center;
}

/* 新增和修改的样式 */
.charts-wrapper {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
  flex: 3;
  gap: 20px;
  padding: 0 10px;
}

.chart-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 10px;
}

.chart-label {
  margin-top: 10px;
  font-size: 14px;
  color: #666;
}

.chart-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding-left: 20px;
  border-left: 1px solid #f0f0f0;
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

.footer-area {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

.finish-btn {
  margin-left: 16px;
  min-width: 100px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .chart-container {
    flex-direction: column;
  }

  .charts-wrapper {
    width: 100%;
    margin-bottom: 20px;
  }

  .chart-info {
    width: 100%;
    border-left: none;
    border-top: 1px solid #f0f0f0;
    padding-left: 0;
    padding-top: 20px;
  }
}
</style>
