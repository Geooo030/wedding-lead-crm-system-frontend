export interface ApiResponse<T = unknown> {
  success: boolean
  message: string
  data: T
}

export interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export interface User {
  id: number
  username: string
  email?: string
  role: 'ADMIN' | 'BOSS' | 'SUB_ACCOUNT'
  createdAt?: string
  updatedAt?: string
  lastLoginAt?: string
}

export interface LoginResponse {
  token: string
  user: User
}

export interface Lead {
  id: number
  companyName: string
  companyType: string
  businessScope: string
  website: string
  contactPhone: string
  contactEmail: string
  country: string
  region: string
  address: string
  priorityScore: number
  priorityLevel: 'HOT' | 'WARM' | 'COLD'
  leadSource: 'AI' | 'MANUAL'
  leadChannel: string
  sourceUrl: string
  notes: string
  status: 'NEW_LEAD' | 'CONTACTING' | 'NEGOTIATING' | 'CONVERTED' | 'LOST'
  agentId: number
  followOperator: string
  createdAt: string
  updatedAt: string
}

export interface FollowRecord {
  id: number
  leadId: number
  operatorId: number
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

export interface AgentTask {
  id: number
  title: string
  description: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  agentId: number
  leadId: number
  deadline: string
  createdAt: string
  updatedAt: string
  completedAt: string
  createdBy: number
  completedBy: number
}

export interface Report {
  id?: number
  reportType: 'daily' | 'weekly' | 'monthly'
  reportDate: string
  metrics: Record<string, any>
  agentSummary: [string, number][]
  createdAt: string
}

export interface DashboardStats {
  totalLeads: number
  newLeadsToday: number
  byCountry: [string, number][]
  byStatus: [string, number][]
  byPriority: [string, number][]
  agentSummary: [string, number][]
}
