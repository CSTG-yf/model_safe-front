<template>
  <div class="head">
    <a-steps :current="3" class="step-bar">
      <a-step title="选择题库" />
      <a-step title="变形方法" />
      <a-step title="进行预览" />
      <a-step title="完成" />
    </a-steps>
  </div>
  <div class="container">
    <a-result
        status="success"
        title="生成完成"
        sub-title="您的内容已成功生成，您可以选择返回仪表盘或进入题库。"
    />
    <div class="button-group">
      <a-button type="primary" @click="goToDashboard">返回仪表盘</a-button>
      <a-button type="default" @click="goToQuestionBank">进入题库</a-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const goToDashboard = () => {
  router.push("/project/console");
};

const goToQuestionBank = () => {
  router.push("/question-bank");
};
</script>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 80vh; /* 让内容适当居中，但不会填满整个屏幕 */
  text-align: center;
  padding: 20px;
}

.button-group {
  margin-top: 16px;
  display: flex;
  gap: 12px;
}
</style>
