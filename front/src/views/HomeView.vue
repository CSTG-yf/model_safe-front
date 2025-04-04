<template>
  <div class="home-container">
    <a-layout class="full-layout">
      <!-- 左侧侧边栏 -->
      <a-layout-sider
        class="layout-sider"
        :width="sidebarWidth"
        :collapsedWidth="80"
        :collapsed="collapsed"
        collapsible
        :trigger="null"
      >
        <div class="sider-inner">
          <!-- 顶部 LOGO 区域：使用 v-show 控制显示，隐藏时仍保留空间 -->
          <div class="logo-area" v-show="!collapsed">
            <SafetyCertificateTwoTone class="logo-icon" />
            <span class="logo-text">大模型观测测评平台</span>
          </div>

          <!-- 导航菜单 -->
          <a-menu
            class="menu-top"
            theme="light"
            mode="inline"
            :inline-collapsed="collapsed"
            :selected-keys="[selectedKey]"
            :open-keys="openKeys"
            @openChange="openKeys = $event"
          >
            <!-- 创建新项目按钮 - 保持固定 -->
            <a-menu-item
              key="newproject"
              :style="menuItemStyle"
              @click="onMenuClick('newproject')"
            >
              <folder-add-outlined :style="iconStyle" />
              <span class="menu-text">新建项目</span>
            </a-menu-item>

            <!-- 动态项目列表 -->
            <a-menu-item
              v-for="project in projectsList"
              :key="`project-${project.id}`"
              :style="menuItemStyle"
              class="project-menu-item"
            >
              <div
                class="project-item-content"
                @click="goToProjectPage(project)"
              >
                <deployment-unit-outlined :style="iconStyle" />
                <span class="menu-text">{{ project.name }}</span>
              </div>
              <more-outlined
                class="more-icon"
                @click.stop="showProjectSettings(project)"
              />
            </a-menu-item>

            <!-- 测试项目 Qwen - 保持固定 -->
            <!-- <a-menu-item
              key="qwens"
              :style="menuItemStyle"
              @click="goToTestProject"
            >
              <robot-outlined :style="iconStyle" />
              <span class="menu-text">Qwen2.5 (测试)</span>
            </a-menu-item> -->
          </a-menu>

          <!-- 下方菜单 -->
          <div class="menu-bottom">
            <a-menu
              theme="light"
              mode="inline"
              :inline-collapsed="collapsed"
              :selected-keys="[selectedKey]"
              :open-keys="openKeys"
              @openChange="openKeys = $event"
            >
              <a-menu-item
                key="setting"
                :style="menuItemStyle"
                @click="onMenuClick('setting')"
              >
                <setting-outlined :style="iconStyle" />
                <span class="menu-text">设置</span>
              </a-menu-item>

              <a-menu-item
                key="profile"
                :style="menuItemStyle"
                @click="onMenuClick('profile')"
              >
                <user-outlined :style="iconStyle" />
                <span class="menu-text">个人中心</span>
              </a-menu-item>
            </a-menu>

            <!-- 版本号 -->
            <div v-if="!collapsed" class="version-info">
              大模型观测测评平台 V1.0
            </div>
          </div>
        </div>
      </a-layout-sider>

      <!-- 右侧主区域 -->
      <a-layout>
        <!-- 顶部导航栏 -->
        <a-layout-header class="layout-header">
          <!-- 左侧：折叠按钮 -->
          <div class="header-left">
            <a-button type="text" class="collapse-btn" @click="toggleCollapse">
              <component
                :is="collapsed ? MenuUnfoldOutlined : MenuFoldOutlined"
                style="font-size: 20px"
              />
            </a-button>
          </div>

          <!-- 右侧：搜索、消息、头像下拉 -->
          <div class="header-right">
            <a-button type="text" class="icon-btn">
              <search-outlined />
            </a-button>
            <a-button type="text" class="icon-btn">
              <bell-outlined />
            </a-button>

            <a-dropdown>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="profile">个人中心</a-menu-item>
                  <a-menu-item key="logout" @click="onLogout"
                    >退出登录</a-menu-item
                  >
                </a-menu>
              </template>
              <div class="user-info">
                <a-avatar
                  src="https://via.placeholder.com/40"
                  size="large"
                  style="margin-right: 8px"
                />
                <span class="username">momo.zy</span>
              </div>
            </a-dropdown>
          </div>
        </a-layout-header>

        <!-- 主内容区：加载子页面 -->
        <a-layout-content class="layout-content">
          <router-view />
        </a-layout-content>
      </a-layout>
    </a-layout>

    <!-- 项目设置弹窗 -->
    <a-modal
      v-model:visible="settingsVisible"
      title="项目设置"
      @ok="handleSettingsSave"
      @cancel="settingsVisible = false"
      :confirmLoading="settingsLoading"
    >
      <a-form :model="projectForm" layout="vertical">
        <a-form-item label="项目名称">
          <a-input v-model:value="projectForm.name" />
        </a-form-item>
        <a-form-item label="项目描述">
          <a-textarea v-model:value="projectForm.description" :rows="4" />
        </a-form-item>
        <a-form-item label="AI 模型">
          <a-input :value="projectForm.ai_model_name" disabled />
        </a-form-item>
        <div class="delete-section">
          <a-button danger @click="showDeleteConfirm">删除项目</a-button>
        </div>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useCounterStore } from "@/stores/counterStore.js";
