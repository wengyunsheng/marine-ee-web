<template>
  <div class="weight-params-container">
    <div class="page-header">
      <h3>加权参数管理</h3>
    </div>

    <div class="mode-controls">
      <div class="control-group">
        <button class="btn btn-primary" @click="addMode">+ 新增运行模式</button>
        <button class="btn btn-secondary" @click="importModes">导入运行模式</button>
        <button class="btn btn-secondary" @click="exportModes">导出运行模式</button>
      </div>

      <div class="search-filter">
        <div class="search-box">
          <input type="text" v-model="searchQuery" placeholder="搜索模式名称" @keyup.enter="filterModes">
          <button class="search-btn" @click="filterModes">🔍</button>
        </div>
      </div>
    </div>

    <div class="mode-list-section">
      <h4>运行模式列表</h4>
      <div class="mode-table-container">
        <table class="mode-table">
          <thead>
            <tr>
              <th>模式名称</th>
              <th>工况数量</th>
              <th>描述</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="mode in paginatedModes" :key="mode.id">
              <td>{{ mode.name }}</td>
              <td>{{ mode.weights.length }} 个工况</td>
              <td>{{ mode.description || '-' }}</td>
              <td class="action-buttons">
                <button class="btn btn-sm btn-info" @click="openViewModal(mode)">查看</button>
                <button class="btn btn-sm btn-warning" @click="editMode(mode)">编辑</button>
                <button class="btn btn-sm btn-success" @click="openWeightConfig(mode)">权重配置</button>
                <button class="btn btn-sm btn-danger" @click="deleteMode(mode.id)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 分页组件 -->
      <div v-if="totalPages > 1" class="pagination-container">
        <div class="pagination-info">
          共 {{ filteredModes.length }} 条记录，第 {{ currentPage }} / {{ totalPages }} 页
        </div>
        <div class="pagination">
          <button 
            class="pagination-btn" 
            :disabled="currentPage === 1" 
            @click="goToPage(currentPage - 1)"
          >
            上一页
          </button>
          <button 
            v-for="page in totalPages" 
            :key="page"
            class="pagination-btn"
            :class="{ active: currentPage === page }"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
          <button 
            class="pagination-btn" 
            :disabled="currentPage === totalPages" 
            @click="goToPage(currentPage + 1)"
          >
            下一页
          </button>
        </div>
      </div>
    </div>

    <!-- 查看运行模式弹窗 -->
    <ModeView
      v-if="showViewModal"
      :mode="selectedMode"
      @close="closeViewModal"
    />

    <!-- 编辑/新增运行模式弹窗 -->
    <ModeEdit
      v-if="showEditModal"
      :mode="editingMode"
      @close="closeEditModal"
      @save="handleSaveMode"
    />

    <!-- 权重配置弹窗 -->
    <ModeWeightConfig
      v-if="showWeightConfigModal"
      :mode="selectedMode"
      @close="closeWeightConfig"
      @save="handleSaveWeights"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ModeView from './components/ModeView.vue'
import ModeEdit from './components/ModeEdit.vue'
import ModeWeightConfig from './components/ModeWeightConfig.vue'

const runModes = ref([
  {
    id: 'E2',
    name: '恒速主机运行模式 (E2)',
    description: '主机以恒定转速运行',
    weights: [
      { id: 1, engineSpeed: '100%', powerMode: '100%', weight: 0.2 },
      { id: 2, engineSpeed: '100%', powerMode: '75%', weight: 0.5 },
      { id: 3, engineSpeed: '100%', powerMode: '50%', weight: 0.15 },
      { id: 4, engineSpeed: '100%', powerMode: '25%', weight: 0.15 }
    ]
  },
  {
    id: 'E3',
    name: '按推进特性运行模式 (E3)',
    description: '发动机按推进特性曲线运行',
    weights: [
      { id: 1, engineSpeed: '100%', powerMode: '100%', weight: 0.2 },
      { id: 2, engineSpeed: '91%', powerMode: '75%', weight: 0.5 },
      { id: 3, engineSpeed: '80%', powerMode: '50%', weight: 0.15 },
      { id: 4, engineSpeed: '63%', powerMode: '25%', weight: 0.15 }
    ]
  },
  {
    id: 'D2',
    name: '恒速辅机运行模式 (D2)',
    description: '辅机以恒定转速运行',
    weights: [
      { id: 1, engineSpeed: '100%', powerMode: '100%', weight: 0.05 },
      { id: 2, engineSpeed: '100%', powerMode: '75%', weight: 0.35 },
      { id: 3, engineSpeed: '100%', powerMode: '50%', weight: 0.3 },
      { id: 4, engineSpeed: '100%', powerMode: '30%', weight: 0.3 },
      { id: 5, engineSpeed: '100%', powerMode: '10%', weight: 0.1 }
    ]
  }
])

