<template>
  <div class="data-display-section">
    <!-- 数据展示区域 -->
    <div class="data-display-wrapper">
      <!-- 发动机基本信息列表 -->
      <div v-if="deviceType === 'engine' && engineList && engineList.length > 0" class="assessment-section">
        <div class="section-title">发动机信息</div>
        <el-table :data="engineList" border>
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
          <el-table-column label="操作" width="280" align="center" fixed="right">
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
      
      <!-- 其他设备类型的提示（暂未开发） -->
      <div v-if="deviceType && deviceType !== 'engine'" class="empty-state">
        该设备类型的数据展示功能暂未开发
      </div>
      
      <!-- 暂无数据提示 -->
      <div v-if="(deviceType === 'engine' && (!engineList || engineList.length === 0)) || !deviceType" class="empty-state">
        暂无数据
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  // 设备类型（parentCode 或 code）
  deviceType: {
    type: String,
    default: ''
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
  }
})

const emit = defineEmits([
  'view-test-condition',
  'view-conditions-data',
  'start-evaluation'
])

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
</script>

<style scoped>
.data-display-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  min-height: 0; /* 允许 flex 子元素收缩 */
}

/* 数据展示包装器 */
.data-display-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0; /* 允许滚动 */
}
</style>
