<template>
  <div class="testbank-detail-container">
    <!-- 顶部标题区域 -->

    <!-- 内容区域 -->
    <div class="content-area">
      <!-- 统计卡片 -->
      <div class="stats-area">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-card class="stat-card">
              <div class="stat-value">{{ questions.length }}</div>
              <div class="stat-label">题目总数</div>
            </a-card>
          </a-col>
          <a-col :span="8">
            <a-card class="stat-card">
              <div class="stat-value">
                {{ questions.length - getTypeCount("简答") }}
              </div>
              <div class="stat-label">单选题数量</div>
            </a-card>
          </a-col>
          <a-col :span="8">
            <a-card class="stat-card">
              <div class="stat-value">{{ getTypeCount("简答") }}</div>
              <div class="stat-label">简答题数量</div>
            </a-card>
          </a-col>
        </a-row>
      </div>

      <!-- 表格区域 -->
      <a-card class="table-card" title="题库内容">
        <a-table
          :columns="columns"
          :data-source="questions"
          row-key="question_id"
          :pagination="{ pageSize: 10 }"
          bordered
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'actions'">
              <a-space>
                <!-- 编辑按钮 -->
                <a-button
                  type="link"
                  @click="openEditModal(record.question_id)"
                >
                  编辑
                </a-button>
                <!-- 删除按钮 -->
                <a-button
                  type="link"
                  danger
                  @click="deleteQuestion(record.question_id)"
                >
                  删除
                </a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 题目详情弹窗 -->
    <a-modal
      v-model:open="detailVisible"
      title="题目详情"
      width="700px"
      :footer="null"
    >
      <div v-if="selectedQuestion" class="detail-container">
        <h3 class="detail-title">{{ selectedQuestion.question }}</h3>
        <a-tag color="blue">{{ selectedQuestion.question_type }}</a-tag>

        <!-- 选择题选项 -->
        <div
          v-if="selectedQuestion.options && selectedQuestion.options.length > 0"
          class="detail-section"
        >
          <h4>选项：</h4>
          <ul class="options-list">
            <li
              v-for="(option, index) in selectedQuestion.options"
              :key="index"
            >
              {{ option }}
            </li>
          </ul>
        </div>

        <!-- 答案 -->
        <div class="detail-section">
          <h4>参考答案：</h4>
          <div>{{ selectedQuestion.answer }}</div>
        </div>

        <!-- 评分标准 -->
        <div v-if="selectedQuestion.scoring_criteria" class="detail-section">
          <h4>评分标准：</h4>
          <div
            v-if="isObjectScoringCriteria(selectedQuestion.scoring_criteria)"
          >
            <div
              v-for="(criteria, score) in parseScoringCriteria(
                selectedQuestion.scoring_criteria
              )"
              :key="score"
              class="criteria-item"
            >
              <strong>{{ score }}：</strong> {{ criteria }}
            </div>
          </div>
          <div v-else>
            {{ selectedQuestion.scoring_criteria }}
          </div>
        </div>

        <!-- 题目来源 -->
        <div v-if="selectedQuestion.source" class="detail-section">
          <h4>来源：</h4>
          <div>{{ selectedQuestion.source }}</div>
        </div>
      </div>
    </a-modal>

    <!-- 编辑弹窗 -->
    <a-modal
      v-model:open="editModalVisible"
      title="编辑题目"
      ok-text="确认"
      cancel-text="取消"
      width="600px"
      @ok="saveEdit"
    >
      <a-form layout="vertical">
        <a-form-item label="题目内容">
          <a-textarea v-model:value="currentQuestion.question" :rows="3" />
        </a-form-item>

        <a-form-item label="评分标准">
          <!-- 简单文本评分标准 -->
          <template
            v-if="!isObjectScoringCriteria(currentQuestion.scoring_criteria)"
          >
            <a-textarea
              v-model:value="currentQuestion.scoring_criteria"
              :rows="2"
            />
          </template>

          <!-- 对象类型评分标准 -->
          <template v-else>
            <div
              v-for="(criteria, score) in parseScoringCriteria(
                currentQuestion.scoring_criteria
              )"
              :key="score"
              class="criteria-edit-item"
            >
              <div class="criteria-score">{{ score }}：</div>
              <a-textarea
                v-model:value="editableScoringCriteria[score]"
                :rows="2"
                class="criteria-textarea"
                @change="updateScoringCriteria"
              />
            </div>
          </template>
        </a-form-item>

        <a-form-item label="题型">
          <a-input v-model:value="currentQuestion.question_type" />
        </a-form-item>

        <a-form-item
          label="选项"
          v-if="currentQuestion.options && currentQuestion.options.length > 0"
        >
          <div
            v-for="(opt, index) in currentQuestion.options"
            :key="index"
            class="option-item"
          >
            <a-input
              v-model:value="currentQuestion.options[index]"
              :placeholder="`选项 ${String.fromCharCode(65 + index)}`"
              style="margin-bottom: 8px"
            />
          </div>
        </a-form-item>

        <a-form-item label="答案">
          <a-textarea v-model:value="currentQuestion.answer" :rows="2" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 底部按钮区域 -->
    <div class="footer-area">
      <a-space>
        <a-button type="primary" @click="goBack">返回题库管理</a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { message } from "ant-design-vue";
