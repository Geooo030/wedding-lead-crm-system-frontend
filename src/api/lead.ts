import { request } from './request'
import type { ApiResponse, Lead } from '@/types'

interface LeadQuery {
  country?: string
  status?: string
  priorityLevel?: string
  companyType?: string
  region?: string
  keyword?: string
  agentId?: number
  page?: number
  size?: number
  sortBy?: string
  sortDir?: string
}

export const getLeads = (params: LeadQuery) => 
  request.get<ApiResponse<Lead[]>>('/leads', { params })

export const getLeadById = (id: number) => 
  request.get<ApiResponse<Lead>>(`/leads/${id}`)

export const createLead = (data: Partial<Lead>) => 
  request.post<ApiResponse<Lead>>('/leads', data)

export const updateLead = (id: number, data: Partial<Lead>) => 
  request.put<ApiResponse<Lead>>(`/leads/${id}`, data)

export const deleteLead = (id: number) => 
  request.delete<ApiResponse<void>>(`/leads/${id}`)

export const importLeads = (leads: Partial<Lead>[]) => 
  request.post<ApiResponse<number>>('/leads/import', leads)

export const getCountries = () => 
  request.get<ApiResponse<string[]>>('/leads/countries')

export const getAgentSummary = () => 
  request.get<ApiResponse<[string, number][]>>('/leads/stats/agent-summary')

export const getLeadsByCountry = () => 
  request.get<ApiResponse<[string, number][]>>('/leads/stats/by-country')

export const getLeadsByStatus = () => 
  request.get<ApiResponse<[string, number][]>>('/leads/stats/by-status')

export const getLeadsByPriority = () => 
  request.get<ApiResponse<[string, number][]>>('/leads/stats/by-priority')