<template>
  <div class="device-type-management-container">
    <div class="device-type-controls">
      <div class="control-group">
        <button class="btn btn-primary" @click="openAddModal">+ 新增设备类型</button>
        <button class="btn btn-secondary" @click="importDeviceTypes">导入设备类型</button>
        <button class="btn btn-secondary" @click="exportDeviceTypes">导出设备类型</button>
      </div>

      <div class="search-filter">
        <div class="search-box">
          <input type="text" v-model="searchQuery" placeholder="搜索设备类型名称" @keyup.enter="filterDeviceTypes">
          <button class="search-btn" @click="filterDeviceTypes">🔍</button>
        </div>
        <select class="filter-select" v-model="categoryFilter" @change="filterDeviceTypes">
          <option value="">全部类别</option>
          <option value="diesel">柴油发动机</option>
          <option value="lng-diesel">LNG/柴油双燃料发动机</option>
          <option value="methanol-diesel">甲醇/柴油双燃料发动机</option>
        </select>
      </div>
    </div>

    <div class="device-type-list-section">
      <h3>设备类型列表</h3>
      <div class="device-type-table-container">
        <table class="device-type-table">
          <thead>
            <tr>
              <th>设备类型名称</th>
              <th>类别</th>
              <th>描述</th>
              <th>备注</th>
              <th>创建时间</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="deviceType in paginatedDeviceTypes" :key="deviceType.id">
              <td>{{ deviceType.name }}</td>
              <td>
                <span class="device-category" :class="deviceType.category">
                  {{ getCategoryName(deviceType.category) }}
                </span>
              </td>
              <td class="description-cell">{{ deviceType.description }}</td>
              <td>
                <span class="remark-badge">{{ deviceType.remark }}</span>
              </td>
              <td>{{ deviceType.createdAt }}</td>
              <td class="action-buttons">
                <button class="btn btn-sm btn-info" @click="viewDeviceType(deviceType)">查看</button>
                <button class="btn btn-sm btn-warning" @click="openEditModal(deviceType)">编辑</button>
                <button class="btn btn-sm btn-danger" @click="deleteDeviceType(deviceType.id)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 分页组件 -->
      <div class="pagination-container">
        <div class="pagination-info">
          共 {{ filteredDeviceTypes.length }} 条记录，第 {{ currentPage }} / {{ totalPages }} 页
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

    <!-- 新增/编辑设备类型弹窗 -->
    <DeviceTypeForm
      v-if="showFormModal"
      :is-edit="isEditMode"
      :form-data="formData"
      @save="saveDeviceType"
      @close="closeFormModal"
    />

    <!-- 查看设备类型详情弹窗 -->
    <DeviceTypeView
      v-if="showViewModal"
      :device-type="currentDeviceType"
      @close="closeViewModal"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import DeviceTypeForm from './components/DeviceTypeForm.vue'
import DeviceTypeView from './components/DeviceTypeView.vue'

const searchQuery = ref('')
const categoryFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const showFormModal = ref(false)
const showViewModal = ref(false)
const isEditMode = ref(false)
const currentDeviceType = ref(null)

const defaultFormData = {
  name: '',
  category: '',
  description: '',
  remark: ''
}

const formData = ref({ ...defaultFormData })

const deviceTypes = ref([
  {
    id: 1,
    name: '船用柴油发动机（低速机）',
    category: 'diesel',
    description: '船舶主推进系统，低速柴油发动机',
    standard: 'ISO 15550:2016',
    remark: '已通过Tier III认证',
    createdAt: '2024-04-01'
  },
  {
    id: 2,
    name: '船用柴油发动机（中速机）',
    category: 'diesel',
    description: '船舶辅助发电系统，中速柴油发动机',
    standard: 'GB/T 38999-2020',
    remark: '2024年新增标准验证型号',
    createdAt: '2024-04-02'
  },
  {
    id: 3,
    name: '船用LNG/柴油双燃料发动机（低速机）',
    category: 'lng-diesel',
    description: '船舶主推进系统，LNG/柴油双燃料低速发动机',
    standard: 'TSG G0003-2010',
    remark: '主推节能型号',
    createdAt: '2024-04-03'
  },
  {
    id: 4,
    name: '船用LNG/柴油双燃料发动机（中速机）',
    category: 'lng-diesel',
    description: '船舶辅助发电系统，LNG/柴油双燃料中速发动机',
    standard: 'GB/T 13006-2013',
    remark: '待更新技术手册',
    createdAt: '2024-04-04'
  },
  {
    id: 5,
    name: '船用甲醇/柴油双燃料发动机（低速机）',
    category: 'methanol-diesel',
    description: '船舶主推进系统，甲醇/柴油双燃料低速发动机',
    standard: 'IMO EEXI标准',
    remark: '环保优先推荐',
    createdAt: '2024-04-05'
  },
  {
    id: 6,
    name: '船用甲醇/柴油双燃料发动机（中速机）',
    category: 'methanol-diesel',
    description: '船舶辅助发电系统，甲醇/柴油双燃料中速发动机',
    standard: 'ISO 7547:2017',
    remark: '研发阶段验证中',
    createdAt: '2024-04-06'
  }
])

