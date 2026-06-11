<template>
  <el-dialog
    v-model="visible"
    :title="`上传3D模型 - ${categoryName || ''}`"
    width="600px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-upload
      class="upload-3d-model"
      drag
      action="/api/files/upload/3d-model"
      :data="{ deviceId: categoryId }"
      :on-success="handleUploadSuccess"
      :on-error="handleUploadError"
      :before-upload="beforeUpload"
      accept=".obj,.fbx,.glb,.stl"
      name="file"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        拖拽文件到此处或<em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          支持格式: OBJ, FBX, GLB, STL，文件大小不超过100MB
        </div>
      </template>
    </el-upload>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'
import { ElMessage } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  categoryId: {
    type: [String, Number],
    default: null
  },
  categoryName: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'success', 'close'])

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

// 上传前验证
const beforeUpload = (file) => {
  const isValidType = ['.obj', '.fbx', '.glb', '.stl'].some(ext => 
    file.name.toLowerCase().endsWith(ext)
  )
  if (!isValidType) {
    ElMessage.error('只支持上传 OBJ, FBX, GLB, STL 格式的文件')
    return false
  }
  
  const isLt100M = file.size / 1024 / 1024 < 100
  if (!isLt100M) {
    ElMessage.error('文件大小不能超过100MB')
    return false
  }
  
  return true
}

// 上传成功处理
const handleUploadSuccess = (response) => {
  if (response.code === 200) {
    ElMessage.success('3D模型上传成功')
    emit('success')
    handleClose()
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

// 上传失败处理
const handleUploadError = (error) => {
  ElMessage.error('上传失败:' + (error.message || '网络错误'))
}
</script>

<style scoped>
/* 上传3D模型样式 */
.upload-3d-model {
  width: 100%;
}

.upload-3d-model :deep(.el-upload-dragger) {
  background-color: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 40px 20px;
}

.upload-3d-model :deep(.el-upload-dragger:hover) {
  border-color: #409eff;
  background-color: rgba(64, 158, 255, 0.1);
}

.upload-3d-model :deep(.el-icon--upload) {
  font-size: 67px;
  color: #409eff;
  margin-bottom: 16px;
}

.upload-3d-model :deep(.el-upload__text) {
  color: #e0e0e0;
  font-size: 14px;
}

.upload-3d-model :deep(.el-upload__text em) {
  color: #409eff;
  font-style: normal;
}

.upload-3d-model :deep(.el-upload__tip) {
  color: #909399;
  font-size: 12px;
  line-height: 1.5;
  margin-top: 8px;
}
</style>
