<template>
  <div class="generate-complete-container">
    <!-- 顶部标题 + 进度条 -->
    <div class="header-area">
      <h2 class="page-title">题库生成</h2>
      <!-- 步骤条：共3步，这里处于第3步 -->
      <a-steps :current="2" class="step-bar">
        <a-step title="设置题库参数" />
        <a-step title="生成题库" />
        <a-step title="生成完成" />
      </a-steps>
    </div>

    <!-- 生成结果区域 -->
    <div class="result-area">
      <div class="result-header">
        <div class="result-icon">
          <CheckCircleFilled style="font-size: 48px; color: #52c41a;" />
        </div>
        <div class="result-title">
          <h3>题库生成成功</h3>
          <p>已完成题库生成，您可以查看、编辑题库或前往题库管理</p>
        </div>
      </div>

      <!-- 题库基本信息编辑 -->
      <a-card class="test-bank-info-card" title="题库基本信息">
        <a-form layout="vertical">
          <a-form-item label="题库名称" required>
            <a-input v-model:value="testBankName" placeholder="请输入题库名称" />
          </a-form-item>
          <a-form-item label="题库描述">
            <a-textarea v-model:value="testBankDesc" :rows="3" placeholder="请输入题库描述" />
          </a-form-item>
          <a-form-item label="题库标签">
            <a-select
              v-model:value="selectedTags"
              mode="multiple"
              style="width: 100%"
              placeholder="选择题库标签"
              :options="domainTags"
            ></a-select>
          </a-form-item>
        </a-form>
      </a-card>

      <!-- 题库统计卡片 -->
      <div class="result-stats">
        <a-row :gutter="16">
          <a-col :span="8">
            <a-card class="stat-card">
              <div class="stat-value">{{ totalQuestions }}</div>
              <div class="stat-label">生成题目总数</div>
            </a-card>
          </a-col>
          <a-col :span="8">
            <a-card class="stat-card">
              <div class="stat-value success">{{ multipleChoiceCount }}</div>
              <div class="stat-label">选择题数量</div>
            </a-card>
          </a-col>
          <a-col :span="8">
            <a-card class="stat-card">
              <div class="stat-value info">{{ essayCount }}</div>
              <div class="stat-label">问答题数量</div>
            </a-card>
          </a-col>
        </a-row>
      </div>

      <!-- 题目列表预览 -->
      <a-card class="questions-card" title="题目预览">
        <a-list
          class="questions-list"
          :data-source="generatedQuestions"
          :pagination="{ pageSize: 5 }"
          item-layout="horizontal"
        >
          <template #renderItem="{ item }">
            <a-list-item>
              <a-list-item-meta :description="getQuestionPreview(item)">
                <template #title>
                  <a @click="showQuestionDetail(item.id)" class="question-title-link">
                    {{ item.title }}
                    <a-tag :color="getQuestionTypeColor(item.type)">{{ item.type }}</a-tag>
                  </a>
                </template>
                <template #avatar>
                  <a-avatar 
                    :style="{ backgroundColor: getQuestionTypeColor(item.type) }"
                    class="question-avatar"
                  >
                    {{ item.type === '选择题' ? '选' : '问' }}
                  </a-avatar>
                </template>
              </a-list-item-meta>
              <template #actions>
                <a-button type="link" @click="showQuestionDetail(item.id)">查看详情</a-button>
                <a-button type="link" danger @click="deleteQuestion(item.id)">删除</a-button>
              </template>
            </a-list-item>
          </template>
        </a-list>
      </a-card>

      <!-- 题目详情弹窗 -->
      <a-modal
        v-model:open="detailVisible"
        title="题目详情"
        width="800px"
        :footer="null"
        :destroyOnClose="true"
      >
        <div v-if="selectedQuestion" class="detail-container">
          <h3 class="detail-title">{{ selectedQuestion.title }}</h3>
          <a-tag :color="getQuestionTypeColor(selectedQuestion.type)" class="detail-tag">
            {{ selectedQuestion.type }}
          </a-tag>
          
          <div class="detail-section">
            <h4>题目内容：</h4>
            <p>{{ selectedQuestion.content }}</p>
          </div>

          <template v-if="selectedQuestion.type === '选择题'">
            <div class="detail-section">
              <h4>选项：</h4>
              <ul class="options-list">
                <li v-for="(option, index) in selectedQuestion.options" :key="index">
                  {{ String.fromCharCode(65 + index) }}. {{ option }}
                </li>
              </ul>
            </div>
          </template>

          <div class="detail-section">
            <h4>答案：</h4>
            <p>{{ selectedQuestion.answer }}</p>
          </div>
          
          <div class="detail-section">
            <h4>标签：</h4>
            <div>
              <a-tag v-for="tag in selectedQuestion.tags" :key="tag" color="blue" style="margin-right: 8px">
                {{ tag }}
              </a-tag>
            </div>
          </div>
        </div>
      </a-modal>

      <!-- 底部操作区域 -->
      <div class="footer-area">
        <a-space>
   
          <a-button danger @click="showDeleteModal">删除题库</a-button>
          <a-button type="primary" @click="saveTestBank">保存题库</a-button>
        </a-space>
      </div>
    </div>

    <!-- 删除确认弹窗 -->
    <a-modal
      v-model:open="deleteModalVisible"
      title="删除题库"
      @ok="confirmDelete"
      okText="删除"
      cancelText="取消"
    >
      <p>确定要删除这个题库吗？</p>
    </a-modal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { Steps, Button, Form, Input, Select, Card, List, Avatar, Tag, Modal, message, Space } from 'ant-design-vue'
