<template>
  <div class="report-params-container">
    <!-- 顶部标题 + 步骤条 -->
    <div class="header-area">
      <h2 class="page-title">报告生成</h2>
      <a-steps :current="1" class="step-bar">
        <a-step title="选择评估" />
        <a-step title="选择参数" />
        <a-step title="生成报告" />
        <a-step title="报告详情" />
      </a-steps>
    </div>

    <!-- 参数选择区域 -->
    <div class="label-section">
      <h3 class="section-title">选择评估指标：</h3>
      <div class="tag-cloud">
        <div
          v-for="tag in metricOptions"
          :key="tag.value"
          :class="[
            'metric-pill',
            selectedMetrics.includes(tag.value) ? 'selected' : '',
          ]"
          @click="onMetricSelect(tag.value)"
        >
          <span class="pill-label">{{ tag.label }}</span>
          <a-tooltip :title="tag.desc">
            <question-circle-outlined class="tag-tip-icon" />
          </a-tooltip>
          <span v-if="selectedMetrics.includes(tag.value)" class="check-icon">
            <check-outlined />
          </span>
        </div>
      </div>
    </div>

    <!-- 已选指标展示 -->
    <div class="selected-metrics-section" v-if="selectedMetrics.length > 0">
      <h3 class="section-title">已选指标：</h3>
      <div class="selected-tags">
        <div v-for="value in selectedMetrics" :key="value" class="selected-tag">
          {{ getMetricLabel(value) }}
          <close-outlined class="remove-tag" @click="removeMetric(value)" />
        </div>
      </div>
    </div>

    <!-- 底部操作 -->
    <div class="footer-area">
      <a-button type="primary" class="next-btn" @click="goNextStep"
        >下一步</a-button
      >
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import {
  CheckOutlined,
  CloseOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons-vue";

// 获取当前路由参数
const route = useRoute();
const router = useRouter();

// 从上一个页面获取传递的 testId
const testId = ref(route.query.testId);

// 评估指标选项
const metricOptions = ref([
  { label: "毒性", value: "toxicity", desc: "测试模型的毒性程度" },
  { label: "幻觉", value: "hallucination", desc: "测试模型的幻觉产生能力" },
  {
    label: "Token消耗",
    value: "token_consumption",
    desc: "测试模型的Token消耗",
  },
  { label: "金融", value: "finance", desc: "金融领域相关评估" },
  { label: "医疗", value: "medical", desc: "医疗领域相关评估" },
  { label: "教育", value: "education", desc: "教育领域相关评估" },
  { label: "法律", value: "law", desc: "法律领域相关评估" },
  { label: "制造", value: "manufacturing", desc: "制造业相关评估" },
  { label: "能源", value: "energy", desc: "能源领域相关评估" },
  { label: "交通", value: "transportation", desc: "交通领域相关评估" },
  { label: "政务", value: "government", desc: "政务领域相关评估" },
  { label: "传媒", value: "media", desc: "传媒行业相关评估" },
  { label: "零售", value: "retail", desc: "零售行业相关评估" },
]);

// 选中的评估指标
const selectedMetrics = ref([]);

// 标签选择处理函数
function onMetricSelect(value) {
  if (selectedMetrics.value.includes(value)) {
    selectedMetrics.value = selectedMetrics.value.filter(
      (metric) => metric !== value
    );
  } else {
    selectedMetrics.value.push(value);
  }
}

// 移除已选指标
function removeMetric(value) {
  selectedMetrics.value = selectedMetrics.value.filter(
    (metric) => metric !== value
  );
}

// 获取指标标签
function getMetricLabel(value) {
  const metric = metricOptions.value.find((item) => item.value === value);
  return metric ? metric.label : value;
}

// 下一步跳转
function goNextStep() {
  if (!selectedMetrics.value.length) {
    alert("请至少选择一个评估指标！");
    return;
  }

  console.log("选中的评估指标:", selectedMetrics.value);
  console.log("传递的testId:", testId.value);

  // 跳转到下一个界面，并传递testId和选择的评估指标
  router.push({
    path: `/project/${route.params.projectId}/report-generate-progress`,
    query: {
      testId: testId.value,
      metrics: selectedMetrics.value,
    },
  });
}
</script>

<style scoped>
.report-params-container {
  background: #fff;
  padding: 32px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

/* 顶部区域 */
.header-area {
  margin-bottom: 24px;
}
.page-title {
  margin: 0 0 16px;
  font-size: 24px;
  font-weight: 600;
  color: #1f1f1f;
}
.step-bar {
  margin-bottom: 24px;
}

/* 标签选择区域 */
.label-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
}

.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 24px;
}

.metric-pill {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  background: #f5f7fa;
  border-radius: 20px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
  position: relative;
}

.metric-pill:hover {
  background: #e8f0fe;
  color: #1890ff;
}

.metric-pill.selected {
  background: #e6f7ff;
  color: #1890ff;
  border-color: #91d5ff;
}

.tag-tip-icon {
  margin-left: 8px;
  color: #999;
  font-size: 14px;
}

.check-icon {
  margin-left: 8px;
  color: #52c41a;
}

/* 已选指标展示 */
.selected-metrics-section {
  margin: 16px 0 24px;
  padding: 16px;
  background: #fafafa;
  border-radius: 8px;
}

.selected-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.selected-tag {
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  background: #1890ff;
  color: white;
  border-radius: 16px;
  font-size: 14px;
}

.remove-tag {
  margin-left: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.remove-tag:hover {
  color: #ff4d4f;
}

/* 底部操作 */
.footer-area {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}

.next-btn {
  padding: 8px 24px;
  font-size: 16px;
  height: 40px;
  border-radius: 4px;
}
</style>
