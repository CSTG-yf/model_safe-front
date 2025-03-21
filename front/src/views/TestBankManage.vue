<template>
  <div class="testbank-manage">
    <h2 class="page-title">题库管理</h2>

    <!-- 搜索框替换 sub-info 文本 -->
    <div class="search-area">
      <Search
          v-model:value="searchKeyword"
          placeholder="搜索题库"
          enter-button="搜索"
          size="large"
          class="search-bar"
          @search="onSearch"
      />
    </div>

    <Row gutter="16" class="card-grid">
      <Col
          v-for="(bank, index) in filteredBanks"
          :key="index"
          :span="8"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="8"
      >
        <Card class="testbank-card" hoverable>
          <!-- 上方主体：图标左，文字右 -->
          <div class="card-top">
            <DatabaseOutlined class="card-icon" />
            <div class="card-info">
              <div class="card-title" @click="goToDetail(bank)">
                {{ bank.name }}
              </div>
              <div class="card-desc">
                {{ bank.desc }}
              </div>
            </div>
          </div>

          <!-- 下方操作：编辑/删除 -->
          <div class="card-actions">
            <Button type="link" @click="editBank(bank)">编辑</Button>
            <Button type="link" @click="deleteBank(bank)" class="delete-btn">删除</Button>
          </div>
        </Card>
      </Col>
    </Row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Row, Col, Card, Button, Input } from 'ant-design-vue'
import { DatabaseOutlined } from '@ant-design/icons-vue'

const { Search } = Input

// 搜索关键词
const searchKeyword = ref('')
// 题库数据
const testBanks = ref([
  { name: '题库名称1', desc: '题库介绍1' },
  { name: '题库名称2', desc: '题库介绍2' },
  { name: '题库名称3', desc: '题库介绍3' },
  { name: '题库名称4', desc: '题库介绍4' },
  { name: '题库名称5', desc: '题库介绍5' },
  { name: '题库名称6', desc: '题库介绍6' }
])

// 根据搜索关键字做简单过滤
const filteredBanks = computed(() => {
  if (!searchKeyword.value) return testBanks.value
  return testBanks.value.filter(bank =>
      bank.name.includes(searchKeyword.value)
  )
})

// 搜索回调
function onSearch(value) {
  console.log('搜索关键字:', value)
  // 这里可进一步发请求或更新 testBanks
}

// 点击题库名称 -> 跳转详情
function goToDetail(bank) {
  console.log('点击题库名称，跳转详情:', bank)
  // TODO: router.push(`/project/testbank-manage/${bank.id}`)
}

// 编辑题库
function editBank(bank) {
  console.log('编辑题库:', bank)
  // TODO: 打开编辑弹窗或跳转
}

// 删除题库
function deleteBank(bank) {
  console.log('删除题库:', bank)
  // TODO: 确认删除 -> 调接口
}
</script>

<style scoped>
.testbank-manage {
  background: #fff;
  padding: 24px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
}

/* 标题 */
.page-title {
  margin-bottom: 16px;
  font-size: 24px;
  font-weight: 600;
}

/* 搜索框区域 */
.search-area {
  margin-bottom: 16px;
}
.search-bar {
  width: 320px;
  max-width: 100%;
}

/* 卡片网格 */
.card-grid {
  margin-top: 16px;
}

/* 卡片样式 */
.testbank-card {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin-bottom: 16px;
}

/* 上方主体：图标左，文字右 */
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

.card-desc {
  color: #666;
}

/* 底部操作栏 */
.card-actions {
  display: flex;
  justify-content: space-around;
  border-top: 1px solid #f0f0f0;
  padding-top: 8px;
}

.delete-btn {
  color: red;
}
</style>
