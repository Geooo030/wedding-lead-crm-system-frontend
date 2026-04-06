<template>
  <div class="lead-detail" :class="{ 'is-mobile': isMobile }">
    <!-- PC端头部 -->
    <div v-if="!isMobile" class="detail-header">
      <el-button @click="goBack">← 返回列表</el-button>
      <h1>{{ lead?.companyName }}</h1>
    </div>
    
    <!-- 移动端头部 -->
    <div v-else class="mobile-header">
      <div class="header-top">
        <el-button text @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <span class="header-title">客户详情</span>
        <div class="header-actions">
          <el-dropdown trigger="click">
            <el-icon class="more-icon"><More /></el-icon>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="showFollowDialog = true">添加跟进</el-dropdown-item>
                <el-dropdown-item v-if="lead?.contactPhone" @click="callPhone(lead.contactPhone)">
                  拨打电话
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </div>
      <div class="header-company">
        <h1>{{ lead?.companyName }}</h1>
        <div class="company-tags">
          <el-tag :type="getPriorityType(lead?.priorityLevel)" size="small">
            {{ getPriorityLabel(lead?.priorityLevel) }}优先
          </el-tag>
          <el-tag :type="getStatusType(lead?.status)" size="small">
            {{ getStatusLabel(lead?.status) }}
          </el-tag>
        </div>
      </div>
    </div>
    
    <div class="detail-content">
      <!-- 右侧：跟进记录 -->
      <div class="card follow-card">
        <div class="follow-header">
          <h2>跟进记录</h2>
          <el-button v-if="!isMobile" type="primary" @click="showFollowDialog = true">添加跟进</el-button>
        </div>
        
        <!-- 进度条 -->
        <div class="progress-section">
          <h4>跟进进度</h4>
          <el-progress :percentage="progress" :format="() => progressLabel" />
          <div class="stage-tips" :class="{ 'is-mobile': isMobile }">
            <span v-for="tip in stageTips" :key="tip.stage" :class="{ active: currentStage === tip.stage }">
              {{ tip.label }}
            </span>
          </div>
        </div>
        
        <!-- 跟进列表 -->
        <div class="follow-list">
          <div v-if="followRecords.length === 0" class="empty-state">
            暂无跟进记录
          </div>
          <div v-for="record in followRecords" :key="record.id" class="follow-item">
            <div class="follow-header">
              <div class="follow-time">{{ formatDate(record.createdAt) }}</div>
              <div class="follow-operator" v-if="record.operatorUsername">
                <el-tag type="info" size="small">跟进人: {{ record.operatorUsername }}</el-tag>
              </div>
            </div>
            <div class="follow-content">
              <div class="follow-tags">
                <el-tag size="small">{{ getContactMethodLabel(record.contactMethod) }}</el-tag>
                <el-tag size="small" :type="getContactResultType(record.contactResult)">
                  {{ getContactResultLabel(record.contactResult) }}
                </el-tag>
                <el-tag size="small" :type="getIntentionType(record.customerIntention)">
                  {{ getIntentionLabel(record.customerIntention) }}意向
                </el-tag>
              </div>
              <p v-if="record.notes">{{ record.notes }}</p>
              <p v-if="record.nextAction" class="next-action">下一步：{{ record.nextAction }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 左侧：客户信息 -->
      <div class="card info-card">
        <h2>客户信息</h2>
        
        <!-- PC端表格 -->
        <el-descriptions v-if="!isMobile" :column="2" border>
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
          <el-descriptions-item label="获客方式">
            <el-tag :type="getLeadSourceType(lead?.leadSource)">
              {{ getLeadSourceLabel(lead?.leadSource) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="跟进人">{{ lead?.followOperator || '-' }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{ formatDate(lead?.createdAt) }}</el-descriptions-item>
        </el-descriptions>
        
        <!-- 移动端信息列表 -->
        <div v-else class="mobile-info-list">
          <div class="info-item">
            <span class="info-label">公司类型</span>
            <span class="info-value">{{ lead?.companyType || '-' }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">所在地区</span>
            <span class="info-value">{{ lead?.country }} · {{ lead?.region }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">获客方式</span>
            <span class="info-value">
              <el-tag :type="getLeadSourceType(lead?.leadSource)" size="small">
                {{ getLeadSourceLabel(lead?.leadSource) }}
              </el-tag>
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">跟进人</span>
            <span class="info-value">{{ lead?.followOperator || '-' }}</span>
          </div>
          <div class="info-item" v-if="lead?.contactPhone" @click="callPhone(lead.contactPhone)">
            <span class="info-label">联系电话</span>
            <span class="info-value phone">
              {{ lead.contactPhone }}
              <el-icon><Phone /></el-icon>
            </span>
          </div>
          <div class="info-item" v-if="lead?.contactEmail">
            <span class="info-label">邮箱</span>
            <span class="info-value">{{ lead.contactEmail }}</span>
          </div>
          <div class="info-item" v-if="lead?.website">
            <span class="info-label">网站</span>
            <span class="info-value link" @click="openWebsite(lead.website)">
              {{ lead.website }}
            </span>
          </div>
          <div class="info-item">
            <span class="info-label">创建时间</span>
            <span class="info-value">{{ formatDate(lead?.createdAt) }}</span>
          </div>
        </div>
        
        <div class="notes" v-if="lead?.notes">
          <h4>备注</h4>
          <p>{{ lead.notes }}</p>
        </div>
      </div>
    </div>
    
    <!-- 移动端底部操作栏 -->
    <div v-if="isMobile" class="mobile-bottom-bar">
      <el-button type="primary" size="large" @click="showFollowDialog = true">
        <el-icon><Plus /></el-icon>
        添加跟进
      </el-button>
      <el-button 
        v-if="lead?.contactPhone" 
        size="large" 
        @click="callPhone(lead.contactPhone)"
      >
        <el-icon><Phone /></el-icon>
        拨打电话
      </el-button>
    </div>
    
    <!-- 添加跟进对话框 -->
    <el-dialog 
      v-model="showFollowDialog" 
      title="添加跟进记录" 
      :width="isMobile ? '90%' : '500px'"
      :destroy-on-close="true"
    >
      <el-form ref="followFormRef" :model="followForm" label-width="100px" :label-position="isMobile ? 'top' : 'right'">
        <el-form-item label="联系方式">
          <el-select v-model="followForm.contactMethod" placeholder="请选择联系方式" :style="{ width: isMobile ? '100%' : '200px' }" clearable>
            <el-option label="电话" value="phone" />
            <el-option label="WhatsApp" value="whatsapp" />
            <el-option label="邮件" value="email" />
            <el-option label="拜访" value="visit" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="联系结果">
          <el-select v-model="followForm.contactResult" placeholder="请选择联系结果" :style="{ width: isMobile ? '100%' : '200px' }" clearable>
            <el-option label="接通" value="reached" />
            <el-option label="未接通" value="unreachable" />
            <el-option label="回拨" value="callback" />
            <el-option label="失败" value="failed" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="客户意向">
          <el-select v-model="followForm.customerIntention" placeholder="请选择客户意向" :style="{ width: isMobile ? '100%' : '200px' }" clearable>
            <el-option label="高意向" value="high" />
            <el-option label="中意向" value="medium" />
            <el-option label="低意向" value="low" />
            <el-option label="无意向" value="none" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="当前阶段">
          <el-select v-model="followForm.currentStage" placeholder="请选择当前阶段" :style="{ width: isMobile ? '100%' : '200px' }" clearable>
            <el-option label="新线索" value="new_lead" />
            <el-option label="首次联系" value="first_contact" />
            <el-option label="需求确认" value="requirement" />
            <el-option label="报价/样品" value="quotation" />
            <el-option label="成交/归档" value="deal" />
            <el-option label="已拒绝" value="rejected" />
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
import { ref, reactive, computed, onMounted, watch, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { getLeadById } from '@/api/lead'
import { getFollowRecords, createFollowRecord, getFollowProgress } from '@/api/follow'
import { isMobile as isMobileDevice } from '@/utils/device'
import type { Lead, FollowRecord } from '@/types'

const route = useRoute()
const router = useRouter()
const isMobile = ref(isMobileDevice())

const lead = ref<Lead>()
const followRecords = ref<FollowRecord[]>([])
const progress = ref(0)
const currentStage = ref('new_lead')
const showFollowDialog = ref(false)
const followFormRef = ref()

const followForm = reactive<{
  contactMethod: 'phone' | 'whatsapp' | 'email' | 'visit' | undefined
  contactResult: 'reached' | 'unreachable' | 'callback' | 'failed' | undefined
  customerIntention: 'high' | 'medium' | 'low' | 'none' | undefined
  currentStage: 'new_lead' | 'first_contact' | 'requirement' | 'quotation' | 'deal' | undefined
  notes: string
  nextAction: string
}>({
  contactMethod: undefined,
  contactResult: undefined,
  customerIntention: undefined,
  currentStage: undefined,
  notes: '',
  nextAction: ''
})

const resetFollowForm = () => {
  followForm.contactMethod = 'phone' as 'phone' | 'whatsapp' | 'email' | 'visit'
  followForm.contactResult = 'reached' as 'reached' | 'unreachable' | 'callback' | 'failed'
  followForm.customerIntention = 'medium' as 'high' | 'medium' | 'low' | 'none'
  followForm.currentStage = 'new_lead' as 'new_lead' | 'first_contact' | 'requirement' | 'quotation' | 'deal'
  followForm.notes = ''
  followForm.nextAction = ''
}

watch(showFollowDialog, (newVal) => {
  if (newVal) {
    nextTick(() => {
      resetFollowForm()
    })
  }
})

const progressLabel = computed(() => {
  const labels: Record<string, string> = {
    new: '新线索',
    new_lead: '新线索',
    first_contact: '首次联系',
    requirement: '需求确认',
    quotation: '报价/样品',
    deal: '成交',
    rejected: '已拒绝'
  }
  return labels[currentStage.value] || '新线索'
})

const stageTips = [
  { stage: 'new_lead', label: '新线索' },
  { stage: 'first_contact', label: '首次联系' },
  { stage: 'requirement', label: '需求确认' },
  { stage: 'quotation', label: '报价/样品' },
  { stage: 'deal', label: '成交' },
  { stage: 'rejected', label: '已拒绝' }
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
  if (!followForm.contactMethod) {
    ElMessage.warning('请选择联系方式')
    return
  }
  if (!followForm.contactResult) {
    ElMessage.warning('请选择联系结果')
    return
  }
  if (!followForm.customerIntention) {
    ElMessage.warning('请选择客户意向')
    return
  }
  if (!followForm.currentStage) {
    ElMessage.warning('请选择当前阶段')
    return
  }
  
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

const callPhone = (phone: string) => {
  window.location.href = `tel:${phone}`
}

const openWebsite = (url: string) => {
  window.open(url, '_blank')
}

const formatDate = (date?: string) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : '-'

const getPriorityType = (level?: string) => level === 'hot' ? 'danger' : level === 'warm' ? 'warning' : 'info'
const getPriorityLabel = (level?: string) => level === 'hot' ? '高' : level === 'warm' ? '中' : '低'
const getStatusType = (status?: string) => {
  const types: Record<string, string> = { new_lead: 'info', contacting: 'warning', negotiating: 'primary', converted: 'success', lost: 'danger' }
  return types[status || ''] || 'info'
}
const getStatusLabel = (status?: string) => {
  const labels: Record<string, string> = { new_lead: '新线索', contacting: '联系中', negotiating: '谈判中', converted: '已成交', lost: '已流失' }
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

const getLeadSourceLabel = (source?: string) => {
  const labels: Record<string, string> = { ai: 'AI获客', manual: '人工获客' }
  return labels[source || ''] || source || '-'
}

const getLeadSourceType = (source?: string) => {
  const types: Record<string, string> = { ai: 'success', manual: 'warning' }
  return types[source || ''] || 'info'
}

onMounted(() => {
  loadLead()
  loadFollowRecords()
  loadProgress()
})
</script>

<style scoped lang="scss">
.lead-detail {
  &.is-mobile {
    padding-bottom: 80px;
    
    .mobile-header {
      background: white;
      padding: 12px 16px;
      margin: -12px -12px 12px;
      
      .header-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 12px;
        
        .header-title {
          font-size: 17px;
          font-weight: 600;
        }
        
        .more-icon {
          font-size: 22px;
          color: #1D1D1F;
        }
      }
      
      .header-company {
        h1 {
          font-size: 20px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        
        .company-tags {
          display: flex;
          gap: 8px;
        }
      }
    }
    
    .detail-content {
      grid-template-columns: 1fr;
    }
    
    .info-card {
      h2 {
        font-size: 16px;
      }
      
      .mobile-info-list {
        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 0;
          border-bottom: 1px solid #F5F5F7;
          
          &:last-child {
            border-bottom: none;
          }
          
          .info-label {
            color: #86868B;
            font-size: 14px;
          }
          
          .info-value {
            color: #1D1D1F;
            font-size: 14px;
            
            &.phone, &.link {
              color: #007AFF;
            }
            
            .el-icon {
              margin-left: 4px;
            }
          }
        }
      }
    }
    
    .follow-card {
      h2 {
        font-size: 16px;
      }
      
      .progress-section {
        .stage-tips {
          flex-wrap: wrap;
          gap: 8px;
          
          span {
            font-size: 11px;
          }
        }
      }
      
      .follow-list {
        .follow-item {
          padding: 12px 0;
          
          .follow-content {
            .follow-tags {
              display: flex;
              flex-wrap: wrap;
              gap: 4px;
              
              .el-tag {
                margin-right: 0;
              }
            }
          }
        }
      }
    }
    
    .mobile-bottom-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: white;
      padding: 12px 16px;
      display: flex;
      gap: 12px;
      box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.08);
      
      .el-button {
        flex: 1;
      }
    }
  }
  
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
  
  .card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
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
        white-space: pre-wrap;
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
      .empty-state {
        text-align: center;
        padding: 40px;
        color: #86868B;
      }
      
      .follow-item {
        padding: 16px;
        border-bottom: 1px solid #E5E5E5;
        
        &:last-child {
          border-bottom: none;
        }
        
        .follow-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          
          .follow-time {
            font-size: 12px;
            color: #86868B;
            margin-bottom: 0;
          }
          
          .follow-operator {
            .el-tag {
              margin-right: 0;
            }
          }
        }
        
        .follow-content {
          .el-tag {
            margin-right: 8px;
          }
          
          .follow-tags {
            margin-bottom: 8px;
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