import { CheckCircleFilled } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 题库基本信息
const testBankName = ref('高等数学测试题库')
const testBankDesc = ref('本题库覆盖高等数学主要知识点，包括微积分、线性代数等内容，适合大学生学习测试使用。')
const selectedTags = ref(['finance', 'education'])
const domainTags = [
  { value: 'finance', label: '金融', desc: '银行、证券、保险等金融行业' },
  { value: 'medical', label: '医疗', desc: '临床诊断、药物研发等医疗健康行业' },
  { value: 'education', label: '教育', desc: '课程教学、考试评测等教育行业' },
  { value: 'legal', label: '法律', desc: '合同审查、法律咨询等法律服务行业' },
  { value: 'manufacturing', label: '制造', desc: '工业制造、智能制造、质量控制' },
  { value: 'energy', label: '能源', desc: '电力、新能源、石油天然气' },
  { value: 'transport', label: '交通', desc: '智能驾驶、交通管控、物流' },
  { value: 'government', label: '政务', desc: '公共服务、电子政务、行政审批' },
  { value: 'media', label: '传媒', desc: '新闻采编、内容审核、广告营销' },
  { value: 'retail', label: '零售', desc: '电商、实体店管理、供应链优化' }
]

// 题库统计
const totalQuestions = ref(120)
const multipleChoiceCount = ref(80)
const essayCount = ref(40)

