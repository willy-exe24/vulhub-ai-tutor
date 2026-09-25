import type {
  AiExplanation,
  AiSettings,
  ChatMessage,
  DiscoveredVm,
  Lab,
  Progress,
  ProgressLab,
  ProgressSummary,
  Quiz,
  QuizQuestion,
  ReadmeOut,
  RescanResult,
  RunInstructions,
  StudyNote,
  SystemStatus,
  VmConfig,
  VmConfigUpdate,
} from './types'

const BASE = '/api'

class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })
  if (!res.ok) {
    let detail = res.statusText
    try {
      const body = await res.json()
      detail = body.detail ?? detail
    } catch {
      // ignore non-JSON error bodies
    }
    throw new ApiError(res.status, detail)
  }
  if (res.status === 204) return undefined as T
  return res.json() as Promise<T>
}

export const api = {
  listLabs: () => request<Lab[]>('/labs'),
  getLab: (id: number) => request<Lab>(`/labs/${id}`),
  rescan: () => request<RescanResult>('/labs/rescan', { method: 'POST' }),
  getReadme: (id: number) => request<ReadmeOut>(`/labs/${id}/readme`),
  getRunInstructions: (id: number) => request<RunInstructions>(`/labs/${id}/run-instructions`),

  getProgress: (labId: number) => request<Progress>(`/progress/${labId}`),
  setProgressStatus: (labId: number, status: string) =>
    request<Progress>(`/progress/${labId}`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
  setConfidence: (labId: number, confidence: number) =>
    request<Progress>(`/progress/${labId}/confidence`, {
      method: 'PUT',
      body: JSON.stringify({ confidence }),
    }),
  getProgressSummary: () => request<ProgressSummary>('/progress'),
  listLabProgress: () => request<ProgressLab[]>('/progress/labs'),

  explain: (labId: number, mode: 'beginner' | 'technical') =>
    request<AiExplanation>('/ai/explain', {
      method: 'POST',
      body: JSON.stringify({ lab_id: labId, mode }),
    }),
  getChatHistory: (labId: number) => request<ChatMessage[]>(`/ai/chat/${labId}`),
  sendChatMessage: (labId: number, message: string, mode: string) =>
    request<ChatMessage>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ lab_id: labId, message, mode }),
    }),
  explainCommand: (labId: number, command: string) =>
    request<{ explanation: string }>('/ai/explain-command', {
      method: 'POST',
      body: JSON.stringify({ lab_id: labId, command }),
    }),

  generateQuiz: (labId: number) =>
    request<Quiz>('/ai/quiz', { method: 'POST', body: JSON.stringify({ lab_id: labId }) }),
  getQuizzes: (labId: number) => request<Quiz[]>(`/ai/quiz/${labId}`),
  submitQuiz: (quizId: number, answers: string[]) =>
    request<Quiz>(`/ai/quiz/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),

  generateStudyNotes: (labId: number) =>
    request<StudyNote>('/ai/study-notes', {
      method: 'POST',
      body: JSON.stringify({ lab_id: labId }),
    }),
  getStudyNotes: (labId: number) => request<StudyNote[]>(`/ai/study-notes/${labId}`),

  getAiSettings: () => request<AiSettings>('/settings/ai'),
  updateAiSettings: (provider: 'openai' | 'anthropic') =>
    request<AiSettings>('/settings/ai', {
      method: 'PUT',
      body: JSON.stringify({ provider }),
    }),

  getSystemStatus: () => request<SystemStatus>('/system/status'),

  discoverVms: () => request<DiscoveredVm[]>('/vms/discover'),
  getVmConfig: () => request<VmConfig>('/vms/config'),
  updateVmConfig: (body: VmConfigUpdate) =>
    request<VmConfig>('/vms/config', { method: 'PUT', body: JSON.stringify(body) }),
  startKaliVm: () => request<VmConfig['kali_status']>('/vms/kali/start', { method: 'POST' }),
  stopKaliVm: () => request<VmConfig['kali_status']>('/vms/kali/stop', { method: 'POST' }),
  startVulhubVm: () => request<VmConfig['vulhub_status']>('/vms/vulhub/start', { method: 'POST' }),
  stopVulhubVm: () => request<VmConfig['vulhub_status']>('/vms/vulhub/stop', { method: 'POST' }),
}

export { ApiError }
export type { QuizQuestion }
