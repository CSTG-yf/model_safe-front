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
          <div v-if="lastWsMessage" class="ws-debug">
            最近WebSocket消息: {{ JSON.stringify(lastWsMessage) }}
          </div>
        </template>
        <template v-else>
          <div class="success-icon">
            <CheckCircleFilled style="font-size: 160px; color: #52c41a" />
            <div class="success-text">题库生成已完成!</div>
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

// 生成进度
const generateProgress = ref(1); // 从 1% 开始
// 生成状态文本
const generateStatus = ref("正在生成题库...");
// 生成是否完成
const generateCompleted = ref(false);
// WebSocket连接
const webSocket = ref(null);
// 最近接收的WebSocket消息
const lastWsMessage = ref(null);

// 进度颜色
const progressColor = computed(() => {
  if (generateProgress.value < 30) return "#ff4d4f";
  if (generateProgress.value < 70) return "#faad14";
  return "#52c41a";
});

// 处理WebSocket消息
function handleWebSocketMessage(event) {
  try {
    // 记录原始消息
    console.log("WebSocket 原始消息:", event.data);

    const data = JSON.parse(event.data);

    // 更新最近接收的消息显示
    lastWsMessage.value = data;

    // 详细记录数据结构，便于调试
    console.log("WebSocket 数据结构分析:", {
      数据类型: typeof data,
      完整数据: data,
      字段列表: Object.keys(data),
      字段值: Object.values(data),
    });

    // 根据分析的数据结构适配UI更新
    // 仅当确认后端数据结构后再取消注释下面代码

    /*
    // 假设数据格式为 { progress: 50, message: "正在生成题库...", completed: false }
    if (data.progress !== undefined) {
      generateProgress.value = parseFloat(data.progress);
    }
    
    if (data.message) {
      generateStatus.value = data.message;
    }
    
    if (data.completed === true) {
      generateCompleted.value = true;
      generateProgress.value = 100;
      generateStatus.value = "题库生成已完成!";
    }
    */
  } catch (error) {
    console.error("WebSocket 消息解析错误:", error);
  }
}

// 跳转到下一步
function goNextStep() {
  if (generateCompleted.value) {
    const projectId = route.params.projectId;
    const questionBankId = counterStore.questionBankId;

    // 跳转并传递 questionBankId 作为查询参数
    router.push({
      path: `/project/${projectId}/testbank-generate-complete`,
      query: { questionBankId }, // 将 questionBankId 作为查询参数传递
    });
  }
}

// 连接WebSocket
function connectWebSocket(taskId) {
  // 构建WebSocket URL
  const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${wsProtocol}//127.0.0.1:8000/ws/jailbreak_evaluation/${taskId}/`;

  console.log("正在连接WebSocket:", wsUrl);
  console.log("使用的任务ID:", taskId);

  // 创建WebSocket连接
  webSocket.value = new WebSocket(wsUrl);

  // 设置WebSocket事件处理器
  webSocket.value.onopen = () => {
    console.log("WebSocket 连接已建立");
    message.success("实时进度连接已建立");
    // 可以在这里发送初始请求
    // webSocket.value.send(JSON.stringify({ action: 'start' }));
  };

  webSocket.value.onmessage = handleWebSocketMessage;

  webSocket.value.onerror = (error) => {
    console.error("WebSocket 错误:", error);
    message.error("实时进度连接失败，将使用模拟进度");
    // 连接失败时回退到模拟进度
    startGenerateProgress();
  };

  webSocket.value.onclose = (event) => {
    console.log("WebSocket 连接已关闭", event.code, event.reason);
    if (!event.wasClean) {
      message.warn("实时进度连接意外断开，将使用模拟进度");
      startGenerateProgress();
    }
  };
}

// 模拟生成进度（备用方案）
function startGenerateProgress() {
  let timer = null;
  let speed = 1; // 进度条增速

  timer = setInterval(() => {
    // 进度增量，每次加1，模拟一个加载进度
    generateProgress.value += speed;

    // 更新状态文本
    if (generateProgress.value < 30) {
      generateStatus.value = "正在初始化题库生成环境...";
    } else if (generateProgress.value < 60) {
      generateStatus.value = "正在根据知识点生成题目...";
    } else if (generateProgress.value < 90) {
      generateStatus.value = "正在优化题目质量...";
    } else {
      generateStatus.value = "即将完成题库生成...";
    }

    // 当进度达到100%时停止
    if (generateProgress.value >= 100) {
      clearInterval(timer);
      generateProgress.value = 100;
      generateCompleted.value = true;
    }
  }, 100); // 每100ms更新一次进度

  return timer;
}

// 关闭WebSocket连接
function closeWebSocket() {
  if (webSocket.value && webSocket.value.readyState === WebSocket.OPEN) {
    webSocket.value.close();
  }
}

// 页面加载时自动开始生成进度
onMounted(async () => {
  const projectId = route.params.projectId;
  const questionBankId = counterStore.questionBankId;

  if (!projectId || !questionBankId) {
    message.error("缺少必要参数");
    return;
  }

  try {
    // 构建任务ID（根据后端格式）
    const taskId = `${projectId}`;

    // 连接WebSocket获取实时进度
    connectWebSocket(taskId);

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
        task_id: taskId, // 添加taskId参数用于WebSocket连接
      },
    });

    console.log("后端响应数据:", response.data);

    // 如果WebSocket失败且后端返回成功，直接标记为完成
    if (response.data.status === "success" && !generateCompleted.value) {
      generateCompleted.value = true;
      generateProgress.value = 100;
      generateStatus.value = "题库生成已完成!";
    }
  } catch (error) {
    console.error("题库生成请求失败:", error);
    message.error(error.message || "请求失败");
    // 请求失败时启动模拟进度
    startGenerateProgress();
  }
});

// 组件销毁前关闭WebSocket连接
onBeforeUnmount(() => {
  closeWebSocket();
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

/* 标题 + 进度条 */
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

/* 生成进度区域 */
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

.ws-debug {
  margin-top: 10px;
  font-size: 12px;
  color: #999;
  max-width: 320px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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

/* 底部按钮区域 */
.footer-area {
  display: flex;
  justify-content: flex-end;
  margin-top: auto;
}

.next-btn {
  min-width: 100px;
}
</style>
