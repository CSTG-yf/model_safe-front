<template>
  <div class="step-container">
    <div class="header-area">
      <h2 class="page-title">题库扩展</h2>
      <!-- 步骤条：共4步，这里处于第1步 -->
      <a-steps :current="2" class="step-bar">
        <a-step title="选择题库" />
        <a-step title="变形方法" />
        <a-step title="进行预览" />
        <a-step title="完成" />
      </a-steps>
    </div>

    <div class="content">
      <!-- 左侧面板 -->
      <div class="left-panel">
        <h3 class="section-title">扩展后的题目：</h3>

        <!-- 题目表格 -->
        <a-table
            :columns="columns"
            :data-source="dataSource"
            :pagination="pagination"
            :row-selection="rowSelection"
            :scroll="{ y: 450 }"
            row-key="id"
            class="question-table"
        >
          <template #bodyCell="{ column, text, record }">
            <template v-if="column.key === 'action'">
              <a-button type="link" @click="onDelete(record)">删除</a-button>
            </template>
            <template v-else>
              {{ text }}
            </template>
          </template>
        </a-table>

        <!-- 操作按钮 -->
        <div class="btn-group">
          <a-button type="primary" @click="joinOtherQuestionBank">加入其他题库</a-button>
          <a-button type="primary" @click="saveAsNewQuestionBank">保存为新题库</a-button>
        </div>
      </div>

      <!-- 右侧面板 -->
      <div class="right-panel">
        <div class="box">
          <h4>原始题目 —— 题目编号：{{ originalQuestion?.id || 'xxx' }}</h4>
          <div class="question-content">
            {{ originalQuestion?.content || '暂无内容' }}
          </div>
        </div>

        <div class="box">
          <h4>变形后的题目 —— 题目编号：{{ transformedQuestion?.id || 'xxx' }}</h4>
          <div class="question-content">
            {{ transformedQuestion?.content || '暂无内容' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import {ref} from 'vue';
import {useRouter} from 'vue-router';
import {Steps, Table, Button} from 'ant-design-vue';

const router = useRouter();

// 表格数据（6条示例）
const dataSource = ref([
  {
    id: '1',
    content: '题目1：三角函数基础',
    original: '已知sinθ=0.6，求cosθ的值。'.repeat(5),
    transformed: '已知cosθ=0.8，求sinθ的值。'.repeat(5)
  },
  {
    id: '2',
    content: '题目2：二次函数图像',
    original: '求函数f(x)=x²+2x+1的顶点坐标。'.repeat(4),
    transformed: '求函数f(x)=2x²-4x+1的对称轴方程。'.repeat(4)
  },
  {
    id: '3',
    content: '题目3：几何证明',
    original: '证明等腰三角形两底角相等。'.repeat(6),
    transformed: '证明直角三角形斜边中线定理。'.repeat(6)
  },
  {
    id: '4',
    content: '题目4：概率计算',
    original: '抛掷两枚骰子，求点数之和为7的概率。'.repeat(3),
    transformed: '抛掷三枚硬币，求恰好两个正面的概率。'.repeat(3)
  },
  {
    id: '5',
    content: '题目5：导数应用',
    original: '求函数f(x)=x³-3x的极值点。'.repeat(4),
    transformed: '求函数f(x)=2x³-6x的单调区间。'.repeat(4)
  },
  {
    id: '6',
    content: '题目6：数列求和',
    original: '求等差数列1,3,5,...前10项的和。'.repeat(2),
    transformed: '求等比数列2,4,8,...前5项的和。'.repeat(2)
  },
]);

// 表格列配置
const columns = [
  {title: '题目编号', dataIndex: 'id', key: 'id', width: 100},
  {title: '题目内容', dataIndex: 'content', key: 'content'},
  {title: '操作', key: 'action', width: 80}
];

// 分页配置
const pagination = {
  current: 1,
  pageSize: 5,
  showTotal: total => `共 ${total} 题`,
  showSizeChanger: true,
  pageSizeOptions: ['5', '10', '15'],
};

// 表格选择功能
const selectedRowKeys = ref([]);
const rowSelection = {
  selectedRowKeys: selectedRowKeys.value,
  onChange: (newSelectedKeys, selectedRows) => {
    selectedRowKeys.value = newSelectedKeys;
    if (selectedRows.length > 0) {
      const record = selectedRows[0];
      originalQuestion.value = {id: record.id, content: record.original};
      transformedQuestion.value = {id: record.id, content: record.transformed};
    }
  }
};

// 右侧展示题目
const originalQuestion = ref(null);
const transformedQuestion = ref(null);

// 删除题目
function onDelete(record) {
  dataSource.value = dataSource.value.filter(item => item.id !== record.id);
  if (originalQuestion.value?.id === record.id) originalQuestion.value = null;
  if (transformedQuestion.value?.id === record.id) transformedQuestion.value = null;
}

// 按钮操作
function joinOtherQuestionBank() {
  console.log('执行加入题库操作');
  router.push('/project/testbank-extension4');
}

function saveAsNewQuestionBank() {
  console.log('执行保存新题库操作');
  router.push('/project/testbank-extension4');
}
</script>

<style scoped>
.step-container {
  height: 90vh;
  padding: 24px;
  background: #fff;
  min-height: 90vh;
  display: flex;
  flex-direction: column;
}

.steps {
  margin-bottom: 24px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
}

.content {
  flex: 1;
  display: flex;
  gap: 24px;
  padding: 16px 0;
  min-height: 680px;
  max-width: 1200px;
  margin: 0 auto;
}

.left-panel {
  width: 48%;
  display: flex;
  flex-direction: column;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #1890ff;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.question-table {
  height: 520px;
  overflow: auto;
  margin-bottom: 0;
  border-bottom: 1px solid #f0f0f0;
}

.btn-group {
  margin-top: auto;
  padding: 24px 0 8px;
  display: flex;
  gap: 16px;
  border-top: 1px solid #eee;
}

.right-panel {
  width: 48%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.box {
  flex: 1;
  min-height: 240px;
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  padding: 16px;
  overflow-y: auto;
  background: #fafafa;
}

.box h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.85);
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.question-content {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.75);
  line-height: 1.8;
  white-space: pre-wrap;
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 3px;
}

::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.05);
}
</style>