import axios from "axios";
import { useCounterStore } from "@/stores/counterStore.js"; // 确保路径正确

const route = useRoute();
const router = useRouter();
const counterStore = useCounterStore();

// 获取题库ID
const questionBankId =
  route.params.question_bank_id || route.query.questionBankId;

// 题目数据
const questions = ref([]);

// 题目详情相关
const detailVisible = ref(false);
const selectedQuestion = ref(null);

// 可编辑的评分标准
const editableScoringCriteria = reactive({});

// 统计题型数量
function getTypeCount(type) {
  return questions.value.filter((q) => q.question_type === type).length;
}

// 题目列设置
const columns = [
  {
    title: "ID",
    dataIndex: "question_id",
    key: "question_id",
    width: 0,
    className: "hidden-column",
    responsive: [], // Makes the column hidden across all breakpoints
  },
  { title: "题目", dataIndex: "question", key: "question" },
  { title: "题型", dataIndex: "question_type", key: "question_type" },
  { title: "操作", key: "actions" },
];

// 编辑弹窗控制
const editModalVisible = ref(false);
const currentQuestion = reactive({
  question_id: null,
  question: "",
  scoring_criteria: "",
  question_type: "",
  options: [],
  answer: "",
});

// 检查评分标准是否为对象类型
function isObjectScoringCriteria(criteria) {
  if (!criteria) return false;

  // 如果是字符串类型但看起来是对象的JSON字符串
  if (
    typeof criteria === "string" &&
    (criteria.trim().startsWith("{") || criteria.trim().startsWith("{"))
  ) {
    try {
      return typeof JSON.parse(criteria) === "object";
    } catch (e) {
      return false;
    }
  }

  // 直接是对象
  return typeof criteria === "object" && criteria !== null;
}

// 解析评分标准为对象
function parseScoringCriteria(criteria) {
  if (!criteria) return {};

  if (typeof criteria === "string") {
    try {
      return JSON.parse(criteria);
    } catch (e) {
      return {};
    }
  }

  return criteria;
}

// 更新评分标准对象
function updateScoringCriteria() {
  currentQuestion.scoring_criteria = JSON.stringify(editableScoringCriteria);
}

// 获取题目预览（最多显示100个字符）
function getQuestionPreview(item) {
  return item.question && item.question.length > 100
    ? item.question.substring(0, 100) + "..."
    : item.question;
}

