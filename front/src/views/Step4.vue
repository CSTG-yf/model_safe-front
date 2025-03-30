<template>
  <div class="step4-content">
    <!-- 标题 + 描述 -->
    <h2 class="main-title">邀请成员</h2>
    <p class="sub-desc">
      邀请成员加入您的项目，以便在项目上进行协作。您可以随时在项目管理中查看和修改。
    </p>

    <!-- 顶部工具栏：邮箱搜索 + 搜索按钮 -->
    <div class="toolbar">
      <!-- 邮箱输入框 -->
      <a-input
        v-model:value="searchEmail"
        placeholder="请输入用户邮箱"
        style="width: 300px; margin-right: 8px"
        @keyup.enter="searchUser"
      />

      <a-button type="primary" @click="searchUser" :loading="searchLoading"
        >搜索用户</a-button
      >
    </div>

    <!-- 搜索结果表格 -->
    <h3 style="margin-top: 16px">搜索结果</h3>
    <div class="search-result-table">
      <a-table
        :columns="searchColumns"
        :data-source="searchResultList"
        :pagination="false"
        :loading="searchLoading"
        row-key="id"
        style="margin-top: 8px"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'action'">
            <a-button
              type="primary"
              size="small"
              @click="addMember(record)"
              :loading="addingUser === record.id"
            >
              添加到项目
            </a-button>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 项目成员表格 -->
    <h3 style="margin-top: 24px">项目成员列表</h3>
    <a-table
      :columns="memberColumns"
      :data-source="tableData"
      :pagination="pagination"
      :loading="membersLoading"
      row-key="user"
      style="margin-top: 8px"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.key === 'action'">
          <a
            v-if="record.role !== 'owner'"
            @click="removeMember(record)"
            style="color: #ff4d4f; cursor: pointer"
          >
            移除
          </a>
          <span v-else style="color: #999">无法移除</span>
        </template>
      </template>
    </a-table>

    <!-- 底部翻页信息 + 下一步按钮 -->
    <div class="bottom-bar">
      <div class="left-info">共 {{ pagination.total }} 条记录</div>
      <a-button type="primary" @click="goNext">下一步</a-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useCounterStore } from "@/stores/counterStore.js";
import axios from "axios";
import { message, Modal } from "ant-design-vue";

const router = useRouter();
const counterStore = useCounterStore();

// 搜索用户相关
const searchEmail = ref("");
const searchResultList = ref([]);
const searchLoading = ref(false);
const searchAttempted = ref(false);
const addingUser = ref(null); // 正在添加的用户ID

// 项目成员列表
const tableData = ref([]);
const membersLoading = ref(false);

// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 5,
  total: 0,
  showSizeChanger: true,
  pageSizeOptions: ["5", "10", "20", "50"],
  onChange: (page, pageSize) => {
    pagination.value.current = page;
    pagination.value.pageSize = pageSize;
  },
});

// 搜索结果列定义
const searchColumns = [
  { title: "用户ID", dataIndex: "id", key: "id" },
  { title: "用户名", dataIndex: "username", key: "username" },
  { title: "邮箱", dataIndex: "email", key: "email" },
  {
    title: "操作",
    key: "action",
  },
];

// 成员列表列定义
const memberColumns = [
  { title: "用户ID", dataIndex: "user", key: "user" },
  { title: "用户名", dataIndex: "username", key: "username" },
  { title: "角色", dataIndex: "role", key: "role" },
  { title: "加入时间", dataIndex: "joined_at", key: "joined_at" },
  {
    title: "操作",
    key: "action",
  },
];

// 获取项目成员列表
async function fetchMembers() {
  if (!counterStore.projectId) {
    message.warning("项目ID不存在");
    return;
  }

  membersLoading.value = true;
  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/api/projects/${counterStore.projectId}/members/`,
      {
        headers: {
          Authorization: `Bearer ${counterStore.access}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.result === "success") {
      tableData.value = response.data.members;
      pagination.value.total = response.data.members.length;
    } else {
      console.error("获取成员列表失败:", response.data.message);
      message.error("获取成员列表失败");
    }
  } catch (error) {
    console.error("获取成员列表请求失败");
    message.error("获取成员列表失败，请检查网络连接");
  } finally {
    membersLoading.value = false;
  }
}

// 搜索用户
async function searchUser() {
  const emailToSearch = searchEmail.value ? searchEmail.value.trim() : "";

  if (!emailToSearch) {
    message.warning("请输入邮箱地址");
    return;
  }

  searchLoading.value = true;
  searchResultList.value = [];
  searchAttempted.value = true;

  try {
    const searchUrl =
      "http://127.0.0.1:8000/api/users/search/?email=" +
      encodeURIComponent(emailToSearch);

    const response = await fetch(searchUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${counterStore.access}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`请求失败，状态码: ${response.status}`);
    }

    const data = await response.json();

    if (data.result === "success") {
      if (data.user) {
        // 成功找到用户
        searchResultList.value = [data.user];
      } else {
        // 搜索成功但未找到匹配用户
        message.info(`未找到匹配邮箱 "${emailToSearch}" 的用户`);
      }
    } else {
      message.error(data.message || "搜索失败");
    }
  } catch (error) {
    console.error("搜索用户请求失败:", error.message);
    message.error("搜索请求失败，请检查网络连接");
  } finally {
    searchLoading.value = false;
  }
}

