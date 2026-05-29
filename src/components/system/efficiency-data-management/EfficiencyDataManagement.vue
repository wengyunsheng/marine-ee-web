<template>
  <div class="efficiency-data-management-container">
    <div class="efficiency-data-controls">
      <div class="control-group">
        <el-button type="primary" @click="openAddModal">
          <el-icon><Plus /></el-icon>
          新增能效数据
        </el-button>
        <el-button @click="importData">导入能效数据</el-button>
        <el-button @click="exportData">导出能效数据</el-button>
      </div>

      <div class="search-filter">
        <el-input 
          v-model="searchQuery" 
          placeholder="搜索数据日期" 
          clearable
          style="width: 200px;"
          @keyup.enter="filterData"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="modelFilter" placeholder="全部样机模型" clearable style="width: 250px;" @change="filterData">
          <el-option label="全部样机模型" value="" />
          <el-option v-for="model in models" :key="model.id" :label="model.name" :value="model.id" />
        </el-select>
        <el-select v-model="dataSourceFilter" placeholder="全部数据来源" clearable style="width: 150px;" @change="filterData">
          <el-option label="全部数据来源" value="" />
          <el-option label="台架试验" value="台架试验" />
          <el-option label="实船运行" value="实船运行" />
        </el-select>
        <el-button @click="resetFilters">重置筛选</el-button>
      </div>
    </div>

    <div class="efficiency-data-list-section">
      <h3>能效数据列表</h3>
      <el-table :data="paginatedData" style="width: 100%" border stripe>
        <el-table-column prop="dataDate" label="数据日期" width="120" />
        <el-table-column label="样机模型" min-width="200" show-overflow-tooltip>
          <template #default="scope">
            {{ getModelName(scope.row.modelId) }}
          </template>
        </el-table-column>
        <el-table-column prop="version" label="版本" width="80" align="center">
          <template #default="scope">
            <el-tag size="small">v{{ scope.row.version }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="dataSource" label="数据来源" width="120" />
        <el-table-column label="操作" width="320" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="viewData(scope.row)">查看</el-button>
            <el-button type="warning" size="small" @click="openEditModal(scope.row)">编辑</el-button>
            <el-button type="success" size="small" @click="viewOperatingData(scope.row)">工况数据</el-button>
            <el-button type="danger" size="small" @click="deleteData(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="pageSizes"
          :total="filteredData.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="resetPage"
        />
      </div>
    </div>

    <!-- 新增/编辑历史数据弹窗 -->
    <EfficiencyDataForm
      v-if="showFormModal"
      :is-edit="isEditMode"
      :form-data="formData"
      :models="models"
      @save="saveData"
      @close="closeFormModal"
    />

    <!-- 查看历史数据弹窗 -->
    <EfficiencyDataView 
      v-if="showViewModal" 
      :data="currentData"
      :models="models"
      @close="closeViewModal" 
    />

    <!-- 查看工况数据弹窗 -->
    <OperatingDataView
      v-if="showOperatingDataModal"
      :data="currentOperatingData"
      :models="models"
      @close="closeOperatingDataModal"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import EfficiencyDataForm from './components/EfficiencyDataForm.vue'
import EfficiencyDataView from './components/EfficiencyDataView.vue'
import OperatingDataView from './components/OperatingDataView.vue'

const props = defineProps({
  historyData: {
    type: Array,
    default: () => []
  },
  models: {
    type: Array,
    default: () => []
  },
  globalState: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['delete'])

const searchQuery = ref('')
const modelFilter = ref('')
const dataSourceFilter = ref('')
const showFormModal = ref(false)
const showViewModal = ref(false)
const isEditMode = ref(false)
const currentData = ref(null)
const showOperatingDataModal = ref(false)
const currentOperatingData = ref(null)

const defaultFormData = {
  dataDate: '',
  modelId: '',
  deviceType: '',
  deviceName: '',
  dataSource: '',
  version: 1
}

const formData = ref({ ...defaultFormData })

const localHistoryData = ref([
  {
    id: 1,
    dataDate: '2024-04-20',
    modelId: 1,
    deviceType: '船用柴油发动机（低速机）',
    deviceName: 'VLCC超大型油轮 - 船用柴油发动机（低速机）',
    dataSource: '台架试验',
    version: 1
  },
  {
    id: 2,
    dataDate: '2024-04-20',
    modelId: 1,
    deviceType: '船用柴油发动机（低速机）',
    deviceName: 'VLCC超大型油轮 - 船用柴油发动机（低速机）',
    dataSource: '台架试验',
    version: 2
  },
  {
    id: 3,
    dataDate: '2024-04-15',
    modelId: 2,
    deviceType: '船用柴油发动机（中速机）',
    deviceName: '散货船 - 船用柴油发动机（中速机）',
    dataSource: '实船运行',
    version: 1
  },
  {
    id: 4,
    dataDate: '2024-04-10',
    modelId: 3,
    deviceType: '船用LNG/柴油双燃料发动机（低速机）',
    deviceName: '集装箱船 - 船用LNG/柴油双燃料发动机（低速机）',
    dataSource: '台架试验',
    version: 1
  },
  {
    id: 5,
    dataDate: '2024-04-05',
    modelId: 4,
    deviceType: '船用LNG/柴油双燃料发动机（中速机）',
    deviceName: '液化气船 - 船用LNG/柴油双燃料发动机（中速机）',
    dataSource: '实船运行',
    version: 1
  },
  {
    id: 6,
    dataDate: '2024-04-01',
    modelId: 5,
    deviceType: '船用甲醇/柴油双燃料发动机（低速机）',
    deviceName: 'VLCC超大型油轮 - 船用甲醇/柴油双燃料发动机（低速机）',
    dataSource: '台架试验',
    version: 1
  },
  {
    id: 7,
    dataDate: '2024-03-25',
    modelId: 6,
    deviceType: '船用甲醇/柴油双燃料发动机（中速机）',
    deviceName: '散货船 - 船用甲醇/柴油双燃料发动机（中速机）',
    dataSource: '实船运行',
    version: 1
  }
])

// 合并外部数据和本地数据（去重）
const mergedData = computed(() => {
  const externalIds = new Set(props.historyData.map(d => d.id))
  const localOnly = localHistoryData.value.filter(d => !externalIds.has(d.id))
  return [...props.historyData, ...localOnly]
})



// 获取样机模型名称
const getModelName = (modelId) => {
  const model = props.models.find(m => m.id === modelId)
  return model ? model.name : '-'
}

const filteredData = computed(() => {
  let result = mergedData.value
  if (searchQuery.value) {
    result = result.filter(data =>
      data.dataDate.includes(searchQuery.value)
    )
  }
  if (modelFilter.value) {
    result = result.filter(data => data.modelId === modelFilter.value)
  }
  if (dataSourceFilter.value) {
    result = result.filter(data => data.dataSource === dataSourceFilter.value)
  }
  return result
})

const currentPage = ref(1)
const pageSize = ref(10)
const pageSizes = ref([10, 20, 50, 100, 200, 500])

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

const resetPage = () => {
  currentPage.value = 1
}

const filterData = () => {
  resetPage()
  console.log('过滤数据', {
    searchQuery: searchQuery.value,
    modelFilter: modelFilter.value,
    dataSourceFilter: dataSourceFilter.value
  })
}

const resetFilters = () => {
  searchQuery.value = ''
  modelFilter.value = ''
  dataSourceFilter.value = ''
  resetPage()
  console.log('重置筛选条件')
}

const openAddModal = () => {
  isEditMode.value = false
  formData.value = { ...defaultFormData }
  showFormModal.value = true
}

const openEditModal = (data) => {
  isEditMode.value = true
  formData.value = { ...data }
  showFormModal.value = true
}

const closeFormModal = () => {
  showFormModal.value = false
  formData.value = { ...defaultFormData }
}

const saveData = (data) => {
  if (!data.dataDate || !data.modelId || !data.dataSource) {
    ElMessage.warning('请填写所有必填项')
    return
  }

  if (isEditMode.value) {
    const index = localHistoryData.value.findIndex(d => d.id === data.id)
    if (index !== -1) {
      localHistoryData.value[index] = { ...data }
    }
  } else {
    // 计算版本号：查找相同样机模型和数据日期的最大版本号
    const existingVersions = localHistoryData.value
      .filter(d => d.modelId === data.modelId && d.dataDate === data.dataDate)
      .map(d => d.version || 0)
    const maxVersion = existingVersions.length > 0 ? Math.max(...existingVersions) : 0
    const newVersion = maxVersion + 1
    
    const newId = Math.max(...localHistoryData.value.map(d => d.id), 0) + 1
    localHistoryData.value.push({
      ...data,
      id: newId,
      version: newVersion
    })
  }
  // 同步数据到全局状态
  syncToGlobalState()
  closeFormModal()
}

const viewData = (data) => {
  console.log('查看历史数据:', data)
  currentData.value = data
  showViewModal.value = true
}

const closeViewModal = () => {
  showViewModal.value = false
  currentData.value = null
}

const viewOperatingData = (data) => {
  currentOperatingData.value = data
  showOperatingDataModal.value = true
}

const closeOperatingDataModal = () => {
  showOperatingDataModal.value = false
  currentOperatingData.value = null
}

const importData = () => {
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
            const validData = importedData.filter(item => 
              item.dataDate && item.modelId && item.dataSource
            )
            if (validData.length > 0) {
              const maxId = Math.max(...localHistoryData.value.map(d => d.id), 0)
              validData.forEach((item, index) => {
                item.id = maxId + index + 1
              })
              localHistoryData.value = [...localHistoryData.value, ...validData]
              syncToGlobalState()
              ElMessage.success(`成功导入 ${validData.length} 条能效数据`)
            } else {
              ElMessage.error('导入的数据格式不正确，缺少必需字段（dataDate、modelId、dataSource）')
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

const exportData = () => {
  const dataToExport = localHistoryData.value.map(item => ({
    dataDate: item.dataDate,
    modelId: item.modelId,
    dataSource: item.dataSource
  }))
  
  const jsonString = JSON.stringify(dataToExport, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `history-data-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}

const deleteData = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这条能效数据吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    localHistoryData.value = localHistoryData.value.filter(data => data.id !== id)
    syncToGlobalState()
    emit('delete', id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
  }
}

// 同步数据到全局状态，供样机模型管理查看关联数据
const syncToGlobalState = () => {
  if (props.globalState) {
    props.globalState.efficiencyData = [...localHistoryData.value]
  }
}

// 初始化时同步一次
syncToGlobalState()
</script>

<style scoped>
.efficiency-data-management-container {
  padding: 20px;
  height: 100%;
  min-height: calc(100vh - 120px);
  overflow-y: auto;
  box-sizing: border-box;
}

.efficiency-data-controls {
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

.efficiency-data-list-section {
  margin-bottom: 24px;
}

.efficiency-data-list-section h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.text-muted {
  color: #94a3b8;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .efficiency-data-controls {
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
  
  .history-data-table-container {
    overflow-x: auto;
  }
  
  .history-data-table {
    min-width: 600px;
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
