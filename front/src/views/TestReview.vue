<template>
  <div class="test-review-container">
    <!-- 顶部标题区域 -->
    <div class="header-area">
      <h2 class="page-title">测试审核</h2>
      <p class="page-subtitle">测试ID: {{ testId }}</p>
    </div>

    <!-- 内容区域 -->
    <div class="content-area">
      <!-- 统计卡片 -->
      <div class="stats-area">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-card class="stat-card">
              <div class="stat-value">{{ reviewData.length }}</div>
              <div class="stat-label">题目总数</div>
            </a-card>
          </a-col>
          <a-col :span="8">
            <a-card class="stat-card">
              <div class="stat-value">{{ getReviewedCount() }}</div>
              <div class="stat-label">已审核题目</div>
            </a-card>
          </a-col>
          <a-col :span="8">
            <a-card class="stat-card">
              <div class="stat-value">{{ getAverageScore() }}</div>
              <div class="stat-label">平均得分</div>
            </a-card>
          </a-col>
        </a-row>
      </div>

      <!-- 表格区域 -->
      <a-card class="table-card" title="测试审核内容">
        <a-table 
          :columns="columns" 
          :data-source="reviewData" 
          row-key="id" 
          :pagination="{ pageSize: 5 }"
          bordered
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'actions'">
              <a-space>
                <a-button type="link" @click="openReview(record)">审核</a-button>
                <a-button type="link" danger @click="deleteQuestion(record.id)">删除</a-button>
              </a-space>
            </template>
            <template v-if="column.key === 'content'">
              <div class="truncated-content">{{ record.content.slice(0, 100) }}...</div>
            </template>
            <template v-if="column.key === 'score'">
              <a-tag :color="getScoreColor(record.score)">{{ record.score }}</a-tag>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 审核弹窗 -->
    <a-modal
        v-model:open="reviewVisible"
        title="题目审核"
        ok-text="确认"
        cancel-text="取消"
        @ok="saveReview"
        width="80%"
        body-style="max-height: 70vh; overflow-y: auto; padding: 24px;"
    >
      <!-- 题目信息区 -->
      <div class="review-section">
        <h3 class="section-title">题目信息</h3>
        <p><strong>题目：</strong>{{ currentItem.content }}</p>
        <p><strong>题型：</strong>{{ currentItem.type }}</p>
        <template v-if="currentItem.type === '选择题'">
          <p><strong>选项：</strong></p>
          <ul class="option-list">
            <li v-for="(opt, i) in currentItem.options" :key="i">
              {{ String.fromCharCode(65 + i) }}. {{ opt }}
            </li>
          </ul>
        </template>
      </div>

      <!-- 回答信息区 -->
      <div class="review-section">
        <h3 class="section-title">回答信息</h3>
        <p><strong>AI回答：</strong></p>
        <div class="answer-block">{{ currentItem.aiAnswer }}</div>

        <p><strong>标准答案：</strong></p>
        <div class="answer-block">{{ currentItem.standardAnswer }}</div>
      </div>

      <!-- 得分操作区 -->
      <div class="review-section">
        <h3 class="section-title">评分</h3>
        <a-form layout="vertical">
          <a-form-item label="得分">
            <a-input-number
                v-model:value="currentItem.score"
                :min="0"
                :max="100"
                :precision="1"
                style="width: 200px"
            />
          </a-form-item>
          <a-form-item label="评分说明">
            <a-textarea
                v-model:value="currentItem.scoreComment"
                placeholder="请输入评分理由..."
                rows="3"
            />
          </a-form-item>
        </a-form>
      </div>
    </a-modal>

    <!-- 底部按钮区域 -->
    <div class="footer-area">
      <a-space>
        <a-button @click="goToTestManage">返回测试管理</a-button>
        <a-button type="primary" @click="completeReview">完成审核</a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup>
