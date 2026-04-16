// 通用响应类型
export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
}

// 分页响应
export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

// 用户
export interface User {
  id: string | number
  username: string
  role: 'admin' | 'boss' | 'sub_account'
}

// 登录响应
export interface LoginResponse {
  token: string
  username: string
  userId: string
  role: 'admin' | 'boss' | 'sub_account'
}

// 客户线索
export interface Lead {
  id: string | number
  companyName: string
  companyType: string
  country: string
  region: string
  address: string
  contactPhone: string
  contactEmail: string
  website: string
  businessScope: string
  intentSignals: string[]
  priorityScore: number
  priorityLevel: 'hot' | 'warm' | 'cold'
  leadSource: 'ai' | 'manual'
  leadChannel: string
  followOperator: string
  agentId: string | number
  status: 'new_lead' | 'contacting' | 'negotiating' | 'converted' | 'lost'
  notes: string
  sourceUrl: string
  createdAt: string
  updatedAt: string
}

// 跟进记录
export interface FollowRecord {
  id: string | number
  leadId: string | number
  operatorId: string | number
  operatorUsername?: string
  contactMethod: 'phone' | 'whatsapp' | 'email' | 'visit'
  contactResult: 'reached' | 'unreachable' | 'callback' | 'failed'
  customerIntention: 'high' | 'medium' | 'low' | 'none'
  currentStage: 'new_lead' | 'first_contact' | 'requirement' | 'quotation' | 'deal' | 'rejected'
  notes: string
  nextAction: string
  nextActionDate: string
  createdAt: string
}

// Agent任务
export interface AgentTask {
  id: string
  taskType: 'lead_hunt' | 'report_summary' | 'custom'
  taskParams: Record<string, unknown>
  status: 'pending' | 'running' | 'completed' | 'failed'
  result: Record<string, unknown>
  scheduledAt: string
  startedAt: string
  completedAt: string
  errorMessage: string
  createdAt: string
}

// 报表
export interface Report {
  id: string
  reportType: 'daily' | 'weekly' | 'monthly'
  reportDate: string
  metrics: Record<string, unknown>
  agentSummary: string
  createdAt: string
}

// 看板统计
export interface DashboardStats {
  totalLeads: number
  newLeadsToday: number
  byCountry: [string, number][]
  byStatus: [string, number][]
  byPriority: [string, number][]
}