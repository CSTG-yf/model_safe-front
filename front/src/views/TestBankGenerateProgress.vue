<template>
  <div class="generate-progress-container">
    <!-- 顶部标题 + 进度条 -->
    <div class="header-area">
      <h2 class="page-title">题库生成</h2>
      <!-- 步骤条：共3步，这里处于第2步 -->
      <a-steps :current="1" class="step-bar">
        <a-step title="设置题库参数" />
        <a-step title="生成题库" />
        <a-step title="生成完成" />
      </a-steps>
    </div>

    <!-- 中间生成进度显示区域 -->
    <div class="generate-progress-area">
      <div class="progress-circle-container">
        <!-- 生成中显示进度圈，生成完成显示成功图标 -->
        <template v-if="!generateCompleted">
          <a-progress
            type="circle"
            :percent="Math.floor(generateProgress)"
            :width="320"
            :stroke-color="progressColor"
            :stroke-width="10"
            :format="(percent) => `${percent}%`"
          />
          <div class="progress-status">{{ generateStatus }}</div>
        </template>
        <template v-else>
          <div class="success-icon">
            <CheckCircleFilled style="font-size: 160px; color: #52c41a" />
            <div class="success-text">题库生成已完成!</div>
          </div>
        </template>

        <!-- 调试信息 -->
        <div
          class="debug-info"
          style="margin-top: 10px; font-size: 12px; color: #666"
        >
          当前显示进度: {{ generateProgress.toFixed(1) }}% | 目标进度:
          {{ targetProgress }}% | 后端进度: {{ backendProgress }}%
        </div>
      </div>
    </div>

    <!-- 底部操作区域 -->
    <div class="footer-area">
      <a-button
        type="primary"
        class="next-btn"
        @click="goNextStep"
        :disabled="!generateCompleted"
      >
        下一步
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { CheckCircleFilled } from "@ant-design/icons-vue";
import { useRouter, useRoute } from "vue-router";
import { useCounterStore } from "@/stores/counterStore.js";
import axios from "axios";
import { message } from "ant-design-vue";

const router = useRouter();
const route = useRoute();
const counterStore = useCounterStore();

// 当前显示的进度（动画进度）
const generateProgress = ref(1); // 从 1% 开始显示
// 目标进度（从后端获取的进度）
const targetProgress = ref(1);
// 后端返回的原始进度值
const backendProgress = ref(0);
// 生成状态文本
const generateStatus = ref("正在初始化题库生成...");
// 生成是否完成
const generateCompleted = ref(false);
// 轮询定时器
const progressTimer = ref(null);
// 动画定时器
const animationTimer = ref(null);

// 进度颜色
const progressColor = computed(() => {
  if (generateProgress.value < 30) return "#ff4d4f";
  if (generateProgress.value < 70) return "#faad14";
  return "#52c41a";
});

// 获取生成进度
// 获取生成进度
async function fetchGenerateProgress() {
  const projectId = route.params.projectId;
  const questionBankId = counterStore.questionBankId;

  console.log("正在获取生成进度...", { projectId, questionBankId });

  try {
    const response = await axios({
      method: "post",
      url: `http://127.0.0.1:8000/api/question-bank/${projectId}/progress/`,
      headers: {
        Authorization: `Bearer ${counterStore.access}`,
        "Content-Type": "application/json",
      },
      data: {
        question_bank_id: questionBankId,
      },
    });

    console.log("接收到的进度数据:", response.data);

    // 修复：检查 status 是否为 'success'，而不是数字 0
    if (
      response.data.status === "success" &&
      response.data.progress !== undefined
    ) {
      const { progress, status, state, message } = response.data;

      console.log("解析的进度信息:", { progress, status, state, message });

      // 更新后端进度
      backendProgress.value = progress;

      // 设置新的目标进度（确保不小于当前显示进度）
      const newTargetProgress = Math.max(progress, generateProgress.value);

      console.log("进度更新:", {
        currentDisplay: generateProgress.value,
        backendProgress: progress,
        oldTarget: targetProgress.value,
        newTarget: newTargetProgress,
      });

      // 只有当新目标大于当前目标时才更新并启动动画
      if (newTargetProgress > targetProgress.value) {
        targetProgress.value = newTargetProgress;
        startProgressAnimation();
      }

      // 更新状态文本
      if (message) {
        generateStatus.value = message;
      } else {
        updateStatusByProgress(progress);
      }

      // 如果进度达到100%，则生成完成
      if (progress >= 100) {
        targetProgress.value = 100;
        generateCompleted.value = true;
        generateStatus.value = "题库生成已完成!";
        stopProgressPolling();
        console.log("题库生成完成，停止轮询");
      }
    } else {
      console.warn("响应格式不正确或状态不是success:", response.data);
    }
  } catch (error) {
    console.error("获取生成进度失败:", error);
    if (error.response) {
      console.error("错误响应:", error.response.data);
    }
  }
}

