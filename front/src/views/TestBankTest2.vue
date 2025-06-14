<template>
  <div class="test-progress-container">
    <!-- 顶部标题 + 进度条 -->
    <div class="header-area">
      <h2 class="page-title">测试执行</h2>
      <a-steps :current="1" class="step-bar">
        <a-step title="选择题库" />
        <a-step title="进行测试" />
        <a-step title="测试完成" />
      </a-steps>
    </div>

    <!-- 中间测试进度显示区域 -->
    <div class="test-progress-area">
      <div class="progress-circle-container">
        <template v-if="!testCompleted">
          <a-progress
            type="circle"
            :percent="Math.floor(testProgress)"
            :width="320"
            :stroke-color="progressColor"
            :stroke-width="10"
            :format="(percent) => `${percent}%`"
          />
          <div class="progress-status">{{ testStatus }}</div>
        </template>
        <template v-else>
          <div class="success-icon">
            <CheckCircleFilled style="font-size: 160px; color: #52c41a" />
            <div class="success-text">测试已完成!</div>
          </div>
        </template>

        <!-- 调试信息 -->
        <div
          class="debug-info"
          style="margin-top: 10px; font-size: 12px; color: #666"
        >
          当前显示进度: {{ testProgress.toFixed(1) }}% | 目标进度:
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
        :disabled="!testCompleted"
      >
        下一步
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import { CheckCircleFilled } from "@ant-design/icons-vue";
import axios from "axios";
import { message } from "ant-design-vue";
import { useCounterStore } from "@/stores/counterStore";

const router = useRouter();
const route = useRoute();
const counterStore = useCounterStore();

const evaluationId = route.query.evaluationId;
const questionBankId = route.query.questionBankId;
const projectId = route.params.projectId;

// 当前显示的进度（动画进度）
const testProgress = ref(1); // 从 1% 开始显示
// 目标进度（从后端获取的进度）
const targetProgress = ref(1);
// 后端返回的原始进度值
const backendProgress = ref(0);
// 测试状态文本
const testStatus = ref("正在准备测试环境...");
// 测试是否完成
const testCompleted = ref(false);
// 轮询定时器
const progressTimer = ref(null);
// 动画定时器
const animationTimer = ref(null);

// 进度颜色
const progressColor = computed(() => {
  if (testProgress.value < 30) return "#ff4d4f";
  if (testProgress.value < 70) return "#faad14";
  return "#52c41a";
});

// 获取测试进度
async function fetchTestProgress() {
  console.log("正在获取测试进度...", { projectId, evaluationId });

  try {
    const response = await axios({
      method: "post",
      url: `http://127.0.0.1:8000/api/model-evaluation/${projectId}/process/`,
      headers: {
        Authorization: `Bearer ${counterStore.access}`,
        "Content-Type": "application/json",
      },
      data: {
        evaluation_id: parseInt(evaluationId),
      },
    });

    console.log("接收到的进度数据:", response.data);

    // 根据你的后端返回格式调整这里的判断条件
    // 假设后端返回格式类似: { status: 'success', progress: 50, message: '...' }
    if (
      response.data.status === "success" &&
      response.data.progress !== undefined
    ) {
      const { progress, status, state, message } = response.data;

      console.log("解析的进度信息:", { progress, status, state, message });

      // 更新后端进度
      backendProgress.value = progress;

      // 设置新的目标进度（确保不小于当前显示进度）
      const newTargetProgress = Math.max(progress, testProgress.value);

      console.log("进度更新:", {
        currentDisplay: testProgress.value,
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
        testStatus.value = message;
      } else {
        updateStatusByProgress(progress);
      }

      // 如果进度达到100%，则测试完成
      if (progress >= 100) {
        targetProgress.value = 100;
        testCompleted.value = true;
        testStatus.value = "测试已完成!";
        stopProgressPolling();
        console.log("测试完成，停止轮询");
      }
    } else {
      console.warn("响应格式不正确或状态不是success:", response.data);
    }
  } catch (error) {
    console.error("获取测试进度失败:", error);
    if (error.response) {
      console.error("错误响应:", error.response.data);
    }
  }
}

// 根据进度更新状态文本
function updateStatusByProgress(progress) {
  if (progress < 30) {
    testStatus.value = "正在初始化测试环境...";
  } else if (progress < 60) {
    testStatus.value = "正在执行测试用例...";
  } else if (progress < 90) {
    testStatus.value = "正在分析测试结果...";
  } else if (!testCompleted.value) {
    testStatus.value = "即将完成测试...";
  }
}

// 开始轮询进度
function startProgressPolling() {
  console.log("开始轮询测试进度...");

  // 立即获取一次进度
  fetchTestProgress();

  // 每3秒轮询一次
  progressTimer.value = setInterval(() => {
    console.log("执行定时轮询...");
    fetchTestProgress();
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
    from: testProgress.value,
    to: targetProgress.value,
  });

  // 如果当前进度已经达到目标进度，无需动画
  if (testProgress.value >= targetProgress.value) {
    console.log("当前进度已达到目标，无需动画");
    return;
  }

  const speed = 0.8; // 动画速度（每100ms增长0.8%）

  animationTimer.value = setInterval(() => {
    if (testProgress.value < targetProgress.value) {
      // 增长进度，但不超过目标值
      testProgress.value = Math.min(
        testProgress.value + speed,
        targetProgress.value
      );

      console.log(
        "进度动画:",
        testProgress.value.toFixed(1),
        "->",
        targetProgress.value
      );
    } else {
      // 达到目标进度，停止动画
      console.log("进度动画完成，当前进度:", testProgress.value);
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

// 请求后端启动测试
async function runTest() {
  try {
    const res = await axios.post(
      `http://localhost:8000/api/model-evaluation/${evaluationId}/run/`,
      {
        question_bank_id: parseInt(questionBankId),
      },
      {
        headers: {
          Authorization: `Bearer ${counterStore.access}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("测试启动响应:", res.data);
    message.success("测试已启动");

    // 启动测试后开始轮询进度
    startProgressPolling();
  } catch (err) {
    console.error("测试启动失败:", err);
    message.error("测试启动失败");
  }
}

function goNextStep() {
  if (testCompleted.value) {
    const projectId = route.params.projectId;

    // 跳转到下一个界面并传递 evaluationId 和 projectId
    router.push({
      path: `/project/${projectId}/testbank-test3`,
      query: {
        evaluationId: evaluationId,
        projectId: projectId,
      },
    });
  }
}

onMounted(() => {
  if (!evaluationId || !questionBankId) {
    message.error("缺少必要参数");
    return;
  }

  console.log("页面加载，参数:", { evaluationId, questionBankId, projectId });

  // 启动测试
  runTest();
});

// 组件销毁前清理定时器
onBeforeUnmount(() => {
  console.log("组件销毁，清理定时器");
  stopProgressPolling();
  stopProgressAnimation();
});
</script>

<style scoped>
.test-progress-container {
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

.test-progress-area {
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
