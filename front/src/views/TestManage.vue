<template>
  <div class="test-manage">
    <h2 class="page-title">测试管理</h2>

    <!-- 卡片列表 -->
    <a-row gutter="16" class="card-grid">
      <a-col
        v-for="(test, index) in filteredTests"
        :key="test.id"
        :span="8"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="8"
      >
        <a-card class="test-card" hoverable>
          <div class="card-top">
            <ExperimentOutlined class="card-icon" />
            <div class="card-info">
              <div class="card-title-row">
                <div class="card-title" @click="goToReview(test)">
                  {{ test.name }}
                </div>
                <div
                  class="review-status"
                  :style="{ color: test.is_reviewed ? '#52c41a' : '#999' }"
                >
                  {{ test.is_reviewed ? "已人工审核" : "未人工审核" }}
                </div>
              </div>
              <div class="card-time">
                测试时间：{{ formatDate(test.created_at) }}
              </div>
            </div>
          </div>

          <div class="card-actions">
            <a-button type="link" @click="editTest(test)">编辑</a-button>
            <a-button type="link" danger @click="deleteTest(test.id)"
              >删除</a-button
            >
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 编辑弹窗 -->
    <a-modal
      v-model:open="editModalVisible"
      title="编辑测试"
      ok-text="确认"
      cancel-text="取消"
      @ok="saveEdit"
    >
      <a-form layout="vertical">
        <a-form-item label="测试名称">
          <a-input v-model:value="currentTest.name" />
        </a-form-item>
        <a-form-item label="测试描述">
          <a-textarea v-model:value="currentTest.description" />
        </a-form-item>
        <a-form-item label="测试时间">
          <a-input :value="currentTest.created_at" disabled />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { message } from "ant-design-vue";
import { ExperimentOutlined } from "@ant-design/icons-vue";
import axios from "axios";
import { useCounterStore } from "@/stores/counterStore.js";

const router = useRouter();
const route = useRoute();
const counterStore = useCounterStore();

// 项目ID
const projectId = route.params.projectId;

// 测试数据
const testList = ref([]);
const filteredTests = computed(() => testList.value);

// 编辑弹窗控制
const editModalVisible = ref(false);
const currentTest = reactive({
  id: null,
  name: "",
  description: "",
  created_at: "",
});

// 格式化日期
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString();
}

// 获取测试列表数据
async function fetchTestList() {
  const projectId = route.params.projectId;
  try {
    const response = await axios.get(
      `http://localhost:8000/api/model-evaluation/list/`,
      {
        params: {
          project_id: projectId,
        },
        headers: {
          Authorization: `Bearer ${counterStore.access}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (response.data.message === "评测记录列表获取成功") {
      console.log(response.data.data);
      testList.value = response.data.data;
    } else {
      message.error("获取测试列表失败");
    }
  } catch (error) {
    console.error(error);
    message.error("获取测试列表失败");
  }
}

// 编辑
function editTest(test) {
  currentTest.id = test.id;
  currentTest.name = test.name;
  currentTest.description = test.description;
  currentTest.created_at = test.created_at;
  editModalVisible.value = true;
}

// 保存编辑
function saveEdit() {
  axios
    .put(
      `http://localhost:8000/api/model-evaluation/${currentTest.id}/detail/`,
      {
        name: currentTest.name,
        description: currentTest.description,
      },
      {
        headers: {
          Authorization: `Bearer ${counterStore.access}`,
          "Content-Type": "application/json",
        },
      }
    )
    .then(() => {
      message.success("测试信息已更新");
      editModalVisible.value = false;
      fetchTestList(); // 更新测试列表
    })
    .catch((error) => {
      console.error(error);
      message.error("保存失败");
    });
}

// 删除
function deleteTest(id) {
  axios
    .delete(`http://localhost:8000/api/model-evaluation/${id}/detail/`, {
      headers: {
        Authorization: `Bearer ${counterStore.access}`,
        "Content-Type": "application/json",
      },
    })
    .then(() => {
      message.success("测试已删除");
      fetchTestList(); // 更新测试列表
    })
    .catch((error) => {
      console.error(error);
      message.error("删除失败");
    });
}

// 点击卡片后跳转到测试详情页面
function goToReview(test) {
  router.push({
    path: `/project/${projectId}/test-review`, // 路径中包含 projectId
    query: { evaluation_id: test.id }, // 将 test.id 作为查询参数传递
  });
}

// 页面加载时自动获取测试列表
onMounted(() => {
  fetchTestList();
});

// 暴露 goToReview 给模板
defineExpose({
  goToReview,
});
</script>

<style scoped>
.test-manage {
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

.card-grid {
  margin-top: 16px;
}

.test-card {
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
  color: #722ed1;
  margin-right: 16px;
}

.card-info {
  flex: 1;
}

.card-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 4px;
  cursor: pointer;
}

.review-status {
  font-size: 14px;
  white-space: nowrap;
  margin-left: 12px;
}

.card-time {
  color: #666;
}

.card-actions {
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #f0f0f0;
  padding-top: 8px;
}
</style>
