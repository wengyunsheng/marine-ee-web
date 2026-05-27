<template>
  <div class="model-management-container">
    <div class="model-controls">
      <div class="control-group">
        <el-button type="primary" @click="openAddModal">
          <el-icon><Plus /></el-icon>
          新增样机模型
        </el-button>
        <el-button @click="importModel">导入样机模型</el-button>
        <el-button @click="exportModels">导出样机模型</el-button>
      </div>

      <div class="search-filter">
        <el-input 
          v-model="searchQuery" 
          placeholder="搜索模型名称" 
          clearable
          style="width: 200px;"
          @keyup.enter="filterModels"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="modelStatusFilter" placeholder="全部状态" clearable style="width: 150px;" @change="filterModels">
          <el-option label="全部状态" value="" />
          <el-option label="已连接" value="connected" />
          <el-option label="未连接" value="disconnected" />
          <el-option label="测试中" value="testing" />
          <el-option label="已验证" value="validated" />
        </el-select>
      </div>
    </div>

    <div class="model-list-section">
      <h3>样机模型列表</h3>
      <el-table :data="paginatedModels" style="width: 100%" border stripe>
        <el-table-column prop="name" label="模型名称" min-width="150" />
        <el-table-column prop="shipType" label="船型" min-width="120" />
        <el-table-column prop="deviceType" label="设备类型" min-width="180" />
        <el-table-column label="关联数据" width="150">
          <template #default="scope">
            <el-link v-if="scope.row.relatedData" type="primary" @click="navigateToData(scope.row.relatedData)">
              {{ scope.row.relatedData }}
            </el-link>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="version" label="模型版本" width="120" />
        <el-table-column label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusTagType(scope.row.status)">
              {{ getStatusText(scope.row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" width="120" />
        <el-table-column label="操作" width="350" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="viewModel(scope.row)">查看</el-button>
            <el-button size="small" @click="view3DModel(scope.row)">3D模型</el-button>
            <el-button type="warning" size="small" @click="openEditModal(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="deleteModel(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="pageSizes"
          :total="filteredModels.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="resetPage"
        />
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
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
const pageSizes = ref([10, 20, 50, 100, 200, 500])

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

const getStatusTagType = (status) => {
  const typeMap = {
    connected: 'success',
    disconnected: 'info',
    testing: 'warning',
    validated: ''
  }
  return typeMap[status] || ''
}

const filterModels = () => {
  console.log('过滤模型', {
    searchQuery: searchQuery.value,
    modelStatusFilter: modelStatusFilter.value
  })
}

const navigateToData = (relatedData) => {
  ElMessage.info(`跳转到能效数据管理，查看数据：${relatedData}`)
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
    ElMessage.warning('请填写必填项')
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
  ElMessage.success('模型保存成功')
}

const viewModel = (model) => {
  currentModel.value = model
  showViewModal.value = true
}

const closeViewModal = () => {
  showViewModal.value = false
  currentModel.value = null
}

const deleteModel = async (modelId) => {
  try {
    await ElMessageBox.confirm('确定要删除这个模型吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    models.value = models.value.filter(model => model.id !== modelId)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
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
              ElMessage.success(`成功导入 ${validData.length} 个模型`)
            } else {
              ElMessage.error('导入的数据格式不正确')
            }
          } else {
            ElMessage.error('导入的数据格式不正确')
          }
        } catch (error) {
          ElMessage.error('导入失败：' + error.message)
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

.model-list-section {
  margin-bottom: 24px;
}

.model-list-section h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
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
  justify-content: flex-end;
  padding: 16px 0;
}

.pagination-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.pagination-info {
  font-size: 14px;
  color: #64748b;
}

.pagination-page-size {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #64748b;
}

.page-size-select {
  padding: 6px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  background-color: white;
}

.page-size-select:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
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