const searchQuery = ref('')
const showViewModal = ref(false)
const showEditModal = ref(false)
const showWeightConfigModal = ref(false)
const selectedMode = ref(null)
const editingMode = ref(null)

const filteredModes = computed(() => {
  if (!searchQuery.value) {
    return runModes.value
  }
  const query = searchQuery.value.toLowerCase()
  return runModes.value.filter(mode => 
    mode.name.toLowerCase().includes(query) ||
    mode.description.toLowerCase().includes(query)
  )
})

const currentPage = ref(1)
const pageSize = ref(10)

const totalPages = computed(() => {
  return Math.ceil(filteredModes.value.length / pageSize.value)
})

const paginatedModes = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredModes.value.slice(start, end)
})

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const resetPage = () => {
  currentPage.value = 1
}

const filterModes = () => {
  resetPage()
}

const addMode = () => {
  editingMode.value = null
  showEditModal.value = true
}

const editMode = (mode) => {
  editingMode.value = mode
  showEditModal.value = true
}

const deleteMode = (modeId) => {
  if (confirm('确定要删除该运行模式吗？')) {
    const index = runModes.value.findIndex(m => m.id === modeId)
    if (index > -1) {
      runModes.value.splice(index, 1)
      alert('删除成功')
    }
  }
}

const importModes = () => {
  alert('导入功能已触发，请选择文件')
}

const exportModes = () => {
  const data = JSON.stringify(runModes.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'weight-modes.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  alert('导出成功')
}

const openViewModal = (mode) => {
  selectedMode.value = mode
  showViewModal.value = true
}

const closeViewModal = () => {
  showViewModal.value = false
  selectedMode.value = null
}

const closeEditModal = () => {
  showEditModal.value = false
  editingMode.value = null
}

const handleSaveMode = (data) => {
  if (editingMode.value) {
    const index = runModes.value.findIndex(m => m.id === editingMode.value.id)
    if (index > -1) {
      runModes.value[index] = {
        ...runModes.value[index],
        name: data.name,
        description: data.description
      }
    }
    alert('编辑成功')
  } else {
    runModes.value.push({
      id: data.id,
      name: data.name,
      description: data.description,
      weights: []
    })
    alert('新增成功')
  }
  closeEditModal()
}

const openWeightConfig = (mode) => {
  selectedMode.value = mode
  showWeightConfigModal.value = true
}

const closeWeightConfig = () => {
  showWeightConfigModal.value = false
  selectedMode.value = null
}

const handleSaveWeights = (weights) => {
  if (selectedMode.value) {
    selectedMode.value.weights = weights
  }
  alert('权重配置已保存')
  closeWeightConfig()
}
</script>

<style scoped>
.weight-params-container {
  padding: 20px;
  height: calc(100vh - 120px);
  overflow-y: auto;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.page-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.mode-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.control-group {
  display: flex;
  gap: 12px;
}

.search-filter {
  display: flex;
  gap: 12px;
}

.search-box {
  display: flex;
  align-items: center;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}

.search-box input {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  outline: none;
  background-color: transparent;
  width: 200px;
}

.search-btn {
  padding: 6px 10px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.search-btn:hover {
  background-color: #1d4ed8;
}

.mode-list-section {
  margin-bottom: 32px;
}

.mode-list-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.mode-table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
}

.mode-table {
  width: 100%;
  border-collapse: collapse;
}

.mode-table th {
  background-color: #f8fafc;
  padding: 12px 16px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e2e8f0;
}

.mode-table td {
  padding: 12px 16px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #e2e8f0;
}

.mode-table tr:hover {
  background-color: #f8fafc;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 14px;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.btn-secondary {
  background-color: #e2e8f0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #cbd5e1;
}

.btn-info {
  background-color: #3b82f6;
  color: white;
}

.btn-info:hover {
  background-color: #2563eb;
}

.btn-warning {
  background-color: #f59e0b;
  color: white;
}

.btn-warning:hover {
  background-color: #d97706;
}

.btn-success {
  background-color: #10b981;
  color: white;
}

.btn-success:hover {
  background-color: #059669;
}

.btn-danger {
  background-color: #ef4444;
  color: white;
}

.btn-danger:hover {
  background-color: #dc2626;
}

@media (max-width: 768px) {
  .mode-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .control-group {
    flex-wrap: wrap;
  }
  
  .search-box input {
    width: 100%;
  }
  
  .action-buttons {
    flex-wrap: wrap;
  }
}
</style>