// 添加成员到项目
async function addMember(user) {
  if (!user || !user.id || !counterStore.projectId) {
    message.warning("用户信息或项目ID不存在");
    return;
  }

  addingUser.value = user.id;
  try {
    const response = await axios.post(
      `http://127.0.0.1:8000/api/projects/${counterStore.projectId}/members/`,
      {
        user_id: user.id,
      },
      {
        headers: {
          Authorization: `Bearer ${counterStore.access}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.result === "success") {
      message.success(`已将 ${user.username} 添加到项目`);
      // 添加成功后刷新成员列表
      fetchMembers();
      // 从搜索结果中移除已添加的用户
      searchResultList.value = searchResultList.value.filter(
        (item) => item.id !== user.id
      );
    } else {
      message.error(response.data.message || "添加成员失败");
    }
  } catch (error) {
    console.error("添加成员请求失败");
    message.error("添加成员失败，请稍后重试");
  } finally {
    addingUser.value = null;
  }
}

// 移除成员
async function removeMember(record) {
  if (!counterStore.projectId) {
    message.warning("项目ID不存在");
    return;
  }

  // 添加防重复点击标记
  if (record._removing) {
    return;
  }

  // 使用Modal.confirm替代原生confirm
  Modal.confirm({
    title: "确认移除",
    content: `确定要将用户 ${record.username} 从项目中移除吗？`,
    okText: "确认移除",
    okType: "danger",
    cancelText: "取消",
    async onOk() {
      try {
        // 设置标记防止重复点击
        record._removing = true;

        const userId = parseInt(record.user) || record.user;
        const deleteUrl = `http://127.0.0.1:8000/api/projects/${counterStore.projectId}/members/${userId}/`;

        const response = await axios.delete(deleteUrl, {
          headers: {
            Authorization: `Bearer ${counterStore.access}`,
            "Content-Type": "application/json",
          },
        });

        // 更灵活地判断响应
        const isSuccess =
          (response.data && response.data.result === "success") ||
          (response.status >= 200 && response.status < 300) ||
          (response.data && response.data.detail === "成员已移除");

        if (isSuccess) {
          // 立即从界面上移除该成员，不等待刷新
          tableData.value = tableData.value.filter(
            (item) => item.user !== record.user
          );
          // 然后再刷新完整列表
          fetchMembers();
          message.success(`已将 ${record.username} 从项目中移除`);
        } else {
          const errorMsg =
            response.data?.message ||
            response.data?.detail ||
            response.data?.error ||
            "未知错误";
          message.error(`移除失败: ${errorMsg}`);
        }
      } catch (error) {
        // 特殊处理404错误 - 可能是成员已被删除
        if (error.response && error.response.status === 404) {
          // 从界面上移除该成员
          tableData.value = tableData.value.filter(
            (item) => item.user !== record.user
          );
          // 刷新成员列表
          fetchMembers();
          message.info("该成员已不在项目中");
          return;
        }

        console.error("移除成员请求失败");
        if (error.response) {
          message.error(
            `移除失败: ${error.response.data?.message || "请求出错"}`
          );
        } else {
          message.error("移除失败，请检查网络连接");
        }
      } finally {
        // 清除标记
        delete record._removing;
      }
    },
    onCancel() {
      // 用户取消操作，不做任何事
    },
  });
}

// 点击「下一步」
function goNext() {
  if (!counterStore.projectId) {
    message.warning("项目还未创建完成，请等待");
    return;
  }

  console.log("跳转到新创建的项目，ID:", counterStore.projectId);

  // 确保项目名称也已设置
  if (!counterStore.projectName) {
    // 如果项目名称未设置（可能的情况），尝试从列表获取
    fetchProjectName(counterStore.projectId);
  }

  // 导航到项目控制台页面
  router.push(`/project/${counterStore.projectId}/console`);
}

// 辅助函数：获取项目名称
async function fetchProjectName(projectId) {
  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/api/projects/${projectId}/`,
      {
        headers: {
          Authorization: `Bearer ${counterStore.access}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data && response.data.project) {
      counterStore.projectName = response.data.project.name;
    }
  } catch (error) {
    console.error("获取项目名称失败:", error);
  }
}

// 组件挂载时获取成员列表
onMounted(() => {
  fetchMembers();
});
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
  display: flex;
  align-items: center;
}

/* 搜索结果表格 */
.search-result-table {
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  margin-bottom: 24px;
}

/* 底部栏：左侧翻页信息 + 右侧"下一步"按钮 */
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
