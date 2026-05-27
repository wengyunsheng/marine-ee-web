<template>
  <div class="device-params-container">
    <div class="device-params-controls">
      <div class="control-group">
        <el-button type="primary" @click="addParamTemplate">
          <el-icon><Plus /></el-icon>
          新增设备参数
        </el-button>
        <el-button @click="importParamTemplates">导入设备参数</el-button>
        <el-button @click="exportParamTemplates">导出设备参数</el-button>
      </div>

      <div class="search-filter">
        <el-input 
          v-model="searchQuery" 
          placeholder="搜索设备类型名称" 
          clearable
          style="width: 200px;"
          @keyup.enter="filterTemplates"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="categoryFilter" placeholder="全部类别" clearable style="width: 150px;" @change="filterTemplates">
          <el-option label="全部类别" value="" />
          <el-option label="船用发动机" value="engine" />
          <el-option label="船用齿轮箱" value="gearbox" />
          <el-option label="船用余热回收发电装置" value="waste-heat" />
          <el-option label="船用焚烧炉" value="incinerator" />
          <el-option label="船用碟式分离机" value="separator" />
          <el-option label="船用压载水处理设备" value="ballast" />
          <el-option label="船用锚绞机" value="windlass" />
          <el-option label="船用吊机" value="crane" />
          <el-option label="船用发电机" value="generator" />
          <el-option label="船用空调机组" value="air-conditioner" />
          <el-option label="船用冷水机组" value="chiller" />
          <el-option label="船用惰性气体系统" value="inert-gas" />
          <el-option label="船用二氧化碳捕集设备" value="co2-capture" />
          <el-option label="船用推进器" value="propeller" />
        </el-select>
        <el-select v-model="deviceTypeFilter" placeholder="全部设备类型" clearable style="width: 250px;" @change="filterTemplates">
          <el-option label="全部设备类型" value="" />
          <el-option label="船用柴油发动机（低速机）" value="船用柴油发动机（低速机）" />
          <el-option label="船用柴油发动机（中速机）" value="船用柴油发动机（中速机）" />
          <el-option label="船用LNG/柴油双燃料发动机（低速机）" value="船用LNG/柴油双燃料发动机（低速机）" />
          <el-option label="船用LNG/柴油双燃料发动机（中速机）" value="船用LNG/柴油双燃料发动机（中速机）" />
          <el-option label="船用甲醇/柴油双燃料发动机（低速机）" value="船用甲醇/柴油双燃料发动机（低速机）" />
          <el-option label="船用甲醇/柴油双燃料发动机（中速机）" value="船用甲醇/柴油双燃料发动机（中速机）" />
          <el-option label="单台齿轮箱" value="单台齿轮箱" />
          <el-option label="两台齿轮箱" value="两台齿轮箱" />
          <el-option label="船用有机朗肯循环发电装置" value="船用有机朗肯循环发电装置" />
          <el-option label="船用蒸汽透平发电装置" value="船用蒸汽透平发电装置" />
          <el-option label="单功能焚烧炉（固体废弃物）" value="单功能焚烧炉（固体废弃物）" />
          <el-option label="单功能焚烧炉（污油泥）" value="单功能焚烧炉（污油泥）" />
          <el-option label="双功能焚烧炉" value="双功能焚烧炉" />
          <el-option label="多功能焚烧炉" value="多功能焚烧炉" />
          <el-option label="船用碟式分离机" value="船用碟式分离机" />
          <el-option label="船用压载水处理设备" value="船用压载水处理设备" />
          <el-option label="船用起锚机" value="船用起锚机" />
          <el-option label="船用系泊绞车" value="船用系泊绞车" />
          <el-option label="船用吊机" value="船用吊机" />
          <el-option label="船用低压交流三相同步发电机" value="船用低压交流三相同步发电机" />
          <el-option label="船用中压交流三相同步发电机" value="船用中压交流三相同步发电机" />
          <el-option label="船用组合式空调机组" value="船用组合式空调机组" />
          <el-option label="船用冷水机组" value="船用冷水机组" />
          <el-option label="船用惰性气体系统" value="船用惰性气体系统" />
          <el-option label="船用二氧化碳捕集设备" value="船用二氧化碳捕集设备" />
          <el-option label="船用推进器" value="船用推进器" />
        </el-select>
      </div>
    </div>

    <div class="template-list-section">
      <h3>设备参数列表</h3>
      <el-table :data="paginatedTemplates" style="width: 100%" border stripe>
        <el-table-column prop="deviceType" label="设备类型名称" min-width="250" />
        <el-table-column label="类别" min-width="180">
          <template #default="scope">
            <span class="device-category" :class="scope.row.category">
              {{ getCategoryName(scope.row.category) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="参数数量" width="120">
          <template #default="scope">
            {{ scope.row.params.length }} 个参数
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="300" show-overflow-tooltip />
        <el-table-column label="操作" width="400" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="openViewModal(scope.row)">查看</el-button>
            <el-button type="warning" size="small" @click="editTemplate(scope.row)">编辑</el-button>
            <el-button type="success" size="small" @click="openDefaultValueModal(scope.row)">默认值配置</el-button>
            <el-button type="danger" size="small" @click="deleteTemplate(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="pageSizes"
          :total="filteredTemplates.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="resetPage"
        />
      </div>
    </div>

    <!-- 查看设备参数弹窗 -->
    <DeviceParamsView
      v-if="showViewModal"
      :category="getCategoryName(viewTemplate?.category)"
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import DeviceParamsForm from './components/DeviceParamsForm.vue'
import DefaultValueConfig from './components/DefaultValueConfig.vue'
import DeviceParamsView from './components/DeviceParamsView.vue'

const categoryMap = {
  engine: '船用发动机',
  gearbox: '船用齿轮箱',
  'waste-heat': '船用余热回收发电装置',
  incinerator: '船用焚烧炉',
  separator: '船用碟式分离机',
  ballast: '船用压载水处理设备',
  windlass: '船用锚绞机',
  crane: '船用吊机',
  generator: '船用发电机',
  'air-conditioner': '船用空调机组',
  chiller: '船用冷水机组',
  'inert-gas': '船用惰性气体系统',
  'co2-capture': '船用二氧化碳捕集设备',
  propeller: '船用推进器'
}

const getCategoryName = (category) => {
  return categoryMap[category] || category
}

const paramTemplates = ref([
  {
    id: 1,
    deviceType: '船用柴油发动机（低速机）',
    category: 'engine',
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
    category: 'engine',
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
    category: 'engine',
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
    category: 'engine',
    description: '船用LNG/柴油双燃料发动机（中速机）设备参数',
    params: [
      { id: 27, name: '额定功率', unit: 'kW', defaultValue: 2000, minValue: 500, maxValue: 5000 },
      { id: 28, name: '额定转速', unit: 'r/min', defaultValue: 1500, minValue: 1000, maxValue: 2000 },
      { id: 29, name: '主燃料低热引', unit: 'kJ/kg', defaultValue: 50000, minValue: 48000, maxValue: 52000 },
      { id: 30, name: '引燃燃料低热값', unit: 'kJ/kg', defaultValue: 42700, minValue: 40000, maxValue: 45000 },
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
    category: 'engine',
    description: '船用甲醇/柴油双燃料发动机（低速机）设备参数',
    params: [
      { id: 39, name: '额定功率', unit: 'kW', defaultValue: 15000, minValue: 0, maxValue: 30000 },
      { id: 40, name: '额定转速', unit: 'r/min', defaultValue: 100, minValue: 50, maxValue: 150 },
      { id: 41, name: '主燃料低热引', unit: 'kJ/kg', defaultValue: 19900, minValue: 19000, maxValue: 21000 },
      { id: 42, name: '引燃燃料低热값', unit: 'kJ/kg', defaultValue: 42700, minValue: 40000, maxValue: 45000 },
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
    category: 'engine',
    description: '船用甲醇/柴油双燃料发动机（中速机）设备参数',
    params: [
      { id: 51, name: '额定功率', unit: 'kW', defaultValue: 2000, minValue: 500, maxValue: 5000 },
      { id: 52, name: '额定转速', unit: 'r/min', defaultValue: 1500, minValue: 1000, maxValue: 2000 },
      { id: 53, name: '主燃料低热引', unit: 'kJ/kg', defaultValue: 19900, minValue: 19000, maxValue: 21000 },
      { id: 54, name: '引燃燃料低热값', unit: 'kJ/kg', defaultValue: 42700, minValue: 40000, maxValue: 45000 },
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
const categoryFilter = ref('')
const deviceTypeFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const pageSizes = ref([10, 20, 50, 100, 200, 500])

const filteredTemplates = computed(() => {
  let result = paramTemplates.value
  if (searchQuery.value) {
    result = result.filter(template =>
      template.deviceType.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  if (categoryFilter.value) {
    result = result.filter(template => template.category === categoryFilter.value)
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

const deleteTemplate = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个设备参数吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    paramTemplates.value = paramTemplates.value.filter(template => template.id !== id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
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
  ElMessage.success('默认值保存成功')
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
  ElMessage.success('设备参数保存成功')
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
              ElMessage.success(`成功导入 ${validData.length} 个设备参数`)
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
  height: 100%; 
  min-height: calc(100vh - 120px); 
  overflow-y: auto; 
  box-sizing: border-box; 
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

.template-list-section { 
  margin-bottom: 24px; 
}

.template-list-section h3 { 
  margin: 0 0 16px 0; 
  font-size: 18px; 
  font-weight: 600; 
  color: #333; 
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0;
}

.device-category {
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.device-category.engine { background-color: #e3f2fd; color: #1976d2; }
.device-category.gearbox { background-color: #e8f5e8; color: #2e7d32; }
.device-category.waste-heat { background-color: #fff3e0; color: #ef6c00; }
.device-category.incinerator { background-color: #ffebee; color: #c62828; }
.device-category.separator { background-color: #f3e5f5; color: #7b1fa2; }
.device-category.ballast { background-color: #e0f7fa; color: #00838f; }
.device-category.windlass { background-color: #fce4ec; color: #880e4f; }
.device-category.crane { background-color: #e3f2fd; color: #0d47a1; }
.device-category.generator { background-color: #fff8e1; color: #f57c00; }
.device-category.air-conditioner { background-color: #e1f5fe; color: #0288d1; }
.device-category.chiller { background-color: #e3f2fd; color: #1565c0; }
.device-category.inert-gas { background-color: #f3e5f5; color: #6a1b9a; }
.device-category.co2-capture { background-color: #c8e6c9; color: #2e7d32; }
.device-category.propeller { background-color: #fff3e0; color: #e65100; }
</style>