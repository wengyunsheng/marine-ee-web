<template>
  <div class="history-data-management-container">
    <div class="history-data-controls">
      <div class="control-group">
        <button class="btn btn-primary" @click="openAddModal">+ 新增数据</button>
        <button class="btn btn-secondary" @click="importData">导入数据</button>
        <button class="btn btn-secondary" @click="exportData">导出数据</button>
      </div>

      <div class="search-filter">
        <div class="search-box">
          <input type="text" v-model="searchQuery" placeholder="搜索设备名称或数据日期" @keyup.enter="filterData">
          <button class="search-btn" @click="filterData">🔍</button>
        </div>
        <select class="filter-select" v-model="deviceFilter" @change="filterData">
          <option value="">全部设备类型</option>
          <option value="diesel-low">船用柴油发动机（低速机）</option>
          <option value="diesel-medium">船用柴油发动机（中速机）</option>
          <option value="lng-diesel-low">船用LNG/柴油双燃料发动机（低速机）</option>
          <option value="lng-diesel-medium">船用LNG/柴油双燃料发动机（中速机）</option>
          <option value="methanol-diesel-low">船用甲醇/柴油双燃料发动机（低速机）</option>
          <option value="methanol-diesel-medium">船用甲醇/柴油双燃料发动机（中速机）</option>
        </select>
        <select class="filter-select" v-model="dataSourceFilter" @change="filterData">
          <option value="">全部数据来源</option>
          <option value="台架试验">台架试验</option>
          <option value="实船运行">实船运行</option>
        </select>
        <select class="filter-select" v-model="workingConditionFilter" @change="filterData">
          <option value="">全部工况特性</option>
          <option value="额定工况">额定工况</option>
          <option value="部分负荷">部分负荷</option>
          <option value="低负荷">低负荷</option>
          <option value="变工况">变工况</option>
        </select>
        <select class="filter-select" v-model="efficiencyLevelFilter" @change="filterData">
          <option value="">全部能效等级</option>
          <option value="1级">1级</option>
          <option value="2级">2级</option>
          <option value="3级">3级</option>
          <option value="4级">4级</option>
          <option value="5级">5级</option>
        </select>
      </div>
    </div>

    <div class="history-data-list-section">
      <h3>能效数据列表</h3>
      <div class="history-data-table-container">
        <table class="history-data-table">
          <thead>
            <tr>
              <th>数据日期</th>
              <th>设备类型</th>
              <th>设备名称</th>
              <th>数据来源</th>
              <th>工况特性</th>
              <th>能效指标值</th>
              <th>能效等级</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="data in paginatedData" :key="data.id">
              <td>{{ data.dataDate }}</td>
              <td>{{ data.deviceType }}</td>
              <td>{{ data.deviceName }}</td>
              <td>{{ data.dataSource }}</td>
              <td>{{ data.workingCondition }}</td>
              <td>{{ data.efficiencyValue || '-' }}</td>
              <td>
                <span v-if="data.efficiencyLevel" class="efficiency-badge" :class="'level-' + data.efficiencyLevel.replace('级', '')">
                  {{ data.efficiencyLevel }}
                </span>
                <span v-else class="text-muted">-</span>
              </td>
              <td class="action-buttons">
                <button class="btn btn-sm btn-info" @click="viewData(data)">查看</button>
                <button class="btn btn-sm btn-warning" @click="openEditModal(data)">编辑</button>
                <button class="btn btn-sm btn-danger" @click="deleteData(data.id)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 分页组件 -->
      <div class="pagination-container">
        <div class="pagination-left">
          <div class="pagination-info">
            共 {{ filteredData.length }} 条记录，第 {{ currentPage }} / {{ totalPages }} 页
          </div>
          <div class="pagination-page-size">
            <label>每页</label>
            <select v-model="pageSize" @change="resetPage" class="page-size-select">
              <option v-for="size in pageSizes" :key="size" :value="size">{{ size }}</option>
            </select>
            <span>条</span>
          </div>
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

    <!-- 新增/编辑历史数据弹窗 -->
    <EfficiencyDataForm
      v-if="showFormModal"
      :is-edit="isEditMode"
      :form-data="formData"
      @save="saveData"
      @close="closeFormModal"
    />

    <!-- 查看历史数据弹窗 -->
    <EfficiencyDataView 
      v-if="showViewModal" 
      :data="currentData" 
      @close="closeViewModal" 
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import EfficiencyDataForm from './components/EfficiencyDataForm.vue'
import EfficiencyDataView from './components/EfficiencyDataView.vue'

