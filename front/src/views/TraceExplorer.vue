<template>
  <div class="trace-page">
    <div class="page-head">
      <div>
        <h2>Trace 风险归因</h2>
        <p>查看每次评测的输入、检索、模型输出、工具调用、裁判结果和风险证据。</p>
      </div>
      <a-space>
        <a-select v-model:value="scenarioType" allow-clear placeholder="场景" style="width: 170px">
          <a-select-option value="jailbreak">自适应红队</a-select-option>
          <a-select-option value="rag">RAG 污染</a-select-option>
          <a-select-option value="agent">Agent 工具</a-select-option>
          <a-select-option value="regression">回归验证</a-select-option>
        </a-select>
        <a-button type="primary" :loading="loading" @click="loadTraces">查询</a-button>
      </a-space>
    </div>

    <a-card :bordered="false">
      <a-table
        :columns="columns"
        :data-source="traces"
        row-key="trace_id"
        :loading="loading"
        :pagination="{ pageSize: 10 }"
        @row="record => ({ onClick: () => selectTrace(record) })"
      >
        <template #bodyCell="{ column, record }">
          <a-tag v-if="column.dataIndex === 'scenario_type'" color="geekblue">
            {{ scenarioName(record.scenario_type) }}
          </a-tag>
          <a-tag v-else-if="column.dataIndex === 'risk_level'" :color="riskColor(record.risk_level)">
            {{ record.risk_level }}
          </a-tag>
        </template>
      </a-table>
    </a-card>

    <a-drawer v-model:open="drawerOpen" width="760" title="Trace 详情">
      <template v-if="selectedTrace">
        <a-descriptions bordered size="small" :column="1">
          <a-descriptions-item label="Trace ID">{{ selectedTrace.trace_id }}</a-descriptions-item>
          <a-descriptions-item label="场景">{{ scenarioName(selectedTrace.scenario_type) }}</a-descriptions-item>
          <a-descriptions-item label="风险等级">
            <a-tag :color="riskColor(selectedTrace.risk_level)">{{ selectedTrace.risk_level }}</a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="输入">{{ selectedTrace.input_text || '-' }}</a-descriptions-item>
          <a-descriptions-item label="输出">{{ selectedTrace.final_output || '-' }}</a-descriptions-item>
        </a-descriptions>

        <a-divider orientation="left">步骤</a-divider>
        <a-timeline>
          <a-timeline-item v-for="step in selectedTrace.steps || []" :key="step.id">
            <div class="step-title">{{ step.position }}. {{ step.name }} / {{ step.step_type }}</div>
            <pre>{{ JSON.stringify(step.output_payload || {}, null, 2) }}</pre>
          </a-timeline-item>
        </a-timeline>

        <a-divider orientation="left">风险</a-divider>
        <a-list :data-source="selectedTrace.risks || []" bordered>
          <template #renderItem="{ item }">
            <a-list-item>
              <a-list-item-meta :title="item.risk_code" :description="item.reason">
                <template #avatar>
                  <a-tag :color="riskColor(item.risk_level)">{{ item.risk_level }}</a-tag>
                </template>
              </a-list-item-meta>
            </a-list-item>
          </template>
        </a-list>
      </template>
    </a-drawer>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { fetchTraceDetail, fetchTraces } from '@/api/securityEvaluation'
import { formatDateTime, riskColor, scenarioName } from '@/utils/formatters'

const route = useRoute()
const loading = ref(false)
const traces = ref([])
const selectedTrace = ref(null)
const drawerOpen = ref(false)
const scenarioType = ref()

const columns = [
  { title: 'Trace ID', dataIndex: 'trace_id' },
  { title: '场景', dataIndex: 'scenario_type', width: 140 },
  { title: '风险等级', dataIndex: 'risk_level', width: 120 },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    width: 190,
    customRender: ({ text }) => formatDateTime(text)
  }
]

async function loadTraces() {
  loading.value = true
  try {
    const data = await fetchTraces(route.params.projectId, {
      scenario_type: scenarioType.value || undefined
    })
    traces.value = data.traces || []
  } catch (error) {
    message.error(error.message || 'Trace 加载失败')
  } finally {
    loading.value = false
  }
}

async function selectTrace(record) {
  try {
    selectedTrace.value = await fetchTraceDetail(record.trace_id)
    drawerOpen.value = true
  } catch (error) {
    message.error(error.message || 'Trace 详情加载失败')
  }
}

onMounted(loadTraces)
</script>

<style scoped>
.trace-page {
  background: #f5f7fb;
  min-height: 100%;
}
.page-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  background: #fff;
  border: 1px solid #edf0f5;
  border-radius: 8px;
  padding: 20px 22px;
}
.page-head h2 {
  margin: 0;
  color: #111827;
  font-size: 22px;
  font-weight: 700;
}
.page-head p {
  margin: 6px 0 0;
  color: #667085;
}
.step-title {
  font-weight: 650;
  color: #111827;
}
pre {
  max-height: 180px;
  overflow: auto;
  background: #f6f8fa;
  padding: 12px;
  border-radius: 6px;
}
</style>
