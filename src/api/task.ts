import { request } from './request'
import type { ApiResponse, AgentTask } from '@/types'

interface TaskQuery {
  agentId?: number
  status?: string
  priority?: string
  leadId?: number
  page?: number
  size?: number
}

export const getTasks = (params?: TaskQuery) => 
  request.get<ApiResponse<AgentTask[]>>('/agent/tasks', { params })

export const createTask = (data: Partial<AgentTask>) => 
  request.post<ApiResponse<AgentTask>>('/agent/tasks', data)

export const getTaskById = (id: number) => 
  request.get<ApiResponse<AgentTask>>(`/agent/tasks/${id}`)

export const updateTask = (id: number, data: Partial<AgentTask>) => 
  request.put<ApiResponse<AgentTask>>(`/agent/tasks/${id}`, data)

export const updateTaskStatus = (id: number, status: string, operatorId: number) => 
  request.put<ApiResponse<AgentTask>>(`/agent/tasks/${id}/status`, { status, operatorId })

export const deleteTask = (id: number) => 
  request.delete<ApiResponse<void>>(`/agent/tasks/${id}`)

export const getPendingTasks = () => 
  request.get<ApiResponse<AgentTask[]>>('/agent/tasks/pending')

export const getTasksByStatus = () => 
  request.get<ApiResponse<[string, number][]>>('/agent/tasks/stats/by-status')

export const getTasksByPriority = () => 
  request.get<ApiResponse<[string, number][]>>('/agent/tasks/stats/by-priority')