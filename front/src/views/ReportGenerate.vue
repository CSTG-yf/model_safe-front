<template>
  <div class="report-generate-container">
    <!-- 顶部标题 + 步骤条 -->
    <div class="header-area">
      <h2 class="page-title">报告生成</h2>
      <a-steps :current="0" class="step-bar">
        <a-step title="选择测试" />
        <a-step title="选择参数" />
        <a-step title="生成报告" />
        <a-step title="报告详情" />
      </a-steps>
    </div>

    <!-- 测试卡片选择区域 -->
    <a-row gutter="16" class="card-grid">
      <a-col
        v-for="test in currentPageData"
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
              <div class="card-time">测试时间：2024-10-10</div>
            </div>
          </div>
          <div class="card-actions">
            <a-radio
              :checked="selectedId === test.id"
              @change="toggleSelect(test.id)"
            >
              选择
            </a-radio>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 底部分页与操作 -->
    <div class="footer-area">
      <a-pagination
        :page-size="pageSize"
        :total="testList.length"
        :current="currentPage"
        @change="onPageChange"
      />
      <a-button type="primary" class="next-btn" @click="goNextStep"
        >下一步</a-button
      >
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { message } from "ant-design-vue";
import axios from "axios";
import { ExperimentOutlined } from "@ant-design/icons-vue";
import { useRoute } from "vue-router";
import { useCounterStore } from "@/stores/counterStore.js";

const route = useRoute();
const counterStore = useCounterStore();

// 存储测试列表
const testList = ref([]);

// 当前页相关
const pageSize = 9;
const currentPage = ref(1);

const currentPageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize;
  return testList.value.slice(start, start + pageSize);
});

function onPageChange(page) {
  currentPage.value = page;
}

// 存储选中的ID
const selectedId = ref(null);

// 选择卡片
function toggleSelect(id) {
  selectedId.value = id;
}

const router = useRouter();

// 下一步跳转
function goNextStep() {
  if (!selectedId.value) {
    message.warning("请至少选择一个测试！");
    return;
  }
  console.log("选中的测试ID:", selectedId.value);
  // 跳转到下一个页面，并将选中的ID作为参数传递
  router.push({
    path: `/project/${route.params.projectId}/report-generate-params`,
    query: { testId: selectedId.value },
  });
}

// 获取评估数据
async function fetchEvalResults() {
  try {
    const response = await axios.get(
      "http://localhost:8000/api/model-evaluation/overall-results/",
      {
        params: { project_id: route.params.projectId }, // 假设项目ID为6
        headers: {
          Authorization: `Bearer ${counterStore.access}`, // 用实际的token替换
        },
      }
    );
    console.log(response.data);
    // 从接口结果中提取id和name
    testList.value = response.data.results.map((result) => ({
      id: result.id,
      name: result.name,
    }));
    console.log(testList.value);
  } catch (error) {
    console.error("获取评估数据失败:", error);
    message.error("获取评估数据失败");
  }
}

// 初始化
onMounted(() => {
  fetchEvalResults();
});
</script>

<style scoped>
.report-generate-container {
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
</style>
