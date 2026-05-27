<template>
  <div class="panel-section">
    <div class="section-header">
      <h3>标准验证结果</h3>
      <el-button link @click="showDetail = !showDetail">
        {{ showDetail ? '收起' : '详情' }}
      </el-button>
    </div>
    <div v-if="data" class="validation-panel">
      <el-alert 
        :type="getAlertType(data.status)"
        :closable="false"
        show-icon
        class="validation-result"
      >
        <template #title>
          <div class="result-title">{{ getValidationTitle(data.status) }}</div>
        </template>
        <template #default>
          <div class="result-subtitle">达到 {{ data.level }}级 能效标准</div>
        </template>
      </el-alert>
      <div v-if="showDetail" class="validation-detail">
        <el-descriptions title="适用标准" :column="2" border class="detail-block">
          <el-descriptions-item label="标准编号">{{ data.standardNo }}</el-descriptions-item>
          <el-descriptions-item label="排放等级">{{ data.emissionLevel }}</el-descriptions-item>
          <el-descriptions-item label="设备类型">{{ data.name }}</el-descriptions-item>
          <el-descriptions-item label="功率区间">{{ data.powerRange }}</el-descriptions-item>
          <el-descriptions-item label="试验循环">{{ data.testCycle }}</el-descriptions-item>
        </el-descriptions>
        
        <el-descriptions title="验证指标" :column="2" border class="detail-block">
          <el-descriptions-item label="能效指标计算值">
            <el-tag type="primary" effect="dark">{{ data.currentValue }}</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="1级基准值">{{ data.baselineLevel1 }}</el-descriptions-item>
          <el-descriptions-item label="2级基准值">{{ data.baselineLevel2 }}</el-descriptions-item>
          <el-descriptions-item label="3级基准值">{{ data.baselineLevel3 }}</el-descriptions-item>
        </el-descriptions>
        <div class="detail-block">
          <div class="block-title">验证明细</div>
          <el-table :data="data.validationItems" style="width: 100%" border size="small">
            <el-table-column prop="item" label="验证项" min-width="180" />
            <el-table-column prop="result" label="结果" width="150" />
            <el-table-column label="状态" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.status === '通过' ? 'success' : 'danger'" size="small">
                  {{ row.status === '通过' ? '✓' : '✗' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <el-button type="primary" @click="$emit('exportReport')">导出验证报告</el-button>
      </div>
    </div>
    <div v-else class="empty-state">请从左侧列表选择设备查看标准验证结果</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
  data: {
    type: Object,
    default: null
  }
})

defineEmits(['exportReport'])

const showDetail = ref(false)

const getAlertType = (status) => {
  switch (status) {
    case 'pass': return 'success'
    case 'warning': return 'warning'
    case 'fail': return 'error'
    default: return 'info'
  }
}

const getValidationTitle = (status) => {
  switch (status) {
    case 'pass': return '通过'
    case 'warning': return '待改进'
    case 'fail': return '未达标'
    default: return ''
  }
}
</script>

<style scoped>
.panel-section {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9));
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  padding: 16px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-left: 16px;
  padding-right: 16px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.btn-link {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
}

.empty-state {
  text-align: center;
  padding: 30px;
  color: rgba(255, 255, 255, 0.5);
  font-size: 14px;
}

.validation-panel {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  padding: 16px;
}

.btn-link {
  background: none;
  border: none;
  color: #3b82f6;
  font-size: 14px;
  cursor: pointer;
  text-decoration: underline;
}

.result-title {
  font-size: 20px;
  font-weight: 600;
  color: white;
}

.result-subtitle {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.validation-result {
  margin-bottom: 16px;
}

.validation-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-block {
  margin-bottom: 16px;
}

.block-title {
  font-size: 14px;
  font-weight: 600;
  color: white;
  margin-bottom: 12px;
}
</style>
