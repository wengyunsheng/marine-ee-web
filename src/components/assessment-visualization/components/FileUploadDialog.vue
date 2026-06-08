<template>
  <el-dialog
    v-model="visible"
    title="导入数据"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-upload
      class="upload-data-file"
      drag
      :auto-upload="false"
      :on-change="handleFileChange"
      accept=".csv,.xlsx,.xls"
      :limit="1"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        拖拽文件到此处或<em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          支持格式: CSV, XLSX, XLS，文件大小不超过10MB
        </div>
      </template>
    </el-upload>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'file-change', 'close'])

// 双向绑定控制弹窗显示
const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 文件上传处理
const handleFileChange = (file) => {
  emit('file-change', file)
}

// 关闭弹窗
const handleClose = () => {
  emit('close')
}
</script>

<style scoped>
/* 导入文件上传组件样式 */
.upload-data-file {
  width: 100%;
}

.upload-data-file :deep(.el-upload-dragger) {
  background-color: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  border-radius: 4px;
  padding: 40px 20px;
}

.upload-data-file :deep(.el-upload-dragger:hover) {
  border-color: #409eff !important;
  background-color: rgba(64, 158, 255, 0.1) !important;
}

.upload-data-file :deep(.el-icon--upload) {
  font-size: 67px;
  color: #409eff;
  margin-bottom: 16px;
}

.upload-data-file :deep(.el-upload__text) {
  color: #e0e0e0;
  font-size: 14px;
}

.upload-data-file :deep(.el-upload__text em) {
  color: #409eff;
  font-style: normal;
}

.upload-data-file :deep(.el-upload__tip) {
  color: #909399;
  font-size: 12px;
  line-height: 1.5;
  margin-top: 8px;
}
</style>
