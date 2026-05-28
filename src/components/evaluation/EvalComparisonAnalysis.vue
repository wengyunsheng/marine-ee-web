<template>
  <el-dialog 
    v-model="dialogVisible" 
    title="对比分析"
    width="90%"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="comparison-analysis-container">
      <!-- 已选数据提示 -->
      <el-alert 
        v-if="selectedItems.length > 0"
        type="info" 
        :closable="false"
        style="margin-bottom: 20px"
      >
        <template #title>
          已选择 <strong>{{ selectedItems.length }}</strong> 条数据进行对比分析
        </template>
      </el-alert>

      <!-- 无数据提示 -->
      <el-empty 
        v-if="selectedItems.length === 0"
        description="请在能效评估列表中勾选要对比的数据"
      />

      <!-- 对比表格 -->
      <div v-else class="comparison-content">
        <el-table 
          :data="comparisonData" 
          border 
          stripe 
          style="width: 100%"
          height="500"
        >
          <el-table-column label="指标" prop="indicator" width="150" fixed="left" />
          <el-table-column 
            v-for="(item, index) in selectedItems" 
            :key="index"
            :label="getDeviceName(item)"
            min-width="180"
            align="center"
          >
            <template #default="{ row }">
              <span :class="getHighlightClass(row, index)">
                {{ row.values[index] }}
              </span>
            </template>
          </el-table-column>
        </el-table>

        <!-- 能效基值对比 -->
        <div class="score-comparison">
          <h4>能效基值对比</h4>
          <div class="score-chart">
            <div 
              v-for="(item, index) in selectedItems" 
              :key="index"
              class="score-bar-item"
            >
              <div class="score-label">{{ getDeviceName(item) }}</div>
              <div class="score-bar-wrapper">
                <div 
                  class="score-bar"
                  :style="{ 
                    width: (item.score / 100 * 100) + '%',
                    backgroundColor: getScoreColor(item.score)
                  }"
                >
                  <span class="score-value">{{ item.score }}</span>
                </div>
              </div>
              <div class="score-level">
                <el-tag :type="getLevelType(item.levelClass)" size="small">
                  {{ item.level }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
      <el-button type="primary" @click="exportComparison" :disabled="selectedItems.length === 0">
        导出对比报告
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  selectedItems: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close'])

const dialogVisible = ref(true)

const handleClose = () => {
  emit('close')
}

// 获取设备名称
const getDeviceName = (item) => {
  return item.device || item.name || '设备'
}

// 获取等级标签类型
const getLevelType = (levelClass) => {
  const typeMap = {
    'level-1': 'success',
    'level-2': '',
    'level-3': 'warning',
    'level-4': 'danger',
    'level-5': 'danger'
  }
  return typeMap[levelClass] || ''
}

// 获取得分颜色
const getScoreColor = (score) => {
  if (score >= 90) return '#67c23a'
  if (score >= 80) return '#409eff'
  if (score >= 70) return '#e6a23c'
  return '#f56c6c'
}

// 对比数据
const comparisonData = computed(() => {
  if (props.selectedItems.length === 0) return []
  
  return [
    {
      indicator: '样机模型名称',
      values: props.selectedItems.map(item => item.device)
    },
    {
      indicator: '设备类型名称',
      values: props.selectedItems.map(item => item.deviceClass)
    },
    {
      indicator: '类别',
      values: props.selectedItems.map(item => getCategoryName(item.category))
    },
    {
      indicator: '能效基值',
      values: props.selectedItems.map(item => item.score)
    },
    {
      indicator: '能效等级',
      values: props.selectedItems.map(item => item.level)
    },
    {
      indicator: '数据日期',
      values: props.selectedItems.map(item => item.dataDate || '-')
    },
    {
      indicator: '版本',
      values: props.selectedItems.map(item => `v${item.version}`)
    },
    {
      indicator: '评估时间',
      values: props.selectedItems.map(item => item.evalTime)
    }
  ]
})

// 获取类别名称
const getCategoryName = (category) => {
  const categoryMap = {
    engine: '船用发动机',
    gearbox: '船用齿轮箱',
    'waste-heat': '船用余热回收发电装置',
    incinerator: '船用焚烧炉',
    separator: '船用碟式分离机',
    ballast: '船用压载水处理设备',
    windlass: '船用锚绞机',
    crane: '船用吊机',
    generator: '船用发电机',
    'air-conditioner': '船用组合式空调机组',
    chiller: '船用冷水机组',
    'inert-gas': '船用惰性气体系统',
    'co2-capture': '船用二氧化碳捕集设备',
    propeller: '船用推进器'
  }
  return categoryMap[category] || category
}

// 高亮最优值
const getHighlightClass = (row, index) => {
  if (row.indicator === '能效基值') {
    const scores = props.selectedItems.map(item => item.score)
    const maxScore = Math.max(...scores)
    if (row.values[index] === maxScore) {
      return 'highlight-best'
    }
  }
  return ''
}

// 导出对比报告
const exportComparison = () => {
  alert('导出对比报告功能开发中')
}
</script>

<style scoped>
.comparison-analysis-container {
  padding: 0;
}

.comparison-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.score-comparison h4 {
  margin: 0 0 16px 0;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.score-chart {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.score-bar-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.score-label {
  width: 200px;
  font-size: 13px;
  color: #333;
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.score-bar-wrapper {
  flex: 1;
  height: 32px;
  background: #f5f7fa;
  border-radius: 4px;
  overflow: hidden;
}

.score-bar {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 8px;
  transition: width 0.6s ease;
  border-radius: 4px;
}

.score-value {
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0,0,0,0.2);
}

.score-level {
  width: 60px;
  flex-shrink: 0;
  text-align: center;
}

.highlight-best {
  color: var(--el-color-primary);
  font-weight: 600;
}
</style>
