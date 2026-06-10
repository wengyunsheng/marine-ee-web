<template>
  <el-dialog
    v-model="visible"
    title="能效评估结果"
    width="600px"
    :close-on-click-modal="false"
  >
    <div v-if="evaluationResult" class="evaluation-result-content">
      <div class="result-summary">
        <div class="summary-item">
          <span class="summary-label">综合能效等级</span>
          <span class="summary-level">{{ evaluationResult.overallLevel }}级</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">能效评分</span>
          <span class="summary-score">{{ evaluationResult.score }}</span>
        </div>
      </div>
      <el-divider />
      <div class="result-details">
        <div class="detail-card" v-for="(item, index) in evaluationResult.details" :key="index">
          <div class="detail-name">{{ item.name }}</div>
          <div class="detail-value">{{ item.value }}</div>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  evaluationResult: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

// 双向绑定控制弹窗显示
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 关闭弹窗
const handleClose = () => {
  emit('update:modelValue', false)
  emit('close')
}
</script>

<style scoped>
/* 评估结果弹窗样式 */
.evaluation-result-content {
  padding: 10px 0;
}

.result-summary {
  display: flex;
  justify-content: space-around;
  align-items: center;
  padding: 20px 0;
}

.summary-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.summary-label {
  font-size: 14px;
  color: #b0b0b0;
  font-weight: 500;
}

.summary-score {
  font-size: 36px;
  font-weight: 700;
  color: #409eff;
  line-height: 1;
}

.summary-level {
  font-size: 16px;
  font-weight: 600;
  color: #e0e0e0;
}

.result-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.detail-card {
  background: rgba(30, 58, 95, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  padding: 16px 20px;
  transition: all 0.3s ease;
}

.detail-card:hover {
  background: rgba(30, 58, 95, 0.8);
  border-color: rgba(64, 158, 255, 0.4);
  transform: translateX(4px);
}

.detail-name {
  font-size: 14px;
  color: #b0b0b0;
  margin-bottom: 8px;
}

.detail-value {
  font-size: 16px;
  font-weight: 600;
  color: #e0e0e0;
  text-align: center;
  padding: 8px 0;
}
</style>
