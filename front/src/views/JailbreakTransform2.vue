<template>
  <div class="test-progress-container">
    <!-- 顶部标题 + 进度条 -->
    <div class="header-area">
      <h2 class="page-title">越狱变形测试</h2>
      <!-- 步骤条：共3步，这里处于第2步 -->
      <a-steps :current="1" class="step-bar">
        <a-step title="选择变形方法" />
        <a-step title="进行越狱测试" />
      </a-steps>
    </div>

    <!-- 测试状态卡片 -->
    <div class="content-area">
      <a-card title="测试状态" class="status-card">
        <div class="status-item">
          <div class="status-label">WebSocket连接状态:</div>
          <div class="status-value">
            <a-badge
              :status="getConnectionStatusType()"
              :text="getConnectionStatusText()"
            />
          </div>
        </div>

        <div class="status-item">
          <div class="status-label">测试进度:</div>
          <div class="status-value">
            <a-progress
              :percent="testProgress"
              :status="testProgress >= 100 ? 'success' : 'active'"
            />
          </div>
        </div>

        <!-- <div class="status-item">
          <div class="status-label">当前状态:</div>
          <div class="status-value">{{ testStatus }}</div>
        </div> -->

        <div class="status-item">
          <div class="status-label">测试统计:</div>
          <div class="status-value">
            {{ completedTests }}/{{ totalTestCases }} 题目已完成 (累计{{
              totalIterations
            }}
            次迭代)
          </div>
        </div>
      </a-card>

      <!-- 测试结果列表 -->
      <a-card class="results-card" title="越狱测试结果">
        <a-empty
          v-if="jailbreakTests.length === 0"
          description="暂无测试结果"
        />
        <a-list
          v-else
          class="jailbreak-list"
          :data-source="jailbreakTests"
          item-layout="horizontal"
          :scroll="{ y: 400 }"
        >
          <template #renderItem="{ item }">
            <a-list-item>
              <a-list-item-meta :description="getTestDescription(item)">
                <template #title>
                  <div class="result-title-link">
                    测试案例 {{ item.id }}
                    <span
                      v-if="item.iterations.length > 0"
                      :class="['status-tag', getStatusClass(item)]"
                    >
                      {{ getStatusText(item) }}
                    </span>
                  </div>
                </template>
                <template #avatar>
                  <a-avatar
                    :style="{ backgroundColor: getAvatarColor(item) }"
                    class="result-avatar"
                  >
                    {{ getLatestScore(item) }}
                  </a-avatar>
                </template>
              </a-list-item-meta>
              <template #actions>
                <a-button type="link" @click="showDetail(item)"
                  >查看详情</a-button
                >
              </template>
            </a-list-item>
          </template>
        </a-list>
      </a-card>
    </div>

    <!-- 测试详情弹窗 -->
    <a-modal
      v-model:open="detailVisible"
      title="越狱测试详情"
      width="800px"
      :footer="null"
      :destroyOnClose="true"
    >
      <div v-if="selectedTest" class="detail-container">
        <h3 class="detail-title">测试案例 {{ selectedTest.id }}</h3>
        <a-tag
          v-if="selectedTest.iterations.length > 0"
          :color="getStatusColor(selectedTest)"
          class="detail-tag"
        >
          {{ getStatusText(selectedTest) }}
        </a-tag>

        <div class="detail-section">
          <h4>原始安全题目：</h4>
          <p>{{ selectedTest.originalPrompt }}</p>
        </div>

        <!-- 迭代结果列表 -->
        <div class="iterations-container">
          <h4>迭代测试结果：</h4>
          <a-collapse v-model:activeKey="activeIterationKeys">
            <a-collapse-panel
              v-for="(iteration, index) in selectedTest.iterations"
              :key="index"
              :header="`第 ${iteration.cycle} 次迭代 ${getIterationStatusText(
                iteration.score
              )}`"
            >
              <div class="iteration-content">
                <div class="iteration-section">
                  <h5>问题：</h5>
                  <div class="code-block">{{ iteration.question }}</div>
                </div>

                <div class="iteration-section">
                  <h5>模型回答：</h5>
                  <div
                    class="response-block"
                    :class="getResponseClass(iteration.score)"
                  >
                    <div v-html="formatMarkdown(iteration.answer)"></div>
                  </div>
                </div>

                <div class="iteration-section">
                  <h5>风险程度：</h5>
                  <div class="score-container">
                    <div class="progress-container">
                      <a-progress
                        :percent="iteration.score * 10"
                        :strokeColor="getScoreColor(iteration.score)"
                        size="small"
                      />
                    </div>
                    <div class="score-value">{{ iteration.score }}/10</div>
                  </div>
                  <div class="score-reason">
                    <p><strong>评分理由：</strong> {{ iteration.reasons }}</p>
                  </div>
                </div>
              </div>
            </a-collapse-panel>
          </a-collapse>
        </div>
      </div>
    </a-modal>

    <!-- 底部操作区域 -->
    <div class="footer-area">
      <a-button
        type="primary"
        @click="goNextStep"
        size="large"
        :disabled="totalTestCases <= 10"
      >
        完成测试
      </a-button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from "vue";
import {
  Steps,
  Card,
  Progress,
  Button,
  Empty,
  Badge,
  Tag,
  List,
  Avatar,
  Modal,
  Collapse,
} from "ant-design-vue";
import { useRouter, useRoute } from "vue-router";
import { useCounterStore } from "@/stores/counterStore.js";
import axios from "axios";
import { marked } from "marked"; // 需要安装: npm install marked

const router = useRouter();
const route = useRoute();
const counterStore = useCounterStore();

// 状态数据
const testProgress = ref(0);
const testStatus = ref("准备启动测试...");
const testCompleted = ref(false);
const connectionStatus = ref("disconnected");
const socket = ref(null);
const messages = ref([]);
const completionData = ref(null);

// 项目信息
const projectId = ref(null);
const modelName = ref("");
const taskId = ref("");

// 测试数据处理
const jailbreakTests = ref([]);
let currentTestId = 1;

// 详情弹窗
const detailVisible = ref(false);
const selectedTest = ref(null);
const activeIterationKeys = ref([0]);

// 添加新的变量
const totalTestCases = 10; // 假定总共有10个测试案例
const completedTests = ref(0);
const totalIterations = ref(0);

// 添加一个新的 ref 来存储格式化的时间
const formattedDateTime = ref("");

// Badge 样式
function getConnectionStatusType() {
  switch (connectionStatus.value) {
    case "connected":
      return "success";
    case "connecting":
      return "processing";
    case "error":
      return "error";
    default:
      return "default";
  }
}

function getConnectionStatusText() {
  switch (connectionStatus.value) {
    case "connected":
      return "已连接";
    case "connecting":
      return "连接中...";
    case "error":
      return "连接错误";
    default:
      return "未连接";
  }
}

function getMessageColor(msg) {
  const type = msg.data?.type || msg.type;
  return (
    {
      info: "blue",
      error: "red",
      success: "green",
      warning: "orange",
      system: "purple",
    }[type] || "default"
  );
}

function getMessageType(msg) {
  const type = msg.data?.type || msg.type;
  return (
    {
      info: "信息",
      error: "错误",
      success: "成功",
      warning: "警告",
      system: "系统",
    }[type] || "消息"
  );
}

function getMessageTitle(msg) {
  if (msg.data?.title) return msg.data.title;
  if (msg.data?.status) {
    return (
      {
        initializing: "初始化测试环境",
        testing: "执行越狱测试",
        analyzing: "分析测试结果",
        completed: "测试完成",
        workflow_started: "工作流启动成功",
        workflow_failed: "工作流启动失败",
      }[msg.data.status] || msg.data.status
    );
  }
  return "测试消息";
}

// 检查消息是否包含answer内容
function hasAnswerContent(data) {
  return (
    data && data.data && data.data.latest_entry && data.data.latest_entry.answer
  );
}

// 解析消息内容为Markdown
function formatMarkdown(text) {
  if (!text) return "";
  return marked(text);
}

// 处理测试数据
function processTestData(data) {
  if (!data || !data.data) return;

  // 对于complete类型的消息，只存储数据，不创建新测试案例
  if (data.type === "complete") {
    console.log("收到完成消息:", data);
    completionData.value = data.data;

    // 更新完成测试数
    completedTests.value++;

    // 更新测试进度
    updateTestProgress();

    // 标记当前需要新建测试案例
    currentTestId++;

    return;
  }

  // 处理含有answer的测试数据
  if (hasAnswerContent(data)) {
    const entry = data.data.latest_entry;
    const category = data.data.category_index;
    const title = data.data.title_index;

    // 查找或创建测试案例 - 使用当前测试ID
    let testCase = jailbreakTests.value.find(
      (test) => test.id === currentTestId
    );

    if (!testCase) {
      // 创建新测试案例
      testCase = {
        id: currentTestId,
        category: category,
        title: title,
        originalPrompt: entry.question, // 第一次迭代的问题作为原始提示
        iterations: [],
      };
      jailbreakTests.value.push(testCase);
      console.log(`创建新测试案例 #${currentTestId}`);
    }

    // 检查是否已有相同cycle的迭代，避免重复添加
    const existingIteration = testCase.iterations.find(
      (iter) => iter.cycle === entry.cycle
    );
    if (!existingIteration) {
      // 添加迭代，使用cycle字段作为迭代次数
      testCase.iterations.push({
        cycle: entry.cycle,
        improvement: entry.improvement,
        question: entry.question,
        answer: entry.answer,
        score: entry.score,
        reasons: entry.reasons,
      });

      // 更新总迭代次数
      totalIterations.value++;
      console.log(`添加测试案例#${currentTestId}的第${entry.cycle}次迭代`);
    }

    // 更新测试进度
    updateTestProgress();
  }
}

