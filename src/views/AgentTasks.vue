<template>
  <div class="tasks-page">
    <div class="card">
      <div class="page-header">
        <h2>Agent 任务队列</h2>
        <el-button type="primary" @click="createLeadHuntTask">
          <el-icon><Plus /></el-icon>
          新建获客任务
        </el-button>
      </div>
      
      <el-table :data="tasks" v-loading="loading">
        <el-table-column prop="taskType" label="任务类型" width="150">
          <template #default="{ row }">
            <el-tag>{{ getTaskTypeLabel(row.taskType) }}</el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="scheduledAt" label="计划执行时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.scheduledAt) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="completedAt" label="完成时间" width="180">
          <template #default="{ row }">
            {{ row.completedAt ? formatDate(row.completedAt) : '-' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="errorMessage" label="错误信息" min-width="200">
          <template #default="{ row }">
            <span v-if="row.errorMessage" class="error-text">{{ row.errorMessage }}</span>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { getTasks, createTask } from '@/api/task'
import type { AgentTask } from '@/types'

const loading = ref(false)
const tasks = ref<AgentTask[]>([])

const loadTasks = async () => {
  loading.value = true
  try {
    const res = await getTasks()
    tasks.value = res.data
  } finally {
    loading.value = false
  }
}

const createLeadHuntTask = async () => {
  try {
    await createTask({
      taskType: 'lead_hunt',
      taskParams: { region: 'middle_east' }
    })
    ElMessage.success('获客任务已创建')
    loadTasks()
  } catch {
    // 错误已处理
  }
}

const getTaskTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    lead_hunt: '获客任务',
    report_summary: '报表总结',
    custom: '自定义任务'
  }
  return labels[type] || type
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: '等待中',
    running: '执行中',
    completed: '已完成',
    failed: '失败'
  }
  return labels[status] || status
}

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    pending: 'info',
    running: 'warning',
    completed: 'success',
    failed: 'danger'
  }
  return types[status] || 'info'
}

const formatDate = (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm:ss')

onMounted(() => {
  loadTasks()
})
</script>

<style scoped lang="scss">
.tasks-page {
  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    
    h2 {
      font-size: 18px;
      font-weight: 600;
    }
  }
  
  .error-text {
    color: #FF3B30;
  }
}
</style>