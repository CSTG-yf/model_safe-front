<template>
  <div class="report-manage">
    <h2 class="page-title">报告管理</h2>

    <!-- 搜索框 -->
    <div class="search-area">
      <a-input-search
          v-model:value="searchKeyword"
          placeholder="搜索报告"
          enter-button="搜索"
          size="large"
          class="search-bar"
          @search="onSearch"
      />
    </div>

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
                {{ report.name }}
              </div>
              <div class="card-time">
                生成时间：{{ report.time }}
              </div>
            </div>
          </div>

          <div class="card-actions">
            <a-button type="link" @click="editReport(report)">编辑</a-button>
            <a-button type="link" danger @click="deleteReport(report.id)">删除</a-button>
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
          <a-input v-model:value="currentReport.name" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { FileTextOutlined } from '@ant-design/icons-vue'

const router = useRouter()

// 搜索关键词
const searchKeyword = ref('')

// 报告数据
const reportList = ref([
  { id: 1, name: '模型评估报告 - 2024Q1', time: '2024-04-01 10:00' },
  { id: 2, name: '通用能力评估报告', time: '2024-05-10 14:30' },
  { id: 3, name: '风险评估报告', time: '2024-06-15 09:00' }
])

// 过滤搜索
const filteredReports = computed(() => {
  if (!searchKeyword.value) return reportList.value
  return reportList.value.filter(r => r.name.includes(searchKeyword.value))
})

// 编辑弹窗控制
const editModalVisible = ref(false)
const currentReport = reactive({
  id: null,
  name: ''
})

// 搜索事件
function onSearch(val) {
  console.log('搜索:', val)
}

// 进入报告详情
function goToReportDetail(report) {
  router.push(`/project/report-detail/${report.id}`)
}

// 编辑报告
function editReport(report) {
  currentReport.id = report.id
  currentReport.name = report.name
  editModalVisible.value = true
}

// 保存编辑
function saveEdit() {
  const index = reportList.value.findIndex(r => r.id === currentReport.id)
  if (index !== -1) {
    reportList.value[index].name = currentReport.name
    message.success('报告名称已更新')
  }
  editModalVisible.value = false
}

// 删除报告
function deleteReport(id) {
  reportList.value = reportList.value.filter(r => r.id !== id)
  message.success('报告已删除')
}
</script>

<style scoped>
.report-manage {
  background: #fff;
  padding: 24px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
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
