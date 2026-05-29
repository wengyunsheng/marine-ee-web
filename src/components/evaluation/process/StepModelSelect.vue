<template>
  <el-card class="step-card">
    <template #header>
      <div class="card-header">
        <div class="step-title">
          <el-icon class="step-icon"><Box /></el-icon>
          <h3>第一步：选择样机模型</h3>
        </div>
        <p>选择已有样机模型或新增样机模型</p>
      </div>
    </template>

    <div class="device-selection">
      <el-form>
        <el-form-item label="样机模型" class="full-width-item">
          <div class="model-select-wrapper">
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
            <el-button 
              type="primary" 
              @click="handleAddModel"
              style="margin-left: 12px"
            >
              <el-icon><Plus /></el-icon>
              新增样机模型
            </el-button>
          </div>
        </el-form-item>
      </el-form>
    </div>
  </el-card>
</template>

<script setup>
import { computed } from 'vue'
import { Box, Plus } from '@element-plus/icons-vue'

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

const emit = defineEmits(['update:selectedModelId', 'add'])

const selectedModel = computed(() => {
  return props.modelOptions.find(m => m.id === props.selectedModelId) || null
})

const onModelChange = (modelId) => {
  emit('update:selectedModelId', modelId)
}

const handleAddModel = () => {
  emit('add')
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

.full-width-item {
  width: 100%;
}

.model-select-wrapper {
  display: flex;
  align-items: center;
  width: 100%;
}
</style>