import { useRoute, useRouter } from 'vue-router'
import { ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'

const route = useRoute()
const router = useRouter()
const testId = route.params.testId

const longText = '这是一个很长的文本，用于测试弹窗在面对大段内容时的布局与可读性表现。'.repeat(10) // 每段30字，重复10次 ≈ 300字

const reviewData = ref([
  {
    id: 1,
    content: `题目内容：${longText}`,
    type: '选择题',
    options: ['选项A内容很长很长很长很长很长很长很长', '选项B内容也很长很长很长很长很长', '选项C略短', '选项D也不短'],
    aiAnswer: `AI回答内容：${longText}`,
    standardAnswer: `标准答案内容：${longText}`,
    score: 85,
    scoreComment: ''
  },
  {
    id: 2,
    content: `题目内容：${longText}`,
    type: '简答题',
    options: [],
    aiAnswer: `AI回答内容：${longText}`,
    standardAnswer: `标准答案内容：${longText}`,
    score: 0,
    scoreComment: ''
  }
])

// 获取已审核题目数量
function getReviewedCount() {
  return reviewData.value.filter(item => item.score > 0).length
}

// 获取平均分
function getAverageScore() {
  const scores = reviewData.value.filter(item => item.score > 0).map(item => item.score)
  if (scores.length === 0) return 0
  return (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1)
}

// 根据分数获取颜色
function getScoreColor(score) {
  if (score === 0) return 'default'
  if (score < 60) return 'error'
  if (score < 80) return 'warning'
  return 'success'
}

const columns = [
  { title: '题号', dataIndex: 'id', key: 'id', width: 100 },
  {
    title: '题目',
    dataIndex: 'content',
    key: 'content'
  },
  { title: '题型', dataIndex: 'type', key: 'type', width: 100 },
  { title: '得分', dataIndex: 'score', key: 'score', width: 100 },
  { title: '操作', key: 'actions', width: 150 }
]

// 弹窗控制
const reviewVisible = ref(false)
const currentItem = reactive({
  id: null,
  content: '',
  type: '',
  aiAnswer: '',
  standardAnswer: '',
  options: [],
  score: 0,
  scoreComment: ''
})

// 打开审核弹窗
function openReview(item) {
  Object.assign(currentItem, item)
  reviewVisible.value = true
}

// 保存评分
function saveReview() {
  const idx = reviewData.value.findIndex(q => q.id === currentItem.id)
  if (idx !== -1) {
    reviewData.value[idx].score = currentItem.score
    reviewData.value[idx].scoreComment = currentItem.scoreComment
    message.success('审核已保存')
  }
  reviewVisible.value = false
}

// 删除题目
function deleteQuestion(id) {
  reviewData.value = reviewData.value.filter(q => q.id !== id)
  message.success('题目已删除')
}

// 返回测试管理
function goToTestManage() {
  router.push('/project/test-manage')
}

// 完成审核
function completeReview() {
  message.success('审核已完成')
  router.push('/project/test-manage')
}
</script>

<style scoped>
.test-review-container {
  background: #fff;
  padding: 24px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 标题区域 */
.header-area {
  margin-bottom: 24px;
}
.page-title {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 600;
}
.page-subtitle {
  margin: 0;
  color: #666;
  font-size: 16px;
}

/* 内容区域 */
.content-area {
  flex: 1;
  overflow: auto;
}

/* 统计卡片 */
.stats-area {
  margin-bottom: 24px;
}

.stat-card {
  text-align: center;
  padding: 16px;
  height: 100%;
}

.stat-value {
  font-size: 36px;
  font-weight: 600;
  color: #1890ff;
  margin-bottom: 8px;
}

.stat-label {
  color: #666;
}

/* 表格卡片 */
.table-card {
  margin-bottom: 24px;
}

.truncated-content {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 400px;
}

/* 审核弹窗样式 */
.review-section {
  margin-bottom: 24px;
  padding: 16px;
  background-color: #fafafa;
  border-radius: 4px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
  border-left: 4px solid #1890ff;
  padding-left: 8px;
}

.answer-block {
  background-color: #f0f5ff;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  white-space: pre-wrap;
  border-left: 4px solid #1890ff;
}

.option-list {
  padding-left: 20px;
  margin: 0;
}

/* 底部按钮区域 */
.footer-area {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}
</style>
