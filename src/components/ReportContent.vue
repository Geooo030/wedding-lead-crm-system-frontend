<template>
  <div class="report-content">
    <div class="card" v-if="report">
      <div class="report-header">
        <h3>{{ title }}</h3>
        <span class="report-date">{{ report.reportDate }}</span>
      </div>
      
      <div class="metrics" v-if="report.metrics">
        <div class="metric-item" v-for="(value, key) in report.metrics" :key="key">
          <div class="metric-value">{{ value }}</div>
          <div class="metric-label">{{ formatKey(key as string) }}</div>
        </div>
      </div>
      
      <div class="agent-summary" v-if="report.agentSummary">
        <h4>🤖 AI 总结</h4>
        <p>{{ report.agentSummary }}</p>
      </div>
    </div>
    
    <div class="card empty" v-else>
      <el-empty description="暂无报表数据" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { getDailyReport, getWeeklyReport, getMonthlyReport } from '@/api/report'
import type { Report } from '@/types'

const props = defineProps<{
  type: 'daily' | 'weekly' | 'monthly'
}>()

const report = ref<Report>()

const title = computed(() => {
  const titles = { daily: '日报表', weekly: '周报表', monthly: '月报表' }
  return titles[props.type]
})

const loadReport = async () => {
  const apis = { daily: getDailyReport, weekly: getWeeklyReport, monthly: getMonthlyReport }
  try {
    const res = await apis[props.type]()
    report.value = res.data
  } catch {
    report.value = undefined
  }
}

const formatKey = (key: string) => {
  const labels: Record<string, string> = {
    totalLeads: '总客户数',
    newLeads: '新增客户',
    conversions: '成交数',
    conversionRate: '转化率'
  }
  return labels[key] || key
}

watch(() => props.type, loadReport)

onMounted(() => {
  loadReport()
})
</script>

<style scoped lang="scss">
.report-content {
  .report-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    
    h3 {
      font-size: 18px;
      font-weight: 600;
    }
    
    .report-date {
      color: #86868B;
      font-size: 14px;
    }
  }
  
  .metrics {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 24px;
    
    .metric-item {
      text-align: center;
      padding: 20px;
      background: #F5F5F7;
      border-radius: 12px;
      
      .metric-value {
        font-size: 28px;
        font-weight: 600;
        color: #1D1D1F;
      }
      
      .metric-label {
        font-size: 14px;
        color: #86868B;
        margin-top: 4px;
      }
    }
  }
  
  .agent-summary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    padding: 24px;
    border-radius: 12px;
    color: white;
    
    h4 {
      margin-bottom: 12px;
    }
    
    p {
      line-height: 1.6;
      opacity: 0.9;
    }
  }
  
  .empty {
    padding: 60px;
    text-align: center;
  }
}
</style>