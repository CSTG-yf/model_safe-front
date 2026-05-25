<template>
  <div class="task-page">
    <div class="page-head">
      <div>
        <h2>Agent 工具沙箱</h2>
        <p>用 mock 工具和规则引擎验证模型是否计划越权调用删除、支付、配置修改等高危工具。</p>
      </div>
      <a-space>
        <a-button :loading="loading" @click="seedTools">初始化工具</a-button>
        <a-button type="primary" :loading="loading" @click="runEval">执行越权评测</a-button>
      </a-space>
    </div>

    <a-alert
      class="hint"
      type="info"
      show-icon
      message="当前后端边界：Agent 使用固定越权样例和策略规则，不启用动态红队。"
    />

    <a-card title="工具调用发现" :bordered="false">
      <a-table
        size="small"
        :columns="columns"
        :data-source="agentFindings"
        :pagination="{ pageSize: 8 }"
        row-key="call_id"
      >
        <template #bodyCell="{ column, record }">
          <a-tag v-if="column.dataIndex === 'decision'" :color="record.decision === 'allowed' ? 'green' : 'red'">
            {{ record.decision }}
          </a-tag>
          <a-tag v-else-if="column.dataIndex === 'risk_level'" :color="riskColor(record.risk_level)">
            {{ record.risk_level || '-' }}
          </a-tag>
        </template>
      </a-table>
    </a-card>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { createAgentEvalRun, fetchCompetitionPackage, seedAgentTools } from '@/api/securityEvaluation'
import { riskColor } from '@/utils/formatters'

const route = useRoute()
const loading = ref(false)
const packageData = ref({})
const agentFindings = computed(() => packageData.value.agent_findings || [])

const columns = [
  { title: '工具', dataIndex: 'planned_tool_name' },
  { title: '角色', dataIndex: 'user_role', width: 100 },
  { title: '决策', dataIndex: 'decision', width: 130 },
  { title: '原因', dataIndex: 'blocked_reason' },
  { title: '风险', dataIndex: 'risk_level', width: 100 },
  { title: 'Trace', dataIndex: 'trace_id', width: 180 }
]

async function loadPackage() {
  packageData.value = await fetchCompetitionPackage(route.params.projectId)
}

async function seedTools() {
  loading.value = true
  try {
    await seedAgentTools(route.params.projectId)
    message.success('mock 工具已初始化')
  } catch (error) {
    message.error(error.message || '工具初始化失败')
  } finally {
    loading.value = false
  }
}

async function runEval() {
  loading.value = true
  try {
    await createAgentEvalRun(route.params.projectId, { simulate: true })
    message.success('Agent 沙箱评测已执行')
    await loadPackage()
  } catch (error) {
    message.error(error.message || 'Agent 评测失败')
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  try {
    await loadPackage()
  } catch (error) {
    message.error(error.message || 'Agent 数据加载失败')
  }
})
</script>

<style scoped>
.task-page {
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
.hint {
  margin-bottom: 16px;
}
</style>
