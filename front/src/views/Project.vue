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
            :selected-keys="[activeMenuKey]"
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

            <!-- 父层级：安全评测闭环 -->
            <a-sub-menu key="security-loop">
              <template #icon>
                <SafetyCertificateTwoTone :style="iconStyle" />
              </template>
              <template #title>
                <span class="menu-text">安全评测闭环</span>
              </template>
              <a-menu-item key="safety-overview" @click="goPage('safety-overview')">
                安全总览
              </a-menu-item>
              <a-menu-item key="redteam-runs" @click="goPage('redteam-runs')">
                自适应红队
              </a-menu-item>
              <a-menu-item key="rag-security" @click="goPage('rag-security')">
                RAG 污染评测
              </a-menu-item>
              <a-menu-item key="agent-security" @click="goPage('agent-security')">
                Agent 工具沙箱
              </a-menu-item>
              <a-menu-item key="trace-explorer" @click="goPage('trace-explorer')">
                Trace 风险归因
              </a-menu-item>
            </a-sub-menu>

            <!-- 父层级：个性化防护 -->
            <a-sub-menu key="protection">
              <template #icon>
                <DeploymentUnitOutlined :style="iconStyle" />
              </template>
              <template #title>
                <span class="menu-text">个性化防护</span>
              </template>
              <a-menu-item key="protection-strategy" @click="goPage('protection-strategy')">
                防护策略包
              </a-menu-item>
            </a-sub-menu>

            <!-- 父层级：比赛材料 -->
            <a-sub-menu key="competition">
              <template #icon>
                <FileTextOutlined :style="iconStyle" />
              </template>
              <template #title>
                <span class="menu-text">比赛材料</span>
              </template>
              <a-menu-item key="competition-report" @click="goPage('competition-report')">
                答辩材料包
              </a-menu-item>
            </a-sub-menu>

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
              :selected-keys="[activeMenuKey]"
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
              {{ getPageTitle() }}
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
                  <a-menu-item key="logout" @click="onLogout">
                    退出登录
                  </a-menu-item>
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
          <keep-alive>
            <router-view />
          </keep-alive>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useCounterStore } from "@/stores/counterStore.js";
import { Modal, Input, message } from "ant-design-vue";
import axios from "axios";
import { createVNode, render } from "vue";

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
  ArrowLeftOutlined,
} from "@ant-design/icons-vue";

const router = useRouter();
const route = useRoute();
const counterStore = useCounterStore();
const collapsed = ref(false);
const sidebarWidth = 280;

// 路由与菜单映射关系
const routeToMenuMap = {
  // 控制台
  console: "console",
  "safety-overview": "safety-overview",
  "redteam-runs": "redteam-runs",
  "rag-security": "rag-security",
  "agent-security": "agent-security",
  "trace-explorer": "trace-explorer",
  "protection-strategy": "protection-strategy",
  "competition-report": "competition-report",
  // 测试题库相关
  "testbank-generate": "testbank-generate",
  "testbank-generate-progress": "testbank-generate",
  "testbank-generate-complete": "testbank-generate",
  "testbank-manage": "testbank-manage",
  "testbank-detail": "testbank-manage",
  // 模型测试相关
  "testbank-test": "testbank-test",
  "test-manage": "test-manage",
  "jailbreak-transform": "jailbreak-transform",
  // 模型评估相关
  "perf-eval": "perf-eval",
  // 评估报告相关
  "report-generate": "report-generate",
  "report-manage": "report-manage",
};

// 父菜单映射
const subMenuMap = {
  "safety-overview": "security-loop",
  "redteam-runs": "security-loop",
  "rag-security": "security-loop",
  "agent-security": "security-loop",
  "trace-explorer": "security-loop",
  "protection-strategy": "protection",
  "competition-report": "competition",
  "testbank-generate": "testbank",
  "testbank-manage": "testbank",
  "testbank-test": "modeltest",
  "test-manage": "modeltest",
  "jailbreak-transform": "modeltest",
  "perf-eval": "modeleval",
  "report-generate": "evalreport",
  "report-manage": "evalreport",
};

// 计算当前路由对应的菜单项
const activeMenuKey = computed(() => {
  const path = route.path;
  // 从路径中提取最后一部分作为当前路由名称
  const routeName = path.split("/").pop();
  // 使用映射表找到对应的菜单key
  return routeToMenuMap[routeName] || "console";
});

// 根据当前路由自动设置打开的子菜单
const openKeys = ref([]);
// 根据当前激活的菜单项设置打开的父菜单
watch(
  activeMenuKey,
  (newKey) => {
    const parentKey = subMenuMap[newKey];
    if (parentKey && !openKeys.value.includes(parentKey)) {
      openKeys.value = [...openKeys.value, parentKey];
    }
  },
  { immediate: true }
);

const iconStyle = {
  fontSize: "20px",
  marginRight: "8px",
};
const menuItemStyle = {};

// 获取页面标题
function getPageTitle() {
  const routeName = route.path.split("/").pop();
  return pageTitleMap[routeToMenuMap[routeName]] || "控制台";
}

