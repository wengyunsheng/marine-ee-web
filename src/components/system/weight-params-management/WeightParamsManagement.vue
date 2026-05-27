<template>
  <div class="weight-params-container">
    <div class="mode-controls">
      <div class="control-group">
        <el-button type="primary" @click="addMode">
          <el-icon><Plus /></el-icon>
          新增运行模式
        </el-button>
        <el-button @click="importModes">导入运行模式</el-button>
        <el-button @click="exportModes">导出运行模式</el-button>
      </div>

      <div class="search-filter">
        <el-input 
          v-model="searchQuery" 
          placeholder="搜索模式名称" 
          clearable
          style="width: 200px;"
          @keyup.enter="filterModes"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
      </div>
    </div>

    <div class="mode-list-section">
      <h3>运行模式列表</h3>
      <el-table :data="paginatedModes" style="width: 100%" border stripe>
        <el-table-column prop="name" label="模式名称" min-width="150" />
        <el-table-column label="工况数量" width="120">
          <template #default="scope">
            {{ scope.row.weights.length }} 个工况
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="300" show-overflow-tooltip />
        <el-table-column label="操作" width="400" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="openViewModal(scope.row)">查看</el-button>
            <el-button type="warning" size="small" @click="editMode(scope.row)">编辑</el-button>
            <el-button type="success" size="small" @click="openWeightConfig(scope.row)">权重配置</el-button>
            <el-button type="danger" size="small" @click="deleteMode(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="pageSizes"
          :total="filteredModes.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="resetPage"
        />
      </div>
    </div>

    <!-- 查看运行模式弹窗 -->
    <WeightParamsView
      v-if="showViewModal"
      :mode="selectedMode"
      @close="closeViewModal"
    />

    <!-- 编辑/新增运行模式弹窗 -->
    <WeightParamsForm
      v-if="showEditModal"
      :mode="editingMode"
      @close="closeEditModal"
      @save="handleSaveMode"
    />

    <!-- 权重配置弹窗 -->
    <WeightParamsConfig
      v-if="showWeightConfigModal"
      :mode="selectedMode"
      @close="closeWeightConfig"
      @save="handleSaveWeights"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import WeightParamsView from './components/WeightParamsView.vue'
import WeightParamsForm from './components/WeightParamsForm.vue'
import WeightParamsConfig from './components/WeightParamsConfig.vue'

const runModes = ref([
  {
    id: 'E2',
    name: '恒速主机运行模式 (E2)',
    description: '主机以恒定转速运行',
    weights: [
      { id: 1, engineSpeed: '100%', powerMode: '100%', weight: 0.2 },
      { id: 2, engineSpeed: '100%', powerMode: '75%', weight: 0.5 },
      { id: 3, engineSpeed: '100%', powerMode: '50%', weight: 0.15 },
      { id: 4, engineSpeed: '100%', powerMode: '25%', weight: 0.15 }
    ]
  },
  {
    id: 'E3',
    name: '按推进特性运行模式 (E3)',
    description: '发动机按推进特性曲线运行',
    weights: [
      { id: 1, engineSpeed: '100%', powerMode: '100%', weight: 0.2 },
      { id: 2, engineSpeed: '91%', powerMode: '75%', weight: 0.5 },
      { id: 3, engineSpeed: '80%', powerMode: '50%', weight: 0.15 },
      { id: 4, engineSpeed: '63%', powerMode: '25%', weight: 0.15 }
    ]
  },
  {
    id: 'D2',
    name: '恒速辅机运行模式 (D2)',
    description: '辅机以恒定转速运行',
    weights: [
      { id: 1, engineSpeed: '100%', powerMode: '100%', weight: 0.05 },
      { id: 2, engineSpeed: '100%', powerMode: '75%', weight: 0.25 },
      { id: 3, engineSpeed: '100%', powerMode: '50%', weight: 0.3 },
      { id: 4, engineSpeed: '100%', powerMode: '25%', weight: 0.3 },
      { id: 5, engineSpeed: '100%', powerMode: '10%', weight: 0.1 }
    ]
  }
])

const searchQuery = ref('')
const showViewModal = ref(false)
const showEditModal = ref(false)
const showWeightConfigModal = ref(false)
const selectedMode = ref(null)
const editingMode = ref(null)

const filteredModes = computed(() => {
  if (!searchQuery.value) {
    return runModes.value
  }
  const query = searchQuery.value.toLowerCase()
  return runModes.value.filter(mode => 
    mode.name.toLowerCase().includes(query) ||
    mode.description.toLowerCase().includes(query)
  )
})

const currentPage = ref(1)
const pageSize = ref(10)
const pageSizes = ref([10, 20, 50, 100, 200, 500])

const totalPages = computed(() => {
  return Math.ceil(filteredModes.value.length / pageSize.value)
})

const paginatedModes = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredModes.value.slice(start, end)
})

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const resetPage = () => {
  currentPage.value = 1
}

const filterModes = () => {
  resetPage()
}

const addMode = () => {
  editingMode.value = null
  showEditModal.value = true
}

const editMode = (mode) => {
  editingMode.value = mode
  showEditModal.value = true
}

const deleteMode = async (modeId) => {
  try {
    await ElMessageBox.confirm('确定要删除该运行模式吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const index = runModes.value.findIndex(m => m.id === modeId)
    if (index > -1) {
      runModes.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  } catch {
    // 用户取消删除
  }
}

const importModes = () => {
  ElMessage.info('导入功能已触发，请选择文件')
}

const exportModes = () => {
  const data = JSON.stringify(runModes.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'weight-modes.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}

const openViewModal = (mode) => {
  selectedMode.value = mode
  showViewModal.value = true
}

const closeViewModal = () => {
  showViewModal.value = false
  selectedMode.value = null
}

const closeEditModal = () => {
  showEditModal.value = false
  editingMode.value = null
}

const handleSaveMode = (data) => {
  if (editingMode.value) {
    // 编辑模式
    const index = runModes.value.findIndex(m => m.id === editingMode.value.id)
    if (index > -1) {
      runModes.value[index] = {
        ...runModes.value[index],
        name: data.name,
        description: data.description
      }
    }
    ElMessage.success('编辑成功')
  } else {
    // 新增模式，自动生成ID
    const maxId = runModes.value.length > 0 ? Math.max(...runModes.value.map(m => m.id)) : 0
    runModes.value.push({
      id: maxId + 1,
      name: data.name,
      description: data.description,
      weights: []
    })
    ElMessage.success('新增成功')
  }
  closeEditModal()
}

const openWeightConfig = (mode) => {
  selectedMode.value = mode
  showWeightConfigModal.value = true
}

const closeWeightConfig = () => {
  showWeightConfigModal.value = false
  selectedMode.value = null
}

const handleSaveWeights = (weights) => {
  if (selectedMode.value) {
    selectedMode.value.weights = weights
  }
  ElMessage.success('权重配置已保存')
  closeWeightConfig()
}
</script>

<style scoped>
.weight-params-container {
  padding: 20px;
  height: 100%;
  min-height: calc(100vh - 120px);
  overflow-y: auto;
  box-sizing: border-box;
}

.mode-controls {
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

.mode-list-section {
  margin-bottom: 24px;
}

.mode-list-section h3 {
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
</style>