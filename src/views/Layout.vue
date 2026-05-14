<template>
  <div class="layout-container" :class="{ 'is-mobile': isMobile }">
    <!-- PC端布局 -->
    <el-container v-if="!isMobile">
      <!-- 侧边栏 -->
      <el-aside width="240px" class="sidebar">
        <div class="logo">
          <span class="logo-icon">👰</span>
          <span class="logo-text">获客系统</span>
        </div>
        
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          @select="navigateTo"
        >
          <el-menu-item index="/dashboard">
            <el-icon><DataAnalysis /></el-icon>
            <span>看板概览</span>
          </el-menu-item>
          
          <el-menu-item index="/leads">
            <el-icon><User /></el-icon>
            <span>客户列表</span>
          </el-menu-item>
          
          <el-menu-item index="/reports">
            <el-icon><Document /></el-icon>
            <span>报表中心</span>
          </el-menu-item>
          
          <el-menu-item index="/tasks">
            <el-icon><Timer /></el-icon>
            <span>Agent任务</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      
      <!-- 主内容区 -->
      <el-container>
        <el-header class="header">
          <div class="header-left">
            <h2>{{ pageTitle }}</h2>
          </div>
          
          <div class="header-right">
            <el-dropdown @command="handleCommand">
              <span class="user-info">
                <el-icon><User /></el-icon>
                {{ username }}
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        
        <el-main class="main">
          <div class="fallback-content" v-if="!routerAvailable">
            <p>请确保路由已正确配置</p>
          </div>
          <router-view v-else />
        </el-main>
      </el-container>
    </el-container>
    
    <!-- 移动端布局 -->
    <div v-else class="mobile-layout">
      <!-- 移动端头部 -->
      <div class="mobile-header">
        <div class="mobile-logo">
          <span class="logo-icon">👰</span>
          <span class="logo-text">{{ pageTitle }}</span>
        </div>
        
        <div class="mobile-header-right">
          <el-dropdown @command="handleCommand" trigger="click">
            <el-icon class="user-icon"><User /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item disabled>{{ username }}</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      
      <!-- 移动端内容区 -->
      <div class="mobile-content">
        <router-view v-if="routerAvailable" />
      </div>
      
      <!-- 移动端底部导航 -->
      <div class="mobile-nav">
        <div 
          class="nav-item" 
          :class="{ active: activeMenu === '/dashboard' }"
          @click="navigateTo('/dashboard')"
        >
          <el-icon><DataAnalysis /></el-icon>
          <span>看板</span>
        </div>
        
        <div 
          class="nav-item" 
          :class="{ active: activeMenu === '/leads' }"
          @click="navigateTo('/leads')"
        >
          <el-icon><User /></el-icon>
          <span>客户</span>
        </div>
        
        <div 
          class="nav-item" 
          :class="{ active: activeMenu === '/reports' }"
          @click="navigateTo('/reports')"
        >
          <el-icon><Document /></el-icon>
          <span>报表</span>
        </div>
        
        <div 
          class="nav-item" 
          :class="{ active: activeMenu === '/tasks' }"
          @click="navigateTo('/tasks')"
        >
          <el-icon><Timer /></el-icon>
          <span>任务</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { isMobile as checkIsMobile } from '@/utils/device'

// 设备状态
const isMobile = ref(checkIsMobile())

// 安全获取当前路径
const getCurrentPath = (): string => {
  try {
    return window.location.pathname || '/dashboard'
  } catch {
    return '/dashboard'
  }
}

const activeMenu = ref(getCurrentPath())
const username = ref(localStorage.getItem('username') || '用户')
const routerAvailable = ref(true)

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/dashboard': '看板',
    '/leads': '客户',
    '/reports': '报表',
    '/tasks': '任务'
  }
  return titles[activeMenu.value] || '获客系统'
})

// 安全导航
const navigateTo = (path: string) => {
  try {
    activeMenu.value = path
    window.location.hash = path
    // 如果是 history 模式
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path)
      window.location.reload()
    }
  } catch {
    window.location.href = path
  }
}

const handleCommand = (command: string) => {
  if (command === 'logout') {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    navigateTo('/login')
  }
}

onMounted(() => {
  // 监听路径变化
  window.addEventListener('hashchange', () => {
    activeMenu.value = getCurrentPath()
  })
  
  window.addEventListener('popstate', () => {
    activeMenu.value = getCurrentPath()
  })
})
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
  
  &.is-mobile {
    height: 100vh;
    overflow: hidden;
  }
  
  .el-container {
    height: 100%;
  }
}

.fallback-content {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #909399;
}

// PC端样式
.sidebar {
  background: #1D1D1F;
  
  .logo {
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    
    .logo-icon {
      font-size: 28px;
    }
    
    .logo-text {
      color: white;
      font-size: 18px;
      font-weight: 600;
    }
  }
  
  .sidebar-menu {
    border: none;
    background: transparent;
    
    :deep(.el-menu-item) {
      color: rgba(255, 255, 255, 0.7);
      
      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }
      
      &.is-active {
        background: #007AFF;
        color: white;
      }
    }
  }
}

.header {
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  
  h2 {
    font-size: 20px;
    font-weight: 600;
    color: #1D1D1F;
  }
  
  .user-info {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    color: #1D1D1F;
  }
}

.main {
  background: #F5F5F7;
  padding: 24px;
  overflow-y: auto;
}

// 移动端样式
.mobile-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #F5F5F7;
}

.mobile-header {
  height: 56px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  position: sticky;
  top: 0;
  z-index: 100;
  
  .mobile-logo {
    display: flex;
    align-items: center;
    gap: 8px;
    
    .logo-icon {
      font-size: 24px;
    }
    
    .logo-text {
      font-size: 18px;
      font-weight: 600;
      color: #1D1D1F;
    }
  }
  
  .mobile-header-right {
    .user-icon {
      font-size: 22px;
      color: #1D1D1F;
      cursor: pointer;
    }
  }
}

.mobile-content {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  padding-bottom: 70px;
}

.mobile-nav {
  height: 60px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-around;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  box-shadow: 0 -1px 4px rgba(0, 0, 0, 0.08);
  z-index: 100;
  
  .nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    padding: 8px 16px;
    cursor: pointer;
    color: #86868B;
    transition: all 0.2s;
    
    .el-icon {
      font-size: 22px;
    }
    
    span {
      font-size: 12px;
    }
    
    &.active {
      color: #007AFF;
      
      .el-icon {
        font-size: 24px;
      }
      
      span {
        font-weight: 500;
      }
    }
    
    &:active {
      transform: scale(0.95);
    }
  }
}

// 页面切换动画
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
