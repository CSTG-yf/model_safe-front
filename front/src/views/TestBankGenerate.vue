<template>
  <div class="testbank-generate">
    <!-- 标题 -->
    <h2 class="page-title">生成式AI观测题库配置系统</h2>

    <!-- 搜索栏 -->
    <div class="search-section">
      <a-input-search
          v-model:value="keyword"
          placeholder="输入领域关键词（如：金融风控、医疗诊断等）"
          enter-button="搜索"
          size="large"
          class="search-bar"
      />
    </div>

    <!-- 专业领域配置区块 -->
    <div class="domain-config">
      <!-- 专业领域标签 -->
      <div class="label-section">
        <h3 class="section-title">选择专业领域（单选）：</h3>
        <div class="tag-list">
          <a-checkable-tag
              v-for="tag in domainTags"
              :key="tag.value"
              :checked="selectedDomain === tag.value"
              @click="onDomainSelect(tag.value)"
              class="domain-tag"
          >
            {{ tag.label }}
            <a-tooltip :title="tag.desc">
              <question-circle-outlined class="tag-tip-icon" />
            </a-tooltip>
          </a-checkable-tag>
        </div>
      </div>

      <!-- 题目数量输入 -->
      <div class="count-section">
        <h3 class="count-title">领域题目总数：</h3>
        <a-input-number
            v-model:value="domainQuestionCount"
            :min="10"
            :max="500"
            :step="10"
            class="count-input"
            addon-after="题"
        />
      </div>
    </div>

    <!-- 安全题目比例配置 -->
    <div class="security-config">
      <h3 class="section-title">安全题目分类配置（必选）</h3>
      <a-row :gutter="[16, 12]">
        <a-col
            v-for="(item, index) in securityCategories"
            :key="index"
            :span="8"
            class="ratio-col"
        >
          <div class="ratio-item">
            <a-tooltip :title="item.desc">
              <span class="ratio-label">{{ item.label }}</span>
            </a-tooltip>
            <div class="ratio-control">
              <a-slider
                  v-model:value="securityRatios[item.key]"
                  :min="0"
                  :max="100"
                  :step="5"
                  class="slider"
              />
              <span class="ratio-value">{{ securityRatios[item.key] }}%</span>
            </div>
          </div>
        </a-col>
      </a-row>
      <div class="ratio-total">总比例：{{ totalRatio }}%</div>
    </div>

    <!-- 生成按钮 -->
    <div class="action-section">
      <a-button
          type="primary"
          size="large"
          @click="generateTestBank"
          :disabled="totalRatio !== 100 || !selectedDomain"
          class="generate-btn"
      >
        生成观测题库（共{{ domainQuestionCount }}题）
      </a-button>
      <div class="alert-container">
        <div v-if="totalRatio !== 100" class="alert-item">
          <exclamation-circle-filled class="alert-icon" />
          安全分类比例总和必须为100%
        </div>
        <div v-if="!selectedDomain" class="alert-item">
          <exclamation-circle-filled class="alert-icon" />
          请选择专业领域
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { QuestionCircleOutlined, ExclamationCircleFilled } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 专业领域配置
const domainTags = [
  { value: 'finance', label: '金融', desc: '银行、证券、保险等金融行业' },
  { value: 'medical', label: '医疗', desc: '临床诊断、药物研发等医疗健康行业' },
  { value: 'education', label: '教育', desc: '课程教学、考试评测等教育行业' },
  { value: 'legal', label: '法律', desc: '合同审查、法律咨询等法律服务行业' },
  { value: 'manufacturing', label: '制造', desc: '工业制造、智能制造、质量控制' },
  { value: 'energy', label: '能源', desc: '电力、新能源、石油天然气' },
  { value: 'transport', label: '交通', desc: '智能驾驶、交通管控、物流' },
  { value: 'government', label: '政务', desc: '公共服务、电子政务、行政审批' },
  { value: 'media', label: '传媒', desc: '新闻采编、内容审核、广告营销' },
  { value: 'retail', label: '零售', desc: '电商、实体店管理、供应链优化' }
]
const selectedDomain = ref(null)
const domainQuestionCount = ref(100) // 领域题目总数

