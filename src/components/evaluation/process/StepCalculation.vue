<template>
  <el-card class="step-card">
    <template #header>
      <div class="card-header">
        <div class="step-title">
          <el-icon class="step-icon"><Cpu /></el-icon>
          <h3>第三步：自动计算评估</h3>
        </div>
        <p>系统将基于选择的样机模型和能效数据，自动计算能效指标</p>
      </div>
    </template>

    <div class="calculation-section">
      <el-form label-width="120px">
        <el-form-item label="样机模型">
          <el-input :value="selectedModel?.name || '-'" disabled />
        </el-form-item>

        <el-form-item label="设备类型">
          <el-input :value="engineInfo?.engineType || '-'" disabled />
        </el-form-item>

        <el-form-item label="设备品牌">
          <el-input :value="engineInfo?.brand || '-'" disabled />
        </el-form-item>

        <el-form-item label="能效数据数量">
          <el-input :value="selectedHistoryData?.length || 0" disabled>
            <template #suffix>条</template>
          </el-input>
        </el-form-item>

        <el-form-item label="评估模型">
          <el-input value="ISO 15550:2016" disabled />
        </el-form-item>

        <el-divider />

        <el-form-item>
          <el-button 
            type="primary" 
            size="large" 
            :loading="isCalculating"
            @click="handleCalculate"
            style="width: 100%"
          >
            <el-icon v-if="!isCalculating"><Cpu /></el-icon>
            {{ isCalculating ? '计算中...' : '开始计算评估' }}
          </el-button>
        </el-form-item>
      </el-form>

      <el-alert
        v-if="showResult"
        title="评估计算完成"
        type="success"
        :closable="false"
        show-icon
        style="margin-top: 20px"
      >
        <template #default>
          <div style="margin-top: 8px">
            <p style="margin: 0">能效指标：<strong>{{ calculatedEfficiency?.toFixed(2) || 0 }}%</strong></p>
            <p style="margin: 4px 0 0 0">能效等级：<strong>{{ efficiencyLevel || '-' }}</strong></p>
          </div>
        </template>
      </el-alert>
    </div>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { Cpu } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  selectedModel: {
    type: Object,
    default: null
  },
  engineInfo: {
    type: Object,
    default: () => ({})
  },
  selectedHistoryData: {
    type: Array,
    default: () => []
  },
  showResult: {
    type: Boolean,
    default: false
  },
  calculatedEfficiency: {
    type: Number,
    default: 0
  },
  efficiencyLevel: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['calculate'])

const isCalculating = ref(false)

const handleCalculate = () => {
  if (!props.selectedModel) {
    ElMessage.warning('请先选择样机模型')
    return
  }

  if (props.selectedHistoryData.length === 0) {
    ElMessage.warning('请选择至少一条能效数据')
    return
  }

  isCalculating.value = true
  
  // 模拟计算过程
  setTimeout(() => {
    isCalculating.value = false
    emit('calculate')
  }, 1500)
}
</script>

<style scoped>
.step-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.step-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.step-icon {
  font-size: 24px;
  color: #409eff;
}

.step-title h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.card-header p {
  margin: 0;
  font-size: 14px;
  color: #606266;
}

.calculation-section {
  padding: 20px 0;
}
</style>
