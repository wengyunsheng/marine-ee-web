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
      accept=".xlsx,.xls"
      :limit="1"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        拖拽文件到此处或<em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          支持格式: XLSX, XLS，文件大小不超过10MB
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
</style>
