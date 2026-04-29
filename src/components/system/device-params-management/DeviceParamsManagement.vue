<template>
  <div class="device-params-container">
    <div class="device-params-controls">
      <div class="control-group">
        <button class="btn btn-primary" @click="addParamTemplate">+ 新增设备参数</button>
        <button class="btn btn-secondary" @click="importParamTemplates">导入设备参数</button>
        <button class="btn btn-secondary" @click="exportParamTemplates">导出设备参数</button>
      </div>

      <div class="search-filter">
        <div class="search-box">
          <input type="text" v-model="searchQuery" placeholder="搜索设备类型名称" @keyup.enter="filterTemplates">
          <button class="search-btn" @click="filterTemplates">🔍</button>
        </div>
        <select class="filter-select" v-model="deviceTypeFilter" @change="filterTemplates">
          <option value="">全部设备类型</option>
          <option value="船用柴油发动机（低速机）">船用柴油发动机（低速机）</option>
          <option value="船用柴油发动机（中速机）">船用柴油发动机（中速机）</option>
          <option value="船用LNG/柴油双燃料发动机（低速机）">船用LNG/柴油双燃料发动机（低速机）</option>
          <option value="船用LNG/柴油双燃料发动机（中速机）">船用LNG/柴油双燃料发动机（中速机）</option>
          <option value="船用甲醇/柴油双燃料发动机（低速机）">船用甲醇/柴油双燃料发动机（低速机）</option>
          <option value="船用甲醇/柴油双燃料发动机（中速机）">船用甲醇/柴油双燃料发动机（中速机）</option>
        </select>
      </div>
    </div>

    <div class="template-list-section">
      <h4>设备参数列表</h4>
      <div class="template-table-container">
        <table class="template-table">
          <thead>
            <tr>
              <th>设备类型</th>
              <th>参数数量</th>
              <th>描述</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="template in paginatedTemplates" :key="template.id">
              <td>{{ template.deviceType }}</td>
              <td>{{ template.params.length }} 个参数</td>
              <td>{{ template.description }}</td>
              <td class="action-buttons">
                <button class="btn btn-sm btn-info" @click="openViewModal(template)">查看</button>
                <button class="btn btn-sm btn-warning" @click="editTemplate(template)">编辑</button>
                <button class="btn btn-sm btn-success" @click="openDefaultValueModal(template)">默认值配置</button>
                <button class="btn btn-sm btn-danger" @click="deleteTemplate(template.id)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- 分页组件 -->
      <div class="pagination-container">
        <div class="pagination-info">
          共 {{ filteredTemplates.length }} 条记录，第 {{ currentPage }} / {{ totalPages }} 页
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

    <!-- 查看设备参数弹窗 -->
    <DeviceParamsView
      v-if="showViewModal"
      :device-type="viewTemplate?.deviceType"
      :description="viewTemplate?.description"
      :params="viewTemplate?.params"
      @close="closeViewModal"
    />

    <!-- 默认值配置弹窗 -->
    <DefaultValueConfig
      v-if="showDefaultValueModal"
      :device-type="selectedTemplate?.deviceType"
      :params="selectedTemplate?.params"
      @close="closeDefaultValueModal"
      @save="handleSaveDefaultValues"
    />

    <!-- 设备参数表单弹窗 -->
    <DeviceParamsForm
      v-if="showFormModal"
      :is-edit="isEditMode"
      :form-data="formData"
      @save="saveParamTemplate"
      @close="closeFormModal"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import DeviceParamsForm from './components/DeviceParamsForm.vue'
import DefaultValueConfig from './components/DefaultValueConfig.vue'
import DeviceParamsView from './components/DeviceParamsView.vue'

