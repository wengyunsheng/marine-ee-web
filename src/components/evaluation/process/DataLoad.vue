<template>
  <div class="data-load-container">
    <el-breadcrumb separator=">" class="breadcrumb">
      <el-breadcrumb-item><a href="#" @click.prevent>首页</a></el-breadcrumb-item>
      <el-breadcrumb-item><a href="#" @click.prevent>能效评估</a></el-breadcrumb-item>
      <el-breadcrumb-item>数据加载</el-breadcrumb-item>
    </el-breadcrumb>
    
    <div class="module-header">
      <h2>数据加载</h2>
      <div class="module-actions">
        <el-button @click="backToDeviceSelect">返回设备选择</el-button>
      </div>
    </div>

    <div class="data-load-section">
      <div class="section-header">
        <h3>选择数据来源</h3>
        <p>请选择评估数据的来源方式</p>
      </div>
      
      <el-tabs v-model="activeSource" class="data-source-tabs">
        <el-tab-pane label="文件上传" name="upload"></el-tab-pane>
        <el-tab-pane label="历史数据" name="history"></el-tab-pane>
        <el-tab-pane label="实时数据" name="real-time"></el-tab-pane>
      </el-tabs>

      <!-- 文件上传 -->
      <div v-if="activeSource === 'upload'" class="upload-section">
        <el-upload
          drag
          multiple
          accept=".csv,.xlsx,.xls,.json,.xml"
          :auto-upload="false"
          :on-change="handleFileChange"
          :file-list="uploadedFiles"
          class="upload-area"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">
            拖拽文件到此处或<em>点击上传</em>
          </div>
          <template #tip>
            <div class="el-upload__tip">
              支持的文件类型: CSV, Excel, JSON, XML
            </div>
          </template>
        </el-upload>
        
        <div class="uploaded-files" v-if="uploadedFiles.length > 0">
          <h4>已上传文件</h4>
          <el-table :data="uploadedFiles" style="width: 100%; margin-top: 16px">
            <el-table-column prop="name" label="文件名" min-width="200" />
            <el-table-column label="文件大小" width="120">
              <template #default="{ row }">
                {{ formatFileSize(row.size) }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100" />
            <el-table-column label="操作" width="150" align="center">
              <template #default="{ row }">
                <el-button size="small" @click="previewFile(row)">预览</el-button>
                <el-button size="small" type="danger" @click="removeFile(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <!-- 历史数据 -->
      <div v-if="activeSource === 'history'" class="history-section">
        <el-input
          v-model="historySearch"
          placeholder="搜索历史数据"
          prefix-icon="Search"
          clearable
          @keyup.enter="searchHistory"
          class="search-box"
        />
        
        <el-table
          :data="filteredHistoryData"
          style="width: 100%; margin-top: 16px"
          highlight-current-row
          @row-click="toggleHistoryData"
          class="history-data-table"
        >
          <el-table-column type="selection" width="55" align="center">
            <template #default="{ row }">
              <el-checkbox 
                :model-value="selectedHistoryData.includes(row.id)"
                @change="() => toggleHistoryData(row)"
                @click.stop
              />
            </template>
          </el-table-column>
          <el-table-column label="名称" prop="name" min-width="200" />
          <el-table-column label="描述" prop="description" min-width="250" show-overflow-tooltip />
          <el-table-column label="设备" prop="device" width="120" />
          <el-table-column label="时间" prop="date" width="120" />
          <el-table-column label="大小" prop="size" width="100" />
        </el-table>
        
        <div class="pagination" v-if="totalHistoryPages > 1">
          <el-pagination
            v-model:current-page="currentHistoryPage"
            :page-size="5"
            :total="filteredHistoryData.length"
            layout="total, prev, pager, next"
            @current-change="goToHistoryPage"
          />
        </div>
      </div>

      <!-- 实时数据 -->
      <div v-if="activeSource === 'real-time'" class="realtime-section">
        <div class="realtime-devices">
          <h4>可用实时设备</h4>
          <el-table
            :data="realtimeDevices"
            style="width: 100%; margin-top: 16px"
            highlight-current-row
            @row-click="toggleRealtimeDevice"
            class="device-table"
          >
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="row.connected ? 'success' : 'danger'" size="small">
                  {{ row.connected ? '在线' : '离线' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="设备名称" prop="name" min-width="150" />
            <el-table-column label="型号" prop="model" min-width="180" />
            <el-table-column label="IP地址" prop="ip" width="140" />
            <el-table-column label="信号强度" width="120">
              <template #default="{ row }">
                <el-progress :percentage="row.signal" :color="getSignalColor(row.signal)" />
              </template>
            </el-table-column>
            <el-table-column label="选择" width="80" align="center">
              <template #default="{ row }">
                <el-checkbox 
                  :model-value="selectedRealtimeDevices.includes(row.id)"
                  :disabled="!row.connected"
                  @change="() => toggleRealtimeDevice(row)"
                  @click.stop
                />
              </template>
            </el-table-column>
          </el-table>
        </div>
        
        <div class="realtime-settings">
          <h4>实时数据设置</h4>
          <el-form :model="realtimeSettings" label-width="120px" class="settings-form">
            <el-form-item label="数据采集频率">
              <el-select v-model="realtimeSettings.dataFrequency" style="width: 100%">
                <el-option label="1秒" value="1s" />
                <el-option label="5秒" value="5s" />
                <el-option label="10秒" value="10s" />
                <el-option label="30秒" value="30s" />
                <el-option label="1分钟" value="1m" />
              </el-select>
            </el-form-item>
            <el-form-item label="采集时长">
              <el-input-number v-model="realtimeSettings.collectionDuration" :min="1" :max="120" style="width: 100%">
                <template #append>分钟</template>
              </el-input-number>
            </el-form-item>
            <el-form-item label="数据存储">
              <el-checkbox v-model="realtimeSettings.storeData">采集后存储为历史数据</el-checkbox>
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- 数据预览 -->
      <el-dialog v-model="showPreview" title="数据预览" width="80%">
        <el-table :data="previewData" style="width: 100%" border max-height="400">
          <el-table-column 
            v-for="(header, index) in previewHeaders" 
            :key="index"
            :prop="'col' + index"
            :label="header"
          />
        </el-table>
      </el-dialog>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button @click="resetData">重置</el-button>
        <el-button type="primary" @click="nextStep" :disabled="!canProceed">
          下一步: 参数配置
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { UploadFilled, Search } from '@element-plus/icons-vue'

const emit = defineEmits(['navigate'])

const activeSource = ref('upload')
const uploadedFiles = ref([])
const historySearch = ref('')
const currentHistoryPage = ref(1)
const selectedHistoryData = ref([])
const selectedRealtimeDevices = ref([])
const realtimeSettings = ref({
  dataFrequency: '5s',
  collectionDuration: 10,
  storeData: true
})
const showPreview = ref(false)
const previewHeaders = ref([])
const previewData = ref([])

const historyData = ref([
  { id: 1, name: '主机运行数据_20240401', description: '主机系统2024年4月1日运行数据', device: '主机系统', date: '2024-04-01', size: '2.3 MB' },
  { id: 2, name: '辅机运行数据_20240402', description: '辅机系统2024年4月2日运行数据', device: '辅机系统', date: '2024-04-02', size: '1.8 MB' },
  { id: 3, name: '锅炉运行数据_20240403', description: '锅炉系统2024年4月3日运行数据', device: '锅炉系统', date: '2024-04-03', size: '1.5 MB' },
  { id: 4, name: '泵组运行数据_20240404', description: '泵组系统2024年4月4日运行数据', device: '泵组系统', date: '2024-04-04', size: '2.1 MB' },
  { id: 5, name: '冷却系统数据_20240405', description: '冷却系统2024年4月5日运行数据', device: '冷却系统', date: '2024-04-05', size: '1.9 MB' },
  { id: 6, name: '主机运行数据_20240406', description: '主机系统2024年4月6日运行数据', device: '主机系统', date: '2024-04-06', size: '2.5 MB' },
  { id: 7, name: '辅机运行数据_20240407', description: '辅机系统2024年4月7日运行数据', device: '辅机系统', date: '2024-04-07', size: '1.7 MB' },
  { id: 8, name: '锅炉运行数据_20240408', description: '锅炉系统2024年4月8日运行数据', device: '锅炉系统', date: '2024-04-08', size: '1.6 MB' },
  { id: 9, name: '泵组运行数据_20240409', description: '泵组系统2024年4月9日运行数据', device: '泵组系统', date: '2024-04-09', size: '2.0 MB' },
  { id: 10, name: '冷却系统数据_20240410', description: '冷却系统2024年4月10日运行数据', device: '冷却系统', date: '2024-04-10', size: '1.8 MB' }
])

const realtimeDevices = ref([
  { id: 1, name: '主机系统', model: 'MAN B&W 6S70MC', ip: '192.168.1.101', signal: 95, connected: true },
  { id: 2, name: '辅机系统', model: 'Cummins QSK60', ip: '192.168.1.102', signal: 92, connected: true },
  { id: 3, name: '锅炉系统', model: 'Alfa Laval Aalborg', ip: '192.168.1.103', signal: 88, connected: true },
  { id: 4, name: '泵组系统', model: 'Grundfos CR15-10', ip: '192.168.1.104', signal: 75, connected: true },
  { id: 5, name: '冷却系统', model: 'Kelvinator K2000', ip: '192.168.1.105', signal: 0, connected: false },
  { id: 6, name: '空调系统', model: 'Daikin VRV', ip: '192.168.1.106', signal: 90, connected: true }
])

const filteredHistoryData = computed(() => {
  let result = historyData.value
  if (historySearch.value) {
    const search = historySearch.value.toLowerCase()
    result = result.filter(item => 
      item.name.toLowerCase().includes(search) ||
      item.description.toLowerCase().includes(search) ||
      item.device.toLowerCase().includes(search)
    )
  }
  return result
})

const totalHistoryPages = computed(() => {
  return Math.ceil(filteredHistoryData.value.length / 5)
})

const visibleHistoryPages = computed(() => {
  const pages = []
  const start = Math.max(1, currentHistoryPage.value - 2)
  const end = Math.min(totalHistoryPages.value, start + 4)
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const canProceed = computed(() => {
  if (activeSource.value === 'upload') {
    return uploadedFiles.value.length > 0
  } else if (activeSource.value === 'history') {
    return selectedHistoryData.value.length > 0
  } else if (activeSource.value === 'real-time') {
    return selectedRealtimeDevices.value.length > 0
  }
  return false
})

const handleFileChange = (file, fileList) => {
  uploadedFiles.value = fileList.map(f => ({
    name: f.name,
    size: f.size,
    status: '待上传',
    raw: f.raw
  }))
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / 1048576).toFixed(2) + ' MB'
}

const removeFile = (file) => {
  const index = uploadedFiles.value.findIndex(f => f.name === file.name)
  if (index > -1) {
    uploadedFiles.value.splice(index, 1)
  }
}

const previewFile = (file) => {
  // 模拟文件预览
  previewHeaders.value = ['时间', '参数1', '参数2', '参数3', '参数4']
  previewData.value = [
    { col0: '2024-04-01 00:00', col1: '100', col2: '200', col3: '300', col4: '400' },
    { col0: '2024-04-01 00:01', col1: '101', col2: '201', col3: '301', col4: '401' },
    { col0: '2024-04-01 00:02', col1: '102', col2: '202', col3: '302', col4: '402' },
    { col0: '2024-04-01 00:03', col1: '103', col2: '203', col3: '303', col4: '403' },
    { col0: '2024-04-01 00:04', col1: '104', col2: '204', col3: '304', col4: '404' }
  ]
  showPreview.value = true
}

const searchHistory = () => {
  currentHistoryPage.value = 1
}

const toggleHistoryData = (row) => {
  const id = row.id
  const index = selectedHistoryData.value.indexOf(id)
  if (index > -1) {
    selectedHistoryData.value.splice(index, 1)
  } else {
    selectedHistoryData.value.push(id)
  }
}

const goToHistoryPage = (page) => {
  currentHistoryPage.value = page
}

const toggleRealtimeDevice = (row) => {
  if (!row.connected) return
  
  const id = row.id
  const index = selectedRealtimeDevices.value.indexOf(id)
  if (index > -1) {
    selectedRealtimeDevices.value.splice(index, 1)
  } else {
    selectedRealtimeDevices.value.push(id)
  }
}

const getSignalColor = (signal) => {
  if (signal >= 80) return '#67c23a'
  if (signal >= 50) return '#e6a23c'
  return '#f56c6c'
}

const resetData = () => {
  if (activeSource.value === 'upload') {
    uploadedFiles.value = []
  } else if (activeSource.value === 'history') {
    selectedHistoryData.value = []
  } else if (activeSource.value === 'real-time') {
    selectedRealtimeDevices.value = []
  }
}

const nextStep = () => {
  // 跳转到参数配置页面
  emit('navigate', 'param-config')
}

const backToDeviceSelect = () => {
  // 返回设备选择页面
  emit('navigate', 'device-select')
}
</script>

<style scoped>
.data-load-container {
  padding: 20px;
}

.breadcrumb {
  margin-bottom: 16px;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.module-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.module-actions {
  display: flex;
  gap: 12px;
}

.data-load-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.section-header {
  margin-bottom: 24px;
}

.section-header h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.section-header p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

.data-source-tabs {
  margin: 24px 0;
}

.upload-section {
  margin-bottom: 24px;
}

.upload-area {
  margin-bottom: 24px;
}

.uploaded-files {
  margin-top: 24px;
}

.uploaded-files h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
}

.history-section {
  margin-bottom: 24px;
}

.search-box {
  margin-bottom: 24px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.realtime-section {
  margin-bottom: 24px;
}

.realtime-settings {
  margin-top: 32px;
  padding: 24px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.settings-form {
  margin-top: 16px;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }
  
  .action-buttons :deep(.el-button) {
    width: 100%;
  }
  
  .module-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .module-actions {
    width: 100%;
    flex-wrap: wrap;
  }
}
</style>