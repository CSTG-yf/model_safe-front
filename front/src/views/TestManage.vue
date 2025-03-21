<template>
  <div class="test-manage">
    <h2 class="page-title">测试管理</h2>

    <!-- 搜索框 -->
    <div class="search-area">
      <a-input-search
          v-model:value="searchKeyword"
          placeholder="搜索测试"
          enter-button="搜索"
          size="large"
          class="search-bar"
          @search="onSearch"
      />
    </div>

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
                    :style="{ color: test.reviewed ? '#52c41a' : '#999' }"
                >
                  {{ test.reviewed ? '已人工审核' : '未人工审核' }}
                </div>
              </div>
              <div class="card-time">
                测试时间：{{ test.time }}
              </div>
            </div>
          </div>

          <div class="card-actions">
            <a-button type="link" @click="editTest(test)">编辑</a-button>
            <a-button type="link" danger @click="deleteTest(test.id)">删除</a-button>
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
        <a-form-item label="测试时间">
          <a-input :value="currentTest.time" disabled />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { ExperimentOutlined } from '@ant-design/icons-vue'

const router = useRouter()

// 搜索关键词
const searchKeyword = ref('')

// 测试数据（含是否审核）
const testList = ref([
  { id: 1, name: '模型鲁棒性测试', time: '2024-10-10 10:00', reviewed: true },
  { id: 2, name: '通用能力测试', time: '2024-10-12 14:30', reviewed: false },
  { id: 3, name: '语言理解测试', time: '2024-11-01 09:00', reviewed: true }
])

// 搜索过滤
const filteredTests = computed(() => {
  if (!searchKeyword.value) return testList.value
  return testList.value.filter(t => t.name.includes(searchKeyword.value))
})

// 编辑弹窗控制
const editModalVisible = ref(false)
const currentTest = reactive({
  id: null,
  name: '',
  time: ''
})

// 搜索事件
function onSearch(val) {
  console.log('搜索:', val)
}

// 跳转审核页
function goToReview(test) {
  router.push(`/project/test-review/${test.id}`)
}

// 编辑
function editTest(test) {
  currentTest.id = test.id
  currentTest.name = test.name
  currentTest.time = test.time
  editModalVisible.value = true
}

// 保存编辑
function saveEdit() {
  const index = testList.value.findIndex(t => t.id === currentTest.id)
  if (index !== -1) {
    testList.value[index].name = currentTest.name
    message.success('测试信息已更新')
  }
  editModalVisible.value = false
}

// 删除
function deleteTest(id) {
  testList.value = testList.value.filter(t => t.id !== id)
  message.success('测试已删除')
}
</script>

<style scoped>
.test-manage {
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