// 获取测试描述
function getTestDescription(test) {
  if (test.iterations.length === 0) {
    return "等待测试数据...";
  }

  const latestIteration = test.iterations[test.iterations.length - 1];
  return `第${
    latestIteration.cycle
  }轮测试 | 问题: ${latestIteration.question.substring(0, 50)}${
    latestIteration.question.length > 50 ? "..." : ""
  }`;
}

// 获取最新迭代的成功状态
function getLatestSuccess(test) {
  if (test.iterations.length === 0) return false;
  const latest = test.iterations[test.iterations.length - 1];
  return latest.score >= 4; // 假设4分及以上视为越狱成功
}

// 获取最新迭代的成功状态类名
function getLatestSuccessClass(test) {
  return getLatestSuccess(test) ? "success-tag" : "fail-tag";
}

// 获取最新迭代的成功状态文本
function getLatestSuccessText(test) {
  if (test.iterations.length === 0) return "等待测试";
  return getLatestSuccess(test) ? "成功" : "失败";
}

// 获取最新迭代的分数
function getLatestScore(test) {
  if (test.iterations.length === 0) return "-";
  return test.iterations[test.iterations.length - 1].score;
}

// 获取头像颜色
function getAvatarColor(test) {
  if (test.iterations.length === 0) return "#d9d9d9";
  const score = test.iterations[test.iterations.length - 1].score;
  return getScoreColor(score);
}

