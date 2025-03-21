<template>
  <div class="testbank-detail-container">
    <!-- 顶部标题区域 -->
    <div class="header-area">
      <h2 class="page-title">题库详情</h2>
      <p class="page-subtitle">题库ID: {{ route.params.id }}</p>
    </div>

    <!-- 内容区域 -->
    <div class="content-area">
      <!-- 统计卡片 -->
      <div class="stats-area">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-card class="stat-card">
              <div class="stat-value">{{ questions.length }}</div>
              <div class="stat-label">题目总数</div>
            </a-card>
          </a-col>
          <a-col :span="8">
            <a-card class="stat-card">
              <div class="stat-value">{{ getTypeCount('单选题') }}</div>
              <div class="stat-label">单选题数量</div>
            </a-card>
          </a-col>
          <a-col :span="8">
            <a-card class="stat-card">
              <div class="stat-value">{{ getTypeCount('简答题') }}</div>
              <div class="stat-label">简答题数量</div>
            </a-card>
          </a-col>
        </a-row>
      </div>

      <!-- 表格区域 -->
      <a-card class="table-card" title="题库内容">
        <a-table 
          :columns="columns" 
          :data-source="questions" 
          row-key="id" 
          :pagination="{ pageSize: 10 }"
          bordered
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'actions'">
              <a-space>
                <a-button type="link" @click="openEditModal(record)">编辑</a-button>
                <a-button type="link" danger @click="deleteQuestion(record.id)">删除</a-button>
              </a-space>
            </template>
          </template>
        </a-table>
      </a-card>
    </div>

    <!-- 编辑弹窗 -->
    <a-modal
        v-model:open="editModalVisible"
        title="编辑题目"
        ok-text="确认"
        cancel-text="取消"
        width="600px"
        @ok="saveEdit"
    >
      <a-form layout="vertical">
        <a-form-item label="题目 ID">
          <a-input :value="currentQuestion.id" disabled />
        </a-form-item>

        <a-form-item label="题目内容">
          <a-textarea v-model:value="currentQuestion.content" rows="3" />
        </a-form-item>

        <a-form-item label="评分标准">
          <a-textarea v-model:value="currentQuestion.scoring" rows="2" />
        </a-form-item>

        <a-form-item label="题型">
          <a-input v-model:value="currentQuestion.type" />
        </a-form-item>

        <a-form-item label="选项">
          <div v-for="(opt, index) in currentQuestion.options" :key="index" class="option-item">
            <a-input
                v-model:value="currentQuestion.options[index]"
                :placeholder="`选项 ${String.fromCharCode(65 + index)}`"
                style="margin-bottom: 8px"
            />
          </div>
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 底部按钮区域 -->
    <div class="footer-area">
      <a-space>
        <a-button type="primary" @click="goBack">返回题库管理</a-button>
      </a-space>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'

const route = useRoute()
const router = useRouter()

// 示例题目数据
const questions = ref([
  {
    id: 101,
    content: '题目内容 A',
    scoring: '每空1分，共5分',
    type: '单选题',
    options: ['选项A', '选项B', '选项C', '选项D']
  },
  {
    id: 102,
    content: '题目内容 B',
    scoring: '答案符合逻辑给5分',
    type: '简答题',
    options: []
  }
])

// 计算不同题型的数量
function getTypeCount(type) {
  return questions.value.filter(q => q.type === type).length
}

const columns = [
  { title: '题号', dataIndex: 'id', key: 'id' },
  { title: '题目', dataIndex: 'content', key: 'content' },
  { title: '题型', dataIndex: 'type', key: 'type' },
  { title: '操作', key: 'actions' }
]

const editModalVisible = ref(false)
const currentQuestion = reactive({
  id: null,
  content: '',
  scoring: '',
  type: '',
  options: []
})

// 编辑题目
function openEditModal(question) {
  currentQuestion.id = question.id
  currentQuestion.content = question.content
  currentQuestion.scoring = question.scoring
  currentQuestion.type = question.type
  currentQuestion.options = [...question.options] // 拷贝数组
  editModalVisible.value = true
}

// 保存题目
function saveEdit() {
  const index = questions.value.findIndex(q => q.id === currentQuestion.id)
  if (index !== -1) {
    questions.value[index] = {
      ...currentQuestion,
      options: [...currentQuestion.options]
    }
    message.success('题目已更新')
  }
  editModalVisible.value = false
}

// 删除题目
function deleteQuestion(id) {
  questions.value = questions.value.filter(q => q.id !== id)
  message.success('题目已删除')
}

// 返回上一页
function goBack() {
  router.push('/project/testbank-manage')
}
</script>

<style scoped>
.testbank-detail-container {
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

/* 选项样式 */
.option-item:last-child {
  margin-bottom: 0;
}

/* 底部按钮区域 */
.footer-area {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}
</style>
