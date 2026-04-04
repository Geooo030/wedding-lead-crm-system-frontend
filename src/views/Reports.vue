<template>
  <div class="reports-page">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="日报表" name="daily">
        <ReportContent :type="'daily'" />
      </el-tab-pane>
      <el-tab-pane label="周报表" name="weekly">
        <ReportContent :type="'weekly'" />
      </el-tab-pane>
      <el-tab-pane label="月报表" name="monthly">
        <ReportContent :type="'monthly'" />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import ReportContent from '@/components/ReportContent.vue'

const activeTab = ref('daily')
</script>

<style scoped lang="scss">
.reports-page {
  :deep(.el-tabs__header) {
    margin-bottom: 24px;
  }
}
</style>