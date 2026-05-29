<template>
  <el-card class="step-card">
    <template #header>
      <div class="card-header">
        <div class="step-title">
          <el-icon class="step-icon"><Cpu /></el-icon>
          <h3>第三步：计算评估</h3>
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
          <el-input :value="selectedHistoryData ? 1 : 0" disabled>
            <template #suffix>条</template>
          </el-input>
        </el-form-item>

        <el-form-item label="计算公式">
          <div class="formula-display">
            <div class="formula-text" v-html="currentFuelConfig?.formulaText || '-'" />
            <div class="formula-params">{{ currentFuelConfig?.paramDesc || '' }}</div>
          </div>
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

      <!-- 计算结果展示 -->
      <div v-if="showResult" class="result-section">
        <el-divider content-position="left">
          <el-icon style="margin-right: 8px"><CircleCheck /></el-icon>
          评估结果
        </el-divider>
        
        <div class="eval-result-panel">
          <div class="result-summary-card">
            <div class="result-score-circle" :class="efficiencyLevelClass">
              <div class="score-number">{{ calculatedEfficiency?.toFixed(2) || 0 }}%</div>
              <div class="score-label-text">能效指标</div>
            </div>
            <div class="result-level-badge" :class="efficiencyLevelClass">
              能效等级：{{ efficiencyLevel }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { ref } from 'vue'
import { Cpu, CircleCheck } from '@element-plus/icons-vue'
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
    type: [Number, String, null],
    default: null
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
  },
  efficiencyLevelClass: {
    type: String,
    default: ''
  },
  currentFuelConfig: {
    type: Object,
    default: null
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
  padding: 20px;
}

.step-card :deep(.el-card__body) {
  padding: 0;
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

.formula-display {
  width: 100%;
  padding: 12px 16px;
  background-color: #f5f7fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  font-size: 14px;
  line-height: 1.6;
}

.formula-text {
  color: #303133;
  font-weight: 500;
  margin-bottom: 8px;
}

.formula-params {
  color: #909399;
  font-size: 13px;
}

/* 结果展示样式 */
.result-section {
  margin-top: 32px;
}

.eval-result-panel {
  padding: 20px;
}

.result-summary-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 40px;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-radius: 16px;
  margin-bottom: 24px;
}

.result-score-circle {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.result-score-circle.level-1 {
  background: linear-gradient(135deg, #22c55e, #16a34a);
  color: white;
}

.result-score-circle.level-2 {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.result-score-circle.level-3 {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.score-number {
  font-size: 36px;
  font-weight: 700;
  line-height: 1;
}

.score-label-text {
  font-size: 14px;
  margin-top: 8px;
  opacity: 0.9;
}

.result-level-badge {
  padding: 10px 24px;
  border-radius: 24px;
  font-size: 18px;
  font-weight: 700;
  color: white;
}

.result-level-badge.level-1 {
  background: #22c55e;
}

.result-level-badge.level-2 {
  background: #f59e0b;
}

.result-level-badge.level-3 {
  background: #ef4444;
}

.result-detail-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.result-detail-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.detail-row {
  display: flex;
  align-items: center;
  padding: 12px;
  background: #f5f7fa;
  border-radius: 8px;
}

.detail-row label {
  font-weight: 600;
  color: #606266;
  min-width: 100px;
}

.detail-row span {
  color: #303133;
  flex: 1;
}
</style>