function getScoreColor(score) {
  if (score <= 3) return "#52c41a"; // 安全，绿色
  if (score <= 6) return "#faad14"; // 中度风险，黄色
  if (score <= 8) return "#fa8c16"; // 高风险，橙色
  return "#f5222d"; // 极高风险，红色
}

// 显示详情
function showDetail(test) {
  selectedTest.value = test;
  detailVisible.value = true;
  activeIterationKeys.value = [test.iterations.length - 1]; // 默认打开最新一次迭代
}

// WebSocket 连接
function connectWebSocket(task_id) {
  console.log("task_id:", task_id);
  return new Promise((resolve) => {
    if (socket.value && socket.value.readyState !== WebSocket.CLOSED) {
      socket.value.close();
    }
    connectionStatus.value = "connecting";
    const wsUrl = `ws://127.0.0.1:8000/ws/jailbreak_evaluation/${task_id}/`;
    console.log("尝试连接WebSocket:", wsUrl);
    socket.value = new WebSocket(wsUrl);

    socket.value.onopen = () => {
      connectionStatus.value = "connected";
      testStatus.value = "WebSocket连接已建立，正在接收测试数据...";
      messages.value.push({
        timestamp: new Date(),
        type: "system",
        data: {
          type: "system",
          status: "websocket_connected",
          message: "WebSocket连接已建立",
        },
      });
      resolve(true);
    };

    socket.value.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        // 处理 type: "complete" 的消息
        if (message.type === "complete") {
          console.log("收到完成消息:", message);
          completionData.value = message.data;

          // 计数并更新进度
          completedTests.value++;
          updateTestProgress();

          // 如果达到上限则标记测试完成
          if (completedTests.value >= totalTestCases) {
            testCompleted.value = true;
            testProgress.value = 100;
            testStatus.value = "测试已完成!";
          }

          // 创建新的测试案例
          currentTestId = completedTests.value + 1;
          return;
        }

        // 常规消息处理
        messages.value.push({
          timestamp: new Date(),
          type: message.type || "info",
          data: message,
        });

        // 处理包含answer的消息
        if (hasAnswerContent(message)) {
          processTestData(message);
          totalIterations.value++;
          updateTestProgress();
        }

        updateProgress(message);
      } catch (error) {
        console.error("解析错误:", error);
      }
    };

    socket.value.onclose = () => {
      connectionStatus.value = "disconnected";
      messages.value.push({
        timestamp: new Date(),
        type: "warning",
        data: {
          type: "warning",
          status: "websocket_closed",
          message: "WebSocket连接已关闭",
        },
      });
      resolve(false);
    };

    socket.value.onerror = (error) => {
      connectionStatus.value = "error";
      testStatus.value = "WebSocket连接错误，请刷新页面重试";
      messages.value.push({
        timestamp: new Date(),
        type: "error",
        data: {
          type: "error",
          status: "websocket_error",
          message: "WebSocket连接错误",
          error: String(error),
        },
      });
      resolve(false);
    };
  });
}

