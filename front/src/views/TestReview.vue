<template>
  <div class="test-review-container">
    <!-- 顶部标题区域 -->
    <div class="header-area"></div>

    <!-- 内容区域 -->
    <div class="content-area">
      <!-- 统计卡片 -->
      <div class="stats-area">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-card class="stat-card">
              <div class="stat-value">{{ testDetails.toxicity_accuracy }}</div>
              <div class="stat-label">毒性评分</div>
            </a-card>
          </a-col>
          <a-col :span="8">
            <a-card class="stat-card">
              <div class="stat-value">
                {{ testDetails.hallucination_accuracy }}
              </div>
              <div class="stat-label">幻觉评分</div>
            </a-card>
          </a-col>

          <a-col :span="8">
            <a-card class="stat-card">
              <div class="stat-value">{{ testDetails.average_score }}</div>
              <div class="stat-label">平均得分</div>
            </a-card>
          </a-col>
        </a-row>
      </div>

      <!-- 表格区域 -->
      <a-card class="table-card" title="测试审核内容">
        <a-table
          :columns="columns"
          :data-source="testDetails.records"
          row-key="record_id"
          :pagination="{ pageSize: 5 }"
          bordered
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'actions'">
              <a-space>
                <a-button type="link" @click="openReview(record)"
                  >审核</a-button
                >
                <a-button
                  type="link"
                  danger
                  @click="deleteQuestion(record.record_id)"
                  >删除</a-button
                >
              </a-space>
            </template>
            <template v-if="column.key === 'content'">
              <div class="truncated-content">
                {{ record.input_text.question.slice(0, 100) }}...
              </div>
            </template>
            <template v-if="column.key === 'type'">
              <div>{{ record.input_text.question_type }}</div>
            </template>
            <template v-if="column.key === 'score'">
              <a-tag :color="getScoreColor(record.score)">{{
                record.score
              }}</a-tag>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 审核弹窗 -->
    <a-modal
      v-model:open="reviewVisible"
      title="题目审核"
      ok-text="确认"
      cancel-text="取消"
      @ok="saveReview"
      width="80%"
      body-style="max-height: 70vh; overflow-y: auto; padding: 24px;"
    >
      <!-- 题目信息 -->
      <div class="review-section">
        <h3 class="section-title">题目信息</h3>
        <p><strong>题目：</strong>{{ currentItem.input_text.question }}</p>
        <p><strong>题型：</strong>{{ currentItem.input_text.question_type }}</p>
        <!-- 如果题型包含"选择"，则显示选项 -->
        <template v-if="currentItem.input_text.question_type.includes('选择')">
          <p><strong>选项：</strong></p>
          <ul class="option-list">
            <li
              v-for="(opt, index) in currentItem.input_text.options"
              :key="index"
            >
              {{ String.fromCharCode(65 + index) }}. {{ opt }}
            </li>
          </ul>
        </template>
      </div>

      <!-- 回答信息 -->
      <div class="review-section">
        <h3 class="section-title">回答信息</h3>
        <p><strong>AI回答：</strong></p>
        <div class="answer-block">{{ currentItem.output_text }}</div>
        <p><strong>正确答案：</strong>{{ currentItem.input_text.answer }}</p>
      </div>

      <!-- 得分操作 -->
      <div class="review-section">
        <h3 class="section-title">评分</h3>
        <a-form layout="vertical">
          <a-form-item label="得分">
            <a-input-number
              v-model:value="currentItem.score"
              :min="0"
              :max="5"
              :precision="1"
              style="width: 200px"
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <!-- 底部按钮区域 -->
    <div class="footer-area">
      <a-space>
        <a-button @click="goToTestManage">返回测试管理</a-button>
        <a-button type="primary" @click="completeReview">完成审核</a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";
import { ref, reactive, computed, onMounted } from "vue";
import { message } from "ant-design-vue";
import axios from "axios";
import { useCounterStore } from "@/stores/counterStore";

// 从路由中获取参数，这里 evaluation_id 是通过 query 传入的
const route = useRoute();
const router = useRouter();
const evaluationId = route.query.evaluation_id;
const counterStore = useCounterStore();

// 存储测试详情（包含统计信息及记录列表）
const testDetails = ref({
  total_samples: 0,
  average_score: 0,
  hallucination_accuracy: 0,
  toxicity_accuracy: 0,
  records: [],
});

// 获取测试详情数据
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
      testDetails.value = response.data.data;
    } else {
      message.error("获取测试详情失败");
    }
  } catch (error) {
    console.error(error);
    message.error("获取测试详情失败");
  }
}

// 计算已审核题目数量
function getReviewedCount() {
  return testDetails.value.records.filter((item) => item.score > 0).length;
}

// 根据分数获取颜色（这里可以根据实际情况调整颜色映射）
function getScoreColor(score) {
  if (score === 0) return "default";
  if (score < 60) return "error";
  if (score < 80) return "warning";
  return "success";
}

