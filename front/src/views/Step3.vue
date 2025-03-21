<template>
  <div class="step3-content">
    <h2 class="main-title">模型验证</h2>
    <p class="sub-desc">我们的大模型验证是否可用</p>

    <!-- 垂直步骤条 -->
    <a-steps direction="vertical" class="verify-steps">
      <a-step title="已校验" status="finish" />
      <a-step title="进行中" status="process" />
      <a-step title="待完成" status="wait" />
    </a-steps>

    <div class="bottom-action">
      <a-button type="primary" @click="goNext">下一步</a-button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

function goNext() {
  router.push('/home/newproject/step4')
}
</script>

<style scoped>
.step3-content {
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

.verify-steps {
  margin-bottom: 24px;
}



.bottom-action {
  text-align: right;
}
</style>
