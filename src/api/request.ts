import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios'
import { ElMessage } from 'element-plus'

const instance: AxiosInstance = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 清理空字符串参数
    if (config.params) {
      const cleanedParams: Record<string, unknown> = {}
      Object.entries(config.params).forEach(([key, value]) => {
        if (value !== '' && value !== null && value !== undefined) {
          cleanedParams[key] = value
        }
      })
      config.params = cleanedParams
    }
    
    return config
  },
  (error) => {
    console.error('[API Request Error]', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
instance.interceptors.response.use(
  (response) => {
    const res = response.data
    
    if (!res.success) {
      const message = res.message || '请求失败'
      console.error('[API Business Error]', message)
      ElMessage.error(message)
      return Promise.reject(new Error(message))
    }
    
    return res
  },
  (error: AxiosError<{ message?: string }>) => {
    console.error('[API Response Error]', error)
    
    // 处理不同的错误状态
    if (error.response) {
      const status = error.response.status
      const message = error.response.data?.message || getDefaultErrorMessage(status)
      
      switch (status) {
        case 401:
          // 未授权，清除 token 并跳转登录
          localStorage.removeItem('token')
          localStorage.removeItem('username')
          ElMessage.warning('登录已过期，请重新登录')
          // 延迟跳转，让用户看到提示
          setTimeout(() => {
            window.location.href = '/login'
          }, 1000)
          break
        case 403:
          ElMessage.error('没有权限访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        default:
          ElMessage.error(message)
      }
    } else if (error.request) {
      // 请求已发出但没有收到响应
      console.error('[API No Response]', error.request)
      ElMessage.error('网络连接失败，请检查网络')
    } else {
      // 请求配置错误
      console.error('[API Config Error]', error.message)
      ElMessage.error('请求配置错误')
    }
    
    return Promise.reject(error)
  }
)

// 根据状态码获取默认错误消息
function getDefaultErrorMessage(status: number): string {
  const messages: Record<number, string> = {
    400: '请求参数错误',
    401: '未授权，请登录',
    403: '拒绝访问',
    404: '资源不存在',
    405: '请求方法不允许',
    408: '请求超时',
    500: '服务器内部错误',
    501: '服务未实现',
    502: '网关错误',
    503: '服务不可用',
    504: '网关超时',
    505: 'HTTP版本不受支持'
  }
  return messages[status] || `请求失败 (${status})`
}

export const request = {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.get(url, config)
  },
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return instance.post(url, data, config)
  },
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    return instance.put(url, data, config)
  },
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return instance.delete(url, config)
  }
}

export default instance