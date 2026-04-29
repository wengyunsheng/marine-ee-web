<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>查看能效数据</h3>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <div class="data-details">
          <div class="detail-row">
            <label>数据日期:</label>
            <span>{{ data.dataDate }}</span>
          </div>
          <div class="detail-row">
            <label>设备类型:</label>
            <span>{{ data.deviceType }}</span>
          </div>
          <div class="detail-row">
            <label>设备名称:</label>
            <span>{{ data.deviceName }}</span>
          </div>
          <div class="detail-row">
            <label>数据来源:</label>
            <span>{{ data.dataSource }}</span>
          </div>
          <div class="detail-row">
            <label>工况特性:</label>
            <span>{{ data.workingCondition }}</span>
          </div>
          <div class="detail-row">
            <label>能效指标值:</label>
            <span>{{ data.efficiencyValue || '-' }}</span>
          </div>
          <div class="detail-row">
            <label>能效等级:</label>
            <span v-if="data.efficiencyLevel" class="efficiency-badge" :class="'level-' + data.efficiencyLevel.replace('级', '')">
              {{ data.efficiencyLevel }}
            </span>
            <span v-else class="text-muted">-</span>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" @click="$emit('close')">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  background-color: #f8fafc;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #64748b;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.modal-close:hover {
  background-color: #e2e8f0;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.data-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-row.full-width {
  grid-column: 1 / -1;
}

.detail-row label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  min-width: auto;
}

.detail-row span {
  font-size: 14px;
  color: #1f2937;
  font-weight: 500;
}

.efficiency-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  color: white;
}

.efficiency-badge.level-1 {
  background-color: #22c55e;
}

.efficiency-badge.level-2 {
  background-color: #3b82f6;
}

.efficiency-badge.level-3 {
  background-color: #f59e0b;
}

.efficiency-badge.level-4 {
  background-color: #f97316;
}

.efficiency-badge.level-5 {
  background-color: #ef4444;
}

.text-muted {
  color: #94a3b8;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #e2e8f0;
  background-color: #f8fafc;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
  }
  
  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .detail-row label {
    min-width: auto;
  }
}
</style>