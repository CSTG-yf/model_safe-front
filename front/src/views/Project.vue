<template>
  <div class="project-container">
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
          <!-- 顶部 LOGO 区域：展开时显示，收缩时隐藏 -->
          <div class="logo-area" v-if="!collapsed">
            <SafetyCertificateTwoTone class="logo-icon" />
            <span class="logo-text">大模型观测测评平台</span>
          </div>

          <!-- 导航菜单 -->
          <a-menu
            class="menu-top"
            theme="light"
            mode="inline"
            :inline-collapsed="collapsed"
            :open-keys="openKeys"
            :selected-keys="[selectedKey]"
            @openChange="onOpenChange"
          >
            <!-- 控制台选项 -->
            <a-menu-item
              key="console"
              :style="menuItemStyle"
              @click="goPage('console')"
            >
              <SafetyCertificateTwoTone :style="iconStyle" />
              <span class="menu-text">控制台</span>
            </a-menu-item>

            <!-- 父层级：测试题库 -->
            <a-sub-menu key="testbank">
              <template #icon>
                <SnippetsOutlined :style="iconStyle" />
              </template>
              <template #title>
                <span class="menu-text">测试题库</span>
              </template>
              <a-menu-item
                key="testbank-generate"
                @click="goPage('testbank-generate')"
              >
                题库生成
              </a-menu-item>
              <!-- <a-menu-item
                key="testbank-transform"
                @click="goPage('testbank-extension')"
              >
                题库变形扩展
              </a-menu-item> -->
              <a-menu-item
                key="testbank-manage"
                @click="goPage('testbank-manage')"
              >
                题库管理
              </a-menu-item>
            </a-sub-menu>

            <!-- 父层级：模型测试 -->
            <a-sub-menu key="modeltest">
              <template #icon>
                <ExperimentOutlined :style="iconStyle" />
              </template>
              <template #title>
                <span class="menu-text">模型测试</span>
              </template>
              <a-menu-item key="testbank-test" @click="goPage('testbank-test')">
                测试执行
              </a-menu-item>
              <a-menu-item
                key="jailbreak-transform"
                @click="goPage('jailbreak-transform')"
              >
                越狱变形测试
              </a-menu-item>
              <!-- <a-menu-item key="test-review" @click="goPage('test-review')">
                测试审核
              </a-menu-item> -->
              <a-menu-item key="test-manage" @click="goPage('test-manage')">
                测试管理
              </a-menu-item>
            </a-sub-menu>

            <!-- 父层级：模型评估 -->
            <a-sub-menu key="modeleval">
              <template #icon>
                <DeploymentUnitOutlined :style="iconStyle" />
              </template>
              <template #title>
                <span class="menu-text">模型评估</span>
              </template>
              <a-menu-item key="perf-eval" @click="goPage('perf-eval')">
                模型评估
              </a-menu-item>
              <!-- <a-menu-item key="safe-eval" @click="goPage('safe-eval')">
                安全评估
              </a-menu-item> -->
            </a-sub-menu>

            <!-- 父层级：评估报告 -->
            <a-sub-menu key="evalreport">
              <template #icon>
                <FileTextOutlined :style="iconStyle" />
              </template>
              <template #title>
                <span class="menu-text">评估报告</span>
              </template>
              <a-menu-item
                key="report-generate"
                @click="goPage('report-generate')"
              >
                报告生成
              </a-menu-item>
              <a-menu-item key="report-manage" @click="goPage('report-manage')">
                报告管理
              </a-menu-item>
            </a-sub-menu>
          </a-menu>

          <!-- 底部菜单 -->
          <div class="menu-bottom">
            <a-menu
              theme="light"
              mode="inline"
              :inline-collapsed="collapsed"
              :selected-keys="[selectedKey]"
            >
              <a-menu-item
                key="setting"
                :style="menuItemStyle"
                @click="goPage('setting')"
              >
                <template #icon>
                  <SettingOutlined :style="iconStyle" />
                </template>
                <span class="menu-text">设置</span>
              </a-menu-item>
              <a-menu-item
                key="profile"
                :style="menuItemStyle"
                @click="goPage('profile')"
              >
                <template #icon>
                  <UserOutlined :style="iconStyle" />
                </template>
                <span class="menu-text">个人中心</span>
              </a-menu-item>

              <!-- 添加返回主页按钮 -->
              <a-menu-item
                key="back-to-home"
                :style="menuItemStyle"
                @click="goBackToHome"
              >
                <template #icon>
                  <ArrowLeftOutlined :style="iconStyle" />
                </template>
                <span class="menu-text">返回主页</span>
              </a-menu-item>
            </a-menu>
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
          <div class="header-left">
            <a-button type="text" class="collapse-btn" @click="toggleCollapse">
              <component
                :is="collapsed ? MenuUnfoldOutlined : MenuFoldOutlined"
                style="font-size: 20px"
              />
            </a-button>
            <h2 class="page-title">
              {{ counterStore.projectName || "项目" }} -
              {{ pageTitleMap[selectedKey] || "控制台" }}
            </h2>
          </div>
          <div class="header-right">
            <a-button type="text" class="icon-btn">
              <SearchOutlined />
            </a-button>
            <a-button type="text" class="icon-btn">
              <BellOutlined />
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
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useCounterStore } from "@/stores/counterStore.js";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  SafetyCertificateTwoTone,
  SnippetsOutlined,
  ExperimentOutlined,
  DeploymentUnitOutlined,
  FileTextOutlined,
  SearchOutlined,
  BellOutlined,
  SettingOutlined,
  UserOutlined,
  ToolOutlined,
  ArrowLeftOutlined,
} from "@ant-design/icons-vue";

