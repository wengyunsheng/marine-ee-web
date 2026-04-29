<template>
  <div class="panel-section">
    <div class="section-header">
      <h3>设备列表</h3>
      <div class="status-legend">
        <span class="legend-item"><span class="legend-dot pass"></span>通过</span>
        <span class="legend-item"><span class="legend-dot warning"></span>待改进</span>
        <span class="legend-item"><span class="legend-dot fail"></span>未达标</span>
      </div>
    </div>
    <div class="equipment-list">
      <div class="list-header">
        <div class="col-rank">排名</div>
        <div class="col-name">设备名称</div>
        <div class="col-score">得分</div>
        <div class="col-level">等级</div>
        <div class="col-status">标准验证</div>
        <div class="col-source">数据来源</div>
      </div>
      <div 
        v-for="(item, index) in equipmentList" 
        :key="item.id"
        class="list-item"
        :class="{ active: selectedId === item.id }"
        @click="$emit('select', item.id)"
      >
        <div class="col-rank" :class="getRankClass(index)">{{ index + 1 }}</div>
        <div class="col-name">{{ item.name }}</div>
        <div class="col-score">{{ item.score }}</div>
        <div class="col-level" :class="getLevelClass(item.level)">{{ item.level }}级</div>
        <div class="col-status" :class="getStatusClass(item.status)">
          <span class="status-icon">{{ getStatusIcon(item.status) }}</span>
          <span class="status-text">{{ getStatusText(item.status) }}</span>
        </div>
        <div class="col-source">{{ item.source }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
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

const getRankClass = (index) => {
  if (index === 0) return 'rank-1'
  if (index === 1) return 'rank-2'
  if (index === 2) return 'rank-3'
  return ''
}

const getLevelClass = (level) => {
  switch (level) {
    case '1': return 'level-excellent'
    case '2': return 'level-good'
    case '3': return 'level-warning'
    default: return ''
  }
}

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

.equipment-list {
  max-height: 200px;
  overflow-y: auto;
}

.list-header {
  display: grid;
  grid-template-columns: 40px 1fr 50px 50px 80px 80px;
  gap: 8px;
  padding: 8px 12px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
}

.list-item {
  display: grid;
  grid-template-columns: 40px 1fr 50px 50px 80px 80px;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 6px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  color: white;
}

.list-item:hover,
.list-item.active {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
}

.col-rank {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  font-weight: 600;
  font-size: 12px;
  background-color: #475569;
}

.col-rank.rank-1 { background-color: #f59e0b; }
.col-rank.rank-2 { background-color: #94a3b8; }
.col-rank.rank-3 { background-color: #b45309; }

.col-name {
  font-size: 13px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.col-score {
  font-size: 13px;
  font-weight: 600;
  color: #3b82f6;
}

.col-level {
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  text-align: center;
}

.col-level.level-excellent {
  background-color: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.col-level.level-good {
  background-color: rgba(59, 130, 246, 0.2);
  color: #3b82f6;
}

.col-level.level-warning {
  background-color: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.col-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
}

.status-pass { color: #22c55e; }
.status-warning { color: #f59e0b; }
.status-fail { color: #ef4444; }

.status-icon {
  font-size: 14px;
}

.col-source {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

@media (max-width: 768px) {
  .list-header,
  .list-item {
    grid-template-columns: 40px 1fr 50px 40px 60px 60px;
    gap: 6px;
  }
  
  .col-name {
    font-size: 12px;
  }
  
  .col-source {
    font-size: 10px;
  }
}
</style>