// 页面标题映射
const pageTitleMap = {
  console: "控制台",
  "safety-overview": "安全总览",
  "redteam-runs": "自适应红队",
  "rag-security": "RAG 污染评测",
  "agent-security": "Agent 工具沙箱",
  "trace-explorer": "Trace 风险归因",
  "protection-strategy": "防护策略包",
  "competition-report": "答辩材料包",
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

function goPage(key) {
  const currentRouteName = route.path.split("/").pop();
  const isProgressPage = currentRouteName === "testbank-generate-progress";
  const isTestPage = currentRouteName === "testbank-test2";

  if (isProgressPage || isTestPage) {
    let inputValue = "";

    Modal.confirm({
      title: "请输入保存的名称",
      content: createVNode("div", {}, [
        createVNode(Input, {
          placeholder: isProgressPage ? "请输入题库名称" : "请输入测评名称",
          "onUpdate:value": (value) => {
            inputValue = value;
          },
        }),
      ]),
      okText: "确认",
      cancelText: "取消",
      onOk: async () => {
        const projectId = route.params.projectId;

        let url, requestData, requestName;

        // 处理 testbank-generate-progress 页面逻辑
        if (isProgressPage) {
          const questionBankId = counterStore.questionBankId;
          const bankName = inputValue;

          if (!projectId || !questionBankId) {
            message.error("缺少必要参数");
            return Promise.reject("缺少参数");
          }

          if (!bankName || bankName.trim() === "") {
            message.error("题库名称不能为空");
            return Promise.reject("题库名称为空");
          }

          url = `http://127.0.0.1:8000/api/question-bank/${projectId}/cancel/`;
          requestData = {
            question_bank_id: questionBankId,
            save_questions: true,
            bank_name: bankName.trim(),
          };
          requestName = "题库生成退出";
        }
        // 处理 testbank-test2 页面逻辑
        else if (isTestPage) {
          const evaluationId = route.query.evaluationId;
          const evaluationName = inputValue;

          if (!projectId || !evaluationId) {
            message.error("缺少必要参数");
            return Promise.reject("缺少参数");
          }

          if (!evaluationName || evaluationName.trim() === "") {
            message.error("测评名称不能为空");
            return Promise.reject("测评名称为空");
          }

          url = `http://127.0.0.1:8000/api/model-evaluation/${projectId}/cancel/`;
          requestData = {
            evaluation_id: parseInt(evaluationId),
            save_evaluation: true,
            evaluation_name: evaluationName.trim(),
          };
          requestName = "模型测评退出";
        }

        // 打印请求信息用于调试
        console.log(`【${requestName}】请求地址:`, url);
        console.log(`【${requestName}】请求头:`, {
          Authorization: `Bearer ${counterStore.access}`,
        });
        console.log(`【${requestName}】发送的数据:`, requestData);

        try {
          const response = await axios.post(url, requestData, {
            headers: {
              Authorization: `Bearer ${counterStore.access}`,
            },
          });

          console.log(`【${requestName}】后端返回的完整数据:`, response.data);

          // ✅ 改为适配实际返回结构的判断方式
          if (
            response.data.status === 200 &&
            response.data.data?.status === "success"
          ) {
            message.success("操作成功");

            setTimeout(() => {
              router.push(`/project/${projectId}/${key}`);
            }, 500);
          } else if (response.data.status === "success") {
            message.success("操作成功");

            setTimeout(() => {
              router.push(`/project/${projectId}/${key}`);
            }, 500);
          } else {
            message.error(
              "提交失败：" +
                (response.data.message ||
                  response.data.data?.message ||
                  "未知错误")
            );
            return Promise.reject("提交失败");
          }
        } catch (error) {
          console.error(`【${requestName}】请求失败:`, error);

          if (error.response) {
            console.error(
              `【${requestName}】服务器响应数据:`,
              error.response.data
            );
            console.error(`【${requestName}】状态码:`, error.response.status);
            message.error(`请求失败：${error.response.status}`);
          } else if (error.request) {
            console.error(
              `【${requestName}】无响应，请求未被接收:`,
              error.request
            );
            message.error("网络错误，请检查连接");
          } else {
            console.error(`【${requestName}】其他错误:`, error.message);
            message.error("请求失败，请重试");
          }

          return Promise.reject(error);
        }
      },
      onCancel: () => {
        console.log("用户取消操作");
      },
    });
  } else {
    // 非特定页面，直接跳转
    const projectId = route.params.projectId;
    if (projectId) {
      router.push(`/project/${projectId}/${key}`);
    } else {
      router.push(`/project/${key}`);
    }
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

// 监听完整路由变化，确保侧边栏反映当前页面
watch(
  () => route.path,
  (newPath) => {
    console.log("路由已变更:", newPath);
    // 自动更新父菜单状态会通过activeMenuKey的计算属性和watcher处理
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
  // 添加项目变更监听
  window.addEventListener("project-changed", handleProjectChange);
});

onUnmounted(() => {
  // 移除事件监听器
  window.removeEventListener("project-changed", handleProjectChange);
});

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