const props = defineProps({
  historyData: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['delete'])

const searchQuery = ref('')
const deviceFilter = ref('')
const dataSourceFilter = ref('')
const workingConditionFilter = ref('')
const efficiencyLevelFilter = ref('')
const showFormModal = ref(false)
const showViewModal = ref(false)
const isEditMode = ref(false)
const currentData = ref(null)

const defaultFormData = {
  dataDate: '',
  deviceType: '',
  deviceName: '',
  dataSource: '',
  workingCondition: '',
  efficiencyValue: '',
  efficiencyLevel: ''
}

const formData = ref({ ...defaultFormData })

const localHistoryData = ref([
  {
    id: 1,
    dataDate: '2024-04-20',
    deviceType: '船用柴油发动机（低速机）',
    deviceName: 'MAN B&W 6S70MC',
    dataSource: '台架试验',
    workingCondition: '额定工况',
    efficiencyValue: 85.6,
    efficiencyLevel: '2级'
  },
  {
    id: 2,
    dataDate: '2024-04-15',
    deviceType: '船用柴油发动机（中速机）',
    deviceName: 'Cummins QSK60',
    dataSource: '实船运行',
    workingCondition: '部分负荷',
    efficiencyValue: 78.2,
    efficiencyLevel: '2级'
  },
  {
    id: 3,
    dataDate: '2024-04-10',
    deviceType: '船用LNG/柴油双燃料发动机（低速机）',
    deviceName: 'Wärtsilä 50DF',
    dataSource: '台架试验',
    workingCondition: '额定工况',
    efficiencyValue: 92.1,
    efficiencyLevel: '1级'
  },
  {
    id: 4,
    dataDate: '2024-04-05',
    deviceType: '船用LNG/柴油双燃料发动机（中速机）',
    deviceName: 'Caterpillar 3516E',
    dataSource: '实船运行',
    workingCondition: '变工况',
    efficiencyValue: 72.5,
    efficiencyLevel: '3级'
  },
  {
    id: 5,
    dataDate: '2024-04-01',
    deviceType: '船用甲醇/柴油双燃料发动机（低速机）',
    deviceName: 'MAN B&W ME-LGIM',
    dataSource: '台架试验',
    workingCondition: '低负荷',
    efficiencyValue: 88.7,
    efficiencyLevel: '2级'
  },
  {
    id: 6,
    dataDate: '2024-03-25',
    deviceType: '船用甲醇/柴油双燃料发动机（中速机）',
    deviceName: 'Wärtsilä 32 Methanol',
    dataSource: '实船运行',
    workingCondition: '额定工况',
    efficiencyValue: 90.3,
    efficiencyLevel: '1级'
  }
])

// 合并外部数据和本地数据（去重）
const mergedData = computed(() => {
  const externalIds = new Set(props.historyData.map(d => d.id))
  const localOnly = localHistoryData.value.filter(d => !externalIds.has(d.id))
  return [...props.historyData, ...localOnly]
})



const filteredData = computed(() => {
  let result = mergedData.value
  if (searchQuery.value) {
    result = result.filter(data =>
      data.deviceName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      data.dataDate.includes(searchQuery.value)
    )
  }
  if (deviceFilter.value) {
    const deviceTypeMap = {
      'diesel-low': '船用柴油发动机（低速机）',
      'diesel-medium': '船用柴油发动机（中速机）',
      'lng-diesel-low': '船用LNG/柴油双燃料发动机（低速机）',
      'lng-diesel-medium': '船用LNG/柴油双燃料发动机（中速机）',
      'methanol-diesel-low': '船用甲醇/柴油双燃料发动机（低速机）',
      'methanol-diesel-medium': '船用甲醇/柴油双燃料发动机（中速机）'
    }
    const deviceTypeName = deviceTypeMap[deviceFilter.value]
    if (deviceTypeName) {
      result = result.filter(data => data.deviceType === deviceTypeName)
    }
  }
  if (dataSourceFilter.value) {
    result = result.filter(data => data.dataSource === dataSourceFilter.value)
  }
  if (workingConditionFilter.value) {
    result = result.filter(data => data.workingCondition === workingConditionFilter.value)
  }
  if (efficiencyLevelFilter.value) {
    result = result.filter(data => data.efficiencyLevel === efficiencyLevelFilter.value)
  }
  return result
})

const currentPage = ref(1)
const pageSize = ref(10)
const pageSizes = ref([10, 20, 50])

const totalPages = computed(() => {
  return Math.ceil(filteredData.value.length / pageSize.value)
})

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredData.value.slice(start, end)
})

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const resetPage = () => {
  currentPage.value = 1
}

