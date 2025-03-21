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
              <div class="card-time">测试时间：{{ test.time }}</div>
            </div>
          </div>
          <div class="card-actions">
            <a-checkbox
                :checked="selectedIds.includes(test.id)"
                @change="toggleSelect(test.id)"
            >
              选择
            </a-checkbox>
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
      <a-button type="primary" class="next-btn" @click="goNextStep">下一步</a-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ExperimentOutlined } from '@ant-design/icons-vue'

// 模拟测试列表数据
const testList = ref([
  { id: 1, name: '鲁棒性测试', time: '2024-10-10' },
  { id: 2, name: '逻辑推理测试', time: '2024-10-12' },
  { id: 3, name: '语言能力测试', time: '2024-10-13' },
  { id: 4, name: '多模态融合测试', time: '2024-10-14' },
  { id: 5, name: '阅读理解测试', time: '2024-10-15' },
  { id: 6, name: '指令跟随测试', time: '2024-10-16' }
])

// 分页相关
const pageSize = 6
const currentPage = ref(1)

const currentPageData = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return testList.value.slice(start, start + pageSize)
})

function onPageChange(page) {
  currentPage.value = page
}

// 多选处理
const selectedIds = ref([])

function toggleSelect(id) {
  if (selectedIds.value.includes(id)) {
    selectedIds.value = selectedIds.value.filter(i => i !== id)
  } else {
    selectedIds.value.push(id)
  }
}

const router = useRouter()
function goNextStep() {
  if (!selectedIds.value.length) {
    alert('请至少选择一个测试！')
    return
  }
  console.log('选中的测试ID:', selectedIds.value)
  // 跳转到下一步选择参数界面
  router.push('/project/report-generate-params')
}
</script>

<style scoped>
.report-generate-container {
  background: #fff;
  padding: 24px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
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