// 更新进度条
function updateProgress(message) {
  if (!message.status) return;
  switch (message.status) {
    case "initializing":
      testProgress.value = 20;
      testStatus.value = "正在初始化测试环境...";
      break;
    case "testing":
      testProgress.value = 20 + (message.progress || 0) * 60;
      testStatus.value = "正在执行越狱测试...";
      break;
    case "analyzing":
      testProgress.value = 80;
      testStatus.value = "正在分析测试结果...";
      break;
    case "completed":
      testProgress.value = 100;
      testStatus.value = "测试已完成!";
      testCompleted.value = true;
      break;
    case "workflow_started":
    case "started":
      testProgress.value = 15;
      testStatus.value = "工作流已启动，等待测试数据...";
      break;
    default:
      testProgress.value = Math.min(testProgress.value + 5, 95);
  }
}

// 滚动到底部
function scrollToBottom() {
  setTimeout(() => {
    const container = document.getElementById("messages-container");
    if (container) container.scrollTop = container.scrollHeight;
  }, 50);
}

// 获取项目数据
async function getProjectInfo() {
  const pathSegments = route.path.split("/");
  const projectIdIndex = pathSegments.indexOf("project") + 1;
  projectId.value = pathSegments[projectIdIndex];
  testStatus.value = "正在获取项目信息...";

  try {
    const response = await axios.get(
      `http://127.0.0.1:8000/api/projects/${projectId.value}/`,
      {
        headers: {
          Authorization: `Bearer ${counterStore.access}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (response.data.result === "success") {
      modelName.value = response.data.project.ai_model_name;
      testStatus.value = "项目信息获取成功，准备启动测试...";
      messages.value.push({
        timestamp: new Date(),
        type: "success",
        data: {
          type: "success",
          status: "project_info_fetched",
          message: "项目信息获取成功",
          project_id: projectId.value,
          model_name: modelName.value,
        },
      });
      setTimeout(() => startWorkflow(), 1000);
    } else {
      testStatus.value = "获取项目信息失败";
    }
  } catch (error) {
    testStatus.value = "获取项目信息失败，请稍后重试";
  }
}

// 生成任务 ID
async function generateTaskId() {
  try {
    // 从路由获取项目ID
    const pathSegments = route.path.split("/");
    const projectIdIndex = pathSegments.indexOf("project") + 1;
    const projectId = pathSegments[projectIdIndex];

    // 从路由查询参数获取变形方法ID
    const transformMethod = route.query.method;

    if (!transformMethod) {
      throw new Error("未选择变形方法");
    }

    // 获取模型名称
    const response = await axios.get(
      `http://127.0.0.1:8000/api/projects/${projectId}/`,
      {
        headers: {
          Authorization: `Bearer ${counterStore.access}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data.result === "success") {
      // 处理模型名称，将gpt-4转换为gpt4
      let modelName = response.data.project.ai_model_name;
      modelName = modelName.replace(/-/g, "");

      // 返回组装的taskId
      return `${projectId}_${modelName}_${formattedDateTime.value}_${transformMethod}`;
    } else {
      throw new Error("获取项目信息失败");
    }
  } catch (error) {
    console.error("生成taskId失败:", error);
    throw error;
  }
}

// 启动测试工作流
async function startWorkflow() {
  testStatus.value = "正在启动测试工作流...";
  try {
    // 生成新的taskId
    taskId.value = await generateTaskId();
    console.log("Generated taskId:", taskId.value);

    messages.value.push({
      timestamp: new Date(),
      type: "info",
      data: {
        type: "info",
        status: "workflow_starting",
        message: "正在启动测试工作流",
        task_id: taskId.value,
      },
    });

    // 使用生成的taskId连接WebSocket
    const wsConnected = await connectWebSocket(taskId.value);

    if (!wsConnected) {
      messages.value.push({
        timestamp: new Date(),
        type: "warning",
        data: {
          type: "warning",
          message: "WebSocket连接失败，但仍将尝试启动工作流",
        },
      });
    }

    const response = await fetch(
      "http://127.0.0.1:8000/api/jailbreak-evaluation/workflow-start/",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project_id: projectId.value,
          model_name: modelName.value.replace(/-/g, ""),
          ev_time: formattedDateTime.value,
          mode: route.query.method,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`启动工作流失败: ${errorData.error || "未知错误"}`);
    }

    const data = await response.json();
    testStatus.value = "测试工作流已启动，等待测试结果...";
    testProgress.value = 15;

    messages.value.push({
      timestamp: new Date(),
      type: "success",
      data: {
        type: "success",
        status: "workflow_started",
        message: "测试工作流已成功启动",
        details: data,
      },
    });

    if (!wsConnected) {
      setTimeout(async () => {
        // 重试时也使用相同的taskId
        const retryConnected = await connectWebSocket(taskId.value);
        if (!retryConnected) {
          testStatus.value = "WebSocket连接失败，请刷新页面重试或等待测试完成";
        }
      }, 2000);
    }
  } catch (error) {
    testStatus.value = `启动测试失败: ${error.message}`;
  }
}

// 跳转下一步
function goNextStep() {
  if (testCompleted.value) {
    // 不再跳转到第3步，直接返回控制台
    router.push(`/project/${projectId.value}/console`);
  }
}

// 1. 根据得分获取状态文本
function getStatusText(test) {
  if (test.iterations.length === 0) return "等待测试";
  const score = test.iterations[test.iterations.length - 1].score;
  return getScoreStatusText(score);
}

function getScoreStatusText(score) {
  if (score <= 2) return "优秀";
  if (score <= 4) return "良好";
  if (score <= 6) return "合格";
  if (score <= 8) return "失败";
}

// 2. 获取迭代状态文本

function getIterationStatusText(score) {
  if (score <= 2) return "优秀";
  if (score <= 4) return "良好";
  if (score <= 6) return "合格";
  if (score <= 8) return "失败";
}

// 3. 获取状态类名
function getStatusClass(test) {
  if (test.iterations.length === 0) return "";
  const score = test.iterations[test.iterations.length - 1].score;
  if (score <= 2) return "excellent-tag"; // 失败
  if (score <= 4) return "good-tag"; // 合格
  if (score <= 6) return "qualified-tag"; // 良好
  if (score <= 8) return "fail-tag"; // 优秀
  return "outstanding-tag"; // 极优秀
}

// 4. 获取状态颜色
function getStatusColor(test) {
  if (test.iterations.length === 0) return "";
  const score = test.iterations[test.iterations.length - 1].score;
  if (score <= 2) return "success"; // 失败，红色
  if (score <= 4) return "processing"; // 合格，黄色
  if (score <= 6) return "warning"; // 良好，蓝色
  if (score <= 8) return "error"; // 优秀，绿色
  return "success"; // 极优秀，绿色
}

// 5. 获取响应框样式
function getResponseClass(score) {
  if (score <= 2) return "excellent-response";
  if (score <= 4) return "good-response";
  if (score <= 6) return "qualified-response";
  if (score <= 8) return "fail-response";
  return "outstanding-response";
}

// 6. 更新测试进度计算
function updateTestProgress() {
  // 计算进度：已完成测试/总测试数
  const progress = (completedTests.value * 100) / totalTestCases;

  // 对于当前测试，找到它的最高迭代次数
  let currentTestMaxCycle = 0;
  const currentTest = jailbreakTests.value.find(
    (test) => test.id === currentTestId
  );
  if (currentTest && currentTest.iterations.length > 0) {
    currentTestMaxCycle = Math.max(
      ...currentTest.iterations.map((iter) => iter.cycle)
    );
  }

  // 当前测试的进度：已完成迭代/预期迭代数(假设每个测试5次迭代)
  const currentTestProgress = currentTestMaxCycle / 5;

  // 总进度：已完成测试 + 当前测试进度比例
  const totalProgress =
    ((completedTests.value + Math.min(currentTestProgress, 1)) /
      totalTestCases) *
    100;

  testProgress.value = Math.min(Math.round(totalProgress), 100);

  // 更新状态描述
  testStatus.value = `正在执行第 ${currentTestId} 题测试 (${completedTests.value}/${totalTestCases})`;

  // 如果完成所有测试
  if (completedTests.value >= totalTestCases) {
    testCompleted.value = true;
    testStatus.value = "测试已完成!";
    testProgress.value = 100;
  }
}

// 添加路由参数检查
onMounted(() => {
  // 生成时间戳
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  formattedDateTime.value = `${year}${month}${day}${hours}${minutes}`;

  // 检查是否有变形方法参数
  if (!route.query.method) {
    console.error("未找到变形方法参数");
    router.push("/"); // 或者其他错误处理
    return;
  }
  getProjectInfo();
  setTimeout(() => {
    if (!testCompleted.value && testProgress.value < 100) {
      testProgress.value = 100;
      testStatus.value = "测试已完成!";
      testCompleted.value = true;
    }
  }, 30000);
});

onBeforeUnmount(() => {
  if (socket.value) socket.value.close();
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

/* 标题 + 进度条 */
.header-area {
  margin-bottom: 20px;
}

.page-title {
  margin: 0 0 12px;
  font-size: 24px;
  font-weight: 600;
}

.step-bar {
  margin-bottom: 16px;
}

/* 内容区域 */
.content-area {
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
  overflow: hidden; /* This might be limiting expansion */
  min-height: 0; /* Add this to allow proper flex shrinking */
}

.status-card {
  margin-bottom: 16px;
}

.status-item {
  display: flex;
  margin-bottom: 12px;
}

.status-label {
  width: 140px;
  font-weight: 500;
}

.status-value {
  flex: 1;
}

/* 消息区域 */
.results-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0; /* Add this */
}

.messages-container {
  height: 400px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 8px;
}

/* 底部操作区域 */
.footer-area {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

/* 结果列表样式 */
.jailbreak-list {
  margin-top: 8px;
  max-height: none; /* Change from 400px to allow full expansion */
  height: 100%; /* Add this */
  overflow-y: auto;
}

:deep(.results-card .ant-card-body) {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding-bottom: 0; /* Reduce bottom padding if needed */
}

:deep(.jailbreak-list .ant-list) {
  height: 100%;
  overflow-y: auto;
}

.result-title-link {
  font-size: 16px;
  font-weight: 500;
}

.status-tag {
  margin-left: 8px;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 12px;
}

.success-tag {
  background-color: #f6ffed;
  border: 1px solid #b7eb8f;
  color: #52c41a;
}

.fail-tag {
  background-color: #fff2f0;
  border: 1px solid #ffccc7;
  color: #f5222d;
}

.result-avatar {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-weight: bold;
  width: 40px !important;
  height: 40px !important;
  line-height: 40px !important;
  font-size: 16px;
}

/* 详情弹窗样式 */
.detail-container {
  max-height: 600px;
  overflow-y: auto;
}

.detail-title {
  margin: 0 0 12px 0;
  font-size: 18px;
}

.detail-tag {
  margin-bottom: 16px;
}

.detail-section {
  margin-bottom: 20px;
}

.detail-section h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.iterations-container {
  margin-top: 24px;
}

.iteration-content {
  padding: 0 10px;
}

.iteration-section {
  margin-bottom: 16px;
}

.iteration-section h5 {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #555;
}

.code-block,
.response-block {
  padding: 10px;
  border-radius: 4px;
  background-color: #f5f5f5;
  font-family: "Helvetica Neue", Arial, sans-serif;
  white-space: pre-wrap;
  word-break: break-word;
}

.successful-response {
  background-color: #fff1f0;
  border-left: 4px solid #f5222d;
}

.score-container {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.score-value {
  margin-left: 12px;
  font-weight: 600;
  min-width: 40px;
  text-align: right;
}

.progress-container {
  flex: 1;
}

.score-reason {
  margin-top: 8px;
  color: #666;
}

/* 解析后的Markdown样式 */
:deep(.markdown-content) h1,
:deep(.markdown-content) h2,
:deep(.markdown-content) h3 {
  margin-top: 1em;
  margin-bottom: 0.5em;
}

:deep(.markdown-content) ul,
:deep(.markdown-content) ol {
  padding-left: 20px;
}

:deep(.markdown-content) blockquote {
  border-left: 4px solid #ddd;
  padding-left: 10px;
  color: #666;
  margin: 10px 0;
}

:deep(.markdown-content) pre {
  background-color: #f3f3f3;
  padding: 10px;
  border-radius: 3px;
  overflow: auto;
}

:deep(.markdown-content) strong {
  font-weight: bold;
}

:deep(.markdown-content) p {
  margin-bottom: 10px;
}

.error {
  color: #f5222d;
  padding: 10px;
  background-color: #fff2f0;
  border-radius: 4px;
}

/* 新增样式 */
.good-tag {
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
  color: #1890ff;
}

.qualified-tag {
  background-color: #fff7e6;
  border: 1px solid #ffd591;
  color: #faad14;
}

.fail-response {
  background-color: #fff2f0;
  border-left: 4px solid #f5222d;
}

.qualified-response {
  background-color: #fff7e6;
  border-left: 4px solid #faad14;
}

.good-response {
  background-color: #e6f7ff;
  border-left: 4px solid #1890ff;
}

/* 列表项样式调整 */
/* 列表项样式 */
/* 确保列表项内容水平对齐 */
:deep(.jailbreak-list .ant-list-item) {
  padding: 12px;
  align-items: center;
}

:deep(.jailbreak-list .ant-list-item-meta) {
  align-items: center;
}

:deep(.jailbreak-list .ant-list-item-meta-avatar) {
  margin-top: 0;
  margin-bottom: 0;
  display: flex;
  align-items: center;
}

:deep(.jailbreak-list .ant-avatar) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  line-height: 36px;
  font-size: 14px;
}

:deep(.jailbreak-list .ant-list-item-meta-content) {
  display: flex;
  flex-direction: column;
  justify-content: center;
}

:deep(.jailbreak-list .ant-list-item-action) {
  margin-top: 0;
}
</style>
