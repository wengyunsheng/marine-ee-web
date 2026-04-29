<template>
  <div class="module">
    <div class="breadcrumb">
      <a href="#" @click.prevent>首页</a> > <a href="#" @click.prevent>能效评估</a> > <span>数据加载</span>
    </div>
    
    <div class="module-header">
      <h2>数据加载</h2>
      <div class="module-actions">
        <button class="btn btn-secondary" @click="backToDeviceSelect">返回设备选择</button>
      </div>
    </div>

    <div class="data-load-section">
      <div class="section-header">
        <h3>选择数据来源</h3>
        <p>请选择评估数据的来源方式</p>
      </div>
      
      <div class="data-source-tabs">
        <button 
          class="source-tab"
          :class="{ active: activeSource === 'upload' }"
          @click="activeSource = 'upload'"
        >
          文件上传
        </button>
        <button 
          class="source-tab"
          :class="{ active: activeSource === 'history' }"
          @click="activeSource = 'history'"
        >
          历史数据
        </button>
        <button 
          class="source-tab"
          :class="{ active: activeSource === 'real-time' }"
          @click="activeSource = 'real-time'"
        >
          实时数据
        </button>
      </div>

      <!-- 文件上传 -->
      <div v-if="activeSource === 'upload'" class="upload-section">
        <div class="upload-area" :class="{ active: isDragActive }" 
             @dragover.prevent @dragenter.prevent @dragleave.prevent @drop.prevent="handleDrop">
          <div class="upload-icon">📁</div>
          <h4>拖拽文件到此处上传</h4>
          <p>或点击选择文件</p>
          <input type="file" ref="fileInput" multiple @change="handleFileSelect" class="file-input">
          <button class="btn btn-secondary" @click="triggerFileInput">选择文件</button>
          <p class="file-types">支持的文件类型: CSV, Excel, JSON, XML</p>
        </div>
        
        <div class="uploaded-files" v-if="uploadedFiles.length > 0">
          <h4>已上传文件</h4>
          <div class="file-list">
            <div v-for="(file, index) in uploadedFiles" :key="index" class="file-item">
              <div class="file-info">
                <span class="file-name">{{ file.name }}</span>
                <span class="file-size">{{ formatFileSize(file.size) }}</span>
                <span class="file-status">{{ file.status }}</span>
              </div>
              <div class="file-actions">
                <button class="btn btn-sm" @click="previewFile(file)">预览</button>
                <button class="btn btn-sm btn-danger" @click="removeFile(index)">删除</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 历史数据 -->
      <div v-if="activeSource === 'history'" class="history-section">
        <div class="search-box">
          <input type="text" v-model="historySearch" placeholder="搜索历史数据" @keyup.enter="searchHistory">
          <button class="search-btn" @click="searchHistory">🔍</button>
        </div>
        
        <div class="history-data-list">
          <div 
            v-for="data in filteredHistoryData" 
            :key="data.id"
            class="history-data-item"
            :class="{ selected: selectedHistoryData.includes(data.id) }"
            @click="toggleHistoryData(data.id)"
          >
            <div class="data-info">
              <h4>{{ data.name }}</h4>
              <p>{{ data.description }}</p>
              <div class="data-meta">
                <span class="meta-item">设备: {{ data.device }}</span>
                <span class="meta-item">时间: {{ data.date }}</span>
                <span class="meta-item">大小: {{ data.size }}</span>
              </div>
            </div>
            <div class="data-checkbox">
              <input 
                type="checkbox" 
                :id="'history-' + data.id"
                :checked="selectedHistoryData.includes(data.id)"
                @change="toggleHistoryData(data.id)"
              >
              <label :for="'history-' + data.id"></label>
            </div>
          </div>
        </div>
        
        <div class="pagination" v-if="totalHistoryPages > 1">
          <span class="pagination-info">显示 1 到 {{ Math.min(5, filteredHistoryData.length) }} 条，共 {{ filteredHistoryData.length }} 条记录</span>
          <div class="pagination-buttons">
            <button class="btn btn-sm" @click="prevHistoryPage" :disabled="currentHistoryPage === 1">上一页</button>
            <button class="btn btn-sm" v-for="page in visibleHistoryPages" :key="page" :class="{ active: page === currentHistoryPage }" @click="goToHistoryPage(page)">{{ page }}</button>
            <button class="btn btn-sm" @click="nextHistoryPage" :disabled="currentHistoryPage === totalHistoryPages">下一页</button>
          </div>
        </div>
      </div>

      <!-- 实时数据 -->
      <div v-if="activeSource === 'real-time'" class="realtime-section">
        <div class="realtime-devices">
          <h4>可用实时设备</h4>
          <div class="device-list">
            <div 
              v-for="device in realtimeDevices" 
              :key="device.id"
              class="device-item"
              :class="{ connected: device.connected, selected: selectedRealtimeDevices.includes(device.id) }"
              @click="toggleRealtimeDevice(device.id)"
            >
              <div class="device-status">
                <div class="status-indicator" :class="{ connected: device.connected }"></div>
                <span>{{ device.connected ? '在线' : '离线' }}</span>
              </div>
              <div class="device-info">
                <h5>{{ device.name }}</h5>
                <p>{{ device.model }}</p>
                <div class="device-meta">
                  <span class="meta-item">IP: {{ device.ip }}</span>
                  <span class="meta-item">信号: {{ device.signal }}%</span>
                </div>
              </div>
              <div class="device-checkbox">
                <input 
                  type="checkbox" 
                  :id="'realtime-' + device.id"
                  :checked="selectedRealtimeDevices.includes(device.id)"
                  :disabled="!device.connected"
                  @change="toggleRealtimeDevice(device.id)"
                >
                <label :for="'realtime-' + device.id"></label>
              </div>
            </div>
          </div>
        </div>
        
        <div class="realtime-settings">
          <h4>实时数据设置</h4>
          <div class="settings-form">
            <div class="form-group">
              <label>数据采集频率</label>
              <select v-model="dataFrequency">
                <option value="1s">1秒</option>
                <option value="5s">5秒</option>
                <option value="10s">10秒</option>
                <option value="30s">30秒</option>
                <option value="1m">1分钟</option>
              </select>
            </div>
            <div class="form-group">
              <label>采集时长</label>
              <input type="number" v-model="collectionDuration" placeholder="输入采集时长（分钟）">
            </div>
            <div class="form-group">
              <label>数据存储</label>
              <input type="checkbox" v-model="storeData">
              <span>采集后存储为历史数据</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 数据预览 -->
      <div class="data-preview" v-if="showPreview">
        <div class="section-header">
          <h3>数据预览</h3>
          <button class="btn btn-sm" @click="closePreview">关闭预览</button>
        </div>
        <div class="preview-content">
          <table class="preview-table">
            <thead>
              <tr>
                <th v-for="(header, index) in previewHeaders" :key="index">{{ header }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, rowIndex) in previewData" :key="rowIndex">
                <td v-for="(cell, cellIndex) in row" :key="cellIndex">{{ cell }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <button class="btn btn-secondary" @click="resetData">重置</button>
        <button class="btn btn-primary" @click="nextStep" :disabled="!canProceed">
          下一步: 参数配置
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['navigate'])

