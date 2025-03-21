<template>
  <div class="step-container">
    <a-steps :current="currentStep" class="steps">
      <a-step title="选择题库" />
      <a-step title="变形方法" />
      <a-step title="进行预览" />
      <a-step title="扩展完成" />
    </a-steps>

    <div class="content">
      <h3 class="section-title">选择变形方法</h3>

      <!-- 选择变形方法下拉框 -->
      <div class="form-group">
        <label for="methodSelect">变形方法：</label>
        <a-select v-model="selectedMethod" placeholder="请选择变形方法" size="large" :options="methodOptions" required>
          <a-select-option v-for="option in methodOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </a-select-option>
        </a-select>
      </div>

      <!-- 变形方法的介绍展示 -->
      <div v-if="selectedMethod" class="form-group">
        <h4 class="bold-text">
          {{ selectedMethod === 'method1' ? '变形方法1的介绍' : selectedMethod === 'method2' ? '变形方法2的介绍' : '变形方法3的介绍' }}
        </h4>
        <p>
          {{ selectedMethod === 'method1' ? '变形方法1的详细说明。' : selectedMethod === 'method2' ? '变形方法2的详细说明。' : '变形方法3的详细说明。' }}
        </p>
      </div>

      <!-- 样例题目展示 -->
      <div v-if="selectedMethod" class="form-group">
        <div class="question-container">
          <div class="question-box">
            <label>原始题目</label>
            <p class="sample-text">这是原始题目的示例文本。</p>
          </div>
          <div class="arrow">
            <span>➡</span>
          </div>
          <div class="question-box">
            <label>变形后的题目</label>
            <p class="sample-text">这是变形后题目的示例文本。</p>
          </div>
        </div>
      </div>

      <!-- 下一步按钮 -->
      <div class="form-group next-step-container">
        <a-button type="primary" @click="goNextStep" size="large" block :disabled="!selectedMethod">
          选择完成，下一步
        </a-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
// 导入所需的组件
import { Steps, Select, Button } from 'ant-design-vue';

const { Option } = Select;

const currentStep = ref(1);  // 当前步骤
const selectedMethod = ref('');  // 默认没有选中
const methodOptions = [
  { value: 'method1', label: '变形方法1' },
  { value: 'method2', label: '变形方法2' },
  { value: 'method3', label: '变形方法3' }
];

const router = useRouter();

onMounted(() => {
  // 设置默认选择方法时，展示对应内容
  selectedMethod.value = 'method1';
});

function goNextStep() {
  if (!selectedMethod.value) {
    alert('请先选择一个变形方法！');
    return;
  }
  // 跳转到下一步路由
  router.push('/project/testbank-extension3');
}
</script>

<style scoped>
.step-container {
  padding: 24px;
  background: #fff; /* 背景设置为白色 */
}

.steps {
  margin-bottom: 20px;
}

.section-title {
  font-size: 24px;
  color: #1890ff; /* 蓝色字体 */
  font-weight: bold;
  margin-bottom: 20px;
}

.bold-text {
  font-weight: bold; /* 加粗字体 */
  font-size: 18px;
}

.form-group {
  margin-bottom: 16px;
}

label {
  display: block;
  margin-bottom: 8px;
}

a-select {
  width: 100%;
}

a-button {
  width: 100%;
}

.question-container {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}

.question-box {
  width: 45%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  height: 150px; /* 提高框的高度 */
  overflow-y: auto; /* 如果内容超出框，显示滚动条 */
}

.arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #000;
}

.sample-text {
  font-size: 16px;
  color: #333;
}

/* 下一步按钮放置在白色区域的右下角 */
.next-step-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>
