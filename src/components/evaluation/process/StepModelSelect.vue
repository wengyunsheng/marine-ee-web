<template>
  <el-card class="step-card">
    <template #header>
      <div class="card-header">
        <div class="step-title">
          <el-icon class="step-icon"><Box /></el-icon>
          <h3>第一步：选择样机模型</h3>
        </div>
        <p>请选择要评估的样机模型，并配置相关参数</p>
      </div>
    </template>

    <div class="device-selection">
      <el-form label-width="100px">
        <el-form-item label="样机模型">
          <el-select 
            :model-value="selectedModelId" 
            @update:model-value="onModelChange"
            placeholder="请选择样机模型"
            style="width: 100%"
            filterable
          >
            <el-option 
              v-for="model in modelOptions" 
              :key="model.id" 
              :label="model.name" 
              :value="model.id"
            >
              <span style="float: left">{{ model.name }}</span>
              <span style="float: right; color: #8492a6; font-size: 13px">{{ model.deviceType }}</span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
    </div>
  </el-card>
</template>

<script setup>
import { computed } from 'vue'
import { Box } from '@element-plus/icons-vue'

const props = defineProps({
  modelOptions: {
    type: Array,
    default: () => []
  },
  selectedModelId: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:selectedModelId'])

const selectedModel = computed(() => {
  return props.modelOptions.find(m => m.id === props.selectedModelId) || null
})

const onModelChange = (modelId) => {
  emit('update:selectedModelId', modelId)
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

.device-selection {
  padding: 20px 0;
}
</style>