// 模拟生成的题目数据
const generatedQuestions = ref([
  {
    id: 1,
    title: '微积分基础题目',
    type: '选择题',
    content: '若函数f(x)=x²+2x在区间[0,2]上的最大值为M，最小值为m，则M-m等于：',
    options: ['4', '6', '8', '10'],
    answer: 'B',
    tags: ['微积分', '函数极值']
  },
  {
    id: 2,
    title: '导数应用题',
    type: '选择题',
    content: '设f(x)在区间[a,b]上具有二阶导数，且f\'(a)=f\'(b)=0，则下列结论正确的是：',
    options: [
      'f(x)在[a,b]上至少有一个极值点',
      'f\"(x)在(a,b)内至少有一点取值为0',
      'f(x)在[a,b]上最多只有一个极值点',
      'f\'(x)在(a,b)内恒为0'
    ],
    answer: 'B',
    tags: ['微积分', '导数', '罗尔定理']
  },
  {
    id: 3,
    title: '线性代数矩阵运算',
    type: '选择题',
    content: '设A为n阶方阵，若A²=A，则下列结论中正确的是：',
    options: [
      'A必为零矩阵',
      'A必为单位矩阵',
      'A的特征值只能是0或1',
      'A必可逆'
    ],
    answer: 'C',
    tags: ['线性代数', '矩阵', '特征值']
  },
  {
    id: 4,
    title: '概率分布问题',
    type: '问答题',
    content: '证明：若随机变量X服从参数为λ的泊松分布，则E(X)=Var(X)=λ。',
    answer: '泊松分布的概率质量函数为P(X=k)=λ^k·e^(-λ)/k!，k=0,1,2,...\n期望E(X)=Σk·P(X=k)=Σk·λ^k·e^(-λ)/k!=λ\n方差Var(X)=E(X²)-[E(X)]²=E(X(X-1))+E(X)-[E(X)]²=λ²+λ-λ²=λ',
    tags: ['概率统计', '泊松分布', '期望', '方差']
  },
  {
    id: 5,
    title: '定积分计算',
    type: '问答题',
    content: '计算定积分：∫(0到π/2) sin(x)·cos(x) dx',
    answer: '令u=sin(x)，则du=cos(x)dx\n∫sin(x)·cos(x)dx = ∫u·du = u²/2 + C = sin²(x)/2 + C\n所以∫(0到π/2) sin(x)·cos(x)dx = [sin²(x)/2](0到π/2) = sin²(π/2)/2 - sin²(0)/2 = 1/2 - 0 = 1/2',
    tags: ['微积分', '定积分', '三角函数']
  },
  {
    id: 6,
    title: '微分方程求解',
    type: '问答题',
    content: '求解常微分方程：dy/dx + 2y = e^x，y(0)=1',
    answer: '这是一阶线性微分方程，可以使用积分因子法求解。\n积分因子为e^∫2dx = e^(2x)\n两边乘以e^(2x)得：e^(2x)·dy/dx + 2e^(2x)·y = e^(2x)·e^x = e^(3x)\n左边可以写成d(e^(2x)·y)/dx = e^(3x)\n两边积分：e^(2x)·y = ∫e^(3x)dx = e^(3x)/3 + C\n因此y = e^(-2x)·(e^(3x)/3 + C) = e^x/3 + C·e^(-2x)\n代入初始条件y(0)=1，得1 = 1/3 + C，即C = 2/3\n所以解为y = e^x/3 + (2/3)·e^(-2x)',
    tags: ['常微分方程', '一阶线性方程']
  },
  {
    id: 7,
    title: '向量空间性质',
    type: '选择题',
    content: '下列说法中错误的是：',
    options: [
      '任何n个n维向量组成的集合都是一组基',
      'n维向量空间中任意一组基都恰好包含n个向量',
      '向量空间的任意一组基所包含的向量个数都相同',
      '线性无关的向量组可以张成一个向量空间'
    ],
    answer: 'A',
    tags: ['线性代数', '向量空间', '基']
  }
])

// 题目详情弹窗
const detailVisible = ref(false)
const selectedQuestion = ref(null)

// 获取题目预览，截取内容前50个字符
function getQuestionPreview(question) {
  const preview = question.content.length > 50 
    ? question.content.substring(0, 50) + '...' 
    : question.content
  return preview
}

// 获取题目类型对应的颜色
function getQuestionTypeColor(type) {
  return type === '选择题' ? '#1890ff' : '#722ed1'
}

// 显示题目详情
function showQuestionDetail(id) {
  const question = generatedQuestions.value.find(q => q.id === id)
  if (question) {
    selectedQuestion.value = question
    detailVisible.value = true
  }
}

