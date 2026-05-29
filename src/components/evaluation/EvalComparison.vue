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
        <div class="table-tip">💡 提示：拖动列表头可调整列顺序，第一列为参考基准</div>
        <el-table 
          ref="tableRef"
          :data="comparisonData" 
          border 
          stripe 
          style="width: 100%"
          height="500"
        >
          <el-table-column label="指标" prop="indicator" width="150" fixed="left" />
          <el-table-column 
            v-for="(item, index) in sortedItems" 
            :key="item.id"
            :label="getDeviceName(item)"
            min-width="180"
            align="center"
            :class-name="index === 0 ? 'reference-column' : ''"
          >
            <template #header>
              <div class="column-header" :class="{ 'is-reference': index === 0 }">
                <span>{{ getDeviceName(item) }}</span>
                <el-icon class="drag-icon"><Rank /></el-icon>
              </div>
            </template>
            <template #default="{ row }">
              <span :class="getHighlightClass(row, index)">
                {{ row.values[index] }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { Rank } from '@element-plus/icons-vue'
import Sortable from 'sortablejs'

const props = defineProps({
  selectedItems: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close'])

const dialogVisible = ref(true)
const tableRef = ref(null)
const sortedItems = ref([])

const handleClose = () => {
  emit('close')
}

// 初始化排序后的数据
const initSortable = () => {
  sortedItems.value = [...props.selectedItems].map((item, index) => ({
    ...item,
    id: item.id || `item-${index}`
  }))
}

// 初始化拖拽功能
const initDrag = async () => {
  await nextTick()
  if (!tableRef.value) return
  
  const table = tableRef.value.$el
  const headerWrapper = table.querySelector('.el-table__header-wrapper')
  const headerRow = headerWrapper?.querySelector('tr')
  
  if (!headerRow) return
  
  // 销毁旧实例
  if (window.draggableInstance) {
    window.draggableInstance.destroy()
  }
  
  window.draggableInstance = Sortable.create(headerRow, {
    animation: 200,
    handle: '.column-header',
    ghostClass: 'sortable-ghost',
    dragClass: 'sortable-drag',
    onEnd: async (evt) => {
      const oldIndex = evt.oldIndex
      const newIndex = evt.newIndex
      
      if (oldIndex === newIndex) return
      
      // 跳过第一列（指标列），调整实际数据列
      const dataOldIndex = oldIndex - 1
      const dataNewIndex = newIndex - 1
      
      // 交换数据
      const itemArray = [...sortedItems.value]
      const [movedItem] = itemArray.splice(dataOldIndex, 1)
      itemArray.splice(dataNewIndex, 0, movedItem)
      sortedItems.value = itemArray
      
      // 等待 DOM 更新后重新初始化拖拽
      await nextTick()
      initDrag()
    }
  })
}

// 获取设备名称
const getDeviceName = (item) => {
  return item.device || item.name || '设备'
}

// 对比数据 - 使用 sortedItems 而不是 props.selectedItems
const comparisonData = computed(() => {
  if (sortedItems.value.length === 0) return []
  
  return [
    {
      indicator: '设备类型名称',
      values: sortedItems.value.map(item => item.deviceClass)
    },
    {
      indicator: '类别',
      values: sortedItems.value.map(item => getCategoryName(item.category))
    },
    {
      indicator: '能效基值',
      values: sortedItems.value.map(item => item.score)
    },
    {
      indicator: '能效等级',
      values: sortedItems.value.map(item => item.level)
    },
    {
      indicator: '标准验证',
      values: sortedItems.value.map(item => {
        if (item.level === '1级') return '符合1级能效标准'
        if (item.level === '2级') return '符合2级能效标准'
        if (item.level === '3级') return '符合3级能效标准'
        return '-'
      })
    },
    {
      indicator: '数据日期',
      values: sortedItems.value.map(item => item.dataDate || '-')
    },
    {
      indicator: '版本',
      values: sortedItems.value.map(item => `v${item.version}`)
    },
    {
      indicator: '评估时间',
      values: sortedItems.value.map(item => item.evalTime)
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

// 监听数据变化
watch(() => props.selectedItems, (newVal) => {
  initSortable()
}, { immediate: true, deep: true })

// 挂载后初始化拖拽
onMounted(() => {
  initDrag()
})

// 高亮逻辑：以第一列为参考基准
const getHighlightClass = (row, index) => {
  // 第一列（参考列）不标注
  if (index === 0) return ''
  
  // 能效基值对比
  if (row.indicator === '能效基值') {
    const referenceScore = row.values[0]
    const currentScore = row.values[index]
    
    if (currentScore < referenceScore) {
      return 'highlight-better'
    } else if (currentScore > referenceScore) {
      return 'highlight-worse'
    }
  }
  
  // 能效等级对比
  if (row.indicator === '能效等级') {
    const referenceLevel = parseInt(row.values[0])
    const currentLevel = parseInt(row.values[index])
    
    if (currentLevel < referenceLevel) {
      return 'highlight-better'
    } else if (currentLevel > referenceLevel) {
      return 'highlight-worse'
    }
  }
  
  return ''
}


</script>

<style scoped>
.comparison-analysis-container {
  padding: 0;
}

.comparison-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.table-tip {
  padding: 8px 12px;
  background: #f0f9ff;
  border: 1px solid #d1e9ff;
  border-radius: 4px;
  font-size: 13px;
  color: #409eff;
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

.highlight-better {
  color: #67c23a;
  font-weight: 600;
}

.highlight-worse {
  color: #e6a23c;
  font-weight: 600;
}

/* 参考列样式 - 整列加强 */
.reference-column {
  background-color: #fff7e6 !important;
  position: relative;
  font-weight: 600;
}

/* 参考列的外边框 - 用 box-shadow 实现 */
.reference-column .cell {
  position: relative;
  z-index: 1;
}

/* 参考列的左侧渐变边框 */
.reference-column::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
  z-index: 1;
}

/* 参考列的右侧边框 */
.reference-column::after {
  content: '';
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(180deg, #f59e0b 0%, #d97706 100%);
  z-index: 1;
}

/* 参考列的表头 */
.column-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: move;
  padding: 4px 8px;
}

.column-header.is-reference {
  color: #d97706;
  font-weight: 700;
  font-size: 15px;
}

/* 拖动图标 */
.drag-icon {
  font-size: 16px;
  color: #909399;
  cursor: grab;
  transition: all 0.3s ease;
}

.drag-icon:hover {
  color: #409eff;
  transform: scale(1.2);
}

/* 拖拽效果 */
.sortable-ghost {
  opacity: 0.6;
  background: #c8ebfb !important;
  border: 2px dashed #409eff !important;
}

.sortable-drag {
  opacity: 0.9;
  background: #ffffff !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
}
</style>
