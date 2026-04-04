<template>
  <div class="layout-container">
    <el-container>
      <!-- 侧边栏 -->
      <el-aside width="240px" class="sidebar">
        <div class="logo">
          <span class="logo-icon">👰</span>
          <span class="logo-text">获客系统</span>
        </div>
        
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          router
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
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const activeMenu = computed(() => route.path)
const username = computed(() => localStorage.getItem('username') || '用户')

const pageTitle = computed(() => {
  const titles: Record<string, string> = {
    '/dashboard': '看板概览',
    '/leads': '客户列表',
    '/reports': '报表中心',
    '/tasks': 'Agent任务'
  }
  return titles[route.path] || '获客系统'
})

const handleCommand = (command: string) => {
  if (command === 'logout') {
    localStorage.removeItem('token')
    localStorage.removeItem('username')
    router.push('/login')
  }
}
</script>

<style scoped lang="scss">
.layout-container {
  height: 100vh;
  
  .el-container {
    height: 100%;
  }
}

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
</style>