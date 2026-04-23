import { request } from './request'
import type { ApiResponse, FollowRecord } from '@/types'

export const getFollowRecords = (leadId: number) => 
  request.get<ApiResponse<FollowRecord[]>>(`/follows/lead/${leadId}`)

export const createFollowRecord = (data: Partial<FollowRecord>) => 
  request.post<ApiResponse<FollowRecord>>('/follows', data)

export const updateFollowRecord = (id: number, data: Partial<FollowRecord>) => 
  request.put<ApiResponse<FollowRecord>>(`/follows/${id}`, data)

export const getFollowProgress = (leadId: number) => 
  request.get<ApiResponse<{ progress: number; currentStage: string }>>(`/follows/progress/${leadId}`)