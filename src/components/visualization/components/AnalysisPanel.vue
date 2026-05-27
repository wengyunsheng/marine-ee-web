<template>
  <div class="panel-section">
    <div class="section-header">
      <h3>指标差异分析</h3>
      <el-button link @click="showDetail = !showDetail">
        {{ showDetail ? '收起' : '详情' }}
      </el-button>
    </div>
    <div v-if="data" class="analysis-panel">
      <div class="analysis-header">
        <span class="equipment-name">{{ data.name }}</span>
        <el-tag :type="getLevelType(data.level)" size="small">
          {{ data.level }}级
        </el-tag>
      </div>
      <div class="comparison-section">
        <div class="comparison-title">能效指标对比</div>
        <div class="comparison-bars">
          <el-progress 
            :percentage="getBarWidth(data.currentValue)" 
            :format="() => `${data.currentValue}`"
            :stroke-width="8"
            color="#3b82f6"
          >
            <template #default>
              <span class="bar-label">当前值</span>
              <span class="bar-value">{{ data.currentValue }}</span>
            </template>
          </el-progress>
          <el-progress 
            :percentage="getBarWidth(data.baselineLevel2)" 
            :format="() => `${data.baselineLevel2} (${data.level}级)`"
            :stroke-width="8"
            color="#f59e0b"
          >
            <template #default>
              <span class="bar-label">{{ data.level }}级基准</span>
            </template>
          </el-progress>
          <el-progress 
            :percentage="getBarWidth(data.baselineLevel1)" 
            :format="() => `${data.baselineLevel1} (1级)`"
            :stroke-width="8"
            color="#22c55e"
          >
            <template #default>
              <span class="bar-label">1级基准(目标)</span>
            </template>
          </el-progress>
        </div>
        <div class="gap-info">
          <div class="gap-item">
            <span class="gap-label">距{{ data.level }}级基准:</span>
            <el-tag 
              :type="data.gapToLevel2 >= 0 ? 'success' : 'warning'" 
              size="small"
            >
              {{ data.gapToLevel2 >= 0 ? '+' : '' }}{{ data.gapToLevel2 }}
              <span v-if="data.gapToLevel2 >= 0">✓ 已达标</span>
            </el-tag>
          </div>
          <div class="gap-item">
            <span class="gap-label">距1级基准:</span>
            <el-tag type="warning" size="small">
              {{ data.gapToLevel1 }}
            </el-tag>
          </div>
        </div>
      </div>
      <el-collapse v-if="showDetail" v-model="activeCollapse" class="detail-section">
        <el-collapse-item name="detail">
          <template #title>
            <span class="detail-title">各工况燃油消耗率差异</span>
          </template>
          <el-table :data="data.conditions" style="width: 100%" size="small" class="detail-table">
            <el-table-column prop="name" label="工况" width="80" />
            <el-table-column prop="current" label="当前值" width="100" align="center" />
            <el-table-column prop="baseline" label="基准值" width="100" align="center" />
            <el-table-column label="差异" min-width="120" align="center">
              <template #default="{ row }">
                <el-tag 
                  :type="row.diff >= 0 ? 'warning' : 'success'" 
                  size="small"
                >
                  {{ row.diff >= 0 ? '+' : '' }}{{ row.diff }}
                  {{ row.diff >= 0 ? '⚠' : '✓' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
          <el-alert
            v-if="data.warningConditions"
            :title="data.warningConditions"
            type="warning"
            :closable="false"
            show-icon
            class="warning-tip"
          />
          <el-button type="primary" plain @click="$emit('viewReport')" class="view-report-btn">
            查看详细分析报告
          </el-button>
        </el-collapse-item>
      </el-collapse>
    </div>
    <el-empty v-else description="请从左侧列表选择设备查看指标差异分析" :image-size="80" />
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    default: null
  }
})

defineEmits(['viewReport'])

const showDetail = ref(false)
const activeCollapse = ref(['detail'])

const getLevelType = (level) => {
  switch (level) {
    case '1': return 'success'
    case '2': return ''
    case '3': return 'warning'
    default: return 'info'
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

.comparison-bars :deep(.el-progress) {
  margin: 0;
}

.comparison-bars :deep(.el-progress-bar__outer) {
  background-color: rgba(255, 255, 255, 0.1);
}

.comparison-bars :deep(.el-progress__text) {
  color: rgba(255, 255, 255, 0.8);
  font-size: 12px;
}

.bar-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-right: 12px;
}

.bar-value {
  font-size: 12px;
  text-align: right;
  color: rgba(255, 255, 255, 0.8);
  margin-left: auto;
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

.detail-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid rgba(59, 130, 246, 0.2);
}

.detail-section :deep(.el-collapse-item__header) {
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  border-bottom: none;
}

.detail-title {
  font-size: 13px;
  font-weight: 600;
}

.detail-table {
  margin-bottom: 12px;
}

.detail-table :deep(.el-table) {
  background: transparent;
  color: white;
}

.detail-table :deep(.el-table th) {
  background: rgba(59, 130, 246, 0.1);
  color: rgba(255, 255, 255, 0.7);
}

.detail-table :deep(.el-table td) {
  background: rgba(255, 255, 255, 0.02);
  color: white;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
}

.warning-tip {
  margin-bottom: 16px;
}

.view-report-btn {
  width: 100%;
}

@media (max-width: 768px) {
  .comparison-bars :deep(.el-progress__text) {
    font-size: 10px;
  }
}
</style>
