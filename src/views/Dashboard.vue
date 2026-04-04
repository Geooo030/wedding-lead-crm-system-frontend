<template>
  <div class="dashboard">
    <!-- 统计卡片 -->
    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-icon" style="background: #007AFF;">📊</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.totalLeads || 0 }}</div>
          <div class="stat-label">总客户数</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: #34C759;">📈</div>
        <div class="stat-info">
          <div class="stat-value">{{ stats.newLeadsToday || 0 }}</div>
          <div class="stat-label">今日新增</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: #FF9500;">🔥</div>
        <div class="stat-info">
          <div class="stat-value">{{ hotLeadsCount }}</div>
          <div class="stat-label">高优先级</div>
        </div>
      </div>
      
      <div class="stat-card">
        <div class="stat-icon" style="background: #5856D6;">🎯</div>
        <div class="stat-info">
          <div class="stat-value">{{ convertedCount }}</div>
          <div class="stat-label">已成交</div>
        </div>
      </div>
    </div>
    
    <!-- 图表区域 -->
    <div class="charts-row">
      <div class="card chart-card">
        <h3>客户国家分布</h3>
        <div class="chart-container" ref="countryChartRef"></div>
      </div>
      
      <div class="card chart-card">
        <h3>客户状态分布</h3>
        <div class="chart-container" ref="statusChartRef"></div>
      </div>
    </div>
    
    <!-- 快捷操作 -->
    <div class="card quick-actions">
      <h3>快捷操作</h3>
      <div class="action-buttons">
        <el-button type="primary" @click="startLeadHunt">
          <el-icon><Search /></el-icon>
          开始获客
        </el-button>
        <el-button @click="goToLeads">
          <el-icon><List /></el-icon>
          查看客户
        </el-button>
        <el-button @click="goToReports">
          <el-icon><Document /></el-icon>
          查看报表
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { getDashboardStats } from '@/api/report'
import { createTask } from '@/api/task'
import type { DashboardStats } from '@/types'

const router = useRouter()
const stats = ref<DashboardStats>({
  totalLeads: 0,
  newLeadsToday: 0,
  byCountry: [],
  byStatus: [],
  byPriority: []
})

const countryChartRef = ref<HTMLElement>()
const statusChartRef = ref<HTMLElement>()

const hotLeadsCount = computed(() => {
  const hot = stats.value.byPriority?.find((item: [string, number]) => item[0] === 'hot')
  return hot ? hot[1] : 0
})

const convertedCount = computed(() => {
  const converted = stats.value.byStatus?.find((item: [string, number]) => item[0] === 'converted')
  return converted ? converted[1] : 0
})

const loadStats = async () => {
  try {
    const res = await getDashboardStats()
    stats.value = res.data
    renderCharts()
  } catch {
    // 错误已处理
  }
}

const renderCharts = () => {
  // 国家分布图
  if (countryChartRef.value) {
    const chart = echarts.init(countryChartRef.value)
    chart.setOption({
      tooltip: { trigger: 'item' },
      series: [{
        type: 'pie',
        radius: '60%',
        data: stats.value.byCountry?.slice(0, 6).map((item: [string, number]) => ({
          name: item[0],
          value: item[1]
        })) || []
      }]
    })
  }
  
  // 状态分布图
  if (statusChartRef.value) {
    const chart = echarts.init(statusChartRef.value)
    const statusNames: Record<string, string> = {
      new: '新线索',
      contacting: '联系中',
      negotiating: '谈判中',
      converted: '已成交',
      lost: '已流失'
    }
    chart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category' },
      yAxis: { type: 'value' },
      series: [{
        type: 'bar',
        data: stats.value.byStatus?.map((item: [string, number]) => ({
          name: statusNames[item[0]] || item[0],
          value: item[1]
        })) || []
      }]
    })
  }
}

const startLeadHunt = async () => {
  try {
    await createTask({
      taskType: 'lead_hunt',
      taskParams: { region: 'middle_east' }
    })
    ElMessage.success('获客任务已创建')
    router.push('/tasks')
  } catch {
    // 错误已处理
  }
}

const goToLeads = () => router.push('/leads')
const goToReports = () => router.push('/reports')

onMounted(() => {
  loadStats()
})
</script>

<style scoped lang="scss">
.dashboard {
  .stat-cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 24px;
  }
  
  .stat-card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
    
    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
    }
    
    .stat-info {
      .stat-value {
        font-size: 28px;
        font-weight: 600;
        color: #1D1D1F;
      }
      
      .stat-label {
        font-size: 14px;
        color: #86868B;
        margin-top: 4px;
      }
    }
  }
  
  .charts-row {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-bottom: 24px;
  }
  
  .chart-card {
    h3 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    
    .chart-container {
      height: 300px;
    }
  }
  
  .quick-actions {
    h3 {
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    
    .action-buttons {
      display: flex;
      gap: 12px;
    }
  }
}
</style>