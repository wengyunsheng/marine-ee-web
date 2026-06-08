<template>
  <div class="data-display-section">
    <!-- 搜索筛选区 -->
    <div v-if="showSearch" class="search-filter-bar">
      <el-form :inline="true" :model="props.searchForm">
        <el-form-item label="品牌">
          <el-input 
            v-model="props.searchForm.brand" 
            placeholder="请输入品牌"
            clearable
            style="width: 180px;"
          />
        </el-form-item>
        <el-form-item label="型号">
          <el-input 
            v-model="props.searchForm.model" 
            placeholder="请输入型号"
            clearable
            style="width: 220px;"
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置筛选</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 数据展示区域 -->
    <div class="data-display-wrapper">
      <!-- 发动机基本信息列表 -->
      <div v-if="engineList && engineList.length > 0" class="assessment-section">
        <div class="section-title">发动机信息</div>
        <el-table :data="engineList" border stripe>
          <el-table-column type="index" label="序号" width="60" align="center" />
          <el-table-column prop="brand" label="品牌" width="120" />
          <el-table-column prop="model" label="型号" width="180" />
          <el-table-column prop="cylinderCount" label="气缸数" width="100" align="center" />
          <el-table-column prop="cylinderBore" label="缸径(mm)" width="120" align="center" />
          <el-table-column prop="fuelType" label="燃油类型" width="120" />
          <el-table-column prop="fuelType1" label="燃油类型1" width="120" />
          <el-table-column prop="fuelType1CalorificValue" label="热值(kJ/kg)" width="140" align="center" />
          <el-table-column prop="engineUsage" label="发动机用途" min-width="150" />
          <el-table-column prop="emissionStandard" label="排放标准" width="120" />
          <el-table-column prop="ratedSpeed" label="额定转速(rpm)" width="140" align="center" />
          <el-table-column prop="ratedPower" label="额定功率(kW)" width="140" align="center" />
          <el-table-column label="操作" width="420" align="center" fixed="right">
            <template #default="{ row }">
              <div style="display: flex; gap: 6px; justify-content: center;">
                <el-button size="small" @click="handleViewTestCondition(row)">测试条件</el-button>
                <el-button size="small" @click="handleViewConditionsData(row)">工况数据</el-button>
                <el-button 
                  size="small" 
                  :loading="evaluating && evaluatingRowId === row.id" 
                  @click="handleStartEvaluation(row)"
                >
                  {{ evaluating && evaluatingRowId === row.id ? '评估中...' : '能效评估' }}
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
      
      <!-- 暂无数据提示 -->
      <div v-if="!engineList || engineList.length === 0" class="empty-state">
        暂无数据
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  // 是否显示搜索区
  showSearch: {
    type: Boolean,
    default: true
  },
  // 发动机列表数据
  engineList: {
    type: Array,
    default: () => []
  },
  // 是否正在评估
  evaluating: {
    type: Boolean,
    default: false
  },
  // 当前评估的行ID
  evaluatingRowId: {
    type: [String, Number],
    default: null
  },
  // 搜索表单（从父组件传入）
  searchForm: {
    type: Object,
    default: () => ({ brand: '', model: '' })
  }
})

const emit = defineEmits([
  'search',
  'reset',
  'view-test-condition',
  'view-conditions-data',
  'start-evaluation'
])

// 搜索处理
const handleSearch = () => {
  emit('search', { ...props.searchForm })
}

// 重置处理
const handleReset = () => {
  // 通知父组件重置搜索表单
  emit('reset')
}

// 查看测试条件
const handleViewTestCondition = (row) => {
  emit('view-test-condition', row)
}

// 查看工况数据
const handleViewConditionsData = (row) => {
  emit('view-conditions-data', row)
}

// 开始评估
const handleStartEvaluation = (row) => {
  emit('start-evaluation', row)
}

// 监听搜索表单变化(可选)
watch(() => props.searchForm, (newVal) => {
  // 如果需要实时搜索,可以在这里触发
}, { deep: true })
</script>

<style scoped>
.data-display-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 搜索筛选栏 */
.search-filter-bar {
  background: rgba(30, 58, 95, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 12px 16px;
}

.search-filter-bar :deep(.el-form) {
  margin-bottom: 0;
}

.search-filter-bar :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 12px;
}

.search-filter-bar :deep(.el-form-item__label) {
  color: #e0e0e0;
}

.search-filter-bar :deep(.el-input__wrapper) {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
}

.search-filter-bar :deep(.el-input__inner) {
  color: #e0e0e0;
}

.search-filter-bar :deep(.el-input__inner::placeholder) {
  color: #909399;
}

/* 数据展示包装器 */
.data-display-wrapper {
  flex: 1;
  overflow-y: auto;
}

/* 评估区域 */
.assessment-section {
  background: rgba(30, 58, 95, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #e0e0e0;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid #409eff;
}

/* 空状态 */
.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #909399;
  font-size: 14px;
}

/* 表格样式 */
.data-display-wrapper :deep(.el-table) {
  background-color: transparent;
  color: #e0e0e0;
}

.data-display-wrapper :deep(.el-table th) {
  background-color: rgba(30, 58, 95, 0.6);
  color: #e0e0e0;
  border-color: rgba(255, 255, 255, 0.1);
}

.data-display-wrapper :deep(.el-table td) {
  border-color: rgba(255, 255, 255, 0.1);
  color: #e0e0e0;
}

.data-display-wrapper :deep(.el-table--striped .el-table__body tr.el-table__row--striped td) {
  background-color: rgba(30, 58, 95, 0.2);
}

.data-display-wrapper :deep(.el-table__body tr:hover > td) {
  background-color: rgba(64, 158, 255, 0.1) !important;
}
</style>
