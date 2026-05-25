import { getData, postData } from '@/api/http'

export function fetchCompetitionPackage(projectId, targetModelName = '') {
  return getData('/report-generation/competition-package/', {
    params: {
      project_id: projectId,
      target_model_name: targetModelName || undefined
    }
  })
}

export function fetchTraces(projectId, filters = {}) {
  return getData('/traces/', {
    params: {
      project_id: projectId,
      ...filters
    }
  })
}

export function fetchTraceDetail(traceId) {
  return getData(`/traces/${traceId}/`)
}

export function createRedTeamRun(projectId, payload) {
  return postData('/redteam/runs/', {
    project_id: Number(projectId),
    execute: true,
    ...payload
  })
}

export function fetchRedTeamRuns(projectId) {
  return getData('/redteam/runs/', {
    params: { project_id: projectId }
  })
}

export function fetchRedTeamAttempts(runId) {
  return getData(`/redteam/runs/${runId}/attempts/`)
}

export function fetchRagKnowledgeBases(projectId) {
  return getData('/rag-security/knowledge-bases/', {
    params: { project_id: projectId }
  })
}

export function seedRagDemoDocuments(projectId) {
  return postData('/rag-security/seed-demo-documents/', {
    project_id: Number(projectId)
  })
}

export function createRagEvalRun(knowledgeBaseId, payload) {
  return postData('/rag-security/eval-runs/', {
    knowledge_base_id: Number(knowledgeBaseId),
    execute: true,
    ...payload
  })
}

export function seedAgentTools(projectId) {
  return postData('/agent-security/tools/seed-defaults/', {
    project_id: Number(projectId)
  })
}

export function createAgentEvalRun(projectId, payload = {}) {
  return postData('/agent-security/eval-runs/', {
    project_id: Number(projectId),
    execute: true,
    ...payload
  })
}

export function fetchAgentToolCalls(projectId) {
  return getData('/agent-security/tool-calls/', {
    params: { project_id: projectId }
  })
}

export function generateProtectionStrategy(projectId, payload = {}) {
  return postData('/protection-strategies/generate/', {
    project_id: Number(projectId),
    activate: true,
    ...payload
  })
}

export function compileProtectionStrategy(projectId, payload = {}) {
  return postData('/protection-strategies/compile/', {
    project_id: Number(projectId),
    ...payload
  })
}
