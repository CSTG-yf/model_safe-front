<template>
  <div class="select-testbank-container">
    <!-- 顶部标题 + 进度条 -->
    <div class="header-area">
      <h2 class="page-title">题库测试</h2>
      <!-- 步骤条：共3步，这里处于第1步 -->
      <a-steps :current="0" class="step-bar">
        <a-step title="选择题库" />
        <a-step title="进行测试" />
        <a-step title="测试完成" />
      </a-steps>
    </div>

    <!-- 网格卡片 -->
    <Row gutter="16" class="card-grid">
      <Col
          v-for="(bank, index) in currentPageData"
          :key="index"
          :span="8"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="8"
      >
        <Card class="testbank-card" hoverable>
          <div class="card-top">
            <DatabaseOutlined class="card-icon" />
            <div class="card-info">
              <div class="card-title">{{ bank.name }}</div>
              <div class="card-desc">{{ bank.desc }}</div>
            </div>
          </div>
          <div class="card-actions">
            <a-button
                type="primary"
                size="small"
                @click="selectBank(bank)"
                :disabled="isSelected(bank.id)"
            >
              <!-- 若已选该题库则显示"已选择"，否则显示"选择" -->
              {{ isSelected(bank.id) ? '已选择' : '选择' }}
            </a-button>
          </div>
        </Card>
      </Col>
    </Row>

    <!-- 分页 + 下一步按钮 -->
    <div class="footer-area">
      <a-pagination
          :page-size="pageSize"
          :total="testBanks.length"
          :current="currentPage"
          @change="onPageChange"
      />
      <a-button type="primary" class="next-btn" @click="goNextStep">
        下一步
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Row, Col, Card, Button, Steps, Pagination } from 'ant-design-vue'
import { DatabaseOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

/*
  模拟题库数据，每行3个卡片，分页
  id 用于区分单选
*/
const testBanks = ref([
  { id: 1, name: '基础数学题库', desc: '包含基础代数和几何题目' },
  { id: 2, name: '高级英语题库', desc: '词汇、语法和阅读理解' },
  { id: 3, name: '物理力学题库', desc: '牛顿力学和动力学' },
  { id: 4, name: '化学元素题库', desc: '元素周期表和化学反应' },
  { id: 5, name: '生物学题库', desc: '细胞结构和遗传学' },
  { id: 6, name: '计算机科学题库', desc: '算法和数据结构' },
  { id: 7, name: '历史题库', desc: '世界历史重要事件' },
  { id: 8, name: '地理题库', desc: '世界地理和自然资源' },
  { id: 9, name: '文学题库', desc: '经典文学作品和分析' }
  // ...可更多
])

// 每页显示多少条
const pageSize = 9
// 当前页
const currentPage = ref(1)

// 只允许单选 => selectedBankId
const selectedBankId = ref(null)

// 分页后的数据
const currentPageData = computed(() => {
  // slice 数据
  const startIndex = (currentPage.value - 1) * pageSize
  const endIndex = startIndex + pageSize
  return testBanks.value.slice(startIndex, endIndex)
})

// 点击分页
function onPageChange(page) {
  currentPage.value = page
}

// 判断该题库是否被选中
function isSelected(id) {
  return selectedBankId.value === id
}

// 点击"选择" => 单选
function selectBank(bank) {
  selectedBankId.value = bank.id
}

// 点击"下一步"
function goNextStep() {
  if (!selectedBankId.value) {
    // 未选 => 提示
    alert('请先选择一个题库！')
    return
  }
  console.log('选中的题库ID=', selectedBankId.value)
  // 跳转到下一步路由
  router.push('/project/testbank-test2')
}
</script>

<style scoped>
.select-testbank-container {
  background: #fff;
  padding: 24px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

/* 标题 + 进度条 */
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

/* 卡片网格 */
.card-grid {
  margin-bottom: 16px;
}

/* 卡片样式 */
.testbank-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 16px;
}
.card-top {
  display: flex;
  align-items: center;
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
.card-desc {
  color: #666;
}

/* 底部操作 */
.card-actions {
  margin-top: 12px;
  text-align: right;
}

/* 分页 + 下一步按钮 */
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