import axios from "axios";
import { message, Modal } from "ant-design-vue";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SafetyCertificateTwoTone,
  SearchOutlined,
  FolderAddOutlined,
  DeploymentUnitOutlined,
  RobotOutlined,
  BellOutlined,
  SettingOutlined,
  UserOutlined,
  MoreOutlined,
} from "@ant-design/icons-vue";

const router = useRouter();
const counterStore = useCounterStore();

const collapsed = ref(false);
const sidebarWidth = 280;

const selectedKey = ref("");
const openKeys = ref([]);
const projectsList = ref([]); // 存储从API获取的项目列表
const projectsLoading = ref(false); // 项目加载状态

const menuItemStyle = {
  fontSize: "16px",
  lineHeight: "48px",
  height: "48px",
};

const iconStyle = {
  fontSize: "20px",
  marginRight: "8px",
};

// 项目设置相关
const settingsVisible = ref(false);
const settingsLoading = ref(false);
const currentProject = ref(null);
const projectForm = ref({
  name: "",
  description: "",
  ai_model_name: "",
});

// 获取项目列表
async function fetchProjects() {
  projectsLoading.value = true;
  try {
    const response = await axios.get("http://127.0.0.1:8000/api/projects/", {
      headers: {
        Authorization: `Bearer ${counterStore.access}`,
        "Content-Type": "application/json",
      },
    });

    if (response.data && response.data.result === "success") {
      // 过滤掉测试项目（如果有特定ID或名称可以识别）
      projectsList.value = response.data.projects.filter((project) => {
        // 假设Qwen2.5测试项目的名称或ID有特殊标记，此处仅为示例
        // 可以根据实际情况调整过滤条件
        return !project.name.includes("Qwen2.5");
      });
    } else {
      console.error("获取项目列表失败:", response.data?.message);
      message.error("获取项目列表失败");
    }
  } catch (error) {
    console.error("项目列表请求失败:", error);
    message.error("获取项目列表失败，请检查网络连接");
  } finally {
    projectsLoading.value = false;
  }
}

function toggleCollapse() {
  collapsed.value = !collapsed.value;
}

function onMenuClick(key) {
  selectedKey.value = key;
  if (key === "newproject") {
    router.push("/home/newproject/step1");
  } else {
    router.push(`/home/${key}`);
  }
}

// 前往实际项目页面 - 使用直接属性赋值而不是方法调用
function goToProjectPage(project) {
  console.log("准备跳转到项目:", project.name, "ID:", project.id);

  // 保存项目ID和名称到store - 使用直接属性赋值
  counterStore.projectId = project.id;
  counterStore.projectName = project.name;

  // 直接跳转到项目控制台页面
  router.push(`/project/${project.id}/console`).catch((err) => {
    if (err.name !== "NavigationDuplicated") {
      console.error("导航错误:", err);
      throw err;
    }
  });
}

// 前往测试项目页面 (Qwen2.5) - 也需要修改
function goToTestProject() {
  console.log("准备跳转到Qwen2.5测试项目");

  // 使用直接属性赋值
  counterStore.projectId = 999;
  counterStore.projectName = "Qwen2.5";

  // 导航到不带ID的路由
  router.push("/project/console").catch((err) => {
    if (err.name !== "NavigationDuplicated") {
      console.error("导航错误:", err);
      throw err;
    }
  });
}

// 退出登录
function onLogout() {
  // 清除token和用户信息
  counterStore.clearUserInfo();
  router.push("/login");
  message.success("已退出登录");
}

