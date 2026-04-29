<template>
  <div class="panel-section">
    <div class="section-header">
      <h3>指标差异分析</h3>
      <button class="btn-link" @click="showDetail = !showDetail">
        {{ showDetail ? '收起' : '详情' }}
      </button>
    </div>
    <div v-if="data" class="analysis-panel">
      <div class="analysis-header">
        <span class="equipment-name">{{ data.name }}</span>
        <span class="equipment-level" :class="getLevelClass(data.level)">
          {{ data.level }}级
        </span>
      </div>
      <div class="comparison-section">
        <div class="comparison-title">能效指标对比</div>
        <div class="comparison-bars">
          <div class="bar-item">
            <span class="bar-label">当前值</span>
            <div class="bar-track">
              <div class="bar-fill current" :style="{ width: getBarWidth(data.currentValue) + '%' }"></div>
            </div>
            <span class="bar-value">{{ data.currentValue }}</span>
          </div>
          <div class="bar-item">
            <span class="bar-label">{{ data.level }}级基准</span>
            <div class="bar-track">
              <div class="bar-fill baseline" :style="{ width: getBarWidth(data.baselineLevel2) + '%' }"></div>
            </div>
            <span class="bar-value">{{ data.baselineLevel2 }} ({{ data.level }}级)</span>
          </div>
          <div class="bar-item">
            <span class="bar-label">1级基准(目标)</span>
            <div class="bar-track">
              <div class="bar-fill target" :style="{ width: getBarWidth(data.baselineLevel1) + '%' }"></div>
            </div>
            <span class="bar-value">{{ data.baselineLevel1 }} (1级)</span>
          </div>
        </div>
        <div class="gap-info">
          <div class="gap-item">
            <span class="gap-label">距{{ data.level }}级基准:</span>
            <span class="gap-value" :class="data.gapToLevel2 >= 0 ? 'positive' : 'negative'">
              {{ data.gapToLevel2 >= 0 ? '+' : '' }}{{ data.gapToLevel2 }}
              <span v-if="data.gapToLevel2 >= 0" class="gap-status">✓ 已达标</span>
            </span>
          </div>
          <div class="gap-item">
            <span class="gap-label">距1级基准:</span>
            <span class="gap-value negative">{{ data.gapToLevel1 }}</span>
          </div>
        </div>
      </div>
      <div v-if="showDetail" class="detail-section">
        <div class="detail-title">各工况燃油消耗率差异</div>
        <div class="detail-table">
          <div class="table-header">
            <span class="th">工况</span>
            <span class="th">当前值</span>
            <span class="th">基准值</span>
            <span class="th">差异</span>
          </div>
          <div v-for="(condition, index) in data.conditions" :key="index" class="table-row">
            <span class="td">{{ condition.name }}</span>
            <span class="td">{{ condition.current }}</span>
            <span class="td">{{ condition.baseline }}</span>
            <span class="td" :class="condition.diff >= 0 ? 'warning' : 'success'">
              {{ condition.diff >= 0 ? '+' : '' }}{{ condition.diff }}
              {{ condition.diff >= 0 ? '⚠' : '✓' }}
            </span>
          </div>
        </div>
        <div v-if="data.warningConditions" class="warning-tip">
          ⚠ {{ data.warningConditions }}
        </div>
        <button class="btn btn-outline" @click="$emit('viewReport')">查看详细分析报告</button>
      </div>
    </div>
    <div v-else class="empty-state">请从左侧列表选择设备查看指标差异分析</div>
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

defineEmits(['viewReport'])

const showDetail = ref(false)

const getLevelClass = (level) => {
  switch (level) {
    case '1': return 'level-excellent'
    case '2': return 'level-good'
    case '3': return 'level-warning'
    default: return ''
  }
}

const getBarWidth = (value) => {
  return Math.min((value / 60) * 100, 100)
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

.analysis-panel {
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
  padding: 16px;
}

.analysis-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.equipment-name {
  font-size: 14px;
  font-weight: 600;
  color: white;
}

.equipment-level {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
}

.equipment-level.level-excellent {
  background-color: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.equipment-level.level-good {
  background-color: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.equipment-level.level-warning {
  background-color: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.comparison-section {
  margin-bottom: 16px;
}

.comparison-title {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 12px;
}

.comparison-bars {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.bar-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.bar-label {
  width: 80px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  flex-shrink: 0;
}

.bar-track {
  flex: 1;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.bar-fill.current {
  background: linear-gradient(90deg, #3b82f6, #60a5fa);
}

.bar-fill.baseline {
  background: linear-gradient(90deg, #f59e0b, #fbbf24);
}

.bar-fill.target {
  background: linear-gradient(90deg, #22c55e, #4ade80);
}

.bar-value {
  width: 100px;
  font-size: 12px;
  text-align: right;
  color: rgba(255, 255, 255, 0.8);
}

.gap-info {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 12px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
}

.gap-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.gap-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.gap-value {
  font-size: 13px;
  font-weight: 600;
}

.gap-value.positive {
  color: #22c55e;
}

.gap-value.negative {
  color: #f59e0b;
}

.gap-status {
  font-size: 11px;
  margin-left: 8px;
  color: #22c55e;
}

.detail-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(59, 130, 246, 0.2);
}

.detail-title {
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 12px;
}

.detail-table {
  margin-bottom: 12px;
}

.detail-table .table-header {
  display: grid;
  grid-template-columns: 60px 80px 80px 80px;
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
  grid-template-columns: 60px 80px 80px 80px;
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

.detail-table .td.warning {
  color: #f59e0b;
}

.warning-tip {
  padding: 10px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 6px;
  font-size: 12px;
  color: #f59e0b;
  margin-bottom: 16px;
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

.btn-outline {
  background-color: transparent;
  color: #3b82f6;
  border: 1px solid #3b82f6;
}

.btn-outline:hover {
  background-color: rgba(59, 130, 246, 0.1);
}
</style>
