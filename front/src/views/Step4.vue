<template>
  <div class="step4-content">
    <!-- 标题 + 描述 -->
    <h2 class="main-title">邀请成员</h2>
    <p class="sub-desc">
      邀请成员加入您的项目，以便在项目上进行协作。您可以随时在项目管理中查看和修改。
    </p>

    <!-- 顶部工具栏：成员名称(输入) + 邮箱(下拉) + 添加按钮 -->
    <div class="toolbar">
      <!-- 成员名称输入框 -->
      <a-input
          v-model="newMemberName"
          placeholder="请输入"
          style="width: 200px; margin-right: 8px;"
      />

      <!-- 邮箱下拉选择框 -->
      <a-select
          v-model="selectedEmail"
          placeholder="请选择"
          style="width: 240px; margin-right: 8px;"
      >
        <!-- 这里列举一些可选邮箱，仅作示例 -->
        <a-select-option value="xxx@xxx.com">xxx@xxx.com</a-select-option>
        <a-select-option value="test@test.com">test@test.com</a-select-option>
        <a-select-option value="abc@demo.com">abc@demo.com</a-select-option>
      </a-select>

      <a-button type="primary" @click="addMember">添加</a-button>
    </div>

    <!-- 表格：可勾选行 -->
    <a-table
        :columns="columns"
        :data-source="tableData"
        :pagination="pagination"
        :row-selection="rowSelection"
        row-key="id"
        style="margin-top: 16px;"
    />

    <!-- 底部翻页信息 + 下一步按钮 -->
    <div class="bottom-bar">
      <div class="left-info">
        共 {{ pagination.total }} 条记录 / {{ pagination.current }} /
        {{ Math.ceil(pagination.total / pagination.pageSize) }} 页
      </div>
      <a-button type="primary" @click="goNext">下一步</a-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 新成员输入：名称、邮箱（下拉选择）
const newMemberName = ref('')
const selectedEmail = ref('')

// 表格数据（模拟）
const tableData = ref([
  { id: 1, name: '张三', email: 'xxx@xxx.com', role: '所有者' },
  { id: 2, name: '李四', email: 'xxxx@xxx.com', role: '编辑' },
  { id: 3, name: '王五', email: 'xxxxx@xxx.com', role: '查看者' },
  { id: 4, name: '赵六', email: 'xxxxxx@xxx.com', role: '无' },
  { id: 5, name: '孙七', email: 'xxxxxxx@xxx.com', role: '所有者' },
  { id: 6, name: '周八', email: 'xxxxxxxx@xxx.com', role: '无' }
])

// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 5,
  total: tableData.value.length, // 初始数据长度
  showSizeChanger: true,
  pageSizeOptions: ['5', '10', '20', '50'],
  onChange: (page, pageSize) => {
    pagination.value.current = page
    pagination.value.pageSize = pageSize
    // TODO: 若需后端分页，可在此请求接口
  }
})

// 列定义
const columns = [
  { title: '名称', dataIndex: 'name', key: 'name' },
  { title: '邮箱', dataIndex: 'email', key: 'email' },
  { title: '角色', dataIndex: 'role', key: 'role' },
  {
    title: '操作',
    key: 'action',
    customRender: (text, record) => {
      // 返回一个蓝色「删除」链接
      return {
        children: '删除',
        attrs: {
          style: 'color: #1890ff; cursor: pointer;',
          onClick: () => deleteMember(record)
        }
      }
    }
  }
]

// 多选勾选行
const rowSelection = {
  onChange: (selectedRowKeys, selectedRows) => {
    console.log('selectedRowKeys:', selectedRowKeys, 'selectedRows:', selectedRows)
  }
}

// 删除成员
function deleteMember(record) {
  tableData.value = tableData.value.filter(item => item.id !== record.id)
  pagination.value.total = tableData.value.length
}

// 添加成员
function addMember() {
  // 简单验证
  if (!newMemberName.value || !selectedEmail.value) return
  const newId = tableData.value.length + 1
  tableData.value.push({
    id: newId,
    name: newMemberName.value,
    email: selectedEmail.value,
    role: '无'
  })
  // 清空输入框
  newMemberName.value = ''
  selectedEmail.value = ''
  pagination.value.total = tableData.value.length
}

// 点击「下一步」
function goNext() {
  // 跳转到完成/下一个步骤
  router.push('/home/newproject/finish')
}
</script>

<style scoped>
.step4-content {
  width: 100%;
  padding: 16px;
  box-sizing: border-box;
  background: #fff;
}

.main-title {
  font-size: 32px;
  font-weight: 700;
  color: #1890ff;
  margin: 0 0 8px 0;
}

.sub-desc {
  margin: 0 0 24px 0;
  color: #666;
}

/* 顶部工具栏 */
.toolbar {
  margin-bottom: 16px;
}

/* 底部栏：左侧翻页信息 + 右侧“下一步”按钮 */
.bottom-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.left-info {
  color: #666;
}
</style>