const router = useRouter();
const route = useRoute();
const counterStore = useCounterStore();

const collapsed = ref(false);
const sidebarWidth = 280;

// 默认选中"控制台"
const selectedKey = ref("console");
const openKeys = ref([]);

const iconStyle = {
  fontSize: "20px",
  marginRight: "8px",
};

// 修复项目内导航，确保保留项目ID
function goPage(key) {
  selectedKey.value = key;
  console.log("跳转到：", key);

  // 获取当前项目ID
  const projectId = route.params.projectId;

  // 构建带有项目ID的路由（如果存在）
  if (projectId) {
    router.push(`/project/${projectId}/${key}`);
  } else {
    // 否则使用不带项目ID的路由（用于Qwen测试项目）
    router.push(`/project/${key}`);
  }
}

function onLogout() {
  console.log("Logout clicked");
  // TODO: 添加实际退出逻辑
}

function toggleCollapse() {
  collapsed.value = !collapsed.value;
}

function onOpenChange(keys) {
  openKeys.value = keys;
}

function goToProject() {
  selectedKey.value = "qwens";
  router.push("/project");
}

// 监听项目切换事件
function handleProjectChange(event) {
  console.log("Project.vue: 检测到项目已切换", event.detail.projectId);
  // 可以在这里进行额外的项目初始化
}

// 监听路由参数变化
watch(
  () => route.params.projectId,
  (newProjectId) => {
    if (newProjectId) {
      console.log("从URL检测到项目ID:", newProjectId);
      // 使用直接属性赋值
      counterStore.projectId = parseInt(newProjectId);
      // 可以在这里加载项目特定数据
    }
  },
  { immediate: true }
);

onMounted(() => {
  // 检查URL参数中是否有项目ID
  if (route.params.projectId) {
    const projectId = parseInt(route.params.projectId);
    console.log("Project.vue: 从URL加载项目ID:", projectId);
    // 使用直接属性赋值
    counterStore.projectId = projectId;
  } else {
    console.log("Project.vue: 使用store中的项目ID:", counterStore.projectId);
  }
});

onUnmounted(() => {
  // 移除事件监听器
  window.removeEventListener("project-changed", handleProjectChange);
});

// 页面标题映射
const pageTitleMap = {
  console: "控制台",
  "testbank-generate": "题库生成",
  "testbank-manage": "题库管理",
  "testbank-extension": "题库变形扩展",
  "testbank-test": "测试执行",
  "jailbreak-transform": "越狱变形测试",
  "test-manage": "测试管理",
  "perf-eval": "模型评估",
  "report-generate": "报告生成",
  "report-manage": "报告管理",
};

function goBackToHome() {
  console.log("返回主页");
  router.push("/home");
}
</script>

<style scoped>
.project-container {
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
  min-height: 64px;
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
</style>
