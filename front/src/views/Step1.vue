<template>
  <div class="step-content">
    <h2 class="main-title">创建项目</h2>
    <p class="sub-desc">请输入项目名称并存入 Pinia</p>

    <a-form layout="vertical" class="form-area">
      <a-form-item label="项目名称">
        <a-input
            :value="counterStore.projectName"
            placeholder="请输入项目名称"
            @change="handleInputChange" />
      </a-form-item>

      <a-button type="primary" @click="createProject">创建</a-button>
    </a-form>

  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useCounterStore } from '@/stores/counterStore.js'

const router = useRouter()
const counterStore = useCounterStore()

// 监听输入框变化并存入 Pinia
function handleInputChange(event) {
  counterStore.updateProjectName(event.target.value);
}

// 提交时跳转到 Step2
function createProject() {
  if (!counterStore.projectName.trim()) {
    console.warn('项目名称不能为空！');
    return;
  }

  console.log('创建项目，存入 Pinia:', counterStore.projectName);
  router.push('/home/newproject/step2');
}
</script>

<style scoped>
.step-content {
  width: 100%;
  padding: 16px;
  box-sizing: border-box;
}

.main-title {
  font-size: 32px;
  font-weight: 700;
  margin: 0 0 8px 0;
  color: #1890ff;
}

.sub-desc {
  margin: 0 0 24px 0;
  color: #666;
}

.form-area {
  max-width: 400px;
}
</style>
