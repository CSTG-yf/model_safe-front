<template>
  <div class="generate-complete-container">
    <!-- 顶部标题 + 进度条 -->
    <div class="header-area">
      <h2 class="page-title">题库生成</h2>
      <a-steps :current="2" class="step-bar">
        <a-step title="设置题库参数" />
        <a-step title="生成题库" />
        <a-step title="生成完成" />
      </a-steps>
    </div>

    <!-- 生成结果区域 -->
    <div class="result-area">
      <div class="result-header">
        <div class="result-icon">
          <CheckCircleFilled style="font-size: 48px; color: #52c41a" />
        </div>
        <div class="result-title">
          <h3>题库生成成功</h3>
          <p>已完成题库生成，您可以查看、编辑题库或前往题库管理</p>
        </div>
      </div>

      <!-- 题库基本信息编辑 -->
      <a-card class="test-bank-info-card" title="题库基本信息">
        <a-form layout="vertical">
          <a-form-item label="题库名称" required>
            <a-input
              v-model:value="testBankName"
              placeholder="请输入题库名称"
            />
          </a-form-item>
          <a-form-item label="题库描述">
            <a-textarea
              v-model:value="testBankDesc"
              :rows="3"
              placeholder="请输入题库描述"
            />
          </a-form-item>
        </a-form>
      </a-card>

      <!-- 题库统计卡片 -->
      <div class="result-stats">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-card class="stat-card">
              <div class="stat-value">{{ totalQuestions }}</div>
              <div class="stat-label">生成题目总数</div>
            </a-card>
          </a-col>
          <a-col :span="8">
            <a-card class="stat-card">
              <div class="stat-value success">
                {{ totalQuestions - essayCount }}
              </div>
              <div class="stat-label">客观题数量</div>
            </a-card>
          </a-col>
          <a-col :span="8">
            <a-card class="stat-card">
              <div class="stat-value info">{{ essayCount }}</div>
              <div class="stat-label">问答题数量</div>
            </a-card>
          </a-col>
        </a-row>
      </div>

      <!-- 题目列表预览 -->
      <a-card class="questions-card" title="题目预览">
        <a-list
          class="questions-list"
          :data-source="generatedQuestions"
          :pagination="{ pageSize: 5 }"
          item-layout="horizontal"
        >
          <template #renderItem="{ item }">
            <a-list-item>
              <a-list-item-meta>
                <template #title>
                  <a
                    @click="showQuestionDetail(item.question_id)"
                    class="question-title-link"
                  >
                    {{ getQuestionPreview(item) }}
                  </a>
                </template>
              </a-list-item-meta>
              <template #actions>
                <a-button
                  type="link"
                  @click="showQuestionDetail(item.question_id)"
                  >查看详情</a-button
                >
                <a-button
                  type="link"
                  danger
                  @click="deleteQuestion(item.question_id)"
                  >删除</a-button
                >
              </template>
            </a-list-item>
          </template>
        </a-list>
      </a-card>

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
            v-if="
              selectedQuestion.options && selectedQuestion.options.length > 0
            "
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
            <div>{{ selectedQuestion.scoring_criteria }}</div>
          </div>

          <!-- 题目来源 -->
          <div v-if="selectedQuestion.source" class="detail-section">
            <h4>来源：</h4>
            <div>{{ selectedQuestion.source }}</div>
          </div>
        </div>
      </a-modal>

      <!-- 删除题库弹窗 -->
      <a-modal
        v-model:open="deleteModalVisible"
        title="删除题库"
        @ok="confirmDelete"
        okText="删除"
        cancelText="取消"
      >
        <p>确定要删除这个题库吗？</p>
      </a-modal>

      <!-- 底部操作区域 -->
      <div class="footer-area">
        <a-space>
          <a-button danger @click="showDeleteModal">删除题库</a-button>
          <a-button type="primary" @click="saveTestBank">下一步</a-button>
        </a-space>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useCounterStore } from "@/stores/counterStore"; // 引入 Pinia store
import axios from "axios";
import { message } from "ant-design-vue";
import { CheckCircleFilled } from "@ant-design/icons-vue";

// 获取 Pinia store 实例
const counterStore = useCounterStore();
const router = useRouter();
const route = useRoute();

// 获取路由中的 questionBankId 和 projectId
const questionBankId = ref(route.query.questionBankId);
const projectId = ref(route.query.projectId || counterStore.projectId);

// 题库基本信息
const testBankName = ref("");
const testBankDesc = ref("");
const totalQuestions = ref(0);
const essayCount = ref(0);
const generatedQuestions = ref([]);

// 题目详情
const detailVisible = ref(false);
const selectedQuestion = ref(null);

// 删除题库弹窗
const deleteModalVisible = ref(false);

