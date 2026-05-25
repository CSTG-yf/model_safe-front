<template>
  <div class="strategy-page">
    <div class="page-head">
      <div>
        <h2>个性化防护策略包</h2>
        <p>把多类评测证据沉淀为目标模型运行前可执行的结构化防护策略。</p>
      </div>
      <a-space>
        <a-button :loading="loading" @click="loadPackage">刷新</a-button>
        <a-button type="primary" :loading="loading" @click="generate">生成并激活</a-button>
      </a-space>
    </div>

    <a-alert
      class="hint"
      type="info"
      show-icon
      message="策略包运行时以 JSON 规则为准；Markdown 只用于展示、报告和人工审阅。"
    />

    <a-row :gutter="[16, 16]">
      <a-col :xs="24" :lg="8">
        <a-card title="策略状态" :bordered="false">
          <a-descriptions :column="1" size="small" bordered>
            <a-descriptions-item label="状态">
              <a-tag :color="policy.has_active_policy ? 'green' : 'orange'">
                {{ policy.has_active_policy ? 'active' : 'missing' }}
              </a-tag>
            </a-descriptions-item>
            <a-descriptions-item label="版本">{{ policy.version || '-' }}</a-descriptions-item>
            <a-descriptions-item label="目标模型">{{ policy.target_model_name || packageData.project?.target_model_name || '-' }}</a-descriptions-item>
            <a-descriptions-item label="回归样例">{{ policy.regression_case_count || 0 }}</a-descriptions-item>
          </a-descriptions>
        </a-card>
        <a-card title="Top 风险" class="section-card" :bordered="false">
          <a-table
            size="small"
            :pagination="false"
            :columns="riskColumns"
            :data-source="policy.top_risks || []"
            row-key="risk_code"
          />
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="16">
        <a-card title="策略内容" :bordered="false">
          <a-tabs>
            <a-tab-pane key="prompt" tab="防护提示词">
              <pre>{{ policy.guard_prompt_preview || '暂无 active 策略包' }}</pre>
            </a-tab-pane>
            <a-tab-pane key="rules" tab="结构化规则">
              <pre>{{ JSON.stringify(rulePack, null, 2) }}</pre>
            </a-tab-pane>
            <a-tab-pane key="report" tab="报告预览">
              <pre>{{ policy.export_markdown_preview || '暂无导出预览' }}</pre>
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
import { fetchCompetitionPackage, generateProtectionStrategy } from '@/api/securityEvaluation'

const route = useRoute()
const loading = ref(false)
const packageData = ref({})
const policy = computed(() => packageData.value.protection_strategy || {})
const rulePack = computed(() => ({
  guard_policy: policy.value.guard_policy || {},
  rag_guard_rules: policy.value.rag_guard_rules || {},
  agent_tool_policy: policy.value.agent_tool_policy || {},
  output_guard_rules: policy.value.output_guard_rules || {}
}))

const riskColumns = [
  { title: '风险代码', dataIndex: 'risk_code' },
  { title: '次数', dataIndex: 'count', width: 80 }
]

async function loadPackage() {
  loading.value = true
  try {
    packageData.value = await fetchCompetitionPackage(route.params.projectId)
  } catch (error) {
    message.error(error.message || '策略包加载失败')
  } finally {
    loading.value = false
  }
}

async function generate() {
  loading.value = true
  try {
    await generateProtectionStrategy(route.params.projectId, { activate: true })
    message.success('策略包已生成并激活')
    await loadPackage()
  } catch (error) {
    message.error(error.message || '策略包生成失败')
  } finally {
    loading.value = false
  }
}

onMounted(loadPackage)
</script>

<style scoped>
.strategy-page {
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
.section-card {
  margin-top: 16px;
}
pre {
  max-height: 560px;
  overflow: auto;
  background: #f6f8fa;
  padding: 16px;
  border-radius: 6px;
  white-space: pre-wrap;
}
</style>
