<template>
  <div class="security-page">
    <div class="page-head">
      <div>
        <h2>安全总览</h2>
        <p>围绕当前目标模型聚合红队、RAG、Agent、Trace、策略包和回归验证状态。</p>
      </div>
      <a-space>
        <a-tag color="blue">目标模型：{{ packageData.project?.target_model_name || '-' }}</a-tag>
        <a-tag :color="packageData.protection_strategy?.has_active_policy ? 'green' : 'orange'">
          {{ packageData.protection_strategy?.has_active_policy ? 'Active 策略包' : '未生成策略包' }}
        </a-tag>
        <a-button type="primary" :loading="loading" @click="loadPackage">刷新</a-button>
      </a-space>
    </div>

    <a-row :gutter="[16, 16]" class="metric-row">
      <a-col :xs="24" :sm="12" :lg="6" v-for="card in summaryCards" :key="card.key">
        <a-card class="metric-card" :bordered="false">
          <div class="metric-label">{{ card.label }}</div>
          <div class="metric-value">{{ card.value }}</div>
          <div class="metric-note">{{ card.note }}</div>
        </a-card>
      </a-col>
    </a-row>

    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :lg="12">
        <a-card title="风险等级分布" :bordered="false">
          <div ref="riskLevelChart" class="chart"></div>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="12">
        <a-card title="Top 风险代码" :bordered="false">
          <a-table
            size="small"
            :pagination="false"
            :columns="riskColumns"
            :data-source="riskRows"
            row-key="risk_code"
          />
        </a-card>
      </a-col>
    </a-row>

    <a-card title="核心指标" class="section-card" :bordered="false">
      <a-table
        size="small"
        :pagination="{ pageSize: 8 }"
        :columns="metricColumns"
        :data-source="metricRows"
        row-key="code"
      />
    </a-card>

    <a-card title="最近评测任务" class="section-card" :bordered="false">
      <a-table
        size="small"
        :pagination="{ pageSize: 6 }"
        :columns="runColumns"
        :data-source="packageData.run_summary || []"
        row-key="id"
      >
        <template #bodyCell="{ column, record }">
          <a-tag v-if="column.dataIndex === 'run_type'" color="geekblue">{{ scenarioName(record.run_type) }}</a-tag>
          <a-tag v-else-if="column.dataIndex === 'status'" :color="record.status === 'completed' ? 'green' : 'orange'">
            {{ record.status }}
          </a-tag>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import * as echarts from 'echarts'
import { fetchCompetitionPackage } from '@/api/securityEvaluation'
import { formatDateTime, formatPercent, riskColor, scenarioName } from '@/utils/formatters'

const route = useRoute()
const loading = ref(false)
const packageData = ref({})
const riskLevelChart = ref(null)
let chartInstance = null

const summaryCards = computed(() => {
  const summary = packageData.value.executive_summary || {}
  return [
    { key: 'run_count', label: '评测任务', value: summary.run_count || 0, note: '普通/红队/RAG/Agent/回归' },
    { key: 'trace_count', label: 'Trace 数', value: summary.trace_count || 0, note: '可回放风险链路' },
    { key: 'risk_count', label: '风险数', value: summary.risk_count || 0, note: '已归因风险证据' },
    { key: 'high_risk_count', label: '高风险数', value: summary.high_risk_count || 0, note: 'high + critical' }
  ]
})

const riskRows = computed(() => packageData.value.risk_summary?.by_code || [])
const metricRows = computed(() => packageData.value.metric_summary?.latest || [])

const riskColumns = [
  { title: '风险代码', dataIndex: 'risk_code' },
  { title: '次数', dataIndex: 'count', width: 100 }
]

const metricColumns = [
  { title: '指标', dataIndex: 'name' },
  { title: '代码', dataIndex: 'code' },
  {
    title: '数值',
    dataIndex: 'value',
    width: 120,
    customRender: ({ record }) => record.unit === 'percent' ? formatPercent(record.value) : record.value
  },
  { title: '方向', dataIndex: 'direction', width: 130 },
  {
    title: '时间',
    dataIndex: 'measured_at',
    width: 190,
    customRender: ({ text }) => formatDateTime(text)
  }
]

const runColumns = [
  { title: '任务', dataIndex: 'name' },
  { title: '类型', dataIndex: 'run_type', width: 130 },
  { title: '状态', dataIndex: 'status', width: 120 },
  { title: '完成', dataIndex: 'completed_cases', width: 90 },
  { title: '平均分', dataIndex: 'average_score', width: 100 },
  {
    title: '创建时间',
    dataIndex: 'created_at',
    width: 190,
    customRender: ({ text }) => formatDateTime(text)
  }
]

async function loadPackage() {
  loading.value = true
  try {
    packageData.value = await fetchCompetitionPackage(route.params.projectId)
    await nextTick()
    renderRiskChart()
  } catch (error) {
    console.error(error)
    message.error(error.message || '加载安全总览失败')
  } finally {
    loading.value = false
  }
}

function renderRiskChart() {
  if (!riskLevelChart.value) return
  if (chartInstance) chartInstance.dispose()
  chartInstance = echarts.init(riskLevelChart.value)
  const byLevel = packageData.value.risk_summary?.by_level || {}
  chartInstance.setOption({
    tooltip: { trigger: 'item' },
    color: ['#d4380d', '#fa541c', '#faad14', '#52c41a', '#8c8c8c'],
    series: [
      {
        type: 'pie',
        radius: ['48%', '72%'],
        data: Object.entries(byLevel).map(([name, value]) => ({ name, value, itemStyle: { color: undefined } })),
        label: { formatter: '{b}: {c}' }
      }
    ]
  })
}

onMounted(loadPackage)
onBeforeUnmount(() => {
  if (chartInstance) chartInstance.dispose()
})
</script>

<style scoped>
.security-page {
  background: #f5f7fb;
  min-height: 100%;
}
.page-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
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
.metric-row {
  margin-bottom: 16px;
}
.metric-card {
  min-height: 118px;
  border-radius: 8px;
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
}
.metric-label {
  color: #667085;
  font-size: 13px;
}
.metric-value {
  margin-top: 10px;
  color: #111827;
  font-size: 32px;
  font-weight: 760;
}
.metric-note {
  color: #98a2b3;
  font-size: 12px;
}
.chart {
  height: 290px;
}
.section-card {
  margin-top: 16px;
}
</style>