// 安全配置
const securityCategories = [
  { key: 'core_value', label: '核心价值观', desc: '包含违反社会主义核心价值观的内容，如危害国家安全、宣扬极端主义等' },
  { key: 'discrimination', label: '歧视性内容', desc: '包含民族、性别、地域等歧视性内容' },
  { key: 'compliance', label: '商业合规', desc: '商业违法违规风险，如知识产权侵权、不正当竞争等' },
  { key: 'rights', label: '合法权益', desc: '侵犯肖像权、隐私权等他人合法权益的内容' },
  { key: 'reliability', label: '专业可靠性', desc: '无法满足医疗、金融等专业领域的安全可靠性要求' }
]
const securityRatios = ref({
  core_value: 25,
  discrimination: 20,
  compliance: 20,
  rights: 20,
  reliability: 15
})

// 计算属性
const totalRatio = computed(() =>
    Object.values(securityRatios.value).reduce((sum, val) => sum + Number(val), 0)
)

// 事件处理
function onDomainSelect(domain) {
  selectedDomain.value = selectedDomain.value === domain ? null : domain
}

function generateTestBank() {
  console.log('生成配置：', {
    domain: selectedDomain.value,
    total: domainQuestionCount.value,
    ratios: securityRatios.value
  })
  
  // 跳转到生成进度页面
  router.push('/project/testbank-generate-progress')
}
</script>

<style scoped>
.testbank-generate {
  max-width: 1200px;
  margin: 20px auto;
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,0.08);
}

.page-title {
  text-align: center;
  color: #1677ff;
  margin: 0 0 32px;
  font-size: 28px;
  font-weight: 600;
  letter-spacing: 1px;
}

.search-section {
  margin-bottom: 32px;
}
.search-bar {
  width: 600px;
  margin: 0 auto;
}

.domain-config {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 24px;
  margin-bottom: 32px;
  background: #fafafa;
  padding: 24px;
  border-radius: 8px;
  border: 1px solid #eee;
}

.label-section {
  flex: 1;
}
.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-top: 16px;
}

.count-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  align-items: center;
  justify-content: center;
}
.count-title {
  margin: 0;
  font-size: 16px;
  color: rgba(0,0,0,0.85);
  font-weight: 500;
}
.count-input {
  width: 200px;
  font-size: 16px;
}

.security-config {
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #eee;
  margin-bottom: 32px;
}

.ratio-item {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 12px;
}
.ratio-label {
  display: block;
  margin-bottom: 12px;
  font-weight: 500;
  color: #2c3e50;
  font-size: 14px;
}
.ratio-control {
  display: flex;
  align-items: center;
  gap: 16px;
}
.slider {
  flex: 1;
}
.ratio-value {
  width: 60px;
  text-align: center;
  font-weight: 500;
  color: #1677ff;
}

.action-section {
  text-align: center;
}
.generate-btn {
  height: 48px;
  padding: 0 48px;
  font-size: 16px;
}
.alert-container {
  margin-top: 16px;
  min-height: 32px;
}
.alert-item {
  display: inline-flex;
  align-items: center;
  color: #ff4d4f;
  margin: 8px 16px;
  font-size: 14px;
}
.alert-icon {
  margin-right: 8px;
}

/* 标签样式优化 */
.domain-tag {
  padding: 10px 20px;
  border-radius: 24px;
  font-size: 14px;
  transition: all 0.2s;
}
.domain-tag:hover {
  transform: translateY(-2px);
}
:deep(.ant-tag-checkable-checked) {
  background: #1677ff;
  color: white;
  box-shadow: 0 2px 8px rgba(22,119,255,0.2);
}
.tag-tip-icon {
  color: rgba(0,0,0,0.45);
  margin-left: 6px;
}
</style>