// 根据进度更新状态文本
function updateStatusByProgress(progress) {
  if (progress < 30) {
    generateStatus.value = "正在初始化题库生成环境...";
  } else if (progress < 60) {
    generateStatus.value = "正在根据知识点生成题目...";
  } else if (progress < 90) {
    generateStatus.value = "正在优化题目质量...";
  } else if (!generateCompleted.value) {
    generateStatus.value = "即将完成题库生成...";
  }
}

// 开始轮询进度
function startProgressPolling() {
  console.log("开始轮询进度...");

  // 立即获取一次进度
  fetchGenerateProgress();

  // 每3秒轮询一次
  progressTimer.value = setInterval(() => {
    console.log("执行定时轮询...");
    fetchGenerateProgress();
  }, 3000);
}

// 停止轮询进度
function stopProgressPolling() {
  if (progressTimer.value) {
    console.log("停止进度轮询");
    clearInterval(progressTimer.value);
    progressTimer.value = null;
  }
}

// 启动进度动画（从当前进度增长到目标进度）
function startProgressAnimation() {
  // 先停止之前的动画
  stopProgressAnimation();

  console.log("启动进度动画", {
    from: generateProgress.value,
    to: targetProgress.value,
  });

  // 如果当前进度已经达到目标进度，无需动画
  if (generateProgress.value >= targetProgress.value) {
    console.log("当前进度已达到目标，无需动画");
    return;
  }

  const speed = 0.8; // 动画速度（每100ms增长0.8%）

  animationTimer.value = setInterval(() => {
    if (generateProgress.value < targetProgress.value) {
      // 增长进度，但不超过目标值
      generateProgress.value = Math.min(
        generateProgress.value + speed,
        targetProgress.value
      );

      console.log(
        "进度动画:",
        generateProgress.value.toFixed(1),
        "->",
        targetProgress.value
      );
    } else {
      // 达到目标进度，停止动画
      console.log("进度动画完成，当前进度:", generateProgress.value);
      stopProgressAnimation();
    }
  }, 100); // 每100ms更新一次
}

// 停止进度动画
function stopProgressAnimation() {
  if (animationTimer.value) {
    console.log("停止进度动画");
    clearInterval(animationTimer.value);
    animationTimer.value = null;
  }
}

// 跳转到下一步
function goNextStep() {
  if (generateCompleted.value) {
    const projectId = route.params.projectId;
    const questionBankId = counterStore.questionBankId;

    router.push({
      path: `/project/${projectId}/testbank-generate-complete`,
      query: { questionBankId },
    });
  }
}

// 页面加载时自动开始生成
onMounted(async () => {
  const projectId = route.params.projectId;
  const questionBankId = counterStore.questionBankId;

  console.log("页面加载，参数:", { projectId, questionBankId });

  if (!projectId || !questionBankId) {
    message.error("缺少必要参数");
    return;
  }

  // 开始轮询进度
  startProgressPolling();

  try {
    console.log("准备发送题库生成请求...");

    // 发送题库生成请求
    const response = await axios({
      method: "post",
      url: `http://127.0.0.1:8000/api/question-bank/${projectId}/generate/`,
      headers: {
        Authorization: `Bearer ${counterStore.access}`,
        "Content-Type": "application/json",
      },
      data: {
        field: route.query.field,
        prompt: route.query.prompt,
        number: parseInt(route.query.number),
        security_ratio: JSON.parse(route.query.security_ratio),
        question_bank_id: questionBankId,
      },
    });

    console.log("后端响应数据:", response.data);
  } catch (error) {
    console.error("题库生成请求失败:", error);

    if (error.response) {
      console.error("错误状态码:", error.response.status);
      console.error("错误响应数据:", error.response.data);
      message.error(
        `请求失败: ${error.response.status} - ${
          error.response.data.message || error.response.statusText
        }`
      );
    } else {
      message.error(error.message || "请求失败");
    }
  }
});

// 组件销毁前清理定时器
onBeforeUnmount(() => {
  console.log("组件销毁，清理定时器");
  stopProgressPolling();
  stopProgressAnimation();
});
</script>

<style scoped>
.generate-progress-container {
  background: #fff;
  padding: 24px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  height: 100%;
  display: flex;
  flex-direction: column;
}

.header-area {
  margin-bottom: 40px;
}

.page-title {
  margin: 0 0 12px;
  font-size: 24px;
  font-weight: 600;
}

.step-bar {
  margin-bottom: 16px;
}

.generate-progress-area {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 40px;
}

.progress-circle-container {
  text-align: center;
  position: relative;
}

.progress-status {
  margin-top: 20px;
  font-size: 18px;
  color: #666;
}

.success-icon {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.success-text {
  margin-top: 20px;
  font-size: 24px;
  font-weight: 600;
  color: #52c41a;
}

.debug-info {
  margin-top: 10px;
  font-size: 12px;
  color: #999;
  max-width: 400px;
  word-wrap: break-word;
}

.footer-area {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
}

.next-btn {
  min-width: 100px;
}
</style>
