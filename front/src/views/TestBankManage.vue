<template>
  <div class="testbank-manage">
    <h2 class="page-title">题库管理</h2>

    <!-- 卡片列表 -->
    <Row gutter="16" class="card-grid">
      <Col
        v-for="(bank, index) in filteredBanks"
        :key="index"
        :span="8"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="8"
      >
        <Card class="testbank-card" hoverable>
          <!-- 上方主体：图标左，文字右 -->
          <div class="card-top">
            <DatabaseOutlined class="card-icon" />
            <div class="card-info">
              <div class="card-title" @click="goToDetail(bank)">
                {{ bank.exam_title }}
              </div>
              <div class="card-desc">
                {{ bank.description }}
              </div>
            </div>
          </div>

          <!-- 下方操作：编辑/删除 -->
          <div class="card-actions">
            <Button type="link" @click="editBank(bank)">编辑</Button>
            <Button
              type="link"
              @click="showDeleteConfirm(bank)"
              class="delete-btn"
              >删除</Button
            >
          </div>
        </Card>
      </Col>
    </Row>

    <!-- 编辑弹窗 -->
    <a-modal
      v-model:open="editModalVisible"
      title="编辑题库"
      ok-text="确认"
      cancel-text="取消"
      @ok="saveEdit"
    >
      <a-form layout="vertical">
        <a-form-item label="题库名称">
          <a-input v-model:value="currentBank.exam_title" />
        </a-form-item>
        <a-form-item label="题库描述">
          <a-textarea v-model:value="currentBank.description" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 删除确认弹窗 -->
    <a-modal
      v-model:open="deleteModalVisible"
      title="确认删除"
      ok-text="删除"
      cancel-text="取消"
      @ok="deleteBank"
    >
      <p>确定要删除该题库吗？</p>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { message } from "ant-design-vue";
import { DatabaseOutlined } from "@ant-design/icons-vue";
import { useCounterStore } from "@/stores/counterStore.js";
import axios from "axios";
import {
  Button,
  Card,
  Row,
  Col,
  Input,
  Modal,
  Form,
  InputNumber,
  Textarea,
} from "ant-design-vue";

const router = useRouter();
const route = useRoute();
const counterStore = useCounterStore();

// 题库数据和搜索关键字
const searchKeyword = ref("");
const testBanks = ref([]);
const filteredBanks = computed(() => {
  if (!searchKeyword.value) return testBanks.value;
  return testBanks.value.filter((bank) =>
    bank.exam_title.includes(searchKeyword.value)
  );
});

// 编辑和删除弹窗的控制
const editModalVisible = ref(false);
const deleteModalVisible = ref(false);
const currentBank = ref({
  question_bank_id: null,
  exam_title: "",
  description: "",
});

// 获取路由中的 projectId
const projectId = route.params.projectId;

// 获取题库列表
async function fetchTestBanks() {
  try {
    const response = await axios.post(
      `http://localhost:8000/api/question-bank/${projectId}/search/`,
      {
        exam_title: "", // 空则获取所有题库
      },
      {
        headers: {
          Authorization: `Bearer ${counterStore.access}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.result === "success") {
      testBanks.value = response.data.question_banks;
    } else {
      message.error("获取题库失败：" + response.data.message);
    }
  } catch (error) {
    console.error(error);
    message.error("获取题库失败");
  }
}

// 搜索功能
function onSearch(value) {
  console.log("搜索关键字:", value);
}

function goToDetail(bank) {
  console.log("点击题库名称，跳转详情:", bank);
  // 使用查询参数传递 question_bank_id
  router.push({
    path: `/project/${projectId}/testbank-detail`,
    query: { questionBankId: bank.question_bank_id },
  });
}

// 编辑题库
function editBank(bank) {
  currentBank.value = { ...bank };
  editModalVisible.value = true;
}

// 保存编辑
async function saveEdit() {
  try {
    const response = await axios.put(
      `http://localhost:8000/api/question-bank/${currentBank.value.question_bank_id}/`,
      {
        exam_title: currentBank.value.exam_title,
        description: currentBank.value.description,
      },
      {
        headers: {
          Authorization: `Bearer ${counterStore.access}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (response.data.result === "success") {
      message.success("题库信息已更新");
      fetchTestBanks(); // 更新题库列表
    } else {
      message.error("编辑失败");
    }
    editModalVisible.value = false;
  } catch (error) {
    console.error(error);
    message.error("编辑失败");
  }
}

// 删除题库
function showDeleteConfirm(bank) {
  currentBank.value = bank;
  deleteModalVisible.value = true;
}

async function deleteBank() {
  try {
    const response = await axios.delete(
      `http://localhost:8000/api/question-bank/${currentBank.value.question_bank_id}/`,
      {
        headers: {
          Authorization: `Bearer ${counterStore.access}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (response.data.result === "success") {
      message.success("题库已删除");
      fetchTestBanks(); // 更新题库列表
    } else {
      message.error("删除失败");
    }
    deleteModalVisible.value = false;
  } catch (error) {
    console.error(error);
    message.error("删除失败");
  }
}

// 页面加载时获取题库列表
// 页面加载时获取题库列表，并在 0.5 秒后刷新一次
onMounted(() => {
  fetchTestBanks(); // 初始加载

  setTimeout(() => {
    fetchTestBanks(); // 延迟刷新一次
  }, 500);
});
</script>

<style scoped>
.testbank-manage {
  background: #fff;
  padding: 24px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.page-title {
  margin-bottom: 16px;
  font-size: 24px;
  font-weight: 600;
}

.search-bar {
  margin-bottom: 16px;
}

.card-grid {
  margin-top: 16px;
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
  margin-bottom: 16px;
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
  cursor: pointer;
}

.card-desc {
  color: #666;
}

.card-actions {
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #f0f0f0;
  padding-top: 8px;
}

.delete-btn {
  color: red;
}
</style>