// 删除题目
function deleteQuestion(id) {
  Modal.confirm({
    title: '确认删除',
    content: '确定要删除这道题目吗？',
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    onOk() {
      const index = generatedQuestions.value.findIndex(q => q.id === id)
      if (index !== -1) {
        generatedQuestions.value.splice(index, 1)
        
        // 更新统计数据
        totalQuestions.value--
        if (selectedQuestion.value.type === '选择题') {
          multipleChoiceCount.value--
        } else {
          essayCount.value--
        }
        
        message.success('题目已删除')
        detailVisible.value = false
      }
    }
  })
}

// 删除题库弹窗
const deleteModalVisible = ref(false)

// 显示删除弹窗
function showDeleteModal() {
  deleteModalVisible.value = true
}

// 确认删除
function confirmDelete() {
  message.success('题库已删除！')
  // 删除成功后跳转到题库管理页面
  router.push('/project/testbank-manage')
}

// 返回上一步
function goBack() {
  router.go(-1)
}

// 保存题库
function saveTestBank() {
  if (!testBankName.value.trim()) {
    message.warning('请输入题库名称')
    return
  }
  
  message.success('题库保存成功！')
  // 保存成功后跳转到题库管理页面
  router.push('/project/testbank-manage')
}
</script>

<style scoped>
.generate-complete-container {
  background: #fff;
  padding: 24px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 标题 + 进度条 */
.header-area {
  margin-bottom: 24px;
}
.page-title {
  margin: 0 0 12px;
  font-size: 24px;
  font-weight: 600;
}
.step-bar {
  margin-bottom: 16px;
}

/* 结果区域 */
.result-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

/* 成功提示 */
.result-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding: 16px;
  background: #f6ffed;
  border: 1px solid #b7eb8f;
  border-radius: 4px;
}
.result-icon {
  margin-right: 16px;
}
.result-title h3 {
  margin: 0;
  font-size: 18px;
  color: #52c41a;
}
.result-title p {
  margin: 4px 0 0;
  color: #666;
}

/* 题库基本信息卡片 */
.test-bank-info-card {
  margin-bottom: 24px;
}

/* 题库统计卡片 */
.result-stats {
  margin-bottom: 24px;
}
.stat-card {
  text-align: center;
  padding: 16px;
  height: 100%;
  transition: all 0.3s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}
.stat-card:hover {
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}
.stat-value {
  font-size: 36px;
  font-weight: 600;
  color: #1890ff;
  margin-bottom: 8px;
}
.stat-value.success {
  color: #52c41a;
}
.stat-value.error {
  color: #f5222d;
}
.stat-value.info {
  color: #722ed1;
}
.stat-label {
  color: #666;
}

/* 题目列表卡片 */
.questions-card {
  margin-bottom: 24px;
}
.question-title-link {
  font-weight: 500;
}

/* 调整列表项和头像样式 */
:deep(.questions-list .ant-list-item) {
  padding: 12px;
  align-items: center;
}

:deep(.questions-list .ant-list-item-meta) {
  align-items: center;
}

:deep(.questions-list .ant-list-item-meta-avatar) {
  margin-top: 0;
  margin-bottom: 0;
  display: flex;
  align-items: center;
}

:deep(.questions-list .ant-avatar) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  line-height: 36px;
  font-size: 14px;
}

:deep(.questions-list .ant-list-item-meta-content) {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

:deep(.questions-list .ant-list-item-action) {
  margin-top: 0;
}

/* 题目详情 */
.detail-container {
  padding: 0 16px;
}
.detail-title {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 18px;
  font-weight: 600;
}
.detail-tag {
  margin-bottom: 16px;
}
.detail-section {
  margin-bottom: 16px;
}
.detail-section:first-of-type {
  margin-top: 16px;
}
.detail-section h4 {
  margin-top: 0;
  margin-bottom: 8px;
  font-weight: 500;
}
.options-list {
  list-style-type: none;
  padding-left: 8px;
  margin: 0;
}
.options-list li {
  margin-bottom: 8px;
}

/* 底部按钮区域 */
.footer-area {
  display: flex;
  justify-content: flex-end;
  margin-top: 24px;
}

.question-avatar {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-weight: normal;
  margin-right: 12px;
}
</style> 