const filteredDeviceTypes = computed(() => {
  let result = deviceTypes.value
  if (searchQuery.value) {
    result = result.filter(deviceType =>
      deviceType.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      deviceType.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  if (categoryFilter.value) {
    result = result.filter(deviceType => deviceType.category === categoryFilter.value)
  }
  return result
})

const totalPages = computed(() => {
  return Math.ceil(filteredDeviceTypes.value.length / pageSize.value)
})

const paginatedDeviceTypes = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredDeviceTypes.value.slice(start, end)
})

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const resetPage = () => {
  currentPage.value = 1
}

const getCategoryName = (category) => {
  const categoryMap = {
    'diesel': '柴油发动机',
    'lng-diesel': 'LNG/柴油双燃料发动机',
    'methanol-diesel': '甲醇/柴油双燃料发动机'
  }
  return categoryMap[category] || category
}

const filterDeviceTypes = () => {
  console.log('过滤设备类型', {
    searchQuery: searchQuery.value,
    categoryFilter: categoryFilter.value
  })
}

const openAddModal = () => {
  isEditMode.value = false
  formData.value = { ...defaultFormData }
  showFormModal.value = true
}

const openEditModal = (deviceType) => {
  isEditMode.value = true
  formData.value = { ...deviceType }
  showFormModal.value = true
}

const closeFormModal = () => {
  showFormModal.value = false
  formData.value = { ...defaultFormData }
}

const saveDeviceType = (data) => {
  if (!data.name || !data.category || !data.description) {
    alert('请填写必填项（设备类型名称、类别、描述）')
    return
  }

  if (isEditMode.value) {
    const index = deviceTypes.value.findIndex(d => d.id === data.id)
    if (index !== -1) {
      deviceTypes.value[index] = { ...data }
    }
  } else {
    const newId = Math.max(...deviceTypes.value.map(d => d.id)) + 1
    deviceTypes.value.push({
      ...data,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0]
    })
  }
  closeFormModal()
}

const viewDeviceType = (deviceType) => {
  currentDeviceType.value = deviceType
  showViewModal.value = true
}

const closeViewModal = () => {
  showViewModal.value = false
  currentDeviceType.value = null
}

const deleteDeviceType = (deviceTypeId) => {
  if (confirm('确定要删除这个设备类型吗？')) {
    deviceTypes.value = deviceTypes.value.filter(deviceType => deviceType.id !== deviceTypeId)
  }
}

const importDeviceTypes = () => {
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
              item.name && item.category && item.description && item.standard
            )
            if (validData.length > 0) {
              // 生成新的ID
              const maxId = Math.max(...deviceTypes.value.map(d => d.id), 0)
              validData.forEach((item, index) => {
                item.id = maxId + index + 1
                item.createdAt = item.createdAt || new Date().toISOString().split('T')[0]
              })
              deviceTypes.value = [...deviceTypes.value, ...validData]
              alert(`成功导入 ${validData.length} 个设备类型`)
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

const exportDeviceTypes = () => {
  const dataToExport = deviceTypes.value.map(item => ({
    name: item.name,
    category: item.category,
    description: item.description,
    standard: item.standard,
    remark: item.remark,
    createdAt: item.createdAt
  }))
  
  const jsonString = JSON.stringify(dataToExport, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `device-types-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.device-type-management-container {
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

.device-type-controls {
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

.device-type-list-section {
  margin-bottom: 24px;
}

.device-type-list-section h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.device-type-table-container {
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  overflow: hidden;
}

.device-type-table {
  width: 100%;
  border-collapse: collapse;
}

.device-type-table th {
  background-color: #f8fafc;
  padding: 12px 16px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e2e8f0;
}

.device-type-table td {
  padding: 12px 16px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #e2e8f0;
}

.device-type-table tr:hover {
  background-color: #f8fafc;
}

.device-category {
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.device-category.main {
  background-color: #e3f2fd;
  color: #1976d2;
}

.device-category.aux {
  background-color: #e8f5e8;
  color: #2e7d32;
}

.device-category.boiler {
  background-color: #fff3e0;
  color: #ef6c00;
}

.device-category.pump {
  background-color: #ffebee;
  color: #c62828;
}

.device-category.cooling {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.description-cell {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.remark-badge {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  background-color: #f1f5f9;
  color: #64748b;
  white-space: nowrap;
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

/* 分页样式 */
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

/* 响应式布局 */
@media (max-width: 768px) {
  .device-type-controls {
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

  .device-type-table-container {
    overflow-x: auto;
  }

  .device-type-table {
    min-width: 600px;
  }
}
</style>
