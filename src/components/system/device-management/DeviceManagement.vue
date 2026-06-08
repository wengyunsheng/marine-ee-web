<template>
  <div class="device-management-container">
    <div class="device-controls">
      <div class="search-filter">
        <el-select v-model="categoryFilter" placeholder="全部设备类别" clearable style="width: 200px;">
          <el-option 
            v-for="item in parentOptions" 
            :key="item.code" 
            :label="item.name" 
            :value="item.code" 
          />
        </el-select>
        <el-input
          v-model="searchQuery"
          placeholder="搜索设备名称"
          clearable
          style="width: 300px;"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-button @click="handleSearch">
          <el-icon><Search /></el-icon>
          搜索
        </el-button>
        <el-button @click="resetFilter">重置筛选</el-button>
      </div>
    </div>

    <div class="device-list-section">
      <h3>设备列表</h3>
      <el-table
        ref="tableRef"
        :data="treeData"
        style="width: 100%"
        row-key="id"
        border
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :default-expand-all="false"
        v-loading="loading"
        @row-click="handleRowClick"
      >
        <el-table-column prop="name" label="设备名称" min-width="280">
          <template #default="scope">
            <span>{{ scope.row.name }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="450" fixed="right">
          <template #default="scope">
            <template v-if="scope.row.children">
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <el-button size="small" @click="upload3DModel(scope.row)">上传3D模型</el-button>
                <el-button v-if="isEngineCategory(scope.row)" size="small" @click="openWeightParamsModal(scope.row)">加权参数</el-button>
              </div>
            </template>
            <template v-else>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                <el-button v-if="!isGearboxDevice(scope.row)" size="small" @click="openEfficiencyConfigModal(scope.row)">能效等级和能效基值</el-button>
              </div>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 新增/编辑设备弹窗 -->
    <el-dialog
      v-model="showFormModal"
      :title="isEditMode ? (isCategoryEditMode ? '编辑分类' : '编辑设备') : (isSubDeviceMode ? '新增子设备' : '新增设备')"
      width="600px"
      :close-on-click-modal="false"
      @close="closeFormModal"
    >
      <DeviceForm
        :is-edit="isEditMode"
        :is-sub-device="isSubDeviceMode"
        :is-category-edit="isCategoryEditMode"
        :form-data="formData"
        :parent-options="parentOptions"
        @save="saveDevice"
        @close="closeFormModal"
      />
    </el-dialog>

    <!-- 上传3D模型弹窗 -->
    <el-dialog
      v-model="showUploadModal"
      :title="`上传3D模型 - ${currentCategory?.name || ''}`"
      width="600px"
      :close-on-click-modal="false"
      @close="closeUploadModal"
    >
      <el-upload
        class="upload-3d-model"
        drag
        action="/api/files/upload/3d-model"
        :data="{ deviceId: currentCategory?.id }"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        :before-upload="beforeUpload"
        accept=".obj,.fbx,.gltf,.glb,.stl,.png,.jpg,.jpeg"
        name="file"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽文件到此处或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持格式: OBJ, FBX, GLTF, GLB, STL，文件大小不超过100MB
          </div>
        </template>
      </el-upload>
    </el-dialog>

    <!-- 加权参数配置弹窗 -->
    <WeightParamsConfig
      v-model="showWeightParamsModal"
      :device-name="currentCategory?.name || ''"
      :device-id="currentCategory?.id"
      @success="fetchTreeData"
      ref="weightParamsConfigRef"
    />

    <!-- 能效配置弹窗 -->
    <EfficiencyConfigDialog
      v-model="showEfficiencyConfigModal"
      :device-data="currentDevice"
      @close="closeEfficiencyConfigModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { Search, UploadFilled } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import DeviceForm from './components/DeviceForm.vue'
import WeightParamsConfig from './components/WeightParamsConfig.vue'
import EfficiencyConfigDialog from './components/EfficiencyConfigDialog.vue'

const searchQuery = ref('')
const categoryFilter = ref('')

const showFormModal = ref(false)
const showUploadModal = ref(false)
const showWeightParamsModal = ref(false)
const showEfficiencyConfigModal = ref(false)
const isEditMode = ref(false)
const currentCategory = ref(null)
const currentDevice = ref(null)
const isSubDeviceMode = ref(false)
const isCategoryEditMode = ref(false)
const loading = ref(false)
const weightParamsConfigRef = ref(null)
const tableRef = ref(null)

const defaultFormData = {
  code: '',
  name: '',
  category: '',
  sort: 0
}

const formData = ref({ ...defaultFormData })

// 树形数据（从接口获取）
const treeData = ref([])
// 父设备选项（用于下拉筛选）
const parentOptions = ref([])

// 从接口获取树形数据（支持搜索）
const fetchTreeData = async (searchParams = {}) => {
  loading.value = true
  try {
    // 构建请求参数，使用已有的tree接口
    const requestBody = {
      name: searchParams.name || undefined,
      parentCode: searchParams.category || undefined
    }
    
    const response = await fetch('/api/devices/tree', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
    const result = await response.json()
    if (result.code === 200) {
      // 适配接口返回的数据格式
      treeData.value = (result.data || []).map(item => ({
        ...item,
        id: item.id,
        code: item.code,
        name: item.name,
        modelFileId: item.modelFileId,
        sort: item.sort,
        children: item.children || []
      }))
    } else {
      ElMessage.error(result.message || '获取数据失败')
    }
  } catch (error) {
    ElMessage.error('获取数据失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchTreeData()
  fetchParentOptions()
})

// 行点击事件 - 触发展开/收起
const handleRowClick = (row, column, event) => {
  // 如果点击的是操作列，不触发展开
  if (column.label === '操作') {
    return
  }
  
  // 如果有子设备，切换展开状态
  if (row.children && row.children.length > 0) {
    nextTick(() => {
      tableRef.value.toggleRowExpansion(row)
    })
  }
}

// 获取父设备选项
const fetchParentOptions = async () => {
  try {
    const response = await fetch('/api/devices/parent-options')
    const result = await response.json()
    if (result.code === 200) {
      parentOptions.value = result.data || []
    } else {
      ElMessage.error(result.message || '获取父设备选项失败')
    }
  } catch (error) {
    ElMessage.error('获取父设备选项失败')
    console.error(error)
  }
}

const handleSearch = () => {
  // 调用后端搜索接口
  const searchParams = {}
  if (searchQuery.value) {
    searchParams.name = searchQuery.value
  }
  if (categoryFilter.value) {
    searchParams.category = categoryFilter.value
  }
  
  fetchTreeData(searchParams)
}

const resetFilter = () => {
  searchQuery.value = ''
  categoryFilter.value = ''
  // 重新加载所有数据
  fetchTreeData()
}

const closeFormModal = () => {
  showFormModal.value = false
  formData.value = { ...defaultFormData }
  isCategoryEditMode.value = false
}

const saveDevice = async (data) => {
  if (!data.code) {
    ElMessage.warning('请填写设备编码')
    return
  }
  if (!data.name) {
    ElMessage.warning('请填写设备名称')
    return
  }

  try {
    if (isEditMode.value) {
      // 编辑模式 - 父类和子类都使用同一个接口
      const response = await fetch('/api/devices', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      const result = await response.json()
      
      if (result.code === 200) {
        ElMessage.success('修改成功')
        fetchTreeData() // 刷新数据
      } else {
        ElMessage.error(result.message || '修改失败')
      }
    } else {
      // 新增模式 - 父类和子类都使用同一个接口
      const requestData = isSubDeviceMode.value
        ? { ...data, parentCode: data.category }
        : { ...data }
      
      const response = await fetch('/api/devices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      })
      const result = await response.json()
      
      if (result.code === 200) {
        ElMessage.success('创建成功')
        fetchTreeData() // 刷新数据
      } else {
        ElMessage.error(result.message || '创建失败')
      }
    }
    closeFormModal()
  } catch (error) {
    ElMessage.error('操作失败')
    console.error(error)
  }
}


// 上传3D模型
const upload3DModel = (categoryRow) => {
  currentCategory.value = categoryRow
  showUploadModal.value = true
}

const closeUploadModal = () => {
  showUploadModal.value = false
  currentCategory.value = null
}

const beforeUpload = (file) => {
  const isValidType = ['.obj', '.fbx', '.gltf', '.glb', '.stl', '.png', '.jpg', '.jpeg'].some(ext => 
    file.name.toLowerCase().endsWith(ext)
  )
  if (!isValidType) {
    ElMessage.error('只支持上传 OBJ, FBX, GLTF, GLB, STL, PNG, JPG, JPEG 格式的文件')
    return false
  }
  
  const isLt100M = file.size / 1024 / 1024 < 100
  if (!isLt100M) {
    ElMessage.error('文件大小不能超过100MB')
    return false
  }
  
  return true
}

const handleUploadSuccess = (response) => {
  if (response.code === 200) {
    ElMessage.success('3D模型上传成功')
    fetchTreeData() // 刷新数据
    closeUploadModal()
  } else {
    ElMessage.error(response.message || '上传失败')
  }
}

const handleUploadError = (error) => {
  ElMessage.error('上传失败：' + (error.message || '网络错误'))
  console.error(error)
}

// 判断是否为船用发动机类别（根据 code 判断）
const isEngineCategory = (categoryRow) => {
  // 通过 parentCode 判断：如果是父级类别（没有 parentCode 或 parentCode 为空）
  // 且其 code 在设备类型中属于发动机类型
  return categoryRow.code && categoryRow.code.includes('engine')
}

// 判断是否为船用齿轮箱设备（根据 parentCode 判断）
const isGearboxDevice = (deviceRow) => {
  if (!deviceRow.parentCode) return false
  // 根据 parentCode 的值判断是否为齿轮箱类型
  return deviceRow.parentCode.includes('gearbox')
}

// 打开加权参数配置弹窗
const openWeightParamsModal = (categoryRow) => {
  currentCategory.value = categoryRow
  showWeightParamsModal.value = true
  // 使用 nextTick 确保组件已挂载后再调用
  setTimeout(() => {
    if (weightParamsConfigRef.value) {
      weightParamsConfigRef.value.fetchWeightParams()
    }
  }, 100)
}



// 打开能效配置弹窗
const openEfficiencyConfigModal = (device) => {
  currentDevice.value = device
  showEfficiencyConfigModal.value = true
}

const closeEfficiencyConfigModal = () => {
  showEfficiencyConfigModal.value = false
  currentDevice.value = null
}

</script>

<style scoped>
/* ==================== 容器布局 ==================== */
.device-management-container {
  padding: 20px;
  height: 100%;
  min-height: calc(100vh - 120px);
  overflow-y: auto;
  box-sizing: border-box;
  background-color: #1e3a5f;
}

/* ==================== 搜索控制区 ==================== */
.device-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 16px;
}

.search-filter {
  display: flex;
  gap: 16px;
  align-items: center;
  flex-wrap: wrap;
}

.search-filter > * {
  margin: 0 !important;
}

/* ==================== 设备列表区 ==================== */
.device-list-section {
  margin-bottom: 24px;
}

.device-list-section h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  font-weight: 600;
  color: #e0e0e0;
}

.device-category {
  display: none;
}

/* ==================== 响应式布局 ==================== */
@media (max-width: 768px) {
  .device-controls {
    flex-direction: column;
    align-items: flex-start;
  }

  .search-filter {
    width: 100%;
  }
}
</style>
