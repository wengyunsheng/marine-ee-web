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
          <option value="engine">船用发动机</option>
          <option value="gearbox">船用齿轮箱</option>
          <option value="waste-heat">船用余热回收发电装置</option>
          <option value="incinerator">船用焚烧炉</option>
          <option value="separator">船用碟式分离机</option>
          <option value="ballast">船用压载水处理设备</option>
          <option value="windlass">船用锚绞机</option>
          <option value="crane">船用吊机</option>
          <option value="generator">船用发电机</option>
          <option value="air-conditioner">船用组合式空调机组</option>
          <option value="chiller">船用冷水机组</option>
          <option value="inert-gas">船用惰性气体系统</option>
          <option value="co2-capture">船用二氧化碳捕集设备</option>
          <option value="propeller">船用推进器</option>
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
          <div class="pagination-left">
            <div class="pagination-info">
              共 {{ filteredDeviceTypes.length }} 条记录，第 {{ currentPage }} / {{ totalPages }} 页
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
const pageSizes = ref([10, 20, 50])

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
  // 发动机类型
  {
    id: 1,
    name: '船用柴油发动机（低速机）',
    category: 'engine',
    description: '船舶主推进系统，低速柴油发动机',
    standard: 'ISO 15550:2016',
    remark: '已通过Tier III认证',
    createdAt: '2024-04-01'
  },
  {
    id: 2,
    name: '船用柴油发动机（中速机）',
    category: 'engine',
    description: '船舶辅助发电系统，中速柴油发动机',
    standard: 'GB/T 38999-2020',
    remark: '2024年新增标准验证型号',
    createdAt: '2024-04-02'
  },
  {
    id: 3,
    name: '船用LNG/柴油双燃料发动机（低速机）',
    category: 'engine',
    description: '船舶主推进系统，LNG/柴油双燃料低速发动机',
    standard: 'TSG G0003-2010',
    remark: '主推节能型号',
    createdAt: '2024-04-03'
  },
  {
    id: 4,
    name: '船用LNG/柴油双燃料发动机（中速机）',
    category: 'engine',
    description: '船舶辅助发电系统，LNG/柴油双燃料中速发动机',
    standard: 'GB/T 13006-2013',
    remark: '待更新技术手册',
    createdAt: '2024-04-04'
  },
  {
    id: 5,
    name: '船用甲醇/柴油双燃料发动机（低速机）',
    category: 'engine',
    description: '船舶主推进系统，甲醇/柴油双燃料低速发动机',
    standard: 'IMO EEXI标准',
    remark: '环保优先推荐',
    createdAt: '2024-04-05'
  },
  {
    id: 6,
    name: '船用甲醇/柴油双燃料发动机（中速机）',
    category: 'engine',
    description: '船舶辅助发电系统，甲醇/柴油双燃料中速发动机',
    standard: 'ISO 7547:2017',
    remark: '研发阶段验证中',
    createdAt: '2024-04-06'
  },
  // 齿轮箱类型
  {
    id: 7,
    name: '单台齿轮箱',
    category: 'gearbox',
    description: '船舶单输入单输出齿轮传动装置',
    standard: 'GB/T 14073-2016',
    remark: '常规型齿轮箱',
    createdAt: '2024-04-07'
  },
  {
    id: 8,
    name: '两台齿轮箱',
    category: 'gearbox',
    description: '船舶两台齿轮箱并联传动系统',
    standard: 'GB/T 13306-2011',
    remark: '冗余设计',
    createdAt: '2024-04-08'
  },
  // 余热回收发电装置
  {
    id: 10,
    name: '船用有机朗肯循环发电装置',
    category: 'waste-heat',
    description: '基于有机朗肯循环的船舶余热回收发电系统',
    standard: 'GB/T 34657-2017',
    remark: '利用废气余热发电',
    createdAt: '2024-04-10'
  },
  {
    id: 11,
    name: '船用蒸汽透平发电装置',
    category: 'waste-heat',
    description: '基于蒸汽透平的船舶余热回收发电系统',
    standard: 'ISO 10816-1:2016',
    remark: '高效率余热利用',
    createdAt: '2024-04-11'
  },
  // 焚烧炉类型
  {
    id: 12,
    name: '单功能焚烧炉（固体废弃物）',
    category: 'incinerator',
    description: '仅具备固体废弃物焚烧功能的船用焚烧设备',
    standard: 'IMO MEPC.107(49)',
    remark: '基础型焚烧设备',
    createdAt: '2024-04-12'
  },
  {
    id: 13,
    name: '单功能焚烧炉（污油泥）',
    category: 'incinerator',
    description: '仅具备污油泥焚烧功能的船用焚烧设备',
    standard: 'IMO MEPC.107(49)',
    remark: '油泥专用',
    createdAt: '2024-04-13'
  },
  {
    id: 14,
    name: '双功能焚烧炉',
    category: 'incinerator',
    description: '具备垃圾焚烧和油泥处理功能的船用焚烧设备',
    standard: 'GB/T 10834-2011',
    remark: '多功能处理',
    createdAt: '2024-04-14'
  },
  {
    id: 15,
    name: '多功能焚烧炉',
    category: 'incinerator',
    description: '具备多种废物处理功能的船用焚烧设备',
    standard: 'ISO 15850:2017',
    remark: '综合废物处理',
    createdAt: '2024-04-15'
  },
  // 碟式分离机
  {
    id: 16,
    name: '船用碟式分离机',
    category: 'separator',
    description: '船舶燃油/滑油分离净化设备',
    standard: 'GB/T 5745-2002',
    remark: '离心式分离',
    createdAt: '2024-04-16'
  },
  // 压载水处理设备
  {
    id: 17,
    name: '船用压载水处理设备',
    category: 'ballast',
    description: '船舶压载水净化处理系统',
    standard: 'IMO D-2标准',
    remark: '满足国际压载水管理公约',
    createdAt: '2024-04-17'
  },
  // 锚绞机
  {
    id: 18,
    name: '船用锚绞机',
    category: 'windlass',
    description: '船舶锚泊设备，负责锚的收放',
    standard: 'GB/T 1854-2018',
    remark: '锚泊专用',
    createdAt: '2024-04-18'
  },
  // 吊机
  {
    id: 20,
    name: '船用吊机',
    category: 'crane',
    description: '船舶货物装卸起重机',
    standard: 'GB/T 14738-2013',
    remark: '货物装卸专用',
    createdAt: '2024-04-20'
  },
  // 发电机
  {
    id: 21,
    name: '船用低压交流三相同步发电机',
    category: 'generator',
    description: '船舶低压电力系统发电机',
    standard: 'GB/T 7064-2017',
    remark: '380V系统',
    createdAt: '2024-04-21'
  },
  {
    id: 22,
    name: '船用中压交流三相同步发电机',
    category: 'generator',
    description: '船舶中压电力系统发电机',
    standard: 'IEC 60034-1',
    remark: '6.6kV/10kV系统',
    createdAt: '2024-04-22'
  },
  // 空调机组
  {
    id: 23,
    name: '船用组合式空调机组',
    category: 'air-conditioner',
    description: '船舶舱室空气调节系统',
    standard: 'GB/T 14295-2008',
    remark: '温湿度控制',
    createdAt: '2024-04-23'
  },
  // 冷水机组
  {
    id: 24,
    name: '船用冷水机组',
    category: 'chiller',
    description: '船舶制冷系统冷水机组',
    standard: 'GB/T 18430.1-2017',
    remark: '水冷式',
    createdAt: '2024-04-24'
  },
  // 惰性气体系统
  {
    id: 25,
    name: '船用惰性气体系统',
    category: 'inert-gas',
    description: '船舶货舱惰化保护系统',
    standard: 'IMO SOLAS II-2/15',
    remark: '油船专用',
    createdAt: '2024-04-25'
  },
  // 二氧化碳捕集设备
  {
    id: 26,
    name: '船用二氧化碳捕集设备',
    category: 'co2-capture',
    description: '船舶碳排放控制与捕集系统',
    standard: 'IMO MEPC.346(77)',
    remark: '减排设备',
    createdAt: '2024-04-26'
  },
  // 推进器
  {
    id: 27,
    name: '船用推进器',
    category: 'propeller',
    description: '船舶螺旋桨推进系统',
    standard: 'ISO 484-1:2017',
    remark: '主推进装置',
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

.device-category.engine {
  background-color: #e3f2fd;
  color: #1976d2;
}

.device-category.gearbox {
  background-color: #e8f5e8;
  color: #2e7d32;
}

.device-category.waste-heat {
  background-color: #fff3e0;
  color: #ef6c00;
}

.device-category.incinerator {
  background-color: #ffebee;
  color: #c62828;
}

.device-category.separator {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.device-category.ballast {
  background-color: #e0f7fa;
  color: #00838f;
}

.device-category.windlass {
  background-color: #fce4ec;
  color: #880e4f;
}

.device-category.crane {
  background-color: #e3f2fd;
  color: #0d47a1;
}

.device-category.generator {
  background-color: #fff8e1;
  color: #f57c00;
}

.device-category.air-conditioner {
  background-color: #e1f5fe;
  color: #0288d1;
}

.device-category.chiller {
  background-color: #e3f2fd;
  color: #1565c0;
}

.device-category.inert-gas {
  background-color: #f3e5f5;
  color: #6a1b9a;
}

.device-category.co2-capture {
  background-color: #c8e6c9;
  color: #2e7d32;
}

.device-category.propeller {
  background-color: #fff3e0;
  color: #e65100;
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
