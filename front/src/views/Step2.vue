<template>
  <div class="step2-content">
    <h2 class="main-title">导入模型</h2>
    <p class="sub-desc">通过 API 以实现模型导入和相关的初始化流程</p>

    <!-- 表单 -->
    <a-form layout="vertical" class="form-area">
      <!-- 模型描述输入框 -->
      <a-form-item label="模型描述">
        <a-input v-model:value="description" placeholder="请输入模型描述" />
      </a-form-item>

      <!-- AI 模型选择 -->
      <a-form-item label="选择 AI 模型">
        <a-select v-model:value="aiModelName">
          <a-select-option
            v-for="model in aiModelOptions"
            :key="model"
            :value="model"
          >
            {{ formatModelDisplayName(model) }}
          </a-select-option>
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
import { ref } from "vue";
import { useCounterStore } from "@/stores/counterStore.js";
import { useRouter } from "vue-router";
import axios from "axios";

// ========== 数据定义 ==========
const counterStore = useCounterStore();
const router = useRouter();

const loading = ref(false); // 加载状态
const description = ref(""); // 输入的模型描述

// 所有可用 AI 模型列表
const aiModelOptions = [
  "glm-4-plus",
  "glm-4-long",
  "glm-4-flash",
  "glm-4",
  "glm-3-turbo",
  "qwen-turbo",
  "qwen-plus",
  "moonshot-v1-8k",
  "moonshot-v1-32k",
  "moonshot-v1-128k",
  "deepseek-chat",
  "deepseek-reasoner",
];

// 默认选中第一个模型
const aiModelName = ref(aiModelOptions[0]);

// ========== 工具函数 ==========
/**
 * 将模型英文名转换为更友好的显示名称
 */
function formatModelDisplayName(modelKey) {
  const displayNames = {
    "glm-4-plus": "GLM-4 Plus",
    "glm-4-long": "GLM-4 Long",
    "glm-4-flash": "GLM-4 Flash",
    "glm-4": "GLM-4",
    "glm-3-turbo": "GLM-3 Turbo",
    "qwen-turbo": "Qwen Turbo",
    "qwen-plus": "Qwen Plus",
    "moonshot-v1-8k": "Moonshot v1 (8K)",
    "moonshot-v1-32k": "Moonshot v1 (32K)",
    "moonshot-v1-128k": "Moonshot v1 (128K)",
    "deepseek-chat": "DeepSeek Chat",
    "deepseek-reasoner": "DeepSeek Reasoner",
  };
  return displayNames[modelKey] || modelKey;
}

// ========== 方法 ==========
/**
 * 提交表单，调用 API 创建项目
 */
async function createModel() {
  console.log("当前 access_token:", counterStore.access);

  if (!counterStore.projectName.trim()) {
    console.warn("项目名称不能为空！");
    return;
  }
  if (!counterStore.access) {
    console.warn("缺少 Access Token，请先赋值！");
    return;
  }

  loading.value = true; // 开始加载

  const requestData = {
    name: counterStore.projectName, // 从 Pinia 读取项目名称
    description: description.value, // 输入的描述
    ai_model_name: aiModelName.value, // 选择的模型
  };

  console.log("请求数据:", requestData);

  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/api/projects/",
      requestData,
      {
        headers: {
          Authorization: `Bearer ${counterStore.access}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("API 响应:", response.data);

    if (response.data.result === "success") {
      const projectId = response.data.project.id;
      counterStore.setProjectId(projectId);
      console.log("项目创建成功，存入 projectId:", projectId);
    } else {
      console.error("项目创建失败:", response.data.message);
    }

    router.push("/home/newproject/step3");
  } catch (error) {
    console.error("API 请求失败:", error.response?.data || error.message);
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
