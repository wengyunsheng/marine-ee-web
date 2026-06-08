<template>
  <el-dialog
    v-model="visible"
    title="加权参数"
    width="900px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-loading="loading">
      <div v-for="cycle in cyclesList" :key="cycle.cycleCode" class="cycle-group">
        <!-- 试验循环标题 -->
        <div class="cycle-header">
          <h3 class="cycle-title">
            试验循环 <span class="cycle-code">{{ cycle.cycleCode }}</span>
            <span class="cycle-name">- {{ cycle.cycleName }}</span>
          </h3>
        </div>
        
        <!-- 工况表格 -->
        <el-table :data="cycle.conditions" border style="margin-bottom: 20px;">
          <el-table-column prop="conditionNo" label="工况" min-width="80" align="center" />
          <el-table-column prop="engineSpeed" label="发动机转速" min-width="100" align="center" />
          <el-table-column prop="powerMode" label="功率模式" min-width="100" align="center" />
          <el-table-column label="加权系数" min-width="150" align="center">
            <template #default="scope">
              {{ scope.row.weightCoefficient.toFixed(2) }}
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    
    <template #footer>
      <div style="display: flex; justify-content: flex-end;">
        <el-button @click="handleClose">关闭</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  deviceName: {
    type: String,
    default: ''
  },
  deviceId: {
    type: [Number, String],
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'success'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const loading = ref(false)
const cyclesList = ref([])

// 获取加权参数数据
const fetchWeightParams = async () => {
  loading.value = true
  try {
    const response = await fetch('/api/test-cycles/cycle-details')
    const result = await response.json()
    
    if (result.code === 200 && result.data && Array.isArray(result.data) && result.data.length > 0) {
      // 直接使用接口返回的试验循环列表
      cyclesList.value = result.data.map(cycle => ({
        ...cycle,
        conditions: (cycle.conditions || []).map(condition => ({
          ...condition,
          weightCoefficient: condition.weightCoefficient || 0
        }))
      }))
      console.log('试验循环数据:', cyclesList.value)
    } else {
      ElMessage.error(result.message || '获取试验循环数据失败')
      cyclesList.value = []
    }
  } catch (error) {
    ElMessage.error('获取试验循环数据失败')
    console.error(error)
    cyclesList.value = []
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  visible.value = false
  cyclesList.value = []
}

// 暴露方法供父组件调用
defineExpose({
  fetchWeightParams
})
</script>

<style scoped>
.cycle-group {
  margin-bottom: 24px;
}

.cycle-group:last-child {
  margin-bottom: 0;
}

.cycle-header {
  background: rgba(30, 58, 95, 0.6);
  padding: 12px 16px;
  border-radius: 4px 4px 0 0;
  border-left: 4px solid #409eff;
  margin-bottom: 0;
}

.cycle-title {
  margin: 0;
  font-size: 16px;
  color: #e0e0e0;
  font-weight: 600;
}

.cycle-code {
  color: #409eff;
  font-weight: bold;
}

.cycle-name {
  color: #b0b0b0;
  font-weight: normal;
  font-size: 14px;
}

/* 深色主题适配 - 弹窗内表格字体 */
:deep(.el-table) {
  font-size: 14px !important;
}

:deep(.el-table th) {
  font-size: 14px !important;
  font-weight: 600;
}

:deep(.el-table td) {
  font-size: 14px !important;
}
</style>
