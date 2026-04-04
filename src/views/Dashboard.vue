<template>
  <div class="dashboard" :class="{ 'is-mobile': isMobile }">
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
        <el-button type="primary" size="large" @click="startLeadHunt">
          <el-icon><Search /></el-icon>
          <span>开始获客</span>
        </el-button>
        <el-button size="large" @click="goToLeads">
          <el-icon><List /></el-icon>
          <span>查看客户</span>
        </el-button>
        <el-button size="large" @click="goToReports">
          <el-icon><Document /></el-icon>
          <span>查看报表</span>
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'
import { getDashboardStats } from '@/api/report'
import { createTask } from '@/api/task'
import { isMobile } from '@/utils/device'
import type { DashboardStats } from '@/types'

const router = useRouter()
const isMobileRef = ref(isMobile())
const stats = ref<DashboardStats>({
  totalLeads: 0,
  newLeadsToday: 0,
  byCountry: [],
  byStatus: [],
  byPriority: []
})

const countryChartRef = ref<HTMLElement>()
const statusChartRef = ref<HTMLElement>()
let countryChart: echarts.ECharts | null = null
let statusChart: echarts.ECharts | null = null

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
    await nextTick()
    renderCharts()
  } catch {
    // 错误已处理
  }
}

const renderCharts = () => {
  // 销毁旧图表
  if (countryChart) {
    countryChart.dispose()
  }
  if (statusChart) {
    statusChart.dispose()
  }
  
  // 国家分布图
  if (countryChartRef.value) {
    countryChart = echarts.init(countryChartRef.value)
    const isMobileVal = isMobileRef.value
    countryChart.setOption({
      tooltip: { trigger: 'item' },
      legend: {
        orient: isMobileVal ? 'horizontal' : 'vertical',
        bottom: isMobileVal ? 0 : 'center',
        left: isMobileVal ? 'center' : 'left'
      },
      series: [{
        type: 'pie',
        radius: isMobileVal ? ['30%', '50%'] : '60%',
        center: isMobileVal ? ['50%', '40%'] : ['60%', '50%'],
        data: stats.value.byCountry?.slice(0, 6).map((item: [string, number]) => ({
          name: item[0],
          value: item[1]
        })) || [],
        label: {
          show: !isMobileVal
        }
      }]
    })
  }
  
  // 状态分布图
  if (statusChartRef.value) {
    statusChart = echarts.init(statusChartRef.value)
    const statusNames: Record<string, string> = {
      new_lead: '新线索',
      contacting: '联系中',
      negotiating: '谈判中',
      converted: '已成交',
      lost: '已流失'
    }
    statusChart.setOption({
      tooltip: { trigger: 'axis' },
      xAxis: { 
        type: 'category',
        axisLabel: {
          interval: 0,
          rotate: isMobileRef.value ? 30 : 0
        }
      },
      yAxis: { type: 'value' },
      grid: {
        left: isMobileRef.value ? '12%' : '3%',
        right: '4%',
        bottom: isMobileRef.value ? '15%' : '3%',
        containLabel: true
      },
      series: [{
        type: 'bar',
        data: stats.value.byStatus?.map((item: [string, number]) => ({
          name: statusNames[item[0]] || item[0],
          value: item[1]
        })) || [],
        itemStyle: {
          color: '#007AFF'
        },
        barWidth: isMobileRef.value ? '40%' : '60%'
      }]
    })
  }
}

// 监听窗口变化重新渲染图表
const handleResize = () => {
  isMobileRef.value = isMobile()
  if (countryChart) countryChart.resize()
  if (statusChart) statusChart.resize()
  renderCharts()
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
  window.addEventListener('resize', handleResize)
})
</script>

<style scoped lang="scss">
.dashboard {
  &.is-mobile {
    .stat-cards {
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    
    .stat-card {
      padding: 16px;
      
      .stat-icon {
        width: 44px;
        height: 44px;
        font-size: 20px;
      }
      
      .stat-value {
        font-size: 22px;
      }
      
      .stat-label {
        font-size: 12px;
      }
    }
    
    .charts-row {
      grid-template-columns: 1fr;
      gap: 12px;
    }
    
    .chart-card {
      h3 {
        font-size: 14px;
        margin-bottom: 12px;
      }
      
      .chart-container {
        height: 200px;
      }
    }
    
    .quick-actions {
      h3 {
        font-size: 14px;
        margin-bottom: 12px;
      }
      
      .action-buttons {
        flex-direction: column;
        gap: 8px;
        
        .el-button {
          width: 100%;
          justify-content: center;
        }
      }
    }
    
    .card {
      padding: 16px;
    }
  }
  
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
  
  .card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
}
</style>