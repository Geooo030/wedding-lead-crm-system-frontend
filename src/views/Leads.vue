<template>
  <div class="leads-page" :class="{ 'is-mobile': isMobile }">
    <!-- 功能切换栏 -->
    <div class="card function-bar">
      <el-tabs v-model="activeTab" @tab-click="handleTabClick">
        <el-tab-pane label="全部客户" name="all" />
        <el-tab-pane label="我的跟进" name="following" />
      </el-tabs>
    </div>
    
    <!-- PC端筛选栏 -->
    <div v-if="!isMobile" class="card filter-bar">
      <el-form :inline="true" :model="filters">
        <el-form-item label="国家">
          <el-select v-model="filters.country" placeholder="选择国家" clearable style="width: 150px;">
            <el-option v-for="country in countries" :key="country" :label="country" :value="country" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="选择状态" clearable style="width: 150px;">
            <el-option label="新线索" value="new_lead" />
            <el-option label="联系中" value="contacting" />
            <el-option label="谈判中" value="negotiating" />
            <el-option label="已成交" value="converted" />
            <el-option label="已流失" value="lost" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="优先级">
          <el-select v-model="filters.priorityLevel" placeholder="选择优先级" clearable style="width: 130px;">
            <el-option label="🔥 高" value="hot" />
            <el-option label="🌤️ 中" value="warm" />
            <el-option label="❄️ 低" value="cold" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="关键词">
          <el-input v-model="filters.keyword" placeholder="搜索公司名/电话/邮箱" clearable />
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="search">搜索</el-button>
          <el-button @click="resetFilters">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    
    <!-- 移动端筛选栏 -->
    <div v-else class="mobile-filter-bar">
      <div class="mobile-filter-row">
        <el-input 
          v-model="filters.keyword" 
          placeholder="搜索公司名/电话" 
          clearable
          @keyup.enter="search"
        >
          <template #append>
            <el-button @click="toggleFilterPanel">
              <el-icon><Filter /></el-icon>
            </el-button>
          </template>
        </el-input>
      </div>
      
      <!-- 高级筛选面板 -->
      <transition name="slide">
        <div v-if="showFilterPanel" class="filter-panel">
          <div class="filter-item">
            <span class="filter-label">国家</span>
            <el-select v-model="filters.country" placeholder="选择国家" clearable>
              <el-option v-for="country in countries" :key="country" :label="country" :value="country" />
            </el-select>
          </div>
          
          <div class="filter-item">
            <span class="filter-label">状态</span>
            <el-select v-model="filters.status" placeholder="选择状态" clearable>
              <el-option label="新线索" value="new_lead" />
              <el-option label="联系中" value="contacting" />
              <el-option label="谈判中" value="negotiating" />
              <el-option label="已成交" value="converted" />
              <el-option label="已流失" value="lost" />
            </el-select>
          </div>
          
          <div class="filter-item">
            <span class="filter-label">优先级</span>
            <el-select v-model="filters.priorityLevel" placeholder="选择优先级" clearable>
              <el-option label="🔥 高" value="hot" />
              <el-option label="🌤️ 中" value="warm" />
              <el-option label="❄️ 低" value="cold" />
            </el-select>
          </div>
          
          <div class="filter-actions">
            <el-button @click="resetFilters">重置</el-button>
            <el-button type="primary" @click="search">搜索</el-button>
          </div>
        </div>
      </transition>
    </div>
    
    <!-- PC端表格 -->
    <div v-if="!isMobile" class="card">
      <el-table :data="leads" v-loading="loading" @row-click="goToDetail" style="width: 100%">
        <el-table-column prop="companyName" label="公司名称" min-width="200">
          <template #default="{ row }">
            <div class="company-info">
              <span class="company-name">{{ row.companyName }}</span>
              <span class="company-type">{{ row.companyType }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="country" label="国家" width="120" />
        
        <el-table-column prop="region" label="地区" width="120" />
        
        <el-table-column label="联系方式" width="200">
          <template #default="{ row }">
            <div class="contact-info">
              <span v-if="row.contactPhone">📞 {{ row.contactPhone }}</span>
              <span v-if="row.contactEmail">✉️ {{ row.contactEmail }}</span>
            </div>
          </template>
        </el-table-column>
        
        <el-table-column prop="priorityLevel" label="优先级" width="100">
          <template #default="{ row }">
            <el-tag :type="getPriorityType(row.priorityLevel)">
              {{ getPriorityLabel(row.priorityLevel) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="followOperator" label="跟进人" width="120">
          <template #default="{ row }">
            {{ row.followOperator || '-' }}
          </template>
        </el-table-column>
        
        <el-table-column prop="createdAt" label="创建时间" width="160">
          <template #default="{ row }">
            {{ formatDate(row.createdAt) }}
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click.stop="goToDetail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination">
        <el-pagination
          v-model:current-page="page"
          v-model:page-size="pageSize"
          :total="total"
          :page-sizes="[20, 50, 100]"
          layout="total, sizes, prev, pager, next"
          @size-change="loadLeads"
          @current-change="loadLeads"
        />
      </div>
    </div>
    
    <!-- 移动端卡片列表 -->
    <div v-else class="mobile-leads-list" v-loading="loading">
      <div 
        v-for="lead in leads" 
        :key="lead.id" 
        class="lead-card"
        @click="goToDetail(lead)"
      >
        <div class="card-header">
          <div class="company-name">{{ lead.companyName }}</div>
          <el-tag :type="getPriorityType(lead.priorityLevel)" size="small">
            {{ getPriorityLabel(lead.priorityLevel) }}
          </el-tag>
        </div>
        
        <div class="card-body">
          <div class="info-row">
            <span class="info-label">类型</span>
            <span class="info-value">{{ lead.companyType || '-' }}</span>
          </div>
          
          <div class="info-row">
            <span class="info-label">地区</span>
            <span class="info-value">{{ lead.country }} · {{ lead.region }}</span>
          </div>
          
          <div class="info-row" v-if="lead.contactPhone">
            <span class="info-label">电话</span>
            <span class="info-value phone" @click.stop="callPhone(lead.contactPhone)">
              📞 {{ lead.contactPhone }}
            </span>
          </div>
          
          <div class="info-row" v-if="lead.followOperator">
            <span class="info-label">跟进人</span>
            <span class="info-value">{{ lead.followOperator }}</span>
          </div>
        </div>
        
        <div class="card-footer">
          <el-tag :type="getStatusType(lead.status)" size="small">
            {{ getStatusLabel(lead.status) }}
          </el-tag>
          <span class="create-time">{{ formatDate(lead.createdAt) }}</span>
        </div>
      </div>
      
      <!-- 移动端分页 -->
      <div class="mobile-pagination">
        <el-button 
          :disabled="page <= 1" 
          @click="prevPage"
        >
          上一页
        </el-button>
        <span class="page-info">{{ page }} / {{ totalPages }}</span>
        <el-button 
          :disabled="page >= totalPages" 
          @click="nextPage"
        >
          下一页
        </el-button>
      </div>
      
      <!-- 空状态 -->
      <div v-if="!loading && leads.length === 0" class="empty-state">
        <span class="empty-icon">📭</span>
        <p>暂无客户数据</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import dayjs from 'dayjs'
import { getLeads, getCountries } from '@/api/lead'
import { isMobile as isMobileDevice } from '@/utils/device'
import type { Lead } from '@/types'

const router = useRouter()
const loading = ref(false)
const leads = ref<Lead[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)
const isMobile = ref(isMobileDevice())
const showFilterPanel = ref(false)
const countries = ref<string[]>([])
const activeTab = ref('all')

const filters = reactive({
  country: '',
  status: '',
  priorityLevel: '',
  keyword: ''
})

const totalPages = computed(() => Math.ceil(total.value / pageSize.value) || 1)

const loadCountries = async () => {
  try {
    const res = await getCountries()
    if (res && res.data) {
      countries.value = res.data
    }
  } catch (error) {
    console.error('获取国家列表失败:', error)
  }
}

const handleTabClick = () => {
  page.value = 1
  loadLeads()
}

const loadLeads = async () => {
  // 检查 token 是否存在
  const token = localStorage.getItem('token')
  if (!token) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  loading.value = true
  try {
    // 构建请求参数
    const requestParams = {
      ...filters,
      page: page.value - 1,
      size: pageSize.value
    }
    
    // 如果是"我的跟进"标签，只显示联系中和谈判中的客户
    if (activeTab.value === 'following') {
      requestParams.status = 'contacting,negotiating'
    }
    
    const res = await getLeads(requestParams)
    
    // 检查响应数据
    if (res && res.data) {
      // 后端直接返回数组，不是分页格式
      leads.value = Array.isArray(res.data) ? res.data : []
      total.value = leads.value.length
    } else {
      console.error('响应数据格式错误:', res)
      ElMessage.error('数据格式错误')
    }
  } catch (error: unknown) {
    console.error('获取客户列表失败:', error)
    
    // 检查是否是 401 错误
    const err = error as { response?: { status?: number } }
    if (err?.response?.status === 401) {
      ElMessage.warning('登录已过期，请重新登录')
      localStorage.removeItem('token')
      router.push('/login')
    } else {
      // 错误已经在 request.ts 中显示了，这里不再重复显示
    }
  } finally {
    loading.value = false
  }
}

const search = () => {
  page.value = 1
  showFilterPanel.value = false
  loadLeads()
}

const resetFilters = () => {
  Object.assign(filters, { country: '', status: '', priorityLevel: '', keyword: '' })
  search()
}

const toggleFilterPanel = () => {
  showFilterPanel.value = !showFilterPanel.value
}

const prevPage = () => {
  if (page.value > 1) {
    page.value--
    loadLeads()
  }
}

const nextPage = () => {
  if (page.value < totalPages.value) {
    page.value++
    loadLeads()
  }
}

const goToDetail = (row: Lead) => {
  router.push(`/leads/${row.id}`)
}

const callPhone = (phone: string) => {
  window.location.href = `tel:${phone}`
}

const getPriorityType = (level: string) => {
  const types: Record<string, string> = { HOT: 'danger', WARM: 'warning', COLD: 'info' }
  return types[level] || 'info'
}

const getPriorityLabel = (level: string) => {
  const labels: Record<string, string> = { HOT: '高', WARM: '中', COLD: '低' }
  return labels[level] || level
}

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    NEW_LEAD: 'info',
    CONTACTING: 'warning',
    NEGOTIATING: 'primary',
    CONVERTED: 'success',
    LOST: 'danger'
  }
  return types[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    NEW_LEAD: '新线索',
    CONTACTING: '联系中',
    NEGOTIATING: '谈判中',
    CONVERTED: '已成交',
    LOST: '已流失'
  }
  return labels[status] || status
}

const formatDate = (date: string) => dayjs(date).format('MM-DD HH:mm')

onMounted(() => {
  loadCountries()
  loadLeads()
})
</script>

<style scoped lang="scss">
.leads-page {
  // PC端样式
  .function-bar {
    margin-bottom: 20px;
  }
  
  .filter-bar {
    margin-bottom: 20px;
    
    .el-form-item {
      margin-bottom: 0;
    }
  }
  
  .company-info {
    .company-name {
      font-weight: 600;
      display: block;
    }
    
    .company-type {
      font-size: 12px;
      color: #86868B;
    }
  }
  
  .contact-info {
    font-size: 13px;
    color: #86868B;
    
    span {
      display: block;
    }
  }
  
  .pagination {
    margin-top: 20px;
    display: flex;
    justify-content: flex-end;
  }
  
  :deep(.el-table__row) {
    cursor: pointer;
    
    &:hover {
      background: #F5F5F7;
    }
  }
  
  .card {
    background: white;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  
  // 移动端样式
  &.is-mobile {
    .mobile-filter-bar {
      margin-bottom: 12px;
      
      .mobile-filter-row {
        margin-bottom: 8px;
      }
      
      .filter-panel {
        background: white;
        border-radius: 12px;
        padding: 16px;
        margin-top: 8px;
        
        .filter-item {
          margin-bottom: 12px;
          
          .filter-label {
            display: block;
            font-size: 12px;
            color: #86868B;
            margin-bottom: 4px;
          }
          
          .el-select {
            width: 100%;
          }
        }
        
        .filter-actions {
          display: flex;
          gap: 8px;
          margin-top: 16px;
          
          .el-button {
            flex: 1;
          }
        }
      }
      
      .slide-enter-active,
      .slide-leave-active {
        transition: all 0.3s ease;
      }
      
      .slide-enter-from,
      .slide-leave-to {
        opacity: 0;
        transform: translateY(-10px);
      }
    }
    
    .mobile-leads-list {
      .lead-card {
        background: white;
        border-radius: 12px;
        padding: 16px;
        margin-bottom: 12px;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        cursor: pointer;
        transition: transform 0.2s;
        
        &:active {
          transform: scale(0.98);
        }
        
        .card-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 12px;
          
          .company-name {
            font-size: 16px;
            font-weight: 600;
            color: #1D1D1F;
            flex: 1;
            margin-right: 8px;
            line-height: 1.4;
          }
        }
        
        .card-body {
          .info-row {
            display: flex;
            align-items: center;
            margin-bottom: 8px;
            font-size: 13px;
            
            .info-label {
              color: #86868B;
              width: 48px;
              flex-shrink: 0;
            }
            
            .info-value {
              color: #1D1D1F;
              flex: 1;
              
              &.phone {
                color: #007AFF;
              }
            }
          }
        }
        
        .card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 12px;
          padding-top: 12px;
          border-top: 1px solid #F5F5F7;
          
          .create-time {
            font-size: 12px;
            color: #86868B;
          }
        }
      }
      
      .mobile-pagination {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 16px;
        padding: 16px 0;
        
        .page-info {
          font-size: 14px;
          color: #86868B;
        }
      }
      
      .empty-state {
        text-align: center;
        padding: 60px 20px;
        
        .empty-icon {
          font-size: 48px;
          display: block;
          margin-bottom: 12px;
        }
        
        p {
          color: #86868B;
          font-size: 14px;
        }
      }
    }
  }
}
</style>