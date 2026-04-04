<template>
  <div class="lead-detail">
    <div class="detail-header">
      <el-button @click="goBack">← 返回列表</el-button>
      <h1>{{ lead?.companyName }}</h1>
    </div>
    
    <div class="detail-content">
      <!-- 左侧：客户信息 -->
      <div class="card info-card">
        <h2>客户信息</h2>
        
        <el-descriptions :column="2" border>
          <el-descriptions-item label="公司名称">{{ lead?.companyName }}</el-descriptions-item>
          <el-descriptions-item label="公司类型">{{ lead?.companyType }}</el-descriptions-item>
          <el-descriptions-item label="国家">{{ lead?.country }}</el-descriptions-item>
          <el-descriptions-item label="地区">{{ lead?.region }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ lead?.contactPhone || '-' }}</el-descriptions-item>
          <el-descriptions-item label="邮箱">{{ lead?.contactEmail || '-' }}</el-descriptions-item>
          <el-descriptions-item label="网站">{{ lead?.website || '-' }}</el-descriptions-item>
          <el-descriptions-item label="优先级">
            <el-tag :type="getPriorityType(lead?.priorityLevel)">
              {{ getPriorityLabel(lead?.priorityLevel) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(lead?.status)">
              {{ getStatusLabel(lead?.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(lead?.createdAt) }}</el-descriptions-item>
        </el-descriptions>
        
        <div class="notes" v-if="lead?.notes">
          <h4>备注</h4>
          <p>{{ lead.notes }}</p>
        </div>
      </div>
      
      <!-- 右侧：跟进记录 -->
      <div class="card follow-card">
        <div class="follow-header">
          <h2>跟进记录</h2>
          <el-button type="primary" @click="showFollowDialog = true">添加跟进</el-button>
        </div>
        
        <!-- 进度条 -->
        <div class="progress-section">
          <h4>跟进进度</h4>
          <el-progress :percentage="progress" :format="() => progressLabel" />
          <div class="stage-tips">
            <span v-for="tip in stageTips" :key="tip.stage" :class="{ active: currentStage === tip.stage }">
              {{ tip.label }}
            </span>
          </div>
        </div>
        
        <!-- 跟进列表 -->
        <div class="follow-list">
          <div v-for="record in followRecords" :key="record.id" class="follow-item">
            <div class="follow-time">{{ formatDate(record.createdAt) }}</div>
            <div class="follow-content">
              <el-tag size="small">{{ getContactMethodLabel(record.contactMethod) }}</el-tag>
              <el-tag size="small" :type="getContactResultType(record.contactResult)">
                {{ getContactResultLabel(record.contactResult) }}
              </el-tag>
              <el-tag size="small" :type="getIntentionType(record.customerIntention)">
                {{ getIntentionLabel(record.customerIntention) }}意向
              </el-tag>
              <p v-if="record.notes">{{ record.notes }}</p>
              <p v-if="record.nextAction" class="next-action">下一步：{{ record.nextAction }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 添加跟进对话框 -->
    <el-dialog v-model="showFollowDialog" title="添加跟进记录" width="500px">
      <el-form :model="followForm" label-width="100px">
        <el-form-item label="联系方式">
          <el-select v-model="followForm.contactMethod">
            <el-option label="电话" value="phone" />
            <el-option label="WhatsApp" value="whatsapp" />
            <el-option label="邮件" value="email" />
            <el-option label="拜访" value="visit" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="联系结果">
          <el-select v-model="followForm.contactResult">
            <el-option label="接通" value="reached" />
            <el-option label="未接通" value="unreachable" />
            <el-option label="回拨" value="callback" />
            <el-option label="失败" value="failed" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="客户意向">
          <el-select v-model="followForm.customerIntention">
            <el-option label="高意向" value="high" />
            <el-option label="中意向" value="medium" />
            <el-option label="低意向" value="low" />
            <el-option label="无意向" value="none" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="当前阶段">
          <el-select v-model="followForm.currentStage">
            <el-option label="新线索" value="new" />
            <el-option label="首次联系" value="first_contact" />
            <el-option label="需求确认" value="requirement" />
            <el-option label="报价/样品" value="quotation" />
            <el-option label="成交/归档" value="deal" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="跟进备注">
          <el-input v-model="followForm.notes" type="textarea" :rows="3" />
        </el-form-item>
        
        <el-form-item label="下一步行动">
          <el-input v-model="followForm.nextAction" />
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="showFollowDialog = false">取消</el-button>
        <el-button type="primary" @click="submitFollow">提交</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { getLeadById } from '@/api/lead'
import { getFollowRecords, createFollowRecord, getFollowProgress } from '@/api/follow'
import type { Lead, FollowRecord } from '@/types'

const route = useRoute()
const router = useRouter()

const lead = ref<Lead>()
const followRecords = ref<FollowRecord[]>([])
const progress = ref(0)
const currentStage = ref('new')
const showFollowDialog = ref(false)

const followForm = reactive({
  contactMethod: 'phone',
  contactResult: 'reached',
  customerIntention: 'medium',
  currentStage: 'new',
  notes: '',
  nextAction: ''
})

const progressLabel = computed(() => {
  const labels: Record<string, string> = {
    new: '新线索',
    first_contact: '首次联系',
    requirement: '需求确认',
    quotation: '报价/样品',
    deal: '成交'
  }
  return labels[currentStage.value] || '新线索'
})

const stageTips = [
  { stage: 'new', label: '新线索' },
  { stage: 'first_contact', label: '首次联系' },
  { stage: 'requirement', label: '需求确认' },
  { stage: 'quotation', label: '报价/样品' },
  { stage: 'deal', label: '成交' }
]

const loadLead = async () => {
  const id = route.params.id as string
  try {
    const res = await getLeadById(id)
    lead.value = res.data
  } catch {
    ElMessage.error('加载客户信息失败')
  }
}

const loadFollowRecords = async () => {
  const id = route.params.id as string
  try {
    const res = await getFollowRecords(id)
    followRecords.value = res.data
  } catch {
    // 错误已处理
  }
}

const loadProgress = async () => {
  const id = route.params.id as string
  try {
    const res = await getFollowProgress(id)
    progress.value = res.data.progress
    currentStage.value = res.data.currentStage
  } catch {
    // 错误已处理
  }
}

const submitFollow = async () => {
  const id = route.params.id as string
  try {
    await createFollowRecord({
      ...followForm,
      leadId: id
    })
    ElMessage.success('跟进记录已添加')
    showFollowDialog.value = false
    loadFollowRecords()
    loadProgress()
  } catch {
    // 错误已处理
  }
}

const goBack = () => router.push('/leads')

const formatDate = (date?: string) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'

const getPriorityType = (level?: string) => level === 'hot' ? 'danger' : level === 'warm' ? 'warning' : 'info'
const getPriorityLabel = (level?: string) => level === 'hot' ? '高' : level === 'warm' ? '中' : '低'
const getStatusType = (status?: string) => {
  const types: Record<string, string> = { new: 'info', contacting: 'warning', negotiating: 'primary', converted: 'success', lost: 'danger' }
  return types[status || ''] || 'info'
}
const getStatusLabel = (status?: string) => {
  const labels: Record<string, string> = { new: '新线索', contacting: '联系中', negotiating: '谈判中', converted: '已成交', lost: '已流失' }
  return labels[status || ''] || status
}

const getContactMethodLabel = (method: string) => {
  const labels: Record<string, string> = { phone: '电话', whatsapp: 'WhatsApp', email: '邮件', visit: '拜访' }
  return labels[method] || method
}

const getContactResultLabel = (result: string) => {
  const labels: Record<string, string> = { reached: '接通', unreachable: '未接通', callback: '回拨', failed: '失败' }
  return labels[result] || result
}

const getContactResultType = (result: string) => result === 'reached' ? 'success' : 'danger'

const getIntentionLabel = (intention: string) => {
  const labels: Record<string, string> = { high: '高', medium: '中', low: '低', none: '无' }
  return labels[intention] || intention
}

const getIntentionType = (intention: string) => {
  const types: Record<string, string> = { high: 'success', medium: 'warning', low: 'info', none: 'danger' }
  return types[intention] || 'info'
}

onMounted(() => {
  loadLead()
  loadFollowRecords()
  loadProgress()
})
</script>

<style scoped lang="scss">
.lead-detail {
  .detail-header {
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 24px;
    
    h1 {
      font-size: 24px;
      font-weight: 600;
    }
  }
  
  .detail-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }
  
  .info-card {
    h2 {
      font-size: 18px;
      margin-bottom: 20px;
    }
    
    .notes {
      margin-top: 20px;
      padding: 16px;
      background: #F5F5F7;
      border-radius: 8px;
      
      h4 {
        margin-bottom: 8px;
      }
      
      p {
        color: #86868B;
      }
    }
  }
  
  .follow-card {
    h2 {
      font-size: 18px;
    }
    
    .follow-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    
    .progress-section {
      margin-bottom: 24px;
      
      h4 {
        margin-bottom: 12px;
      }
      
      .stage-tips {
        display: flex;
        justify-content: space-between;
        margin-top: 12px;
        
        span {
          font-size: 12px;
          color: #86868B;
          
          &.active {
            color: #007AFF;
            font-weight: 600;
          }
        }
      }
    }
    
    .follow-list {
      .follow-item {
        padding: 16px;
        border-bottom: 1px solid #E5E5E5;
        
        &:last-child {
          border-bottom: none;
        }
        
        .follow-time {
          font-size: 12px;
          color: #86868B;
          margin-bottom: 8px;
        }
        
        .follow-content {
          .el-tag {
            margin-right: 8px;
          }
          
          p {
            margin-top: 8px;
            color: #1D1D1F;
          }
          
          .next-action {
            color: #007AFF;
          }
        }
      }
    }
  }
}
</style>