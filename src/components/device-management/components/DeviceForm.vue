<template>
  <el-form :model="localFormData" label-width="120px">
    <el-form-item label="设备编码" required>
      <el-input v-model="localFormData.code" placeholder="请输入设备编码" :disabled="isEdit" />
    </el-form-item>
    
    <el-form-item label="设备名称" required>
      <el-input v-model="localFormData.name" placeholder="请输入设备名称" />
    </el-form-item>
    
    <!-- 只有新增子设备时才显示类别字段 -->
    <el-form-item v-if="isSubDevice" label="类别" required>
      <el-input :model-value="getCategoryName(localFormData.category)" disabled />
    </el-form-item>
    
    <el-form-item label="排序">
      <el-input-number v-model="localFormData.sort" :min="0" :max="9999" placeholder="请输入排序值" style="width: 100%;" />
    </el-form-item>
    
    <div style="display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px;">
      <el-button @click="handleCancel">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
    </div>
  </el-form>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  isEdit: {
    type: Boolean,
    default: false
  },
  isSubDevice: {
    type: Boolean,
    default: false
  },
  isCategoryEdit: {
    type: Boolean,
    default: false
  },
  formData: {
    type: Object,
    default: () => ({})
  },
  parentOptions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['save', 'close'])

const localFormData = ref({ ...props.formData })

watch(() => props.formData, (newValue) => {
  localFormData.value = { ...newValue }
}, { deep: true })

const getCategoryName = (code) => {
  const item = props.parentOptions.find(opt => opt.code === code)
  return item ? item.name : code
}

const handleSave = () => {
  emit('save', localFormData.value)
}

const handleCancel = () => {
  emit('close')
}
</script>

<style scoped>
/* 表单样式由 Element Plus 提供 */
</style>
