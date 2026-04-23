import { request } from './request'
import type { ApiResponse, DashboardStats, Report } from '@/types'

export const getDashboardStats = () =>
  request.get<ApiResponse<DashboardStats>>('/reports/dashboard')

export const getDailyReport = () =>
  request.get<ApiResponse<Report>>('/reports/daily')

export const getWeeklyReport = () =>
  request.get<ApiResponse<Report>>('/reports/weekly')

export const getMonthlyReport = () =>
  request.get<ApiResponse<Report>>('/reports/monthly')