<template>
  <div class="model-management-container">
    <div class="model-controls">
      <div class="control-group">
        <button class="btn btn-primary" @click="openAddModal">+ 新建模型</button>
        <button class="btn btn-secondary" @click="importModel">导入模型</button>
        <button class="btn btn-secondary" @click="exportModels">导出模型</button>
      </div>

      <div class="search-filter">
        <div class="search-box">
          <input type="text" v-model="searchQuery" placeholder="搜索模型名称" @keyup.enter="filterModels">
          <button class="search-btn" @click="filterModels">🔍</button>
        </div>
        <select class="filter-select" v-model="modelStatusFilter" @change="filterModels">
          <option value="">全部状态</option>
          <option value="connected">已连接</option>
          <option value="disconnected">未连接</option>
          <option value="testing">测试中</option>
          <option value="validated">已验证</option>
        </select>
      </div>
    </div>

    <div class="model-list-section">
      <h3>模型列表</h3>
      <div class="model-table-container">
        <table class="model-table">
          <thead>
            <tr>
              <th>模型名称</th>
              <th>船型</th>
              <th>设备类型</th>
              <th>关联数据</th>
              <th>模型版本</th>
              <th>状态</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="model in paginatedModels" :key="model.id">
              <td>{{ model.name }}</td>
              <td>{{ model.shipType }}</td>
              <td>{{ model.deviceType }}</td>
              <td>
                <a v-if="model.relatedData" href="#" class="related-data-link" @click.prevent="navigateToData(model.relatedData)">
                  {{ model.relatedData }}
                </a>
                <span v-else class="text-muted">-</span>
              </td>
              <td>{{ model.version }}</td>
              <td>
                <span class="model-status" :class="model.status">
                  {{ getStatusText(model.status) }}
                </span>
              </td>
              <td>{{ model.createdAt }}</td>
              <td class="action-buttons">
                <button class="btn btn-sm btn-info" @click="viewModel(model)">查看</button>
                <button class="btn btn-sm" @click="view3DModel(model)">3D模型</button>
                <button class="btn btn-sm btn-warning" @click="openEditModal(model)">编辑</button>
                <button class="btn btn-sm btn-danger" @click="deleteModel(model.id)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 分页组件 -->
      <div class="pagination-container">
        <div class="pagination-info">
          共 {{ filteredModels.length }} 条记录，第 {{ currentPage }} / {{ totalPages }} 页
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

    <!-- 新增/编辑模型弹窗 -->
    <ModelForm
      v-if="showFormModal"
      :is-edit="isEditMode"
      :form-data="formData"
      @save="saveModel"
      @close="closeFormModal"
    />

    <!-- 查看模型详情弹窗 -->
    <ModelView
      v-if="showViewModal"
      :model="currentModel"
      @close="closeViewModal"
    />

    <!-- 3D模型查看弹窗 -->
    <Model3DView
      v-if="show3DModel"
      :model="current3DModel"
      @close="close3DModel"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import ModelForm from './components/ModelForm.vue'
import ModelView from './components/ModelView.vue'
import Model3DView from './components/Model3DView.vue'

