<template>
  <div class="perf-eval-container">
    <!-- 顶部标题 + 步骤条 -->
    <div class="header-area">
      <h2 class="page-title">模型评估</h2>
      <a-steps :current="0" class="step-bar">
        <a-step title="选择测试" />
        <a-step title="生成评估" />
        <a-step title="评估展示" />
      </a-steps>
    </div>

    <!-- 普通测试部分 -->
    <div>
      <h3>普通测试</h3>
      <a-row gutter="16" class="card-grid">
        <a-col
          v-for="test in testList"
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
                <div class="card-title">{{ test.name }}</div>
                <div class="card-time">
                  测试时间：{{ formatDate(test.created_at) }}
                </div>
              </div>
            </div>
            <div class="card-actions">
              <a-checkbox
                :checked="selectedTestIds.includes(test.id)"
                @change="toggleSelectTest(test.id)"
              >
                选择
              </a-checkbox>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <a-divider />

    <!-- 越狱测试部分 -->
    <div>
      <h3>越狱测试</h3>
      <a-row gutter="16" class="card-grid">
        <a-col
          v-for="task in jailbreakTasks"
          :key="task.session_name"
          :span="8"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="8"
        >
          <a-card class="test-card" hoverable>
            <div class="card-top">
              <FireOutlined class="card-icon" />
              <!-- 更具进攻性的图标 -->
              <div class="card-info">
                <div class="card-title">越狱测试 - {{ task.session_name }}</div>
                <!-- 显示 session_name -->
              </div>
            </div>
            <div class="card-actions">
              <a-checkbox
                :checked="selectedJailbreakTaskIds.includes(task.session_name)"
                @change="toggleSelectJailbreakTask(task.session_name)"
              >
                选择
              </a-checkbox>
            </div>
          </a-card>
        </a-col>
      </a-row>
    </div>

    <!-- 底部按钮 -->
    <div class="footer-area">
      <a-button type="primary" class="next-btn" @click="goNextStep">
        下一步
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ExperimentOutlined, FireOutlined } from "@ant-design/icons-vue"; // 更具进攻性的图标
import axios from "axios";
import { useCounterStore } from "@/stores/counterStore.js";

// 从路由中获取 projectId
const route = useRoute();
const router = useRouter();
const counterStore = useCounterStore();
const projectId = route.params.projectId; // 获取路由中的 projectId

// 存储普通测试和越狱测试数据
const testList = ref([]);
const jailbreakTasks = ref([]);

// 存储选中的普通测试ID和越狱测试ID
const selectedTestIds = ref([]);
const selectedJailbreakTaskIds = ref([]);

// 通过接口获取普通测试列表数据
async function fetchTestList() {
  try {
    const response = await axios.get(
      "http://localhost:8000/api/model-evaluation/list/",
      {
        params: {
          project_id: projectId,
        },
      }
    );
    if (response.data.message === "评测记录列表获取成功") {
      testList.value = response.data.data;
    } else {
      console.error("获取普通测试列表失败:", response.data.message);
    }
  } catch (error) {
    console.error("获取普通测试列表异常:", error);
  }
}

// 通过接口获取越狱测试列表数据
async function fetchJailbreakTasks() {
  try {
    const response = await axios.get(
      `http://localhost:8000/api/jailbreak-evaluation/score-records/${projectId}/get-taskids/`,
      {
        headers: {
          Authorization: `Bearer ${counterStore.access}`, // 使用 Pinia 中的 Token
          "Content-Type": "application/json",
        },
      }
    );
    if (response.data != null) {
      jailbreakTasks.value = response.data.results;
    } else {
      console.error("获取越狱测试列表失败:", response.data.message);
    }
  } catch (error) {
    console.error("获取越狱测试列表异常:", error);
  }
}

// 格式化普通测试的时间显示
function formatDate(dateString) {
  const date = new Date(dateString);
  if (isNaN(date)) {
    return "无效时间"; // 如果日期无效，返回“无效时间”
  }
  return date.toISOString().slice(0, 19).replace("T", " "); // 例如：2025-04-03 16:21
}

// 普通测试选择处理
function toggleSelectTest(id) {
  if (selectedTestIds.value.includes(id)) {
    selectedTestIds.value = selectedTestIds.value.filter((i) => i !== id);
  } else {
    selectedTestIds.value.push(id);
  }
}

// 越狱测试选择处理
function toggleSelectJailbreakTask(session_name) {
  if (selectedJailbreakTaskIds.value.includes(session_name)) {
    selectedJailbreakTaskIds.value = selectedJailbreakTaskIds.value.filter(
      (i) => i !== session_name
    );
  } else {
    selectedJailbreakTaskIds.value.push(session_name);
  }
}

// 下一步按钮点击逻辑
async function goNextStep() {
  // 确保普通测试和越狱测试都有选择
  if (selectedTestIds.value.length === 0) {
    alert("请至少选择一个普通测试！");
    return;
  }

  if (selectedJailbreakTaskIds.value.length === 0) {
    alert("请至少选择一个越狱测试！");
    return;
  }

  // 发送请求到接口以开始评估
  const payload = {
    project_id: parseInt(projectId),
    model_evaluation_ids: selectedTestIds.value, // 传递选中的普通测试ID
    jailbreak_evaluation_ids: selectedJailbreakTaskIds.value, // 传递选中的越狱测试ID
  };

  try {
    const response = await axios.post(
      "http://localhost:8000/api/model-evaluation/overall-result/",
      payload,
      {
        headers: {
          Authorization: `Bearer ${counterStore.access}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (response.status === 201) {
      const evalId = response.data.id; // 获取返回的评估ID
      console.log("评估ID:", evalId);

      // 跳转到下一个页面，传递评估ID
      router.push({
        path: `/project/${projectId}/perf-eval-dashboard`,
        query: { evalId: evalId },
      });
    } else {
      alert("请求失败，请稍后再试！");
    }
  } catch (error) {
    console.error("提交评估请求失败:", error);
    alert("提交失败，请稍后再试！");
  }
}

// 页面加载时调用接口获取测试列表数据
onMounted(() => {
  fetchTestList();
  fetchJailbreakTasks();
});
</script>

<style scoped>
.perf-eval-container {
  background: #fff;
  padding: 24px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

/* 顶部区域 */
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

/* 卡片布局 */
.card-grid {
  margin-bottom: 16px;
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
  margin-bottom: 12px;
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
.card-time {
  color: #666;
}
.card-actions {
  text-align: right;
}

/* 底部按钮 */
.footer-area {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 16px;
}
.next-btn {
  margin-left: auto;
}

/* 分割线样式 */
.a-divider {
  margin: 24px 0;
}
</style>