const filterData = () => {
  resetPage()
  console.log('过滤数据', { 
    searchQuery: searchQuery.value, 
    deviceFilter: deviceFilter.value,
    dataSourceFilter: dataSourceFilter.value,
    workingConditionFilter: workingConditionFilter.value,
    efficiencyLevelFilter: efficiencyLevelFilter.value
  })
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
  if (!data.dataDate || !data.deviceType || !data.deviceName || !data.dataSource || !data.workingCondition) {
    alert('请填写所有必填项')
    return
  }

  if (isEditMode.value) {
    const index = localHistoryData.value.findIndex(d => d.id === data.id)
    if (index !== -1) {
      localHistoryData.value[index] = { ...data }
    }
  } else {
    const newId = Math.max(...localHistoryData.value.map(d => d.id), 0) + 1
    localHistoryData.value.push({
      ...data,
      id: newId
    })
  }
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
              item.dataDate && item.deviceType && item.deviceName && item.dataSource && item.workingCondition
            )
            if (validData.length > 0) {
              const maxId = Math.max(...localHistoryData.value.map(d => d.id), 0)
              validData.forEach((item, index) => {
                item.id = maxId + index + 1
              })
              localHistoryData.value = [...localHistoryData.value, ...validData]
              alert(`成功导入 ${validData.length} 条待评估历史数据`)
            } else {
              alert('导入的数据格式不正确，缺少必需字段（dataDate、deviceType、deviceName、dataSource、workingCondition）')
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

const exportData = () => {
  const dataToExport = localHistoryData.value.map(item => ({
    dataDate: item.dataDate,
    deviceType: item.deviceType,
    deviceName: item.deviceName,
    dataSource: item.dataSource,
    workingCondition: item.workingCondition
  }))
  
  const jsonString = JSON.stringify(dataToExport, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `history-data-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const deleteData = (id) => {
  if (confirm('确定要删除这条能效数据吗？')) {
    localHistoryData.value = localHistoryData.value.filter(data => data.id !== id)
    emit('delete', id)
  }
}
</script>

<style scoped>
.history-data-management-container {
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

.history-data-controls {
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

.history-data-list-section {
  margin-bottom: 24px;
}

.history-data-list-section h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.history-data-table-container {
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  overflow: hidden;
}

.history-data-table {
  width: 100%;
  border-collapse: collapse;
}

.history-data-table th {
  background-color: #f8fafc;
  padding: 12px 16px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e2e8f0;
}

.history-data-table td {
  padding: 12px 16px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #e2e8f0;
}

.history-data-table tr:hover {
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

.efficiency-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  color: white;
}

.efficiency-badge.level-1 {
  background-color: #22c55e;
}

.efficiency-badge.level-2 {
  background-color: #3b82f6;
}

.efficiency-badge.level-3 {
  background-color: #f59e0b;
}

.efficiency-badge.level-4 {
  background-color: #f97316;
}

.efficiency-badge.level-5 {
  background-color: #ef4444;
}

.text-muted {
  color: #94a3b8;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .history-data-controls {
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
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-top: 1px solid #e2e8f0;
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
