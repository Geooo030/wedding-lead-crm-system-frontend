import { request } from './request'
import type { ApiResponse, FollowRecord } from '@/types'

export const getFollowRecords = (leadId: string) => 
  request.get<ApiResponse<FollowRecord[]>>(`/follows/lead/${leadId}`)

export const createFollowRecord = (data: Partial<FollowRecord>) => 
  request.post<ApiResponse<FollowRecord>>('/follows', data)

export const updateFollowRecord = (id: string, data: Partial<FollowRecord>) => 
  request.put<ApiResponse<FollowRecord>>(`/follows/${id}`, data)

export const getFollowProgress = (leadId: string) => 
  request.get<ApiResponse<{ progress: number; currentStage: string }>>(`/follows/progress/${leadId}`)