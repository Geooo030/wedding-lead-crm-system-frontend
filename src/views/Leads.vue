<template>
  <div class="leads-page">
    <!-- 筛选栏 -->
    <div class="card filter-bar">
      <el-form :inline="true" :model="filters">
        <el-form-item label="国家">
          <el-input v-model="filters.country" placeholder="输入国家" clearable />
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select v-model="filters.status" placeholder="选择状态" clearable>
            <el-option label="新线索" value="new" />
            <el-option label="联系中" value="contacting" />
            <el-option label="谈判中" value="negotiating" />
            <el-option label="已成交" value="converted" />
            <el-option label="已流失" value="lost" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="优先级">
          <el-select v-model="filters.priorityLevel" placeholder="选择优先级" clearable>
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
    
    <!-- 客户列表 -->
    <div class="card">
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import dayjs from 'dayjs'
import { getLeads } from '@/api/lead'
import type { Lead } from '@/types'

const router = useRouter()
const loading = ref(false)
const leads = ref<Lead[]>([])
const total = ref(0)
const page = ref(1)
const pageSize = ref(20)

const filters = reactive({
  country: '',
  status: '',
  priorityLevel: '',
  keyword: ''
})

const loadLeads = async () => {
  loading.value = true
  try {
    const res = await getLeads({
      ...filters,
      page: page.value - 1,
      size: pageSize.value
    })
    leads.value = res.data.content
    total.value = res.data.totalElements
  } finally {
    loading.value = false
  }
}

const search = () => {
  page.value = 1
  loadLeads()
}

const resetFilters = () => {
  Object.assign(filters, { country: '', status: '', priorityLevel: '', keyword: '' })
  search()
}

const goToDetail = (row: Lead) => {
  router.push(`/leads/${row.id}`)
}

const getPriorityType = (level: string) => {
  const types: Record<string, string> = { hot: 'danger', warm: 'warning', cold: 'info' }
  return types[level] || 'info'
}

const getPriorityLabel = (level: string) => {
  const labels: Record<string, string> = { hot: '高', warm: '中', cold: '低' }
  return labels[level] || level
}

const getStatusType = (status: string) => {
  const types: Record<string, string> = {
    new: 'info',
    contacting: 'warning',
    negotiating: 'primary',
    converted: 'success',
    lost: 'danger'
  }
  return types[status] || 'info'
}

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    new: '新线索',
    contacting: '联系中',
    negotiating: '谈判中',
    converted: '已成交',
    lost: '已流失'
  }
  return labels[status] || status
}

const formatDate = (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm')

onMounted(() => {
  loadLeads()
})
</script>

<style scoped lang="scss">
.leads-page {
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
}
</style>