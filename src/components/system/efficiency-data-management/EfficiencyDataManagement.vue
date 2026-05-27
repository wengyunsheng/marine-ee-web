<template>
  <div class="history-data-management-container">
    <div class="history-data-controls">
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
          placeholder="搜索设备名称或数据日期" 
          clearable
          style="width: 250px;"
          @keyup.enter="filterData"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="deviceFilter" placeholder="全部设备类型" clearable style="width: 200px;" @change="filterData">
          <el-option label="全部设备类型" value="" />
          <el-option label="船用柴油发动机（低速机）" value="diesel-low" />
          <el-option label="船用柴油发动机（中速机）" value="diesel-medium" />
          <el-option label="船用LNG/柴油双燃料发动机（低速机）" value="lng-diesel-low" />
          <el-option label="船用LNG/柴油双燃料发动机（中速机）" value="lng-diesel-medium" />
          <el-option label="船用甲醇/柴油双燃料发动机（低速机）" value="methanol-diesel-low" />
          <el-option label="船用甲醇/柴油双燃料发动机（中速机）" value="methanol-diesel-medium" />
        </el-select>
        <el-select v-model="dataSourceFilter" placeholder="全部数据来源" clearable style="width: 150px;" @change="filterData">
          <el-option label="全部数据来源" value="" />
          <el-option label="台架试验" value="台架试验" />
          <el-option label="实船运行" value="实船运行" />
        </el-select>
        <el-select v-model="workingConditionFilter" placeholder="全部工况特性" clearable style="width: 150px;" @change="filterData">
          <el-option label="全部工况特性" value="" />
          <el-option label="额定工况" value="额定工况" />
          <el-option label="部分负荷" value="部分负荷" />
          <el-option label="低负荷" value="低负荷" />
          <el-option label="变工况" value="变工况" />
        </el-select>
        <el-select v-model="efficiencyLevelFilter" placeholder="全部能效等级" clearable style="width: 130px;" @change="filterData">
          <el-option label="全部能效等级" value="" />
          <el-option label="1级" value="1级" />
          <el-option label="2级" value="2级" />
          <el-option label="3级" value="3级" />
          <el-option label="4级" value="4级" />
          <el-option label="5级" value="5级" />
        </el-select>
      </div>
    </div>

    <div class="history-data-list-section">
      <h3>能效数据列表</h3>
      <el-table :data="paginatedData" style="width: 100%" border stripe>
        <el-table-column prop="dataDate" label="数据日期" width="120" />
        <el-table-column prop="deviceType" label="设备类型" min-width="200" />
        <el-table-column prop="deviceName" label="设备名称" min-width="150" />
        <el-table-column prop="dataSource" label="数据来源" width="120" />
        <el-table-column prop="workingCondition" label="工况特性" width="120" />
        <el-table-column prop="efficiencyValue" label="能效指标值" width="120">
          <template #default="scope">
            {{ scope.row.efficiencyValue || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="能效等级" width="100">
          <template #default="scope">
            <el-tag v-if="scope.row.efficiencyLevel" :type="getEfficiencyLevelType(scope.row.efficiencyLevel)">
              {{ scope.row.efficiencyLevel }}
            </el-tag>
            <span v-else class="text-muted">-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="viewData(scope.row)">查看</el-button>
            <el-button type="warning" size="small" @click="openEditModal(scope.row)">编辑</el-button>
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
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
const pageSizes = ref([10, 20, 50, 100, 200, 500])

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
    ElMessage.warning('请填写所有必填项')
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

const getEfficiencyLevelType = (level) => {
  const levelNum = parseInt(level.replace('级', ''))
  if (levelNum === 1) return 'success'
  if (levelNum === 2) return ''
  if (levelNum === 3) return 'warning'
  if (levelNum >= 4) return 'danger'
  return ''
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
              ElMessage.success(`成功导入 ${validData.length} 条待评估历史数据`)
            } else {
              ElMessage.error('导入的数据格式不正确，缺少必需字段（dataDate、deviceType、deviceName、dataSource、workingCondition）')
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
    emit('delete', id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
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

.history-data-list-section {
  margin-bottom: 24px;
}

.history-data-list-section h3 {
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
