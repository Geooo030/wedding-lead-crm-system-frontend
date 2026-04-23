<template>
  <div class="tasks-page">
    <div class="card">
      <div class="page-header">
        <h2>代理任务</h2>
        <el-button type="primary" @click="showCreateDialog = true">
          <el-icon><Plus /></el-icon>
          创建任务
        </el-button>
      </div>

      <!-- 筛选栏 -->
      <div class="filter-bar">
        <el-form :inline="true" :model="filters">
          <el-form-item label="状态">
            <el-select v-model="filters.status" placeholder="选择状态" clearable @change="loadTasks">
              <el-option label="待处理" value="PENDING" />
              <el-option label="处理中" value="IN_PROGRESS" />
              <el-option label="已完成" value="COMPLETED" />
              <el-option label="已取消" value="CANCELLED" />
            </el-select>
          </el-form-item>
          <el-form-item label="优先级">
            <el-select v-model="filters.priority" placeholder="选择优先级" clearable @change="loadTasks">
              <el-option label="高" value="HIGH" />
              <el-option label="中" value="MEDIUM" />
              <el-option label="低" value="LOW" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>

      <!-- 任务表格 -->
      <el-table :data="tasks" v-loading="loading">
        <el-table-column prop="title" label="任务标题" min-width="200" />
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="priority" label="优先级" width="100">
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priority)">
              {{ getPriorityLabel(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="deadline" label="截止时间" width="180">
          <template #default="{ row }">
            {{ row.deadline ? formatDate(row.deadline) : '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="180">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="updateTaskStatus(row.id, 'IN_PROGRESS')" v-if="row.status === 'PENDING'">
              开始
            </el-button>
            <el-button type="success" link size="small" @click="updateTaskStatus(row.id, 'COMPLETED')" v-if="row.status === 'IN_PROGRESS'">
              完成
            </el-button>
            <el-button type="danger" link size="small" @click="deleteTask(row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 创建任务对话框 -->
    <el-dialog v-model="showCreateDialog" title="创建任务" width="500px">
      <el-form :model="newTask" label-width="80px">
        <el-form-item label="任务标题">
          <el-input v-model="newTask.title" placeholder="请输入任务标题" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="newTask.description" type="textarea" :rows="3" placeholder="请输入任务描述" />
        </el-form-item>
        <el-form-item label="优先级">
          <el-select v-model="newTask.priority" placeholder="选择优先级">
            <el-option label="高" value="HIGH" />
            <el-option label="中" value="MEDIUM" />
            <el-option label="低" value="LOW" />
          </el-select>
        </el-form-item>
        <el-form-item label="截止时间">
          <el-date-picker
            v-model="newTask.deadline"
            type="datetime"
            placeholder="选择截止时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createNewTask">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import dayjs from 'dayjs'
import { getTasks, createTask, updateTaskStatus as updateTaskStatusApi, deleteTask as deleteTaskApi } from '@/api/task'
import type { AgentTask } from '@/types'

const loading = ref(false)
const tasks = ref<AgentTask[]>([])
const showCreateDialog = ref(false)
const newTask = ref<Partial<AgentTask>>({
  title: '',
  description: '',
  priority: 'MEDIUM',
  status: 'PENDING'
})
const filters = ref({
  status: '',
  priority: ''
})

const loadTasks = async () => {
  loading.value = true
  try {
    const params: any = {}
    if (filters.value.status) params.status = filters.value.status
    if (filters.value.priority) params.priority = filters.value.priority
    const res = await getTasks(params)
    if (res && res.data) {
      tasks.value = Array.isArray(res.data) ? res.data : []
    }
  } finally {
    loading.value = false
  }
}

const createNewTask = async () => {
  if (!newTask.value.title) {
    ElMessage.warning('请输入任务标题')
    return
  }
  try {
    // 从 localStorage 获取用户 ID
    const userIdStr = localStorage.getItem('userId')
    const agentId = userIdStr ? parseInt(userIdStr) : 1
    await createTask({
      ...newTask.value,
      agentId: agentId,
      status: 'PENDING'
    })
    ElMessage.success('任务创建成功')
    showCreateDialog.value = false
    // 重置表单
    newTask.value = {
      title: '',
      description: '',
      priority: 'MEDIUM',
      status: 'PENDING'
    }
    loadTasks()
  } catch {
    // 错误已处理
  }
}

const updateTaskStatus = async (id: number, status: string) => {
  try {
    const userIdStr = localStorage.getItem('userId')
    const operatorId = userIdStr ? parseInt(userIdStr) : 1
    await updateTaskStatusApi(id, status, operatorId)
    ElMessage.success('状态更新成功')
    loadTasks()
  } catch {
    // 错误已处理
  }
}

const deleteTask = async (id: number) => {
  try {
    await ElMessageBox.confirm('确定要删除这个任务吗？', '删除确认', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await deleteTaskApi(id)
    ElMessage.success('任务删除成功')
    loadTasks()
  } catch {
    // 用户取消或错误已处理
  }
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    PENDING: '待处理',
    IN_PROGRESS: '处理中',
    COMPLETED: '已完成',
    CANCELLED: '已取消'
  }
  return labels[status] || status
}

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    PENDING: 'info',
    IN_PROGRESS: 'warning',
    COMPLETED: 'success',
    CANCELLED: 'danger'
  }
  return types[status] || 'info'
}

const getPriorityLabel = (priority: string) => {
  const labels: Record<string, string> = {
    HIGH: '高',
    MEDIUM: '中',
    LOW: '低'
  }
  return labels[priority] || priority
}

const getPriorityType = (priority: string) => {
  const types: Record<string, string> = {
    HIGH: 'danger',
    MEDIUM: 'warning',
    LOW: 'info'
  }
  return types[priority] || 'info'
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

  .filter-bar {
    margin-bottom: 20px;
  }
}
</style>