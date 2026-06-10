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
          placeholder="请输入设备名称"
          clearable
          style="flex: 1; min-width: 200px; max-width: 400px;"
          @keyup.enter="handleSearch"
        />
        <el-button @click="handleSearch">
          <Search />
          查询
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

    <!-- 上传3D模型弹窗 -->
    <UploadModelDialog
      v-model="showUploadModal"
      :category-id="currentCategory?.id"
      :category-name="currentCategory?.name"
      @success="fetchTreeData"
      @close="closeUploadModal"
    />

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
import { ref, onMounted, nextTick } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import WeightParamsConfig from './components/WeightParamsConfig.vue'
import EfficiencyConfigDialog from './components/EfficiencyConfigDialog.vue'
import UploadModelDialog from './components/UploadModelDialog.vue'

const searchQuery = ref('')
const categoryFilter = ref('')

const showUploadModal = ref(false)
const showWeightParamsModal = ref(false)
const showEfficiencyConfigModal = ref(false)
const currentCategory = ref(null)
const currentDevice = ref(null)
const loading = ref(false)
const weightParamsConfigRef = ref(null)
const tableRef = ref(null)

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


// 上传3D模型
const upload3DModel = (categoryRow) => {
  currentCategory.value = categoryRow
  showUploadModal.value = true
}

const closeUploadModal = () => {
  showUploadModal.value = false
  currentCategory.value = null
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
