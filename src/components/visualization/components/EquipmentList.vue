<template>
  <div class="panel-section">
    <div class="section-header">
      <h3>设备列表</h3>
      <div class="status-legend">
        <el-space :size="16">
          <span class="legend-item"><span class="legend-dot pass"></span>通过</span>
          <span class="legend-item"><span class="legend-dot warning"></span>待改进</span>
          <span class="legend-item"><span class="legend-dot fail"></span>未达标</span>
        </el-space>
      </div>
    </div>
    <el-table 
      :data="equipmentList" 
      style="width: 100%"
      highlight-current-row
      :row-class-name="({ row }) => selectedId === row.id ? 'active-row' : ''"
      @row-click="(row) => $emit('select', row.id)"
      class="equipment-table"
    >
      <el-table-column label="排名" width="60" align="center">
        <template #default="{ $index }">
          <el-tag 
            :type="getRankType($index)" 
            size="small"
            effect="dark"
          >
            {{ $index + 1 }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="name" label="设备名称" min-width="200" show-overflow-tooltip />
      <el-table-column prop="score" label="得分" width="80" align="center">
        <template #default="{ row }">
          <span class="score-value">{{ row.score }}</span>
        </template>
      </el-table-column>
      <el-table-column label="等级" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="getLevelType(row.level)" size="small">
            {{ row.level }}级
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="标准验证" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            <span class="status-icon">{{ getStatusIcon(row.status) }}</span>
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="source" label="数据来源" width="100" align="center" />
    </el-table>
  </div>
</template>

<script setup>
const props = defineProps({
  equipmentList: {
    type: Array,
    required: true
  },
  selectedId: {
    type: String,
    default: ''
  }
})

defineEmits(['select'])

const getRankType = (index) => {
  if (index === 0) return 'warning'
  if (index === 1) return ''
  if (index === 2) return 'success'
  return 'info'
}

const getLevelType = (level) => {
  switch (level) {
    case '1': return 'success'
    case '2': return ''
    case '3': return 'warning'
    default: return 'info'
  }
}

const getStatusType = (status) => {
  switch (status) {
    case 'pass': return 'success'
    case 'warning': return 'warning'
    case 'fail': return 'danger'
    default: return 'info'
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

const getStatusText = (status) => {
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

.status-legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-dot.pass { background-color: #22c55e; }
.legend-dot.warning { background-color: #f59e0b; }
.legend-dot.fail { background-color: #ef4444; }

.equipment-table {
  background: transparent;
}

.equipment-table :deep(.el-table__header-wrapper) {
  background: rgba(59, 130, 246, 0.1);
  border-radius: 6px;
}

.equipment-table :deep(.el-table th) {
  background: transparent;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  font-weight: 600;
  border-bottom: none;
}

.equipment-table :deep(.el-table__body tr) {
  background: rgba(255, 255, 255, 0.03);
  cursor: pointer;
  transition: all 0.3s ease;
}

.equipment-table :deep(.el-table__body tr:hover),
.equipment-table :deep(.el-table__body tr.active-row) {
  background: rgba(59, 130, 246, 0.1);
}

.equipment-table :deep(.el-table td) {
  color: white;
  border-bottom: 1px solid rgba(59, 130, 246, 0.1);
}

.score-value {
  font-size: 13px;
  font-weight: 600;
  color: #3b82f6;
}

.status-icon {
  margin-right: 4px;
}

@media (max-width: 768px) {
  .equipment-table {
    font-size: 12px;
  }
}
</style>