// 获取题库的所有题目
async function fetchQuestionBankDetails() {
  try {
    const response = await axios.get(
      `http://localhost:8000/api/question-bank/${questionBankId}/detail/`,
      {
        headers: {
          Authorization: `Bearer ${counterStore.access}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.result === "success") {
      questions.value = response.data.questions.map((question) => ({
        ...question,
        question:
          question.question && question.question.length > 50
            ? question.question.slice(0, 50) + "..."
            : question.question,
      }));
    } else {
      message.error("获取题目列表失败");
    }
  } catch (error) {
    message.error("获取题目列表失败");
    console.error(error);
  }
}

// 编辑题目
async function openEditModal(questionId) {
  console.log("打开编辑弹窗，Question ID:", questionId);
  try {
    const response = await axios.get(
      `http://localhost:8000/api/question-bank/${questionBankId}/question/${questionId}/`,
      {
        headers: {
          Authorization: `Bearer ${counterStore.access}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.result === "success") {
      const fetchedQuestion = response.data.question;
      currentQuestion.question_id = fetchedQuestion.question_id;
      currentQuestion.question = fetchedQuestion.question;
      currentQuestion.scoring_criteria = fetchedQuestion.scoring_criteria;
      currentQuestion.question_type = fetchedQuestion.question_type;
      currentQuestion.options = fetchedQuestion.options || [];
      currentQuestion.answer = fetchedQuestion.answer;

      // 处理评分标准的编辑
      if (isObjectScoringCriteria(fetchedQuestion.scoring_criteria)) {
        const parsedCriteria = parseScoringCriteria(
          fetchedQuestion.scoring_criteria
        );
        Object.keys(parsedCriteria).forEach((key) => {
          editableScoringCriteria[key] = parsedCriteria[key];
        });
      }

      editModalVisible.value = true;
    } else {
      message.error("获取题目信息失败");
    }
  } catch (error) {
    message.error("获取题目信息失败");
    console.error(error);
  }
}

// 保存编辑
async function saveEdit() {
  try {
    // 如果评分标准是对象形式的，确保它被正确序列化
    if (isObjectScoringCriteria(currentQuestion.scoring_criteria)) {
      currentQuestion.scoring_criteria = JSON.stringify(
        editableScoringCriteria
      );
    }

    const response = await axios.put(
      `http://localhost:8000/api/question-bank/${questionBankId}/question/${currentQuestion.question_id}/`,
      {
        question: currentQuestion.question,
        options: currentQuestion.options,
        question_type: currentQuestion.question_type,
        scoring_criteria: currentQuestion.scoring_criteria,
        answer: currentQuestion.answer,
      },
      {
        headers: {
          Authorization: `Bearer ${counterStore.access}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.result === "success") {
      message.success("题目已更新");
      fetchQuestionBankDetails(); // 更新题库列表
      editModalVisible.value = false;
    } else {
      message.error("编辑失败");
    }
  } catch (error) {
    message.error("编辑失败");
    console.error(error);
  }
}

// 删除题目
async function deleteQuestion(questionId) {
  try {
    const response = await axios.delete(
      `http://localhost:8000/api/question-bank/${questionBankId}/question/${questionId}/`,
      {
        headers: {
          Authorization: `Bearer ${counterStore.access}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      message.success("题目已删除");
      fetchQuestionBankDetails(); // 更新题库列表
    } else {
      message.error("删除失败");
    }
  } catch (error) {
    message.error("删除失败");
    console.error(error);
  }
}

// 返回上一页
function goBack() {
  const projectId = route.params.projectId;
  router.push(`/project/${projectId}/testbank-manage`);
}

// 页面初始化时获取题库详情
onMounted(() => {
  fetchQuestionBankDetails();
});
</script>

<style scoped>
.testbank-detail-container {
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

.option-item:last-child {
  margin-bottom: 0;
}

.footer-area {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

/* 题目详情样式 */
.detail-container {
  padding: 0 16px;
}
.detail-title {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 18px;
  font-weight: 600;
}
.detail-section {
  margin-bottom: 16px;
}
.detail-section:first-of-type {
  margin-top: 16px;
}
.detail-section h4 {
  margin-top: 0;
  margin-bottom: 8px;
  font-weight: 500;
}
.options-list {
  list-style-type: none;
  padding-left: 8px;
  margin: 0;
}
.options-list li {
  margin-bottom: 8px;
}

/* 评分标准项样式 */
.criteria-item {
  margin-bottom: 8px;
  padding: 4px 0;
}

.criteria-edit-item {
  display: flex;
  margin-bottom: 12px;
}

.criteria-score {
  width: 60px;
  padding-top: 8px;
}

.criteria-textarea {
  flex: 1;
}

/* 隐藏ID列 */
.hidden-column {
  display: none !important;
}
</style>