const props = defineProps({
  globalState: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['switch-to-visualization'])

const searchQuery = ref('')
const modelStatusFilter = ref('')

const showFormModal = ref(false)
const showViewModal = ref(false)
const show3DModel = ref(false)
const isEditMode = ref(false)
const currentModel = ref(null)
const current3DModel = ref(null)

const defaultFormData = {
  name: '',
  shipType: '',
  deviceType: '',
  version: 'v1.0.0',
  status: 'disconnected',
  connectionInfo: '',
  description: ''
}

const formData = ref({ ...defaultFormData })

// 初始化模型数据
const initialModels = [
  {
    id: 1,
    name: 'VLCC超大型油轮 - 船用柴油发动机（低速机）',
    shipType: 'VLCC超大型油轮',
    deviceType: '船用柴油发动机（低速机）',
    relatedData: 'MAN B&W 6S70MC - 2024-04-20台架试验',
    version: 'v1.0.0',
    status: 'connected',
    connectionInfo: '已连接至实船数据采集系统，数据源：船舶AIS系统',
    description: '用于VLCC超大型油轮低速柴油发动机的能效评估仿真模型',
    createdAt: '2024-04-01',
    metrics: { score: 89, accuracy: '94%' }
  },
  {
    id: 2,
    name: '散货船 - 船用柴油发动机（中速机）',
    shipType: '散货船',
    deviceType: '船用柴油发动机（中速机）',
    relatedData: 'Cummins QSK60 - 2024-04-15实船运行',
    version: 'v1.0.0',
    status: 'connected',
    connectionInfo: '已连接至台架测试系统，数据源：实验室台架数据',
    description: '用于散货船中速柴油发动机的能效评估仿真模型',
    createdAt: '2024-04-02',
    metrics: { score: 92, accuracy: '91%' }
  },
  {
    id: 3,
    name: '集装箱船 - 船用LNG/柴油双燃料发动机（低速机）',
    shipType: '集装箱船',
    deviceType: '船用LNG/柴油双燃料发动机（低速机）',
    relatedData: 'Wärtsilä 50DF - 2024-04-10台架试验',
    version: 'v1.0.0',
    status: 'testing',
    connectionInfo: '测试中，连接至模拟数据系统',
    description: '用于集装箱船LNG/柴油双燃料发动机的能效评估仿真模型',
    createdAt: '2024-04-03',
    metrics: { score: 76, accuracy: '88%' }
  },
  {
    id: 4,
    name: '液化气船 - 船用LNG/柴油双燃料发动机（中速机）',
    shipType: '液化气船',
    deviceType: '船用LNG/柴油双燃料发动机（中速机）',
    relatedData: 'Caterpillar 3516E - 2024-04-05实船运行',
    version: 'v1.0.0',
    status: 'validated',
    connectionInfo: '已验证，连接至实船数据与台架数据',
    description: '用于液化气船LNG/柴油双燃料发动机的能效评估仿真模型',
    createdAt: '2024-04-04',
    metrics: { score: 82, accuracy: '90%' }
  },
  {
    id: 5,
    name: 'VLCC超大型油轮 - 船用甲醇/柴油双燃料发动机（低速机）',
    shipType: 'VLCC超大型油轮',
    deviceType: '船用甲醇/柴油双燃料发动机（低速机）',
    relatedData: 'MAN B&W ME-LGIM - 2024-04-01台架试验',
    version: 'v1.0.0',
    status: 'disconnected',
    connectionInfo: '未连接数据源',
    description: '用于VLCC超大型油轮甲醇/柴油双燃料发动机的能效评估仿真模型',
    createdAt: '2024-04-05',
    metrics: { score: 88, accuracy: '93%' }
  },
  {
    id: 6,
    name: '散货船 - 船用甲醇/柴油双燃料发动机（中速机）',
    shipType: '散货船',
    deviceType: '船用甲醇/柴油双燃料发动机（中速机）',
    relatedData: 'Wärtsilä 32 Methanol - 2024-03-25实船运行',
    version: 'v1.0.0',
    status: 'testing',
    connectionInfo: '测试中，连接至台架测试系统',
    description: '用于散货船甲醇/柴油双燃料发动机的能效评估仿真模型',
    createdAt: '2024-04-06',
    metrics: { score: 79, accuracy: '87%' }
  }
]

// 同步模型数据到全局状态
if (props.globalState && props.globalState.models && props.globalState.models.length === 0) {
  props.globalState.models = [...initialModels]
}

// 使用全局状态中的模型数据
const models = ref(props.globalState.models || [...initialModels])

const filteredModels = computed(() => {
  let result = models.value
  if (searchQuery.value) {
    result = result.filter(model =>
      model.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  if (modelStatusFilter.value) {
    result = result.filter(model => model.status === modelStatusFilter.value)
  }
  return result
})

const currentPage = ref(1)
const pageSize = ref(10)

const totalPages = computed(() => {
  return Math.ceil(filteredModels.value.length / pageSize.value)
})

const paginatedModels = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredModels.value.slice(start, end)
})

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const resetPage = () => {
  currentPage.value = 1
}

const getStatusText = (status) => {
  const statusMap = {
    connected: '已连接',
    disconnected: '未连接',
    testing: '测试中',
    validated: '已验证'
  }
  return statusMap[status] || status
}

const filterModels = () => {
  console.log('过滤模型', {
    searchQuery: searchQuery.value,
    modelStatusFilter: modelStatusFilter.value
  })
}

const navigateToData = (relatedData) => {
  alert(`跳转到能效数据管理，查看数据：${relatedData}`)
}

const openAddModal = () => {
  isEditMode.value = false
  formData.value = { ...defaultFormData }
  showFormModal.value = true
}

const openEditModal = (model) => {
  isEditMode.value = true
  formData.value = { ...model }
  showFormModal.value = true
}

const closeFormModal = () => {
  showFormModal.value = false
  formData.value = { ...defaultFormData }
}

const saveModel = (data) => {
  if (!data.name || !data.shipType || !data.deviceType) {
    alert('请填写必填项')
    return
  }

  if (isEditMode.value) {
    const index = models.value.findIndex(m => m.id === data.id)
    if (index !== -1) {
      models.value[index] = { ...data }
    }
  } else {
    const newId = Math.max(...models.value.map(m => m.id)) + 1
    models.value.push({
      ...data,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0]
    })
  }
  closeFormModal()
}

