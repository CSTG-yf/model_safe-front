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

            <a-menu-item key="newproject" :style="menuItemStyle" @click="onMenuClick('newproject')">
              <folder-add-outlined :style="iconStyle" />
              <span class="menu-text">New Project</span>
            </a-menu-item>

            <a-menu-item key="deepseek" :style="menuItemStyle" @click="onMenuClick('deepseek')">
              <deployment-unit-outlined :style="iconStyle" />
              <span class="menu-text">DeepSeek</span>
            </a-menu-item>

            <a-menu-item key="qwens" :style="menuItemStyle" @click="goToProject">
              <robot-outlined :style="iconStyle" />
              <span class="menu-text">Qwen2.5</span>
            </a-menu-item>
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
              <a-menu-item key="setting" :style="menuItemStyle" @click="onMenuClick('setting')">
                <setting-outlined :style="iconStyle" />
                <span class="menu-text">设置</span>
              </a-menu-item>

              <a-menu-item key="profile" :style="menuItemStyle" @click="onMenuClick('profile')">
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
                  style="font-size: 20px;"
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
                  <a-menu-item key="logout" @click="onLogout">退出登录</a-menu-item>
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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
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
  UserOutlined
} from '@ant-design/icons-vue'

const router = useRouter()

const collapsed = ref(false)
const sidebarWidth = 280

const selectedKey = ref('')
const openKeys = ref([])

const menuItemStyle = {
  fontSize: '16px',
  lineHeight: '48px',
  height: '48px'
}

const iconStyle = {
  fontSize: '20px',
  marginRight: '8px'
}

function toggleCollapse() {
  collapsed.value = !collapsed.value
}

function onOpenChange(keys) {
  openKeys.value = keys
}

function onMenuClick(key) {
  selectedKey.value = key
  console.log('Menu clicked:', key)
  if (key === 'newproject') {
    router.push('/home/newproject/step1')
  } else if (key === 'search') {
    router.push('/home/searchproject')
  } else {
    router.push(`/home/${key}`)
  }
}

// 单独函数，后续可扩展数据传输逻辑
function goToProject() {
  selectedKey.value = 'qwens'
  console.log('Go to Project triggered')
  router.push('/project/console')
}

function onLogout() {
  console.log('Logout clicked')
  // TODO: 实际退出逻辑
}
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
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
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
