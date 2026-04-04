import { request } from './request'
import type { ApiResponse, AgentTask } from '@/types'

export const getTasks = () => 
  request.get<ApiResponse<AgentTask[]>>('/agent/tasks')

export const createTask = (data: Partial<AgentTask>) => 
  request.post<ApiResponse<AgentTask>>('/agent/tasks', data)

export const getTaskById = (id: string) => 
  request.get<ApiResponse<AgentTask>>(`/agent/tasks/${id}`)

export const updateTaskStatus = (id: string, data: Partial<AgentTask>) => 
  request.put<ApiResponse<AgentTask>>(`/agent/tasks/${id}/status`, data)

export const getPendingTasks = () => 
  request.get<ApiResponse<AgentTask[]>>('/agent/tasks/pending')