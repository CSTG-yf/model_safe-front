<template>
  <div class="competition-page">
    <div class="page-head">
      <div>
        <h2>比赛答辩材料包</h2>
        <p>从后端聚合接口直接读取演示、报告和答辩所需材料。</p>
      </div>
      <a-button type="primary" :loading="loading" @click="loadPackage">刷新材料</a-button>
    </div>

    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :lg="8">
        <a-card title="闭环摘要" :bordered="false">
          <a-descriptions bordered size="small" :column="1" v-if="summary">
            <a-descriptions-item label="目标模型">{{ data.project?.target_model_name || '-' }}</a-descriptions-item>
            <a-descriptions-item label="评测任务">{{ summary.run_count || 0 }}</a-descriptions-item>
            <a-descriptions-item label="Trace">{{ summary.trace_count || 0 }}</a-descriptions-item>
            <a-descriptions-item label="高风险">{{ summary.high_risk_count || 0 }}</a-descriptions-item>
            <a-descriptions-item label="Active 策略">{{ summary.has_active_policy ? '是' : '否' }}</a-descriptions-item>
          </a-descriptions>
        </a-card>
        <a-card title="演示材料路径" class="section-card" :bordered="false">
          <pre>{{ JSON.stringify(data.demo_materials || {}, null, 2) }}</pre>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="16">
        <a-card title="核心证据" :bordered="false">
          <a-tabs>
            <a-tab-pane key="risk" tab="风险证据">
              <a-list :data-source="data.risk_summary?.evidence || []" bordered>
                <template #renderItem="{ item }">
                  <a-list-item>
                    <a-list-item-meta :title="`${item.risk_code} / ${item.scenario_type}`" :description="item.reason" />
                  </a-list-item>
                </template>
              </a-list>
            </a-tab-pane>
            <a-tab-pane key="policy" tab="策略报告">
              <pre>{{ data.protection_strategy?.export_markdown_preview || '暂无策略包' }}</pre>
            </a-tab-pane>
            <a-tab-pane key="metrics" tab="指标">
              <a-table
                size="small"
                :pagination="{ pageSize: 8 }"
                :columns="metricColumns"
                :data-source="data.metric_summary?.latest || []"
                row-key="code"
              />
            </a-tab-pane>
          </a-tabs>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { fetchCompetitionPackage } from '@/api/securityEvaluation'
import { formatPercent } from '@/utils/formatters'

const route = useRoute()
const loading = ref(false)
const data = ref({})
const summary = computed(() => data.value.executive_summary || null)

const metricColumns = [
  { title: '指标', dataIndex: 'name' },
  { title: '代码', dataIndex: 'code' },
  {
    title: '数值',
    dataIndex: 'value',
    width: 120,
    customRender: ({ record }) => record.unit === 'percent' ? formatPercent(record.value) : record.value
  }
]

async function loadPackage() {
  loading.value = true
  try {
    data.value = await fetchCompetitionPackage(route.params.projectId)
  } catch (error) {
    message.error(error.message || '答辩材料加载失败')
  } finally {
    loading.value = false
  }
}

onMounted(loadPackage)
</script>

<style scoped>
.competition-page {
  background: #f5f7fb;
  min-height: 100%;
}
.page-head {
  display: flex;
  justify-content: space-between;
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
.section-card {
  margin-top: 16px;
}
pre {
  max-height: 520px;
  overflow: auto;
  background: #f6f8fa;
  padding: 16px;
  border-radius: 6px;
  white-space: pre-wrap;
}
</style>
