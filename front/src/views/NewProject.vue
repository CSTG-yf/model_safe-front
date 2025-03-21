<template>
  <div class="new-project-container">
    <!-- 1) 最上面一行：Setup 更大字体 -->
    <h1 class="setup-title">Setup</h1>

    <!-- 2) 4 步骤进度条（a-steps） -->
    <a-steps :current="currentStep" class="steps-bar">
      <a-step title="创建项目" />
      <a-step title="导入模型" />
      <a-step title="模型验证" />
      <a-step title="邀请成员" />
    </a-steps>

    <!-- 3) 中间区域：router-view 加载 Step1～Step4 -->
    <div class="wizard-content">
      <router-view />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const currentStep = ref(0)

// 根据子路由 step1/step2/step3/step4 设置 currentStep
watch(
    () => route.path,
    (newPath) => {
      if (newPath.includes('step1')) currentStep.value = 0
      else if (newPath.includes('step2')) currentStep.value = 1
      else if (newPath.includes('step3')) currentStep.value = 2
      else if (newPath.includes('step4')) currentStep.value = 3
    },
    { immediate: true }
)
</script>

<style scoped>
.new-project-container {
  width: 100%;
  height: 100%;
  background: #fff;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  /* 保留父级( HomeView ) .layout-content 的 padding: 2%; 不动 */
  padding: 2%;
}

/* 顶部大标题 Setup */
.setup-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: #333;
}

/* 步骤条 */
.steps-bar {
  margin-bottom: 24px;
  /* 可视需求，若想与顶部间距大一些可加 margin-top: 16px; */
}

/* 中间内容 */
.wizard-content {
  flex: 1;
  /* 留一些内边距让内容不贴边 */
  padding: 16px;
  box-sizing: border-box;
  /* 若需要阴影或边框可加 */
}
</style>