const viewModel = (model) => {
  currentModel.value = model
  showViewModal.value = true
}

const closeViewModal = () => {
  showViewModal.value = false
  currentModel.value = null
}

const deleteModel = (modelId) => {
  if (confirm('确定要删除这个模型吗？')) {
    models.value = models.value.filter(model => model.id !== modelId)
  }
}

const importModel = () => {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.json'
  input.onchange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const importedData = JSON.parse(event.target.result)
          if (Array.isArray(importedData)) {
            // 检查数据格式是否正确
            const validData = importedData.filter(item => 
              item.name && item.shipType && item.deviceType && item.version && item.status
            )
            if (validData.length > 0) {
              // 生成新的ID
              const maxId = Math.max(...models.value.map(m => m.id), 0)
              validData.forEach((item, index) => {
                item.id = maxId + index + 1
                item.createdAt = item.createdAt || new Date().toISOString().split('T')[0]
              })
              models.value = [...models.value, ...validData]
              alert(`成功导入 ${validData.length} 个模型`)
            } else {
              alert('导入的数据格式不正确')
            }
          } else {
            alert('导入的数据格式不正确')
          }
        } catch (error) {
          alert('导入失败：' + error.message)
        }
      }
      reader.readAsText(file)
    }
  }
  input.click()
}

const exportModels = () => {
  const dataToExport = models.value.map(item => ({
    name: item.name,
    shipType: item.shipType,
    deviceType: item.deviceType,
    version: item.version,
    status: item.status,
    connectionInfo: item.connectionInfo,
    description: item.description,
    createdAt: item.createdAt,
    metrics: item.metrics
  }))
  
  const jsonString = JSON.stringify(dataToExport, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `models-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const view3DModel = (model) => {
  // 更新全局状态中的选中模型
  if (props.globalState) {
    props.globalState.selectedModel = model
    // 触发切换到可视化模块的事件
    emit('switch-to-visualization')
  }
}

const close3DModel = () => {
  show3DModel.value = false
  current3DModel.value = null
}
</script>

<style scoped>
.model-management-container {
  padding: 20px;
  height: 100%;
  min-height: calc(100vh - 120px);
  overflow-y: auto;
  box-sizing: border-box;
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

.model-controls {
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
  flex-wrap: wrap;
}

.search-filter {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
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
}

.search-btn {
  padding: 6px 10px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  margin-left: 4px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.search-btn:hover {
  background-color: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.filter-select {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background-color: white;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  cursor: pointer;
  outline: none;
}

.filter-select:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-color: #93c5fd;
}

.model-list-section {
  margin-bottom: 24px;
}

.model-list-section h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.model-table-container {
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  overflow: hidden;
}

.model-table {
  width: 100%;
  border-collapse: collapse;
}

.model-table th {
  background-color: #f8fafc;
  padding: 12px 16px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e2e8f0;
}

.model-table td {
  padding: 12px 16px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #e2e8f0;
}

.model-table tr:hover {
  background-color: #f8fafc;
}

.model-status {
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.model-status.connected {
  background-color: #d1fae5;
  color: #065f46;
}

.model-status.disconnected {
  background-color: #fee2e2;
  color: #b91c1c;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
}

.related-data-link {
  color: #2563eb;
  text-decoration: none;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.related-data-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.text-muted {
  color: #94a3b8;
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

.btn-danger {
  background-color: #ef4444;
  color: white;
}

.btn-danger:hover {
  background-color: #dc2626;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 14px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .model-controls {
    flex-direction: column;
    align-items: flex-start;
  }

  .control-group {
    width: 100%;
  }

  .search-filter {
    width: 100%;
  }

  .search-box {
    flex: 1;
  }

  .model-table-container {
    overflow-x: auto;
  }

  .model-table {
    min-width: 800px;
  }
}

.pagination-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-top: 1px solid #e2e8f0;
}

.pagination-info {
  font-size: 14px;
  color: #64748b;
}

.pagination {
  display: flex;
  gap: 8px;
}

.pagination-btn {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background-color: white;
  color: #333;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover:not(:disabled) {
  background-color: #f1f5f9;
  border-color: #cbd5e1;
}

.pagination-btn.active {
  background-color: #2563eb;
  color: white;
  border-color: #2563eb;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