const paramTemplates = ref([
  {
    id: 1,
    deviceType: '船用柴油发动机（低速机）',
    description: '船用柴油发动机（低速机）设备参数',
    params: [
      { id: 1, name: '额定功率', unit: 'kW', defaultValue: 15000, minValue: 0, maxValue: 30000 },
      { id: 2, name: '额定转速', unit: 'r/min', defaultValue: 100, minValue: 50, maxValue: 150 },
      { id: 3, name: '主燃料低热值', unit: 'kJ/kg', defaultValue: 42700, minValue: 40000, maxValue: 45000 },
      { id: 4, name: '25%工况下燃油消耗率', unit: 'g/kWh', defaultValue: 180, minValue: 150, maxValue: 250 },
      { id: 5, name: '50%工况下燃油消耗率', unit: 'g/kWh', defaultValue: 170, minValue: 140, maxValue: 230 },
      { id: 6, name: '75%工况下燃油消耗率', unit: 'g/kWh', defaultValue: 165, minValue: 130, maxValue: 220 },
      { id: 7, name: '100%工况下燃油消耗率', unit: 'g/kWh', defaultValue: 175, minValue: 140, maxValue: 240 }
    ]
  },
  {
    id: 2,
    deviceType: '船用柴油发动机（中速机）',
    description: '船用柴油发动机（中速机）设备参数',
    params: [
      { id: 8, name: '额定功率', unit: 'kW', defaultValue: 2000, minValue: 500, maxValue: 5000 },
      { id: 9, name: '额定转速', unit: 'r/min', defaultValue: 1500, minValue: 1000, maxValue: 2000 },
      { id: 10, name: '主燃料低热值', unit: 'kJ/kg', defaultValue: 42700, minValue: 40000, maxValue: 45000 },
      { id: 11, name: '25%工况下燃油消耗率', unit: 'g/kWh', defaultValue: 200, minValue: 160, maxValue: 280 },
      { id: 12, name: '50%工况下燃油消耗率', unit: 'g/kWh', defaultValue: 190, minValue: 150, maxValue: 260 },
      { id: 13, name: '75%工况下燃油消耗率', unit: 'g/kWh', defaultValue: 185, minValue: 140, maxValue: 250 },
      { id: 14, name: '100%工况下燃油消耗率', unit: 'g/kWh', defaultValue: 195, minValue: 150, maxValue: 270 }
    ]
  },
  {
    id: 3,
    deviceType: '船用LNG/柴油双燃料发动机（低速机）',
    description: '船用LNG/柴油双燃料发动机（低速机）设备参数',
    params: [
      { id: 15, name: '额定功率', unit: 'kW', defaultValue: 15000, minValue: 0, maxValue: 30000 },
      { id: 16, name: '额定转速', unit: 'r/min', defaultValue: 100, minValue: 50, maxValue: 150 },
      { id: 17, name: '主燃料低热值', unit: 'kJ/kg', defaultValue: 50000, minValue: 48000, maxValue: 52000 },
      { id: 18, name: '引燃燃料低热值', unit: 'kJ/kg', defaultValue: 42700, minValue: 40000, maxValue: 45000 },
      { id: 19, name: '25%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 150, minValue: 120, maxValue: 200 },
      { id: 20, name: '25%工况下引燃燃油消耗率', unit: 'g/kWh', defaultValue: 10, minValue: 5, maxValue: 20 },
      { id: 21, name: '50%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 140, minValue: 110, maxValue: 190 },
      { id: 22, name: '50%工况下引燃燃油消耗率', unit: 'g/kWh', defaultValue: 8, minValue: 4, maxValue: 15 },
      { id: 23, name: '75%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 135, minValue: 105, maxValue: 185 },
      { id: 24, name: '75%工况下引燃燃油消耗率', unit: 'g/kWh', defaultValue: 7, minValue: 3, maxValue: 12 },
      { id: 25, name: '100%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 145, minValue: 115, maxValue: 195 },
      { id: 26, name: '100%工况下引燃燃油消耗率', unit: 'g/kWh', defaultValue: 9, minValue: 4, maxValue: 16 }
    ]
  },
  {
    id: 4,
    deviceType: '船用LNG/柴油双燃料发动机（中速机）',
    description: '船用LNG/柴油双燃料发动机（中速机）设备参数',
    params: [
      { id: 27, name: '额定功率', unit: 'kW', defaultValue: 2000, minValue: 500, maxValue: 5000 },
      { id: 28, name: '额定转速', unit: 'r/min', defaultValue: 1500, minValue: 1000, maxValue: 2000 },
      { id: 29, name: '主燃料低热值', unit: 'kJ/kg', defaultValue: 50000, minValue: 48000, maxValue: 52000 },
      { id: 30, name: '引燃燃料低热值', unit: 'kJ/kg', defaultValue: 42700, minValue: 40000, maxValue: 45000 },
      { id: 31, name: '25%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 170, minValue: 130, maxValue: 220 },
      { id: 32, name: '25%工况下引燃燃油消耗率', unit: 'g/kWh', defaultValue: 12, minValue: 6, maxValue: 24 },
      { id: 33, name: '50%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 160, minValue: 120, maxValue: 210 },
      { id: 34, name: '50%工况下引燃燃油消耗率', unit: 'g/kWh', defaultValue: 10, minValue: 5, maxValue: 20 },
      { id: 35, name: '75%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 155, minValue: 115, maxValue: 205 },
      { id: 36, name: '75%工况下引燃燃油消耗率', unit: 'g/kWh', defaultValue: 9, minValue: 4, maxValue: 18 },
      { id: 37, name: '100%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 165, minValue: 125, maxValue: 215 },
      { id: 38, name: '100%工况下引燃燃油消耗率', unit: 'g/kWh', defaultValue: 11, minValue: 5, maxValue: 22 }
    ]
  },
  {
    id: 5,
    deviceType: '船用甲醇/柴油双燃料发动机（低速机）',
    description: '船用甲醇/柴油双燃料发动机（低速机）设备参数',
    params: [
      { id: 39, name: '额定功率', unit: 'kW', defaultValue: 15000, minValue: 0, maxValue: 30000 },
      { id: 40, name: '额定转速', unit: 'r/min', defaultValue: 100, minValue: 50, maxValue: 150 },
      { id: 41, name: '主燃料低热值', unit: 'kJ/kg', defaultValue: 19900, minValue: 19000, maxValue: 21000 },
      { id: 42, name: '引燃燃料低热值', unit: 'kJ/kg', defaultValue: 42700, minValue: 40000, maxValue: 45000 },
      { id: 43, name: '25%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 350, minValue: 300, maxValue: 400 },
      { id: 44, name: '25%工况下引燃燃油消耗率', unit: 'g/kWh', defaultValue: 15, minValue: 8, maxValue: 25 },
      { id: 45, name: '50%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 330, minValue: 280, maxValue: 380 },
      { id: 46, name: '50%工况下引燃燃油消耗率', unit: 'g/kWh', defaultValue: 12, minValue: 6, maxValue: 20 },
      { id: 47, name: '75%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 320, minValue: 270, maxValue: 370 },
      { id: 48, name: '75%工况下引燃燃油消耗率', unit: 'g/kWh', defaultValue: 10, minValue: 5, maxValue: 18 },
      { id: 49, name: '100%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 340, minValue: 290, maxValue: 390 },
      { id: 50, name: '100%工况下引燃燃油消耗率', unit: 'g/kWh', defaultValue: 13, minValue: 7, maxValue: 22 }
    ]
  },
  {
    id: 6,
    deviceType: '船用甲醇/柴油双燃料发动机（中速机）',
    description: '船用甲醇/柴油双燃料发动机（中速机）设备参数',
    params: [
      { id: 51, name: '额定功率', unit: 'kW', defaultValue: 2000, minValue: 500, maxValue: 5000 },
      { id: 52, name: '额定转速', unit: 'r/min', defaultValue: 1500, minValue: 1000, maxValue: 2000 },
      { id: 53, name: '主燃料低热值', unit: 'kJ/kg', defaultValue: 19900, minValue: 19000, maxValue: 21000 },
      { id: 54, name: '引燃燃料低热值', unit: 'kJ/kg', defaultValue: 42700, minValue: 40000, maxValue: 45000 },
      { id: 55, name: '25%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 380, minValue: 330, maxValue: 430 },
      { id: 56, name: '25%工况下引燃燃油消耗率', unit: 'g/kWh', defaultValue: 18, minValue: 9, maxValue: 30 },
      { id: 57, name: '50%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 360, minValue: 310, maxValue: 410 },
      { id: 58, name: '50%工况下引燃燃油消耗率', unit: 'g/kWh', defaultValue: 15, minValue: 7, maxValue: 25 },
      { id: 59, name: '75%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 350, minValue: 300, maxValue: 400 },
      { id: 60, name: '75%工况下引燃燃油消耗率', unit: 'g/kWh', defaultValue: 13, minValue: 6, maxValue: 22 },
      { id: 61, name: '100%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 370, minValue: 320, maxValue: 420 },
      { id: 62, name: '100%工况下引燃燃油消耗率', unit: 'g/kWh', defaultValue: 16, minValue: 8, maxValue: 28 }
    ]
  }
])

// 搜索和过滤相关
const searchQuery = ref('')
const deviceTypeFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)

const filteredTemplates = computed(() => {
  let result = paramTemplates.value
  if (searchQuery.value) {
    result = result.filter(template =>
      template.deviceType.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  if (deviceTypeFilter.value) {
    result = result.filter(template => template.deviceType === deviceTypeFilter.value)
  }
  return result
})

const totalPages = computed(() => {
  return Math.ceil(filteredTemplates.value.length / pageSize.value)
})

const paginatedTemplates = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredTemplates.value.slice(start, end)
})

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const resetPage = () => {
  currentPage.value = 1
}

const filterTemplates = () => {
  resetPage()
  console.log('过滤设备参数', {
    searchQuery: searchQuery.value,
    deviceTypeFilter: deviceTypeFilter.value
  })
}

const deviceTypes = ref([
  { id: 'diesel-low', name: '船用柴油发动机（低速机）' },
  { id: 'diesel-medium', name: '船用柴油发动机（中速机）' },
  { id: 'lng-diesel-low', name: '船用LNG/柴油双燃料发动机（低速机）' },
  { id: 'lng-diesel-medium', name: '船用LNG/柴油双燃料发动机（中速机）' },
  { id: 'methanol-diesel-low', name: '船用甲醇/柴油双燃料发动机（低速机）' },
  { id: 'methanol-diesel-medium', name: '船用甲醇/柴油双燃料发动机（中速机）' }
])

const activeDeviceType = ref('diesel-low')
const showDefaultValueModal = ref(false)
const selectedTemplate = ref(null)
const showFormModal = ref(false)
const isEditMode = ref(false)
const formData = ref({
  id: null,
  deviceType: '',
  description: '',
  params: []
})

// 查看弹窗相关
const showViewModal = ref(false)
const viewTemplate = ref(null)

const refreshData = () => {
  console.log('刷新设备参数数据')
}

const addParamTemplate = () => {
  isEditMode.value = false
  formData.value = {
    id: null,
    deviceType: '',
    description: '',
    params: []
  }
  showFormModal.value = true
}

const editTemplate = (template) => {
  isEditMode.value = true
  formData.value = { ...template }
  showFormModal.value = true
}

const deleteTemplate = (id) => {
  if (confirm('确定要删除这个设备参数吗？')) {
    paramTemplates.value = paramTemplates.value.filter(template => template.id !== id)
  }
}

const openViewModal = (template) => {
  viewTemplate.value = template
  showViewModal.value = true
}

const closeViewModal = () => {
  showViewModal.value = false
  viewTemplate.value = null
}

const openDefaultValueModal = (template) => {
  selectedTemplate.value = template
  showDefaultValueModal.value = true
}

const closeDefaultValueModal = () => {
  showDefaultValueModal.value = false
  selectedTemplate.value = null
}

const handleSaveDefaultValues = (params) => {
  if (selectedTemplate.value) {
    selectedTemplate.value.params = params
  }
  console.log('保存默认值:', params)
  alert('默认值保存成功')
  closeDefaultValueModal()
}

const saveParamTemplate = (data) => {
  if (isEditMode.value) {
    const index = paramTemplates.value.findIndex(t => t.id === data.id)
    if (index !== -1) {
      paramTemplates.value[index] = { ...data }
    }
  } else {
    const newId = Math.max(...paramTemplates.value.map(t => t.id)) + 1
    paramTemplates.value.push({
      ...data,
      id: newId
    })
  }
  showFormModal.value = false
  alert('设备参数保存成功')
}

const closeFormModal = () => {
  showFormModal.value = false
  formData.value = {
    id: null,
    deviceType: '',
    description: '',
    params: []
  }
}

const importParamTemplates = () => {
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
              item.deviceType && item.description && Array.isArray(item.params)
            )
            if (validData.length > 0) {
              // 生成新的ID
              const maxId = Math.max(...paramTemplates.value.map(t => t.id), 0)
              validData.forEach((item, index) => {
                item.id = maxId + index + 1
                // 确保params数组中的每个参数都有id
                item.params.forEach((param, paramIndex) => {
                  if (!param.id) {
                    param.id = Date.now() + paramIndex
                  }
                })
              })
              paramTemplates.value = [...paramTemplates.value, ...validData]
              alert(`成功导入 ${validData.length} 个设备参数`)
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

const exportParamTemplates = () => {
  const dataToExport = paramTemplates.value.map(item => ({
    deviceType: item.deviceType,
    description: item.description,
    params: item.params.map(param => ({
      name: param.name,
      unit: param.unit,
      defaultValue: param.defaultValue,
      minValue: param.minValue,
      maxValue: param.maxValue
    }))
  }))
  
  const jsonString = JSON.stringify(dataToExport, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `param-templates-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}

const getDeviceParams = (deviceType) => {
  const deviceTypeMap = {
    'diesel-low': '船用柴油发动机（低速机）',
    'diesel-medium': '船用柴油发动机（中速机）',
    'lng-diesel-low': '船用LNG/柴油双燃料发动机（低速机）',
    'lng-diesel-medium': '船用LNG/柴油双燃料发动机（中速机）',
    'methanol-diesel-low': '船用甲醇/柴油双燃料发动机（低速机）',
    'methanol-diesel-medium': '船用甲醇/柴油双燃料发动机（中速机）'
  }
  const deviceTypeName = deviceTypeMap[deviceType]
  const template = paramTemplates.value.find(t => t.deviceType === deviceTypeName)
  return template ? template.params : []
}
</script>

<style scoped>
.device-params-container {
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

.device-params-controls {
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

.filter-select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.template-list-section {
  margin-bottom: 32px;
}

.template-list-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.template-table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  border: 1px solid #e2e8f0;
}

.template-table {
  width: 100%;
  border-collapse: collapse;
}

.template-table th {
  background-color: #f8fafc;
  padding: 12px 16px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e2e8f0;
}

.template-table td {
  padding: 12px 16px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #e2e8f0;
}

.template-table tr:hover {
  background-color: #f8fafc;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: flex-start;
}

.device-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.device-tab {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.device-tab.active {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

/* 弹窗样式 */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  background-color: #f8fafc;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #64748b;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.modal-close:hover {
  background-color: #e2e8f0;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #e2e8f0;
  background-color: #f8fafc;
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

.btn-danger {
  background-color: #ef4444;
  color: white;
}

.btn-danger:hover {
  background-color: #dc2626;
}

.btn-info {
  background-color: #3b82f6;
  color: white;
}

.btn-info:hover {
  background-color: #2563eb;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 14px;
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

@media (max-width: 768px) {
  .template-grid,
  .default-values-grid {
    grid-template-columns: 1fr;
  }
  
  .device-tabs {
    flex-direction: column;
  }
  
  .device-tab {
    width: 100%;
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