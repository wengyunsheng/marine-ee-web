<template>
  <el-card class="step-card">
    <template #header>
      <div class="card-header">
        <div class="step-title">
          <el-icon class="step-icon"><Document /></el-icon>
          <h3>第二步：选择能效数据</h3>
        </div>
        <p>请从能效数据管理中选择评估数据，或导入新的能效数据</p>
      </div>
    </template>

    <div class="data-selection">
      <el-form label-width="100px">
        <el-form-item label="能效数据">
          <el-select 
            :model-value="selectedHistoryData" 
            @update:model-value="onDataChange"
            placeholder="请选择能效数据"
            style="width: 100%"
            filterable
          >
            <el-option 
              v-for="data in dataOptions" 
              :key="data.id" 
              :label="formatDataLabel(data)" 
              :value="data.id"
            />
          </el-select>
        </el-form-item>
      </el-form>

      <div class="import-section">
        <el-button @click="showImportDialog = true" :icon="Upload">
          导入能效数据
        </el-button>
      </div>
    </div>
  </el-card>

  <!-- 导入数据对话框 -->
  <el-dialog 
    v-model="showImportDialog" 
    title="导入能效数据"
    width="600px"
    :close-on-click-modal="false"
  >
    <el-upload
      class="upload-area"
      drag
      :auto-upload="false"
      :on-change="handleFileChange"
      accept=".json,.csv,.xlsx"
    >
      <el-icon class="el-icon--upload"><upload-filled /></el-icon>
      <div class="el-upload__text">
        将文件拖到此处，或<em>点击上传</em>
      </div>
      <template #tip>
        <div class="el-upload__tip">
          支持 JSON、CSV、Excel 格式文件
        </div>
      </template>
    </el-upload>

    <template #footer>
      <el-button @click="showImportDialog = false">取消</el-button>
      <el-button type="primary" @click="handleImport" :disabled="!selectedFile">
        确认导入
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Document, Upload, UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  historyData: {
    type: Array,
    default: () => []
  },
  selectedHistoryData: {
    type: [Number, String, null],
    default: null
  }
})

const emit = defineEmits(['update:selectedHistoryData'])

// 下拉选项
const dataOptions = computed(() => props.historyData)

// 格式化选项标签
const formatDataLabel = (data) => {
  return `${data.dataDate} - ${data.deviceName || data.deviceType} (${data.dataSource})`
}

// 选择变化
const onDataChange = (value) => {
  emit('update:selectedHistoryData', value)
}

// 导入相关
const showImportDialog = ref(false)
const selectedFile = ref(null)

const handleFileChange = (file) => {
  selectedFile.value = file.raw
}

const handleImport = () => {
  if (!selectedFile.value) {
    ElMessage.warning('请选择文件')
    return
  }
  
  // 模拟导入
  ElMessage.success('导入成功')
  showImportDialog.value = false
  selectedFile.value = null
  
  // TODO: 实际导入逻辑
  // 这里可以调用 API 导入文件并更新 historyData
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

.data-selection {
  padding: 20px 0;
}

.import-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e4e7ed;
  display: flex;
  justify-content: center;
}

.upload-area {
  width: 100%;
}

.upload-area :deep(.el-upload-dragger) {
  width: 100%;
}
</style>
