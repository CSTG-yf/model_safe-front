<template>
  <div class="report-manage">
    <h2 class="page-title">报告管理</h2>

    <!-- 报告列表 -->
    <a-row gutter="16" class="card-grid">
      <a-col
        v-for="(report, index) in filteredReports"
        :key="report.id"
        :span="8"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="8"
      >
        <a-card class="report-card" hoverable>
          <div class="card-top">
            <FileTextOutlined class="card-icon" />
            <div class="card-info">
              <div class="card-title" @click="goToReportDetail(report)">
                {{ report.report_name }}
              </div>
              <div class="card-time">
                生成时间：{{ formatDate(report.created_time) }}
              </div>
            </div>
          </div>

          <div class="card-actions">
            <a-button type="link" @click="editReport(report)">编辑</a-button>
            <a-button type="link" danger @click="deleteReport(report.id)">
              删除
            </a-button>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 编辑弹窗 -->
    <a-modal
      v-model:open="editModalVisible"
      title="编辑报告名称"
      ok-text="确认"
      cancel-text="取消"
      @ok="saveEdit"
    >
      <a-form layout="vertical">
        <a-form-item label="报告名称">
          <a-input v-model:value="currentReport.report_name" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { message } from "ant-design-vue";
import { FileTextOutlined } from "@ant-design/icons-vue";
import axios from "axios";
import { useCounterStore } from "@/stores/counterStore.js";
import { format } from "date-fns"; // 引入date-fns

const router = useRouter();
const route = useRoute();
const counterStore = useCounterStore();

// 状态变量
const searchKeyword = ref("");
const reportList = ref([]);
const filteredReports = computed(() => {
  if (!searchKeyword.value) return reportList.value;
  return reportList.value.filter((r) =>
    r.report_name.includes(searchKeyword.value)
  );
});

// 编辑弹窗控制
const editModalVisible = ref(false);
const currentReport = reactive({
  id: null,
  report_name: "",
});

// 获取项目报告
const projectId = route.params.projectId;
onMounted(() => {
  fetchReports(projectId);
});

// 获取报告列表
async function fetchReports(projectId) {
  try {
    const response = await axios.get(
      `http://localhost:8000/api/report-generation/reports/`,
      {
        params: { project_id: projectId },
        headers: { Authorization: `Bearer ${counterStore.access}` },
      }
    );
    reportList.value = response.data.reports;
  } catch (error) {
    console.error("获取报告失败:", error);
    message.error("获取报告失败");
  }
}

// 搜索事件
function onSearch(val) {
  console.log("搜索:", val);
}

// 进入报告详情
function goToReportDetail(report) {
  router.push(`/project/report-detail/${report.id}`);
}

// 编辑报告
function editReport(report) {
  currentReport.id = report.id;
  currentReport.report_name = report.report_name;
  editModalVisible.value = true;
}

// 保存编辑
async function saveEdit() {
  try {
    const response = await axios.put(
      `http://localhost:8000/api/report-generation/report/${currentReport.id}/`,
      { report_name: currentReport.report_name },
      { headers: { Authorization: `Bearer ${counterStore.access}` } }
    );
    const index = reportList.value.findIndex((r) => r.id === currentReport.id);
    if (index !== -1) {
      reportList.value[index].report_name = currentReport.report_name;
    }
    message.success("报告名称已更新");
    editModalVisible.value = false;
  } catch (error) {
    console.error("更新报告失败:", error);
    message.error("更新报告失败");
  }
}

// 删除报告
async function deleteReport(id) {
  try {
    await axios.delete(
      `http://localhost:8000/api/report-generation/report/${id}/`,
      { headers: { Authorization: `Bearer ${counterStore.access}` } }
    );
    reportList.value = reportList.value.filter((r) => r.id !== id);
    message.success("报告已删除");
  } catch (error) {
    console.error("删除报告失败:", error);
    message.error("删除报告失败");
  }
}

// 格式化时间
function formatDate(dateString) {
  return format(new Date(dateString), "yyyy-MM-dd HH:mm"); // 格式化为 2024-04-04 15:30
}
</script>

<style scoped>
.report-manage {
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

.search-area {
  margin-bottom: 16px;
}
.search-bar {
  width: 320px;
  max-width: 100%;
}

.card-grid {
  margin-top: 16px;
}

.report-card {
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

.card-time {
  color: #666;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  border-top: 1px solid #f0f0f0;
  padding-top: 8px;
}
</style>
