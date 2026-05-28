<template>
  <div class="device-type-management-container">
    <div class="device-type-controls">
      <div class="control-group">
        <el-button type="primary" @click="openAddModal">
          <el-icon><Plus /></el-icon> 新增设备类型
        </el-button>
      </div>

      <div class="search-filter">
        <el-input
          v-model="searchQuery"
          placeholder="搜索设备类型名称"
          clearable
          @keyup.enter="filterDeviceTypes"
          style="width: 300px;"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="categoryFilter" placeholder="全部类别" clearable @change="filterDeviceTypes" style="width: 200px;">
          <el-option label="船用发动机" value="engine" />
          <el-option label="船用齿轮箱" value="gearbox" />
          <el-option label="船用余热回收发电装置" value="waste-heat" />
          <el-option label="船用焚烧炉" value="incinerator" />
          <el-option label="船用碟式分离机" value="separator" />
          <el-option label="船用压载水处理设备" value="ballast" />
          <el-option label="船用锚绞机" value="windlass" />
          <el-option label="船用吊机" value="crane" />
          <el-option label="船用发电机" value="generator" />
          <el-option label="船用组合式空调机组" value="air-conditioner" />
          <el-option label="船用冷水机组" value="chiller" />
          <el-option label="船用惰性气体系统" value="inert-gas" />
          <el-option label="船用二氧化碳捕集设备" value="co2-capture" />
          <el-option label="船用推进器" value="propeller" />
        </el-select>
      </div>
    </div>

    <div class="device-type-list-section">
      <h3>设备类型列表</h3>
      <el-table :data="paginatedDeviceTypes" style="width: 100%" border stripe>
        <el-table-column prop="name" label="设备类型名称" min-width="200" />
        <el-table-column label="类别" min-width="150">
          <template #default="scope">
            <el-tag :class="['device-category', scope.row.category]">
              {{ getCategoryName(scope.row.category) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="250" show-overflow-tooltip />
        <el-table-column prop="createdAt" label="创建时间" width="120" />
        <el-table-column label="操作" width="250" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="viewDeviceType(scope.row)">查看</el-button>
            <el-button type="warning" size="small" @click="openEditModal(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="deleteDeviceType(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页组件 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="pageSizes"
          :total="filteredDeviceTypes.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="resetPage"
        />
      </div>
    </div>

    <!-- 新增/编辑设备类型弹窗 -->
    <el-dialog
      v-model="showFormModal"
      :title="isEditMode ? '编辑设备类型' : '新增设备类型'"
      width="600px"
      @close="closeFormModal"
    >
      <DeviceTypeForm
        :is-edit="isEditMode"
        :form-data="formData"
        @save="saveDeviceType"
        @close="closeFormModal"
      />
    </el-dialog>

    <!-- 查看设备类型弹窗 -->
    <el-dialog
      v-model="showViewModal"
      title="查看设备类型"
      width="600px"
      @close="closeViewModal"
    >
      <DeviceTypeView
        :device-type="currentDeviceType"
        @close="closeViewModal"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Plus, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import DeviceTypeForm from './components/DeviceTypeForm.vue'
import DeviceTypeView from './components/DeviceTypeView.vue'

const searchQuery = ref('')
const categoryFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const pageSizes = ref([10, 20, 50, 100, 200, 500])

const showFormModal = ref(false)
const showViewModal = ref(false)
const isEditMode = ref(false)
const currentDeviceType = ref(null)

const defaultFormData = {
  name: '',
  category: '',
  description: ''
}

const formData = ref({ ...defaultFormData })

const deviceTypes = ref([
  // 发动机类型
  {
    id: 1,
    name: '船用柴油发动机（低速机）',
    category: 'engine',
    description: '船舶主推进系统，低速柴油发动机',
    createdAt: '2024-04-01'
  },
  {
    id: 2,
    name: '船用柴油发动机（中速机）',
    category: 'engine',
    description: '船舶辅助发电系统，中速柴油发动机',
    createdAt: '2024-04-02'
  },
  {
    id: 3,
    name: '船用LNG/柴油双燃料发动机（低速机）',
    category: 'engine',
    description: '船舶主推进系统，LNG/柴油双燃料低速发动机',
    createdAt: '2024-04-03'
  },
  {
    id: 4,
    name: '船用LNG/柴油双燃料发动机（中速机）',
    category: 'engine',
    description: '船舶辅助发电系统，LNG/柴油双燃料中速发动机',
    createdAt: '2024-04-04'
  },
  {
    id: 5,
    name: '船用甲醇/柴油双燃料发动机（低速机）',
    category: 'engine',
    description: '船舶主推进系统，甲醇/柴油双燃料低速发动机',
    createdAt: '2024-04-05'
  },
  {
    id: 6,
    name: '船用甲醇/柴油双燃料发动机（中速机）',
    category: 'engine',
    description: '船舶辅助发电系统，甲醇/柴油双燃料中速发动机',
    createdAt: '2024-04-06'
  },
  // 齿轮箱类型
  {
    id: 7,
    name: '单台齿轮箱',
    category: 'gearbox',
    description: '船舶单输入单输出齿轮传动装置',
    createdAt: '2024-04-07'
  },
  {
    id: 8,
    name: '两台齿轮箱',
    category: 'gearbox',
    description: '船舶两台齿轮箱并联传动系统',
    createdAt: '2024-04-08'
  },
  // 余热回收发电装置
  {
    id: 10,
    name: '船用有机朗肯循环发电装置',
    category: 'waste-heat',
    description: '基于有机朗肯循环的船舶余热回收发电系统',
    createdAt: '2024-04-10'
  },
  {
    id: 11,
    name: '船用蒸汽透平发电装置',
    category: 'waste-heat',
    description: '基于蒸汽透平的船舶余热回收发电系统',
    createdAt: '2024-04-11'
  },
  // 焚烧炉类型
  {
    id: 12,
    name: '单功能焚烧炉（固体废弃物）',
    category: 'incinerator',
    description: '仅具备固体废弃物焚烧功能的船用焚烧设备',
    createdAt: '2024-04-12'
  },
  {
    id: 13,
    name: '单功能焚烧炉（污油泥）',
    category: 'incinerator',
    description: '仅具备污油泥焚烧功能的船用焚烧设备',
    createdAt: '2024-04-13'
  },
  {
    id: 14,
    name: '双功能焚烧炉',
    category: 'incinerator',
    description: '具备垃圾焚烧和油泥处理功能的船用焚烧设备',
    createdAt: '2024-04-14'
  },
  {
    id: 15,
    name: '多功能焚烧炉',
    category: 'incinerator',
    description: '具备多种废物处理功能的船用焚烧设备',
    createdAt: '2024-04-15'
  },
  // 碟式分离机
  {
    id: 16,
    name: '船用碟式分离机',
    category: 'separator',
    description: '船舶燃油/滑油分离净化设备',
    createdAt: '2024-04-16'
  },
  // 压载水处理设备
  {
    id: 17,
    name: '船用压载水处理设备',
    category: 'ballast',
    description: '船舶压载水净化处理系统',
    createdAt: '2024-04-17'
  },
  // 锚绞机
  {
    id: 18,
    name: '船用起锚机',
    category: 'windlass',
    description: '船舶锚泊设备，负责锚的起锚作业',
    createdAt: '2024-04-18'
  },
  {
    id: 19,
    name: '船用系泊绞车',
    category: 'windlass',
    description: '船舶系泊设备，负责缆绳的收放',
    createdAt: '2024-04-19'
  },
  // 吊机
  {
    id: 20,
    name: '船用吊机',
    category: 'crane',
    description: '船舶货物装卸起重机',
    createdAt: '2024-04-20'
  },
  // 发电机
  {
    id: 21,
    name: '船用低压交流三相同步发电机',
    category: 'generator',
    description: '船舶低压电力系统发电机',
    createdAt: '2024-04-21'
  },
  {
    id: 22,
    name: '船用中压交流三相同步发电机',
    category: 'generator',
    description: '船舶中压电力系统发电机',
    createdAt: '2024-04-22'
  },
  // 空调机组
  {
    id: 23,
    name: '船用组合式空调机组',
    category: 'air-conditioner',
    description: '船舶舱室空气调节系统',
    createdAt: '2024-04-23'
  },
  // 冷水机组
  {
    id: 24,
    name: '船用冷水机组',
    category: 'chiller',
    description: '船舶制冷系统冷水机组',
    createdAt: '2024-04-24'
  },
  // 惰性气体系统
  {
    id: 25,
    name: '船用惰性气体系统',
    category: 'inert-gas',
    description: '船舶货舱惰化保护系统',
    createdAt: '2024-04-25'
  },
  // 二氧化碳捕集设备
  {
    id: 26,
    name: '船用二氧化碳捕集设备',
    category: 'co2-capture',
    description: '船舶碳排放控制与捕集系统',
    createdAt: '2024-04-26'
  },
  // 推进器
  {
    id: 27,
    name: '船用推进器',
    category: 'propeller',
    description: '船舶螺旋桨推进系统',
    createdAt: '2024-04-26'
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

const resetPage = () => {
  currentPage.value = 1
}

const getCategoryName = (category) => {
  const categoryMap = {
    'engine': '船用发动机',
    'gearbox': '船用齿轮箱',
    'waste-heat': '船用余热回收发电装置',
    'incinerator': '船用焚烧炉',
    'separator': '船用碟式分离机',
    'ballast': '船用压载水处理设备',
    'windlass': '船用锚绞机',
    'crane': '船用吊机',
    'generator': '船用发电机',
    'air-conditioner': '船用组合式空调机组',
    'chiller': '船用冷水机组',
    'inert-gas': '船用惰性气体系统',
    'co2-capture': '船用二氧化碳捕集设备',
    'propeller': '船用推进器'
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
    ElMessage.warning('请填写必填项（设备类型名称、类别、描述）')
    return
  }

  if (isEditMode.value) {
    const index = deviceTypes.value.findIndex(d => d.id === data.id)
    if (index !== -1) {
      deviceTypes.value[index] = { ...data }
      ElMessage.success('修改成功')
    }
  } else {
    const newId = Math.max(...deviceTypes.value.map(d => d.id)) + 1
    deviceTypes.value.push({
      ...data,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0]
    })
    ElMessage.success('创建成功')
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

const deleteDeviceType = async (deviceTypeId) => {
  try {
    await ElMessageBox.confirm('确定要删除这个设备类型吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    deviceTypes.value = deviceTypes.value.filter(deviceType => deviceType.id !== deviceTypeId)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
  }
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

.device-type-list-section {
  margin-bottom: 24px;
}

.device-type-list-section h3 {
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
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
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
}
</style>