// 获取题库详情
async function fetchTestBankDetails() {
  console.log("获取的题库ID:", questionBankId.value);

  if (!questionBankId.value) {
    message.error("题库ID无效");
    return;
  }

  try {
    const response = await axios.get(
      `http://localhost:8000/api/question-bank/${questionBankId.value}/detail/`,
      {
        headers: {
          Authorization: `Bearer ${counterStore.access}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.result === "success") {
      const { questions } = response.data;
      console.log("获取的题目:", questions);
      generatedQuestions.value = questions;
      totalQuestions.value = questions.length;

      // 统计简答题数量
      essayCount.value = questions.filter(
        (q) => q.question_type === "简答"
      ).length;

      // 清空 Pinia 中的 questionBankId
      counterStore.setQuestionBankId(null);
    } else {
      message.error("获取题库详情失败");
    }
  } catch (error) {
    message.error("获取题库详情失败");
    console.error(error);
  }
}

// 获取题目预览（最多显示100个字符）
function getQuestionPreview(item) {
  return item.question.length > 100
    ? item.question.substring(0, 100) + "..."
    : item.question;
}

// 显示题目详情
async function showQuestionDetail(questionId) {
  try {
    const response = await axios.get(
      `http://localhost:8000/api/question-bank/${questionBankId.value}/question/${questionId}/`,
      {
        headers: {
          Authorization: `Bearer ${counterStore.access}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.result === "success") {
      selectedQuestion.value = response.data.question;
      detailVisible.value = true;
    } else {
      message.error("获取题目详情失败");
    }
  } catch (error) {
    message.error("获取题目详情失败");
    console.error(error);
  }
}

// 删除题目
async function deleteQuestion(questionId) {
  try {
    const response = await axios.delete(
      `http://localhost:8000/api/question-bank/${questionBankId.value}/question/${questionId}/`,
      {
        headers: {
          Authorization: `Bearer ${counterStore.access}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.status === 200) {
      // 更新本地数据
      const index = generatedQuestions.value.findIndex(
        (q) => q.question_id === questionId
      );

      if (index !== -1) {
        // 先检查是否为简答题，再删除
        const isEssay =
          generatedQuestions.value[index].question_type === "简答题";
        generatedQuestions.value.splice(index, 1);
        totalQuestions.value--;

        if (isEssay) {
          essayCount.value--;
        }
      }

      message.success("题目已删除");
    } else {
      message.error("删除题目失败");
    }
  } catch (error) {
    message.error("删除题目失败");
    console.error(error);
  }
}

// 显示删除题库弹窗
function showDeleteModal() {
  deleteModalVisible.value = true;
}

// 确认删除题库
async function confirmDelete() {
  try {
    const response = await axios.delete(
      `http://localhost:8000/api/question-bank/${questionBankId.value}/`,
      {
        headers: {
          Authorization: `Bearer ${counterStore.access}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.result === "success") {
      message.success("题库已删除！");
      router.push(`/project/${projectId.value}/testbank-manage`);
    } else {
      message.error("删除题库失败");
    }
  } catch (error) {
    message.error("删除题库失败");
    console.error(error);
  }
}

// 保存题库信息（修改题库名称和描述）
async function saveTestBank() {
  try {
    const response = await axios.put(
      `http://localhost:8000/api/question-bank/${questionBankId.value}/`,
      {
        exam_title: testBankName.value,
        description: testBankDesc.value,
      },
      {
        headers: {
          Authorization: `Bearer ${counterStore.access}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.result === "success") {
      message.success("题库信息保存成功！");
      router.push(`/project/${projectId.value}/testbank-manage`);
    } else {
      message.error("保存题库信息失败");
    }
  } catch (error) {
    message.error("保存题库信息失败");
    console.error(error);
  }
}

// 页面加载时自动获取题库详情
onMounted(() => {
  fetchTestBankDetails();
});
</script>

<style scoped>
.generate-complete-container {
  background: #fff;
  padding: 24px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 标题 + 进度条 */
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

/* 结果区域 */
.result-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* 成功提示 */
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

/* 题库基本信息卡片 */
.test-bank-info-card {
  margin-bottom: 24px;
}

/* 题库统计卡片 */
.result-stats {
  margin-bottom: 24px;
}
.stat-card {
  text-align: center;
  padding: 16px;
  height: 100%;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}
.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
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
.stat-value.error {
  color: #f5222d;
}
.stat-value.info {
  color: #722ed1;
}
.stat-label {
  color: #666;
}

/* 题目列表卡片 */
.questions-card {
  margin-bottom: 24px;
}
.question-title-link {
  font-weight: 500;
}

/* 调整列表项和头像样式 */
:deep(.questions-list .ant-list-item) {
  padding: 12px;
  align-items: center;
}

:deep(.questions-list .ant-list-item-meta) {
  align-items: center;
}

:deep(.questions-list .ant-list-item-meta-avatar) {
  margin-top: 0;
  margin-bottom: 0;
  display: flex;
  align-items: center;
}

:deep(.questions-list .ant-avatar) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  line-height: 36px;
  font-size: 14px;
}

:deep(.questions-list .ant-list-item-meta-content) {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

:deep(.questions-list .ant-list-item-action) {
  margin-top: 0;
}

/* 题目详情 */
.detail-container {
  padding: 0 16px;
}
.detail-title {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 18px;
  font-weight: 600;
}
.detail-tag {
  margin-bottom: 16px;
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

/* 底部按钮区域 */
.footer-area {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

.question-avatar {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-weight: normal;
  margin-right: 12px;
}
</style>