const activeSource = ref('upload')
const isDragActive = ref(false)
const uploadedFiles = ref([])
const fileInput = ref(null)
const historySearch = ref('')
const currentHistoryPage = ref(1)
const selectedHistoryData = ref([])
const selectedRealtimeDevices = ref([])
const dataFrequency = ref('5s')
const collectionDuration = ref(10)
const storeData = ref(true)
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

const handleDrop = (event) => {
  isDragActive.value = false
  const files = event.dataTransfer.files
  handleFiles(files)
}

const triggerFileInput = () => {
  fileInput.value.click()
}

const handleFileSelect = (event) => {
  const files = event.target.files
  handleFiles(files)
}

const handleFiles = (files) => {
  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    uploadedFiles.value.push({
      name: file.name,
      size: file.size,
      status: '上传中...',
      file: file
    })
    
    // 模拟上传过程
    setTimeout(() => {
      const index = uploadedFiles.value.findIndex(f => f.name === file.name)
      if (index > -1) {
        uploadedFiles.value[index].status = '上传完成'
      }
    }, 1000)
  }
}

const formatFileSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB'
  return (bytes / 1048576).toFixed(2) + ' MB'
}

const removeFile = (index) => {
  uploadedFiles.value.splice(index, 1)
}

const previewFile = (file) => {
  // 模拟文件预览
  previewHeaders.value = ['时间', '参数1', '参数2', '参数3', '参数4']
  previewData.value = [
    ['2024-04-01 00:00', '100', '200', '300', '400'],
    ['2024-04-01 00:01', '101', '201', '301', '401'],
    ['2024-04-01 00:02', '102', '202', '302', '402'],
    ['2024-04-01 00:03', '103', '203', '303', '403'],
    ['2024-04-01 00:04', '104', '204', '304', '404']
  ]
  showPreview.value = true
}

const closePreview = () => {
  showPreview.value = false
}

const searchHistory = () => {
  currentHistoryPage.value = 1
}

