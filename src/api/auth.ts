import { request } from './request'
import type { ApiResponse, LoginResponse, User } from '@/types'

export const login = (username: string, password: string) => 
  request.post<ApiResponse<LoginResponse>>('/auth/login', { username, password })

export const logout = () => 
  request.post<ApiResponse<void>>('/auth/logout')

export const getCurrentUser = () => 
  request.get<ApiResponse<User>>('/auth/me')

interface RegisterData {
  username: string
  email: string
  password: string
  role?: string
}

export const register = (data: RegisterData) => 
  request.post<ApiResponse<User>>('/auth/register', data)