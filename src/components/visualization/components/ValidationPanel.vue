<template>
  <div class="panel-section">
    <div class="section-header">
      <h3>标准验证结果</h3>
      <button class="btn-link" @click="showDetail = !showDetail">
        {{ showDetail ? '收起' : '详情' }}
      </button>
    </div>
    <div v-if="data" class="validation-panel">
      <div class="validation-result" :class="getStatusClass(data.status)">
        <div class="result-icon">{{ getStatusIcon(data.status) }}</div>
        <div class="result-text">
          <div class="result-title">{{ getValidationTitle(data.status) }}</div>
          <div class="result-subtitle">达到 {{ data.level }}级 能效标准</div>
        </div>
      </div>
      <div v-if="showDetail" class="validation-detail">
        <div class="detail-block">
          <div class="block-title">适用标准</div>
          <div class="block-content">
            <div class="info-row">
              <span class="info-label">标准编号:</span>
              <span class="info-value">{{ data.standardNo }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">排放等级:</span>
              <span class="info-value">{{ data.emissionLevel }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">设备类型:</span>
              <span class="info-value">{{ data.name }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">功率区间:</span>
              <span class="info-value">{{ data.powerRange }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">试验循环:</span>
              <span class="info-value">{{ data.testCycle }}</span>
            </div>
          </div>
        </div>
        <div class="detail-block">
          <div class="block-title">验证指标</div>
          <div class="block-content">
            <div class="info-row">
              <span class="info-label">能效指标计算值:</span>
              <span class="info-value highlight">{{ data.currentValue }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">1级基准值:</span>
              <span class="info-value">{{ data.baselineLevel1 }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">2级基准值:</span>
              <span class="info-value">{{ data.baselineLevel2 }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">3级基准值:</span>
              <span class="info-value">{{ data.baselineLevel3 }}</span>
            </div>
          </div>
        </div>
        <div class="detail-block">
          <div class="block-title">验证明细</div>
          <div class="block-content">
            <div class="detail-table">
              <div class="table-header">
                <span class="th">验证项</span>
                <span class="th">结果</span>
                <span class="th">状态</span>
              </div>
              <div v-for="(item, index) in data.validationItems" :key="index" class="table-row">
                <span class="td">{{ item.item }}</span>
                <span class="td">{{ item.result }}</span>
                <span class="td" :class="item.status === '通过' ? 'success' : 'fail'">
                  {{ item.status === '通过' ? '✓' : '✗' }}
                </span>
              </div>
            </div>
          </div>
        </div>
        <button class="btn btn-primary" @click="$emit('exportReport')">导出验证报告</button>
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

const getStatusClass = (status) => {
  switch (status) {
    case 'pass': return 'status-pass'
    case 'warning': return 'status-warning'
    case 'fail': return 'status-fail'
    default: return ''
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case 'pass': return '✓'
    case 'warning': return '⚠'
    case 'fail': return '✗'
    default: return ''
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

.validation-result {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 16px;
}

.validation-result.status-pass {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
}

.validation-result.status-warning {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.validation-result.status-fail {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.result-icon {
  font-size: 36px;
}

.result-text {
  flex: 1;
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

.validation-detail {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-block {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  padding: 12px;
}

.block-title {
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 10px;
}

.block-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
}

.info-label {
  color: rgba(255, 255, 255, 0.6);
}

.info-value {
  color: white;
  font-weight: 500;
}

.info-value.highlight {
  color: #3b82f6;
}

.detail-table {
  margin-bottom: 12px;
}

.detail-table .table-header {
  display: grid;
  grid-template-columns: 1fr 120px 60px;
  gap: 8px;
  padding: 6px 10px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 4px;
}

.detail-table .table-row {
  display: grid;
  grid-template-columns: 1fr 120px 60px;
  gap: 8px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 4px;
  font-size: 12px;
  color: white;
  margin-bottom: 4px;
}

.detail-table .th,
.detail-table .td {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.detail-table .td.success {
  color: #22c55e;
}

.detail-table .td.fail {
  color: #ef4444;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
}
</style>
