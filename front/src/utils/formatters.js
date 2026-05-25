export const riskColorMap = {
  critical: 'red',
  high: 'volcano',
  medium: 'orange',
  low: 'green',
  none: 'default'
}

export const scenarioNameMap = {
  normal: '普通评测',
  jailbreak: '自适应红队',
  rag: 'RAG 污染',
  agent: 'Agent 工具',
  regression: '回归验证'
}

export function formatPercent(value, digits = 1) {
  const number = Number(value)
  if (!Number.isFinite(number)) return '-'
  return `${(number * 100).toFixed(digits)}%`
}

export function formatNumber(value) {
  const number = Number(value)
  if (!Number.isFinite(number)) return '-'
  return number.toLocaleString()
}

export function formatDateTime(value) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('zh-CN', { hour12: false })
}

export function riskColor(level) {
  return riskColorMap[level] || 'default'
}

export function scenarioName(type) {
  return scenarioNameMap[type] || type || '-'
}