// 表格列配置，其中通过 render 方法展示题目和题型
const columns = [
  {
    title: "题目",
    dataIndex: "input_text",
    key: "content",
    render: (input_text) => input_text.question,
  },
  {
    title: "题型",
    dataIndex: "input_text",
    key: "type",
    render: (input_text) => input_text.question_type,
  },
  { title: "得分", dataIndex: "score", key: "score", width: 100 },
  { title: "操作", key: "actions", width: 150 },
];

// 当前审核题目详情的存储对象
const currentItem = reactive({
  record_id: null,
  input_text: {
    question: "",
    question_type: "",
    options: [],
    answer: "",
    scoring_criteria: {},
  },
  output_text: "",
  score: 0,
  scoreComment: "",
});

// 点击审核按钮时，根据 record_id 请求题目详情接口，然后填充弹窗内容
async function openReview(item) {
  try {
    const response = await axios.get(
      `http://localhost:8000/api/model-evaluation/records/${item.record_id}/`,
      {
        headers: {
          Authorization: `Bearer ${counterStore.access}`,
          "Content-Type": "application/json",
        },
      }
    );
    // 假设接口返回状态码200且返回数据正确
    if (response.data) {
      const data = response.data;
      currentItem.record_id = data.record_id;
      currentItem.input_text = data.input_text;
      currentItem.output_text = data.output_text;
      currentItem.score = data.score;
      currentItem.scoreComment = "";
      reviewVisible.value = true;
    } else {
      message.error("获取题目详情失败");
    }
  } catch (error) {
    console.error(error);
    message.error("获取题目详情失败");
  }
}

// 保存评分操作
async function saveReview() {
  const idx = testDetails.value.records.findIndex(
    (q) => q.record_id === currentItem.record_id
  );
  if (idx !== -1) {
    // 更新本地记录中的分数
    testDetails.value.records[idx].score = currentItem.score;
    // 保存评分说明
    testDetails.value.records[idx].scoreComment = currentItem.scoreComment;

    // 重新计算平均分
    const validScores = testDetails.value.records
      .filter((record) => record.score > 0)
      .map((record) => record.score);

    testDetails.value.average_score =
      validScores.length > 0
        ? (
            validScores.reduce((sum, score) => sum + score, 0) /
            validScores.length
          ).toFixed(1)
        : 0;

    // 向后端发送更新请求
    try {
      const response = await axios.put(
        `http://localhost:8000/api/model-evaluation/records/${currentItem.record_id}/`,
        { score: currentItem.score },
        {
          headers: {
            Authorization: `Bearer ${counterStore.access}`,
            "Content-Type": "application/json",
          },
        }
      );
      if (response.data != null) {
        message.success("分数已成功修改");
      } else {
        message.error("修改分数失败");
      }
    } catch (error) {
      console.error(error);
      message.error("修改分数失败");
    }
  }
  reviewVisible.value = false;
}

// 删除题目
async function deleteQuestion(record_id) {
  try {
    const response = await axios.delete(
      `http://localhost:8000/api/model-evaluation/records/${record_id}/`,
      {
        headers: {
          Authorization: `Bearer ${counterStore.access}`,
          "Content-Type": "application/json",
        },
      }
    );
    // 根据接口文档，成功删除返回204状态码
    if (response.status === 204) {
      // 从本地记录中删除该题目
      testDetails.value.records = testDetails.value.records.filter(
        (q) => q.record_id !== record_id
      );
      message.success("题目删除成功");
    } else {
      message.error("删除题目失败");
    }
  } catch (error) {
    console.error(error);
    message.error("删除题目失败");
  }
}

// 返回测试管理页面
function goToTestManage() {
  const projectId = route.params.projectId;
  router.push(`/project/${projectId}/test-manage`); // 完成审核后跳转到测试管理页面
}

// 完成审核后返回测试管理页面
async function completeReview() {
  try {
    const response = await axios.put(
      `http://localhost:8000/api/model-evaluation/${evaluationId}/review/`,
      {},
      {
        headers: {
          Authorization: `Bearer ${counterStore.access}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (response.status === 200) {
      message.success("审核已完成");
      const projectId = route.params.projectId;
      router.push(`/project/${projectId}/test-manage`); // 完成审核后跳转到测试管理页面
    } else {
      message.error("完成审核失败");
    }
  } catch (error) {
    console.error(error);
    message.error("完成审核失败");
  }
}

// 弹窗显示控制
const reviewVisible = ref(false);

// 页面加载时自动获取测试详情
onMounted(() => {
  fetchTestDetails();
});
</script>

<style scoped>
/* 样式部分与原代码保持一致 */
.test-review-container {
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
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 600;
}
.page-subtitle {
  margin: 0;
  color: #666;
  font-size: 16px;
}

.content-area {
  flex: 1;
  overflow: auto;
}

.stats-area {
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

.stat-label {
  color: #666;
}

.table-card {
  margin-bottom: 24px;
}

.truncated-content {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 400px;
}

.review-section {
  margin-bottom: 24px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 4px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
  border-left: 4px solid #1890ff;
  padding-left: 8px;
}

.answer-block {
  background-color: #f0f5ff;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  white-space: pre-wrap;
  border-left: 4px solid #1890ff;
}

.option-list {
  padding-left: 20px;
  margin: 0;
}

.footer-area {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}
</style>
