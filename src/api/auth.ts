import { request } from './request'
import type { ApiResponse, LoginResponse, User } from '@/types'

export const login = (username: string, password: string) => 
  request.post<ApiResponse<LoginResponse>>('/auth/login', { username, password })

export const logout = () => 
  request.post<ApiResponse<void>>('/auth/logout')

export const getCurrentUser = () => 
  request.get<ApiResponse<{ username: string; userId: string; role: 'admin' | 'boss' | 'sub_account' }>>('/auth/me')

export const register = (username: string, password: string) => 
  request.post<ApiResponse<void>>('/auth/register', { username, password })