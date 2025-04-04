<template>
  <div class="select-testbank-container">
    <!-- 顶部标题 + 进度条 -->
    <div class="header-area">
      <h2 class="page-title">题库测试</h2>
      <a-steps :current="0" class="step-bar">
        <a-step title="选择题库" />
        <a-step title="进行测试" />
        <a-step title="测试完成" />
      </a-steps>
    </div>

    <!-- 网格卡片 -->
    <Row gutter="16" class="card-grid">
      <Col
        v-for="(bank, index) in currentPageData"
        :key="index"
        :span="8"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="8"
      >
        <Card class="testbank-card" hoverable>
          <div class="card-top">
            <DatabaseOutlined class="card-icon" />
            <div class="card-info">
              <div class="card-title">{{ bank.exam_title }}</div>
              <div class="card-desc">{{ bank.description }}</div>
            </div>
          </div>
          <div class="card-actions">
            <a-button
              type="primary"
              size="small"
              @click="selectBank(bank)"
              :disabled="isSelected(bank.question_bank_id)"
            >
              {{ isSelected(bank.question_bank_id) ? "已选择" : "选择" }}
            </a-button>
          </div>
        </Card>
      </Col>
    </Row>

    <!-- 分页 + 下一步按钮 -->
    <div class="footer-area">
      <a-pagination
        :page-size="pageSize"
        :total="testBanks.length"
        :current="currentPage"
        @change="onPageChange"
      />
      <a-button type="primary" class="next-btn" @click="goNextStep">
        下一步
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import {
  Row,
  Col,
  Card,
  Button,
  Steps,
  Pagination,
  message,
} from "ant-design-vue";
import { DatabaseOutlined } from "@ant-design/icons-vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";
import { useCounterStore } from "@/stores/counterStore";

const router = useRouter();
const route = useRoute();
const counterStore = useCounterStore();

// 获取 project_id
const projectId = route.params.projectId;

// 所有题库数据（接口获取）
const testBanks = ref([]);

// 当前页和分页逻辑
const pageSize = 9;
const currentPage = ref(1);
const currentPageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return testBanks.value.slice(start, start + pageSize);
});

// 单选题库 ID
const selectedBankId = ref(null);
function isSelected(id) {
  return selectedBankId.value === id;
}
function selectBank(bank) {
  selectedBankId.value = bank.question_bank_id;
}
function onPageChange(page) {
  currentPage.value = page;
}

// 获取题库列表
async function fetchTestBanks() {
  try {
    const res = await axios.post(
      `http://localhost:8000/api/question-bank/${projectId}/search/`,
      { exam_title: "" },
      {
        headers: {
          Authorization: `Bearer ${counterStore.access}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (res.data.result === "success") {
      console.log("获取的题库列表:", res.data.question_banks);
      testBanks.value = res.data.question_banks;
    } else {
      message.error("获取题库失败");
    }
  } catch (e) {
    console.error(e);
    message.error("请求题库失败");
  }
}

async function goNextStep() {
  if (!selectedBankId.value) {
    message.warning("请先选择一个题库");
    return;
  }

  try {
    const res = await axios.post(
      `http://localhost:8000/api/model-evaluation/create/`,
      {
        project_id: parseInt(projectId),
        question_bank_id: selectedBankId.value,
        evaluation_name: "自动评测-" + new Date().toLocaleDateString(),
        evaluation_description: "系统自动创建",
        model_name: "moonshot-v1-8k",
        evaluation_model_name: "deepseek-chat",
      },
      {
        headers: {
          Authorization: `Bearer ${counterStore.access}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (res.data.evaluation_id) {
      const evaluationId = res.data.evaluation_id;
      message.success("评测创建成功");
      console.log("evaluationId:", evaluationId);
      console.log("selectedBankId:", selectedBankId.value);
      // 同时传 evaluationId 和 questionBankId
      router.push(
        `/project/${projectId}/testbank-test2?evaluationId=${evaluationId}&questionBankId=${selectedBankId.value}`
      );
    } else {
      message.error("创建评测失败");
    }
  } catch (err) {
    console.error(err);
    message.error("请求失败，无法创建评测");
  }
}

// 页面初始化
onMounted(() => {
  fetchTestBanks();
});
</script>

<style scoped>
.select-testbank-container {
  background: #fff;
  padding: 24px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 标题 + 步骤条 */
.header-area {
  margin-bottom: 16px;
}
.page-title {
  margin: 0 0 12px;
  font-size: 24px;
  font-weight: 600;
}
.step-bar {
  margin-bottom: 16px;
}

/* 卡片列表 */
.card-grid {
  margin-bottom: 16px;
}
.testbank-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 16px;
}
.card-top {
  display: flex;
  align-items: center;
}
.card-icon {
  font-size: 48px;
  color: #1890ff;
  margin-right: 16px;
}
.card-info {
  flex: 1;
}
.card-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
}
.card-desc {
  color: #666;
}
.card-actions {
  margin-top: 12px;
  text-align: right;
}

/* 底部 */
.footer-area {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
}
.next-btn {
  margin-left: auto;
}
</style>