// 显示项目设置
async function showProjectSettings(project) {
  currentProject.value = project;
  settingsLoading.value = true;

  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/api/projects/${project.id}/`,
      {
        headers: {
          Authorization: `Bearer ${counterStore.access}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.result === "success") {
      projectForm.value = {
        name: response.data.project.name,
        description: response.data.project.description,
        ai_model_name: response.data.project.ai_model_name,
      };
      settingsVisible.value = true;
    } else {
      message.error("获取项目信息失败");
    }
  } catch (error) {
    console.error("获取项目信息失败:", error);
    message.error("获取项目信息失败，请稍后重试");
  } finally {
    settingsLoading.value = false;
  }
}

// 保存项目设置
async function handleSettingsSave() {
  if (!currentProject.value) return;

  settingsLoading.value = true;
  try {
    const response = await axios.put(
      `http://127.0.0.1:8000/api/projects/${currentProject.value.id}/`,
      {
        name: projectForm.value.name,
        description: projectForm.value.description,
        ai_model_name: projectForm.value.ai_model_name,
      },
      {
        headers: {
          Authorization: `Bearer ${counterStore.access}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.result === "success") {
      message.success("项目更新成功");
      settingsVisible.value = false;
      // 刷新项目列表
      fetchProjects();
    } else {
      message.error(response.data.message || "更新失败");
    }
  } catch (error) {
    console.error("更新项目失败:", error);
    message.error("更新失败，请稍后重试");
  } finally {
    settingsLoading.value = false;
  }
}

// 删除项目确认
function showDeleteConfirm() {
  Modal.confirm({
    title: "确认删除",
    content: "确定要删除该项目吗？此操作不可恢复。",
    okText: "确认删除",
    okType: "danger",
    cancelText: "取消",
    async onOk() {
      try {
        console.log("准备删除项目:", currentProject.value.id);
        const response = await axios.delete(
          `http://127.0.0.1:8000/api/projects/${currentProject.value.id}/`,
          {
            headers: {
              Authorization: `Bearer ${counterStore.access}`,
              "Content-Type": "application/json",
            },
          }
        );

        // 处理成功响应
        if (
          response.status === 204 ||
          (response.data && response.data.result === "success")
        ) {
          message.success("项目已删除");
          settingsVisible.value = false;
          fetchProjects();
        }
      } catch (error) {
        console.error("删除项目失败:", error);

        // 处理特定错误
        if (error.response) {
          if (error.response.status === 500) {
            message.error(
              "删除失败：项目可能包含其他关联数据，请先删除相关数据"
            );
          } else {
            // 尝试从错误响应中获取更多信息
            const errorMessage =
              error.response.data?.detail ||
              error.response.data?.message ||
              "删除失败，请稍后重试";
            message.error(errorMessage);
          }
          console.error("错误详情:", error.response.data);
        } else {
          message.error("删除失败，请检查网络连接");
        }
      }
    },
  });
}

// 组件挂载时获取项目列表
onMounted(() => {
  fetchProjects();
});
</script>

<style scoped>
.home-container {
  width: 100vw;
  height: 100vh;
  display: flex;
}

.full-layout {
  width: 100%;
  height: 100%;
}

.layout-sider {
  background-color: #fff !important;
  display: flex;
  flex-direction: column;
}

.sider-inner {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.logo-area {
  display: flex;
  align-items: center;
  padding: 16px;
  /* 固定高度，确保隐藏时空间保留 */
  min-height: 64px;
}

.hidden {
  visibility: hidden;
}

.logo-icon {
  font-size: 32px;
  color: #fa541c;
  margin-right: 8px;
}

.logo-text {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.menu-top {
  flex: 1;
}

.menu-bottom {
  margin-top: auto;
  padding-bottom: 16px;
}

.version-info {
  text-align: center;
  font-size: 14px;
  color: #999;
  margin-top: 16px;
}

.layout-header {
  background: #fff !important;
  display: flex;
  align-items: center;
  padding: 0 24px;
  height: 64px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  justify-content: space-between;
}

.header-left {
  display: flex;
  align-items: center;
}

.collapse-btn {
  margin-right: 16px;
}

.page-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.header-right {
  display: flex;
  align-items: center;
}

.icon-btn {
  margin-right: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  font-size: 14px;
  color: #333;
}

.layout-content {
  background: #f4f5f7;
  padding: 2%;
  overflow: auto;
  height: calc(100% - 64px);
  box-sizing: border-box;
  position: relative;
}

.layout-sider .ant-menu-inline-collapsed {
  text-align: center;
}

.layout-sider .ant-menu-inline-collapsed .ant-menu-item .anticon {
  margin-right: 0 !important;
}

.project-menu-item {
  position: relative;
}

.project-item-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.more-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: #999;
  cursor: pointer;
  opacity: 0;
  transition: opacity 0.3s;
}

.project-menu-item:hover .more-icon {
  opacity: 1;
}

.delete-section {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}
</style>
