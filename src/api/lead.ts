import { request } from './request'
import type { ApiResponse, PageResponse, Lead } from '@/types'

interface LeadQuery {
  country?: string
  status?: string
  priorityLevel?: string
  companyType?: string
  region?: string
  keyword?: string
  page?: number
  size?: number
  sortBy?: string
  sortDir?: string
}

export const getLeads = (params: LeadQuery) => 
  request.get<ApiResponse<PageResponse<Lead>>>('/leads', { params })

export const getLeadById = (id: string) => 
  request.get<ApiResponse<Lead>>(`/leads/${id}`)

export const createLead = (data: Partial<Lead>) => 
  request.post<ApiResponse<Lead>>('/leads', data)

export const updateLead = (id: string, data: Partial<Lead>) => 
  request.put<ApiResponse<Lead>>(`/leads/${id}`, data)

export const deleteLead = (id: string) => 
  request.delete<ApiResponse<void>>(`/leads/${id}`)

export const importLeads = (leads: Partial<Lead>[]) => 
  request.post<ApiResponse<number>>('/leads/import', leads)

export const getCountries = () => 
  request.get<ApiResponse<string[]>>('/leads/countries')

export const getAgentSummary = () => 
  request.get<ApiResponse<any[]>>('/leads/stats/agent-summary')