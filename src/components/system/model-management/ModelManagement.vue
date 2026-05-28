<template>
  <div class="model-management-container">
    <div class="model-controls">
      <div class="control-group">
        <el-button type="primary" @click="openAddModal">
          <el-icon><Plus /></el-icon>
          新增样机模型
        </el-button>
      </div>

      <div class="search-filter">
        <el-input 
          v-model="searchQuery" 
          placeholder="搜索样机模型名称" 
          clearable
          style="width: 200px;"
          @keyup.enter="filterModels"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="categoryFilter" placeholder="全部类别" clearable style="width: 180px;" @change="filterModels">
          <el-option label="全部类别" value="" />
          <el-option v-for="opt in categoryOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
        <el-select v-model="deviceTypeFilter" placeholder="全部设备类型" clearable style="width: 240px;" @change="filterModels">
          <el-option label="全部设备类型" value="" />
          <el-option v-for="opt in filteredDeviceTypeOptions" :key="opt" :label="opt" :value="opt" />
        </el-select>
        <el-button @click="resetFilters">重置筛选</el-button>
      </div>
    </div>

    <div class="model-list-section">
      <h3>样机模型列表</h3>
      <el-table :data="paginatedModels" style="width: 100%" border stripe>
        <el-table-column prop="name" label="样机模型名称" min-width="280" max-width="320" />
        <el-table-column prop="deviceType" label="设备类型名称" min-width="200" max-width="240" />
        <el-table-column label="类别" width="140">
          <template #default="{ row }">
            <span class="device-category" :class="row.category">
              {{ getCategoryName(row.category) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="200" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" width="120" />
        <el-table-column label="操作" min-width="380" fixed="right">
          <template #default="scope">
            <div class="operation-buttons">
              <el-button type="primary" size="small" @click="viewModel(scope.row)">查看</el-button>
              <el-button type="warning" size="small" @click="openEditModal(scope.row)">编辑</el-button>
              <el-button type="primary" size="small" @click="viewAssociatedData(scope.row)">关联能效数据</el-button>
              <el-button :type="scope.row.model3D ? 'primary' : 'success'" size="small" @click="handle3DModel(scope.row)">
                {{ scope.row.model3D ? '查看3D模型' : '上传3D模型' }}
              </el-button>
              <el-button type="danger" size="small" @click="deleteModel(scope.row.id)">删除</el-button>
            </div>
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

    <!-- 查看关联能效数据弹窗 -->
    <el-dialog v-model="showDataModal" title="关联能效数据" width="800px">
      <el-table :data="associatedData" border stripe style="width: 100%;">
        <el-table-column prop="dataDate" label="数据日期" width="120" />
        <el-table-column label="样机模型" min-width="200" show-overflow-tooltip>
          <template #default>
            {{ currentModel.name }}
          </template>
        </el-table-column>
        <el-table-column prop="dataSource" label="数据来源" width="120" />
      </el-table>
      <template #footer>
        <el-button type="primary" @click="showDataModal = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import ModelForm from './components/ModelForm.vue'
import ModelView from './components/ModelView.vue'

const props = defineProps({
  globalState: {
    type: Object,
    default: () => ({})
  },
  efficiencyData: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['switch-to-visualization'])

const searchQuery = ref('')
const categoryFilter = ref('')
const deviceTypeFilter = ref('')

const showFormModal = ref(false)
const showViewModal = ref(false)
const showDataModal = ref(false)
const isEditMode = ref(false)
const currentModel = ref(null)

const defaultFormData = {
  name: '',
  deviceType: '',
  category: '',
  description: ''
}

const formData = ref({ ...defaultFormData })

// 设备类型→类别映射（与设备类型管理模块统一）
const deviceTypeToCategoryMap = {
  '船用柴油发动机（低速机）': 'engine',
  '船用柴油发动机（中速机）': 'engine',
  '船用LNG/柴油双燃料发动机（低速机）': 'engine',
  '船用LNG/柴油双燃料发动机（中速机）': 'engine',
  '船用甲醇/柴油双燃料发动机（低速机）': 'engine',
  '船用甲醇/柴油双燃料发动机（中速机）': 'engine',
  '单台齿轮箱': 'gearbox',
  '两台齿轮箱': 'gearbox',
  '船用有机朗肯循环发电装置': 'waste-heat',
  '船用蒸汽透平发电装置': 'waste-heat',
  '单功能焚烧炉（固体废弃物）': 'incinerator',
  '单功能焚烧炉（污油泥）': 'incinerator',
  '双功能焚烧炉': 'incinerator',
  '多功能焚烧炉': 'incinerator',
  '船用碟式分离机': 'separator',
  '船用压载水处理设备': 'ballast',
  '船用起锚机': 'windlass',
  '船用系泊绞车': 'windlass',
  '船用吊机': 'crane',
  '船用低压交流三相同步发电机': 'generator',
  '船用中压交流三相同步发电机': 'generator',
  '船用组合式空调机组': 'air-conditioner',
  '船用冷水机组': 'chiller',
  '船用惰性气体系统': 'inert-gas',
  '船用二氧化碳捕集设备': 'co2-capture',
  '船用推进器': 'propeller'
}

const categoryConfig = {
  engine: { label: '船用发动机' },
  gearbox: { label: '船用齿轮箱' },
  'waste-heat': { label: '船用余热回收发电装置' },
  incinerator: { label: '船用焚烧炉' },
  separator: { label: '船用碟式分离机' },
  ballast: { label: '船用压载水处理设备' },
  windlass: { label: '船用锚绞机' },
  crane: { label: '船用吊机' },
  generator: { label: '船用发电机' },
  'air-conditioner': { label: '船用组合式空调机组' },
  chiller: { label: '船用冷水机组' },
  'inert-gas': { label: '船用惰性气体系统' },
  'co2-capture': { label: '船用二氧化碳捕集设备' },
  propeller: { label: '船用推进器' }
}

const categoryOptions = Object.entries(categoryConfig).map(([value, cfg]) => ({ value, label: cfg.label }))
const deviceTypeOptions = Object.keys(deviceTypeToCategoryMap)

// 根据类别过滤设备类型选项
const filteredDeviceTypeOptions = computed(() => {
  if (!categoryFilter.value) {
    return deviceTypeOptions
  }
  return deviceTypeOptions.filter(dt => deviceTypeToCategoryMap[dt] === categoryFilter.value)
})

const getCategoryName = (category) => categoryConfig[category]?.label || category
const getDeviceCategory = (deviceType) => deviceTypeToCategoryMap[deviceType] || ''

// 类别变化时清空设备类型筛选
watch(categoryFilter, (newVal, oldVal) => {
  if (oldVal !== undefined && newVal !== oldVal) {
    deviceTypeFilter.value = ''
  }
})

// 初始化模型数据
const initialModels = [
  {
    id: 1,
    name: 'VLCC超大型油轮 - 船用柴油发动机（低速机）',
    deviceType: '船用柴油发动机（低速机）',
    category: 'engine',
    description: '用于VLCC超大型油轮低速柴油发动机的能效评估仿真模型',
    createdAt: '2024-04-01'
  },
  {
    id: 2,
    name: '散货船 - 船用柴油发动机（中速机）',
    deviceType: '船用柴油发动机（中速机）',
    category: 'engine',
    description: '用于散货船中速柴油发动机的能效评估仿真模型',
    createdAt: '2024-04-02'
  },
  {
    id: 3,
    name: '集装箱船 - 船用LNG/柴油双燃料发动机（低速机）',
    deviceType: '船用LNG/柴油双燃料发动机（低速机）',
    category: 'engine',
    description: '用于集装箱船LNG/柴油双燃料发动机的能效评估仿真模型',
    createdAt: '2024-04-03'
  },
  {
    id: 4,
    name: '液化气船 - 船用LNG/柴油双燃料发动机（中速机）',
    deviceType: '船用LNG/柴油双燃料发动机（中速机）',
    category: 'engine',
    description: '用于液化气船LNG/柴油双燃料发动机的能效评估仿真模型',
    createdAt: '2024-04-04'
  },
  {
    id: 5,
    name: 'VLCC超大型油轮 - 船用甲醇/柴油双燃料发动机（低速机）',
    deviceType: '船用甲醇/柴油双燃料发动机（低速机）',
    category: 'engine',
    description: '用于VLCC超大型油轮甲醇/柴油双燃料发动机的能效评估仿真模型',
    createdAt: '2024-04-05'
  },
  {
    id: 6,
    name: '散货船 - 船用甲醇/柴油双燃料发动机（中速机）',
    deviceType: '船用甲醇/柴油双燃料发动机（中速机）',
    category: 'engine',
    description: '用于散货船甲醇/柴油双燃料发动机的能效评估仿真模型',
    createdAt: '2024-04-06'
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
  if (categoryFilter.value) {
    result = result.filter(model => model.category === categoryFilter.value)
  }
  if (deviceTypeFilter.value) {
    result = result.filter(model => model.deviceType === deviceTypeFilter.value)
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

const filterModels = () => {
  // 选择设备类型时，自动关联类别
  if (deviceTypeFilter.value && !categoryFilter.value) {
    categoryFilter.value = deviceTypeToCategoryMap[deviceTypeFilter.value] || ''
  }
  resetPage()
  console.log('过滤模型', {
    searchQuery: searchQuery.value,
    categoryFilter: categoryFilter.value,
    deviceTypeFilter: deviceTypeFilter.value
  })
}

const resetFilters = () => {
  searchQuery.value = ''
  categoryFilter.value = ''
  deviceTypeFilter.value = ''
  resetPage()
  console.log('重置筛选条件')
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
  if (!data.name || !data.deviceType) {
    ElMessage.warning('请填写必填项')
    return
  }

  if (isEditMode.value) {
    const index = models.value.findIndex(m => m.id === data.id)
    if (index !== -1) {
      data.category = getDeviceCategory(data.deviceType)
      models.value[index] = { ...data }
    }
  } else {
    const newId = Math.max(...models.value.map(m => m.id)) + 1
    models.value.push({
      ...data,
      category: getDeviceCategory(data.deviceType),
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

// 查看关联能效数据
const associatedData = computed(() => {
  if (!currentModel.value) return []
  return props.efficiencyData.filter(data => data.modelId === currentModel.value.id)
})

const viewAssociatedData = (model) => {
  currentModel.value = model
  showDataModal.value = true
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

const handle3DModel = (model) => {
  if (model.model3D) {
    // 已上传，跳转到可视化模块查看
    if (props.globalState) {
      props.globalState.selectedModel = model
      emit('switch-to-visualization')
    }
  } else {
    // 未上传，弹出文件选择器
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.obj,.fbx,.glb,.gltf,.stl,.step,.stp,.iges,.igs,.dae'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (file) {
        ElMessage.success(`正在上传 ${file.name} 模型文件到 ${model.name}`)
        // TODO: 实现实际的文件上传逻辑，上传成功后设置 model.model3D = file.name
        model.model3D = file.name
      }
    }
    input.click()
  }
}

const upload3DModel = (model) => {
  // 保留旧方法名以防其他地方调用
  handle3DModel(model)
}

const view3DModel = (model) => {
  // 更新全局状态中的选中模型
  if (props.globalState) {
    props.globalState.selectedModel = model
    // 触发切换到可视化模块的事件
    emit('switch-to-visualization')
  }
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

.device-category {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
  white-space: nowrap;
  display: inline-block;
  width: fit-content;
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

.operation-buttons {
  display: flex;
  gap: 4px;
  flex-wrap: nowrap;
  white-space: nowrap;
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
