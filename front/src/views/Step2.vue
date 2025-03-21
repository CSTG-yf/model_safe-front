<template>
  <div class="step2-content">
    <h2 class="main-title">导入模型</h2>
    <p class="sub-desc">通过 API 以实现模型导入和相关的初始化流程</p>

    <!-- 表单 -->
    <a-form layout="vertical" class="form-area">
      <!-- 描述输入框 -->
      <a-form-item label="模型描述">
        <a-input v-model="description" placeholder="请输入模型描述" />
      </a-form-item>

      <!-- AI 模型选择 -->
      <a-form-item label="选择 AI 模型">
        <a-select v-model="aiModelName">
          <a-select-option value="gpt-4">GPT-4</a-select-option>
        </a-select>
      </a-form-item>

      <!-- 创建按钮 -->
      <a-button type="primary" :loading="loading" @click="createModel">
        {{ loading ? "创建中..." : "创建" }}
      </a-button>
    </a-form>
  </div>
</template>

<script setup>
import {ref} from "vue";
import {useCounterStore} from '@/stores/counterStore.js'
import {useRouter} from 'vue-router'
import axios from 'axios'

const counterStore = useCounterStore()
const loading = ref(false) // 加载状态
const description = ref('') // 输入的模型描述
const aiModelName = ref('gpt-4') // 选择的 AI 模型
const router = useRouter()

// 发送 API 请求
async function createModel() {
  console.log("当前 access_token:", counterStore.access);

  if (!counterStore.projectName.trim()) {
    console.warn('项目名称不能为空！')
    return
  }
  if (!counterStore.access) {
    console.warn('缺少 Access Token，请先赋值！')
    return
  }

  loading.value = true; // 开始加载

  const requestData = {
    name: counterStore.projectName, // 从 Pinia 读取项目名称
    description: description.value, // 输入的描述
    ai_model_name: aiModelName.value, // 选择的模型
  }

  try {
    const response = await axios.post(
        'http://127.0.0.1:8000/api/projects/', // 你的 API 地址
        requestData,
        {
          headers: {
            Authorization: `Bearer ${counterStore.access}`, // 使用 Pinia 里的 Token
            'Content-Type': 'application/json',
          },
        }
    )

    console.log('API 响应:', response.data)

    if (response.data.result === "success") {
      const projectId = response.data.project.id;
      counterStore.setProjectId(projectId); // 存入 Pinia
      console.log('项目创建成功，存入 projectId:', projectId);
    } else {
      console.error('项目创建失败:', response.data.message);
    }
    router.push('/home/newproject/step3');

  } catch (error) {
    console.error('API 请求失败:', error.response?.data || error.message);
  } finally {
    loading.value = false; // 结束加载
  }
}
</script>

<style scoped>
.step2-content {
  width: 100%;
  padding: 16px;
  box-sizing: border-box;
  background: #fff;
}

/* 大标题 */
.main-title {
  font-size: 32px;
  font-weight: 700;
  color: #1890ff;
  margin: 0 0 8px 0;
}

/* 描述 */
.sub-desc {
  margin: 0 0 24px 0;
  color: #666;
}

/* 表单 */
.form-area {
  max-width: 400px;
}
</style>
