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
import { ref, computed, onMounted } from "vue";
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

const testProgress = ref(1);
const testStatus = ref("正在准备测试环境...");
const testCompleted = ref(false);
const backendReady = ref(false);

const progressColor = computed(() => {
  if (testProgress.value < 30) return "#ff4d4f";
  if (testProgress.value < 70) return "#faad14";
  return "#52c41a";
});

// 进度动画（与题库生成一致）
function startTestProgress() {
  let timer = null;
  let speed = 1;

  timer = setInterval(() => {
    testProgress.value += speed;

    if (testProgress.value < 30) {
      testStatus.value = "正在初始化测试环境...";
    } else if (testProgress.value < 60) {
      testStatus.value = "正在执行测试用例...";
    } else if (testProgress.value < 90) {
      testStatus.value = "正在分析测试结果...";
    } else {
      testStatus.value = "即将完成测试...";
    }

    if (testProgress.value >= 100) {
      clearInterval(timer);
      testProgress.value = 100;
      if (backendReady.value) {
        testCompleted.value = true;
        testStatus.value = "测试已完成!";
      }
    }
  }, 100);
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

    backendReady.value = true;

    if (testProgress.value >= 100) {
      testCompleted.value = true;
      testStatus.value = "测试已完成!";
    }

    message.success("测试已启动");
    startTestProgress();
  } catch (err) {
    console.error(err);
    message.error("测试启动失败");
  }
}

function goNextStep() {
  if (testCompleted.value) {
    const projectId = route.params.projectId; // 从路由路径中获取 projectId

    // 跳转到下一个界面并传递 evaluationId 和 projectId
    router.push({
      path: `/project/${projectId}/testbank-test3`,
      query: {
        evaluationId: evaluationId, // 传递评测 ID
        projectId: projectId, // 传递项目 ID
      },
    });
  }
}

onMounted(() => {
  if (!evaluationId || !questionBankId) {
    message.error("缺少必要参数");
    return;
  }
  runTest();
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
.footer-area {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
}
.next-btn {
  min-width: 100px;
}
</style>
