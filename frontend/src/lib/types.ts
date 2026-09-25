export interface Lab {
  id: number
  name: string
  cve: string | null
  product: string
  category: string | null
  difficulty: string | null
  folder_path: string
  readme_path: string | null
  compose_path: string
  first_seen_at: string
  last_seen_at: string
}

export interface RescanResult {
  total_found: number
  added: number
  updated: number
  removed: number
}

export interface ReadmeOut {
  content: string | null
}

export interface PortMapping {
  host_port: number
  container_port: number
  protocol: string
}

export interface RunInstructions {
  relative_path: string
  ports: PortMapping[]
}

export type LabProgressStatus = 'not_started' | 'in_progress' | 'completed'

export interface Progress {
  id: number
  lab_id: number
  status: LabProgressStatus
  started_at: string | null
  completed_at: string | null
  confidence: number | null
}

export interface ProgressLab {
  lab_id: number
  lab_name: string
  product: string
  cve: string | null
  category: string | null
  status: LabProgressStatus
  confidence: number | null
  started_at: string | null
  completed_at: string | null
  latest_quiz_score: number | null
}

export interface SystemStatus {
  api: 'online'
  ai_provider: 'openai' | 'anthropic'
  ai_configured: boolean
  kali: VmStatus
  vulhub_vm: VmStatus
}

export interface VmStatus {
  configured: boolean
  available: boolean
  running: boolean
  vmx_path: string | null
  error: string | null
}

export interface DiscoveredVm {
  name: string
  vmx_path: string
  running: boolean
}

export interface VmConfig {
  kali_vmx_path: string | null
  vulhub_vmx_path: string | null
  kali_status: VmStatus
  vulhub_status: VmStatus
}

export interface VmConfigUpdate {
  kali_vmx_path?: string | null
  vulhub_vmx_path?: string | null
}

export interface ProgressSummary {
  labs_discovered: number
  labs_started: number
  labs_completed: number
  quizzes_completed: number
  average_quiz_score: number | null
  categories_studied: Record<string, number>
}

export interface AiExplanation {
  what_is_it: string
  why_it_happens: string
  attacker_impact: string
  what_to_learn: string
  detection: string
  mitigation: string
  stubbed: boolean
}

export interface ChatMessage {
  id: number
  lab_id: number
  role: 'user' | 'assistant'
  message: string
  created_at: string
}

export type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer'

export interface QuizQuestion {
  question: string
  type: QuestionType
  options: string[] | null
  correct_answer: string
  explanation: string
  // Set by the backend once graded; null/undefined before submission.
  is_correct?: boolean | null
}

export interface Quiz {
  id: number
  lab_id: number
  questions: QuizQuestion[]
  score: number | null
  completed_at: string | null
  created_at: string
}

export interface StudyNote {
  id: number
  lab_id: number
  content: string
  created_at: string
}

export interface AiSettings {
  provider: 'openai' | 'anthropic'
  openai_configured: boolean
  anthropic_configured: boolean
  openai_model: string
  anthropic_model: string
}