const toggleHistoryData = (id) => {
  const index = selectedHistoryData.value.indexOf(id)
  if (index > -1) {
    selectedHistoryData.value.splice(index, 1)
  } else {
    selectedHistoryData.value.push(id)
  }
}

const prevHistoryPage = () => {
  if (currentHistoryPage.value > 1) {
    currentHistoryPage.value--
  }
}

const nextHistoryPage = () => {
  if (currentHistoryPage.value < totalHistoryPages.value) {
    currentHistoryPage.value++
  }
}

const goToHistoryPage = (page) => {
  currentHistoryPage.value = page
}

const toggleRealtimeDevice = (id) => {
  const device = realtimeDevices.value.find(d => d.id === id)
  if (!device || !device.connected) return
  
  const index = selectedRealtimeDevices.value.indexOf(id)
  if (index > -1) {
    selectedRealtimeDevices.value.splice(index, 1)
  } else {
    selectedRealtimeDevices.value.push(id)
  }
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
.data-load-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.data-source-tabs {
  display: flex;
  gap: 12px;
  margin: 24px 0;
  border-bottom: 1px solid #e0e0e0;
}

.source-tab {
  padding: 12px 24px;
  background: white;
  border: 1px solid #e0e0e0;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
}

.source-tab:hover {
  background-color: #f8f9fa;
}

.source-tab.active {
  background-color: #2563eb;
  color: white;
  border-color: #2563eb;
}

.upload-section {
  margin-bottom: 24px;
}

.upload-area {
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  padding: 48px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 24px;
}

.upload-area:hover,
.upload-area.active {
  border-color: #2563eb;
  background-color: #eff6ff;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.upload-area h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
}

.upload-area p {
  margin: 0 0 24px 0;
  color: #666;
}

.file-input {
  display: none;
}

.file-types {
  font-size: 12px;
  color: #999;
  margin-top: 16px;
}

.uploaded-files {
  margin-top: 24px;
}

.file-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.file-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}

.file-info {
  flex: 1;
}

.file-name {
  display: block;
  font-weight: 500;
  margin-bottom: 4px;
}

.file-size,
.file-status {
  font-size: 12px;
  color: #666;
  margin-right: 16px;
}

.file-actions {
  display: flex;
  gap: 8px;
}

.history-section {
  margin-bottom: 24px;
}

.search-box {
  position: relative;
  margin-bottom: 24px;
}

.search-box input {
  width: 100%;
  padding: 12px 48px 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
}

.search-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
}

.history-data-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.history-data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.history-data-item:hover {
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  border-color: #2563eb;
}

.history-data-item.selected {
  border-color: #2563eb;
  background-color: #eff6ff;
}

.data-info {
  flex: 1;
}

.data-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
}

.data-info p {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
}

.data-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
}

.realtime-section {
  margin-bottom: 24px;
}

.device-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 24px 0;
}

.device-item {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.device-item:hover {
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
  border-color: #2563eb;
}

.device-item.connected {
  border-left: 4px solid #27ae60;
}

.device-item.selected {
  border-color: #2563eb;
  background-color: #eff6ff;
}

.device-status {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 24px;
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #e74c3c;
}

.status-indicator.connected {
  background-color: #27ae60;
}

.device-info {
  flex: 1;
}

.device-info h5 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
}

.device-info p {
  margin: 0 0 8px 0;
  color: #666;
  font-size: 12px;
}

.device-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
}

.realtime-settings {
  margin-top: 32px;
  padding: 24px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.settings-form {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
}

.form-group input,
.form-group select {
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
}

.data-preview {
  margin-top: 32px;
  padding: 24px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.preview-content {
  overflow-x: auto;
  margin-top: 16px;
}

.preview-table {
  width: 100%;
  border-collapse: collapse;
}

.preview-table th,
.preview-table td {
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  text-align: left;
}

.preview-table th {
  background-color: #e9ecef;
  font-weight: 600;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.pagination-info {
  font-size: 14px;
  color: #666;
}

.pagination-buttons {
  display: flex;
  gap: 8px;
}

.pagination-buttons .btn.active {
  background-color: #2563eb;
  color: white;
  border-color: #2563eb;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .data-source-tabs {
    flex-wrap: wrap;
  }
  
  .file-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .file-actions {
    width: 100%;
    justify-content: flex-end;
  }
  
  .history-data-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .device-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .device-status {
    margin-right: 0;
  }
  
  .settings-form {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }
  
  .action-buttons .btn {
    width: 100%;
  }
  
  .pagination {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .pagination-buttons {
    flex-wrap: wrap;
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