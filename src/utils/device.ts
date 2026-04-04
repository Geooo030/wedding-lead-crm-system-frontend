/**
 * 设备检测工具
 * 用于判断用户是否通过手机客户端访问
 */

// 判断是否为移动设备
export function isMobile(): boolean {
  const userAgent = navigator.userAgent.toLowerCase()
  
  // 检测常见移动设备关键词
  const mobileKeywords = [
    'android',
    'iphone',
    'ipad',
    'ipod',
    'windows phone',
    'mobile',
    'blackberry',
    'webos',
    'opera mini',
    'opera mobi'
  ]
  
  // 检测 userAgent
  if (mobileKeywords.some(keyword => userAgent.includes(keyword))) {
    return true
  }
  
  // 检测屏幕宽度 (小于 768px 视为移动端)
  if (window.innerWidth < 768) {
    return true
  }
  
  // 检测触摸支持
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
    return true
  }
  
  return false
}

// 判断是否为微信浏览器
export function isWeChat(): boolean {
  const userAgent = navigator.userAgent.toLowerCase()
  return userAgent.includes('micromessenger')
}

// 判断是否为支付宝浏览器
export function isAlipay(): boolean {
  const userAgent = navigator.userAgent.toLowerCase()
  return userAgent.includes('alipayclient')
}

// 判断是否为 iOS 设备
export function isIOS(): boolean {
  const userAgent = navigator.userAgent.toLowerCase()
  return /iphone|ipad|ipod/.test(userAgent)
}

// 判断是否为 Android 设备
export function isAndroid(): boolean {
  const userAgent = navigator.userAgent.toLowerCase()
  return userAgent.includes('android')
}

// 获取设备类型
export type DeviceType = 'mobile' | 'tablet' | 'desktop'

export function getDeviceType(): DeviceType {
  const width = window.innerWidth
  
  if (width < 768) {
    return 'mobile'
  } else if (width < 1024) {
    return 'tablet'
  } else {
    return 'desktop'
  }
}

// 获取设备信息
export interface DeviceInfo {
  isMobile: boolean
  isWeChat: boolean
  isAlipay: boolean
  isIOS: boolean
  isAndroid: boolean
  deviceType: DeviceType
  screenWidth: number
  screenHeight: number
}

export function getDeviceInfo(): DeviceInfo {
  return {
    isMobile: isMobile(),
    isWeChat: isWeChat(),
    isAlipay: isAlipay(),
    isIOS: isIOS(),
    isAndroid: isAndroid(),
    deviceType: getDeviceType(),
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight
  }
}

// 监听屏幕尺寸变化
export function watchScreenChange(callback: (info: DeviceInfo) => void): () => void {
  const handler = () => callback(getDeviceInfo())
  window.addEventListener('resize', handler)
  return () => window.removeEventListener('resize', handler)
}