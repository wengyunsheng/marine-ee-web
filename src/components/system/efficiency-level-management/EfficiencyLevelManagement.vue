<template>
  <div class="efficiency-level-container">
    <div class="efficiency-level-controls">
      <div class="control-group">
        <button class="btn btn-primary" @click="openAddModal">+ 新增基值</button>
        <button class="btn btn-secondary" @click="importBaseValues">导入基值</button>
        <button class="btn btn-secondary" @click="exportBaseValues">导出基值</button>
      </div>

      <div class="search-filter">
        <div class="search-box">
          <input type="text" v-model="searchQuery" placeholder="搜索设备类型" @keyup.enter="filterBaseValues">
          <button class="search-btn" @click="filterBaseValues">🔍</button>
        </div>
        <select class="filter-select" v-model="categoryFilter" @change="filterBaseValues">
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
          <option value="air-conditioner">船用空调机组</option>
          <option value="chiller">船用冷水机组</option>
          <option value="inert-gas">船用惰性气体系统</option>
          <option value="co2-capture">船用二氧化碳捕集设备</option>
          <option value="propeller">船用推进器</option>
        </select>
        <select class="filter-select" v-model="engineTypeFilter" @change="filterBaseValues">
          <option value="">全部设备类型</option>
          <option value="船用柴油发动机（低速机）">船用柴油发动机（低速机）</option>
          <option value="船用柴油发动机（中速机）">船用柴油发动机（中速机）</option>
          <option value="船用LNG/柴油双燃料发动机（低速机）">船用LNG/柴油双燃料发动机（低速机）</option>
          <option value="船用LNG/柴油双燃料发动机（中速机）">船用LNG/柴油双燃料发动机（中速机）</option>
          <option value="船用甲醇/柴油双燃料发动机（低速机）">船用甲醇/柴油双燃料发动机（低速机）</option>
          <option value="船用甲醇/柴油双燃料发动机（中速机）">船用甲醇/柴油双燃料发动机（中速机）</option>
          <option value="单台齿轮箱">单台齿轮箱</option>
          <option value="两台齿轮箱">两台齿轮箱</option>
          <option value="船用有机朗肯循环发电装置">船用有机朗肯循环发电装置</option>
          <option value="船用蒸汽透平发电装置">船用蒸汽透平发电装置</option>
          <option value="单功能焚烧炉（固体废弃物）">单功能焚烧炉（固体废弃物）</option>
          <option value="单功能焚烧炉（污油泥）">单功能焚烧炉（污油泥）</option>
          <option value="双功能焚烧炉">双功能焚烧炉</option>
          <option value="多功能焚烧炉">多功能焚烧炉</option>
          <option value="船用碟式分离机">船用碟式分离机</option>
          <option value="船用压载水处理设备">船用压载水处理设备</option>
          <option value="船用锚绞机">船用锚绞机</option>
          <option value="船用吊机">船用吊机</option>
          <option value="船用低压交流三相同步发电机">船用低压交流三相同步发电机</option>
          <option value="船用中压交流三相同步发电机">船用中压交流三相同步发电机</option>
          <option value="船用组合式空调机组">船用组合式空调机组</option>
          <option value="船用冷水机组">船用冷水机组</option>
          <option value="船用惰性气体系统">船用惰性气体系统</option>
          <option value="船用二氧化碳捕集设备">船用二氧化碳捕集设备</option>
          <option value="船用推进器">船用推进器</option>
        </select>
      </div>
    </div>

    <div class="efficiency-level-list-section">
      <h3>能效等级和能效基值</h3>
      <div class="efficiency-level-table-container">
        <table class="efficiency-level-table">
          <thead>
            <tr>
              <th>设备类型名称</th>
              <th>类别</th>
              <th>排放等级</th>
              <th>单缸功率区间 P/kW</th>
              <th>能效等级</th>
              <th>能效基值</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="baseValue in paginatedBaseValues" :key="baseValue.id">
              <td>{{ baseValue.engineType }}</td>
              <td>
                <span class="device-category" :class="baseValue.category">
                  {{ getCategoryName(baseValue.category) }}
                </span>
              </td>
              <td>{{ baseValue.emissionLevel }}</td>
              <td>{{ baseValue.powerRange }}</td>
              <td>{{ baseValue.efficiencyLevel }}</td>
              <td>{{ baseValue.baseValue }}{{ baseValue.unit || '%' }}</td>
              <td class="action-buttons">
                <button class="btn btn-sm btn-info" @click="openViewModal(baseValue)">查看</button>
                <button class="btn btn-sm btn-warning" @click="openEditModal(baseValue)">编辑</button>
                <button class="btn btn-sm btn-danger" @click="deleteBaseValue(baseValue.id)">删除</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="pagination-container">
        <div class="pagination-left">
          <div class="pagination-info">
            共 {{ filteredBaseValues.length }} 条记录，第 {{ currentPage }} / {{ totalPages }} 页
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

    <EfficiencyLevelView v-if="showViewModal" :base-value="currentBaseValue" @close="closeViewModal" />
    <EfficiencyLevelForm v-if="showFormModal" :is-edit="isEditMode" :form-data="formData" @save="saveBaseValue" @close="closeFormModal" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import EfficiencyLevelForm from './components/EfficiencyLevelForm.vue'
import EfficiencyLevelView from './components/EfficiencyLevelView.vue'

const searchQuery = ref('')
const engineTypeFilter = ref('')
const categoryFilter = ref('')
const showFormModal = ref(false)
const showViewModal = ref(false)
const isEditMode = ref(false)
const currentBaseValue = ref(null)

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

const defaultFormData = { id: null, category: '', emissionLevel: '', powerRange: '', efficiencyLevel: '', baseValue: null, engineType: '', unit: '%' }
const formData = ref({ ...defaultFormData })

const efficiencyBaseValues = ref([
  // 船用发动机
  { id: 1, category: 'engine', engineType: '船用柴油发动机（中速机）', emissionLevel: 'Tier II', powerRange: 'P<360', efficiencyLevel: '1级', baseValue: 45.8, unit: '%' },
  { id: 2, category: 'engine', engineType: '船用柴油发动机（中速机）', emissionLevel: 'Tier II', powerRange: 'P<360', efficiencyLevel: '2级', baseValue: 43.8, unit: '%' },
  { id: 3, category: 'engine', engineType: '船用柴油发动机（中速机）', emissionLevel: 'Tier II', powerRange: 'P<360', efficiencyLevel: '3级', baseValue: 42.4, unit: '%' },
  { id: 4, category: 'engine', engineType: '船用柴油发动机（中速机）', emissionLevel: 'Tier II', powerRange: '500≤P<850', efficiencyLevel: '1级', baseValue: 48.2, unit: '%' },
  { id: 5, category: 'engine', engineType: '船用柴油发动机（中速机）', emissionLevel: 'Tier II', powerRange: '500≤P<850', efficiencyLevel: '2级', baseValue: 45.5, unit: '%' },
  { id: 6, category: 'engine', engineType: '船用柴油发动机（中速机）', emissionLevel: 'Tier II', powerRange: '500≤P<850', efficiencyLevel: '3级', baseValue: 45.7, unit: '%' },
  { id: 7, category: 'engine', engineType: '船用柴油发动机（中速机）', emissionLevel: 'Tier III', powerRange: '500≤P<850', efficiencyLevel: '1级', baseValue: 47.0, unit: '%' },
  { id: 8, category: 'engine', engineType: '船用柴油发动机（中速机）', emissionLevel: 'Tier III', powerRange: '500≤P<850', efficiencyLevel: '2级', baseValue: 46.0, unit: '%' },
  { id: 9, category: 'engine', engineType: '船用柴油发动机（中速机）', emissionLevel: 'Tier III', powerRange: '500≤P<850', efficiencyLevel: '3级', baseValue: 43.6, unit: '%' },
  // 船用二氧化碳捕集设备
  { id: 10, category: 'co2-capture', engineType: '船用二氧化碳捕集设备', emissionLevel: '', powerRange: '', efficiencyLevel: '1级', baseValue: 4.2, unit: 'GJ/tCO₂' },
  { id: 11, category: 'co2-capture', engineType: '船用二氧化碳捕集设备', emissionLevel: '', powerRange: '', efficiencyLevel: '2级', baseValue: 5.1, unit: 'GJ/tCO₂' },
  { id: 12, category: 'co2-capture', engineType: '船用二氧化碳捕集设备', emissionLevel: '', powerRange: '', efficiencyLevel: '3级', baseValue: 6, unit: 'GJ/tCO₂' },
  // 船用余热回收发电装置
  { id: 13, category: 'waste-heat', engineType: '船用有机朗肯循环发电装置', emissionLevel: '', powerRange: '', efficiencyLevel: '1级', baseValue: 25, unit: '%' },
  { id: 14, category: 'waste-heat', engineType: '船用有机朗肯循环发电装置', emissionLevel: '', powerRange: '', efficiencyLevel: '2级', baseValue: 20, unit: '%' },
  { id: 15, category: 'waste-heat', engineType: '船用有机朗肯循环发电装置', emissionLevel: '', powerRange: '', efficiencyLevel: '3级', baseValue: 15, unit: '%' },
  { id: 16, category: 'waste-heat', engineType: '船用蒸汽透平发电装置', emissionLevel: '', powerRange: '', efficiencyLevel: '1级', baseValue: 30, unit: '%' },
  { id: 17, category: 'waste-heat', engineType: '船用蒸汽透平发电装置', emissionLevel: '', powerRange: '', efficiencyLevel: '2级', baseValue: 25, unit: '%' },
  { id: 18, category: 'waste-heat', engineType: '船用蒸汽透平发电装置', emissionLevel: '', powerRange: '', efficiencyLevel: '3级', baseValue: 20, unit: '%' },
  // 船用焚烧炉
  { id: 19, category: 'incinerator', engineType: '单功能焚烧炉（固体废弃物）', emissionLevel: '', powerRange: '', efficiencyLevel: '1级', baseValue: 95, unit: '%' },
  { id: 20, category: 'incinerator', engineType: '单功能焚烧炉（固体废弃物）', emissionLevel: '', powerRange: '', efficiencyLevel: '2级', baseValue: 90, unit: '%' },
  { id: 21, category: 'incinerator', engineType: '单功能焚烧炉（固体废弃物）', emissionLevel: '', powerRange: '', efficiencyLevel: '3级', baseValue: 85, unit: '%' },
  { id: 22, category: 'incinerator', engineType: '单功能焚烧炉（污油泥）', emissionLevel: '', powerRange: '', efficiencyLevel: '1级', baseValue: 92, unit: '%' },
  { id: 23, category: 'incinerator', engineType: '单功能焚烧炉（污油泥）', emissionLevel: '', powerRange: '', efficiencyLevel: '2级', baseValue: 88, unit: '%' },
  { id: 24, category: 'incinerator', engineType: '单功能焚烧炉（污油泥）', emissionLevel: '', powerRange: '', efficiencyLevel: '3级', baseValue: 83, unit: '%' },
  { id: 25, category: 'incinerator', engineType: '双功能焚烧炉', emissionLevel: '', powerRange: '', efficiencyLevel: '1级', baseValue: 93, unit: '%' },
  { id: 26, category: 'incinerator', engineType: '双功能焚烧炉', emissionLevel: '', powerRange: '', efficiencyLevel: '2级', baseValue: 89, unit: '%' },
  { id: 27, category: 'incinerator', engineType: '双功能焚烧炉', emissionLevel: '', powerRange: '', efficiencyLevel: '3级', baseValue: 84, unit: '%' },
  { id: 28, category: 'incinerator', engineType: '多功能焚烧炉', emissionLevel: '', powerRange: '', efficiencyLevel: '1级', baseValue: 94, unit: '%' },
  { id: 29, category: 'incinerator', engineType: '多功能焚烧炉', emissionLevel: '', powerRange: '', efficiencyLevel: '2级', baseValue: 90, unit: '%' },
  { id: 30, category: 'incinerator', engineType: '多功能焚烧炉', emissionLevel: '', powerRange: '', efficiencyLevel: '3级', baseValue: 85, unit: '%' },
  // 船用碟式分离机
  { id: 31, category: 'separator', engineType: '船用碟式分离机', emissionLevel: '', powerRange: '', efficiencyLevel: '1级', baseValue: 98, unit: '%' },
  { id: 32, category: 'separator', engineType: '船用碟式分离机', emissionLevel: '', powerRange: '', efficiencyLevel: '2级', baseValue: 95, unit: '%' },
  { id: 33, category: 'separator', engineType: '船用碟式分离机', emissionLevel: '', powerRange: '', efficiencyLevel: '3级', baseValue: 92, unit: '%' },
  // 船用压载水处理设备
  { id: 34, category: 'ballast', engineType: '船用压载水处理设备', emissionLevel: '', powerRange: '', efficiencyLevel: '1级', baseValue: 99, unit: '%' },
  { id: 35, category: 'ballast', engineType: '船用压载水处理设备', emissionLevel: '', powerRange: '', efficiencyLevel: '2级', baseValue: 96, unit: '%' },
  { id: 36, category: 'ballast', engineType: '船用压载水处理设备', emissionLevel: '', powerRange: '', efficiencyLevel: '3级', baseValue: 93, unit: '%' },
  // 船用齿轮箱
  { id: 37, category: 'gearbox', engineType: '单台齿轮箱', emissionLevel: '', powerRange: '', efficiencyLevel: '1级', baseValue: 98, unit: '%' },
  { id: 38, category: 'gearbox', engineType: '单台齿轮箱', emissionLevel: '', powerRange: '', efficiencyLevel: '2级', baseValue: 95, unit: '%' },
  { id: 39, category: 'gearbox', engineType: '单台齿轮箱', emissionLevel: '', powerRange: '', efficiencyLevel: '3级', baseValue: 92, unit: '%' },
  { id: 40, category: 'gearbox', engineType: '两台齿轮箱', emissionLevel: '', powerRange: '', efficiencyLevel: '1级', baseValue: 97, unit: '%' },
  { id: 41, category: 'gearbox', engineType: '两台齿轮箱', emissionLevel: '', powerRange: '', efficiencyLevel: '2级', baseValue: 94, unit: '%' },
  { id: 42, category: 'gearbox', engineType: '两台齿轮箱', emissionLevel: '', powerRange: '', efficiencyLevel: '3级', baseValue: 91, unit: '%' },
  // 船用锚绞机
  { id: 43, category: 'windlass', engineType: '船用锚绞机', emissionLevel: '', powerRange: '', efficiencyLevel: '1级', baseValue: 90, unit: '%' },
  { id: 44, category: 'windlass', engineType: '船用锚绞机', emissionLevel: '', powerRange: '', efficiencyLevel: '2级', baseValue: 85, unit: '%' },
  { id: 45, category: 'windlass', engineType: '船用锚绞机', emissionLevel: '', powerRange: '', efficiencyLevel: '3级', baseValue: 80, unit: '%' },
  // 船用吊机
  { id: 46, category: 'crane', engineType: '船用吊机', emissionLevel: '', powerRange: '', efficiencyLevel: '1级', baseValue: 88, unit: '%' },
  { id: 47, category: 'crane', engineType: '船用吊机', emissionLevel: '', powerRange: '', efficiencyLevel: '2级', baseValue: 83, unit: '%' },
  { id: 48, category: 'crane', engineType: '船用吊机', emissionLevel: '', powerRange: '', efficiencyLevel: '3级', baseValue: 78, unit: '%' },
  // 船用发电机
  { id: 49, category: 'generator', engineType: '船用低压交流三相同步发电机', emissionLevel: '', powerRange: '', efficiencyLevel: '1级', baseValue: 97, unit: '%' },
  { id: 50, category: 'generator', engineType: '船用低压交流三相同步发电机', emissionLevel: '', powerRange: '', efficiencyLevel: '2级', baseValue: 94, unit: '%' },
  { id: 51, category: 'generator', engineType: '船用低压交流三相同步发电机', emissionLevel: '', powerRange: '', efficiencyLevel: '3级', baseValue: 91, unit: '%' },
  { id: 52, category: 'generator', engineType: '船用中压交流三相同步发电机', emissionLevel: '', powerRange: '', efficiencyLevel: '1级', baseValue: 96, unit: '%' },
  { id: 53, category: 'generator', engineType: '船用中压交流三相同步发电机', emissionLevel: '', powerRange: '', efficiencyLevel: '2级', baseValue: 93, unit: '%' },
  { id: 54, category: 'generator', engineType: '船用中压交流三相同步发电机', emissionLevel: '', powerRange: '', efficiencyLevel: '3级', baseValue: 90, unit: '%' },
  // 船用空调机组
  { id: 55, category: 'air-conditioner', engineType: '船用组合式空调机组', emissionLevel: '', powerRange: '', efficiencyLevel: '1级', baseValue: 85, unit: '%' },
  { id: 56, category: 'air-conditioner', engineType: '船用组合式空调机组', emissionLevel: '', powerRange: '', efficiencyLevel: '2级', baseValue: 80, unit: '%' },
  { id: 57, category: 'air-conditioner', engineType: '船用组合式空调机组', emissionLevel: '', powerRange: '', efficiencyLevel: '3级', baseValue: 75, unit: '%' },
  // 船用冷水机组
  { id: 58, category: 'chiller', engineType: '船用冷水机组', emissionLevel: '', powerRange: '', efficiencyLevel: '1级', baseValue: 82, unit: '%' },
  { id: 59, category: 'chiller', engineType: '船用冷水机组', emissionLevel: '', powerRange: '', efficiencyLevel: '2级', baseValue: 77, unit: '%' },
  { id: 60, category: 'chiller', engineType: '船用冷水机组', emissionLevel: '', powerRange: '', efficiencyLevel: '3级', baseValue: 72, unit: '%' },
  // 船用惰性气体系统
  { id: 61, category: 'inert-gas', engineType: '船用惰性气体系统', emissionLevel: '', powerRange: '', efficiencyLevel: '1级', baseValue: 95, unit: '%' },
  { id: 62, category: 'inert-gas', engineType: '船用惰性气体系统', emissionLevel: '', powerRange: '', efficiencyLevel: '2级', baseValue: 90, unit: '%' },
  { id: 63, category: 'inert-gas', engineType: '船用惰性气体系统', emissionLevel: '', powerRange: '', efficiencyLevel: '3级', baseValue: 85, unit: '%' }
])

const filteredBaseValues = computed(() => {
  let result = efficiencyBaseValues.value
  if (searchQuery.value) {
    result = result.filter(bv => bv.engineType.toLowerCase().includes(searchQuery.value.toLowerCase()) || bv.emissionLevel.toLowerCase().includes(searchQuery.value.toLowerCase()))
  }
  if (categoryFilter.value) {
    result = result.filter(bv => bv.category === categoryFilter.value)
  }
  if (engineTypeFilter.value) {
    result = result.filter(bv => bv.engineType.includes(engineTypeFilter.value))
  }
  return result
})

const currentPage = ref(1)
const pageSize = ref(10)
const pageSizes = ref([10, 20, 50])

const totalPages = computed(() => {
  return Math.ceil(filteredBaseValues.value.length / pageSize.value)
})

const paginatedBaseValues = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredBaseValues.value.slice(start, end)
})

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const resetPage = () => {
  currentPage.value = 1
}

const filterBaseValues = () => {
  resetPage()
}

const openAddModal = () => { isEditMode.value = false; formData.value = { ...defaultFormData }; showFormModal.value = true }
const openViewModal = (baseValue) => { currentBaseValue.value = baseValue; showViewModal.value = true }
const closeViewModal = () => { showViewModal.value = false; currentBaseValue.value = null }
const openEditModal = (baseValue) => { isEditMode.value = true; formData.value = { ...baseValue }; showFormModal.value = true }
const closeFormModal = () => { showFormModal.value = false; formData.value = { ...defaultFormData } }

const saveBaseValue = (data) => {
  if (!data.engineType || !data.emissionLevel || !data.powerRange || !data.efficiencyLevel || data.baseValue === null) {
    alert('请填写必填项')
    return
  }
  if (isEditMode.value) {
    const index = efficiencyBaseValues.value.findIndex(bv => bv.id === data.id)
    if (index !== -1) efficiencyBaseValues.value[index] = { ...data }
  } else {
    const newId = Math.max(...efficiencyBaseValues.value.map(bv => bv.id)) + 1
    efficiencyBaseValues.value.push({ ...data, id: newId })
  }
  showFormModal.value = false
  alert('能效基值保存成功')
}

const deleteBaseValue = (id) => {
  if (confirm('确定要删除这个能效基值吗？')) {
    efficiencyBaseValues.value = efficiencyBaseValues.value.filter(bv => bv.id !== id)
  }
}

const importBaseValues = () => { alert('导入能效基值功能开发中') }

const exportBaseValues = () => {
  const data = JSON.stringify(efficiencyBaseValues.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'efficiency-base-values.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  alert('导出成功')
}
</script>

<style scoped>
.efficiency-level-container { padding: 20px; height: 100%; min-height: calc(100vh - 120px); overflow-y: auto; box-sizing: border-box; }
.page-header { display: flex; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0; }
.page-header h3 { margin: 0; font-size: 18px; font-weight: 600; color: #333; }

.efficiency-level-controls { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
.control-group { display: flex; gap: 12px; flex-wrap: wrap; }
.search-filter { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }

.search-box { display: flex; align-items: center; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 4px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
.search-box input { flex: 1; padding: 8px 12px; border: none; border-radius: 6px; font-size: 14px; outline: none; background: transparent; width: 200px; }
.search-btn { padding: 6px 10px; background: #2563eb; color: #fff; border: none; border-radius: 6px; cursor: pointer; margin-left: 4px; }
.search-btn:hover { background: #1d4ed8; }

.filter-select { padding: 8px 16px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 14px; background: #fff; cursor: pointer; outline: none; }

.efficiency-level-list-section { margin-bottom: 24px; }
.efficiency-level-list-section h3 { margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #333; }

.efficiency-level-table-container { background: #fff; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); overflow: hidden; }
.efficiency-level-table { width: 100%; border-collapse: collapse; }
.efficiency-level-table th { background: #f8fafc; padding: 12px 16px; text-align: left; font-size: 14px; font-weight: 600; color: #333; border-bottom: 2px solid #e2e8f0; }
.efficiency-level-table td { padding: 12px 16px; font-size: 14px; color: #333; border-bottom: 1px solid #e2e8f0; }
.efficiency-level-table tr:hover { background: #f8fafc; }

.action-buttons { display: flex; gap: 8px; }

.btn { padding: 8px 16px; border: none; border-radius: 6px; font-size: 14px; font-weight: 500; cursor: pointer; transition: all 0.3s ease; }
.btn-primary { background: #2563eb; color: #fff; }
.btn-primary:hover { background: #1d4ed8; }
.btn-secondary { background: #e2e8f0; color: #333; }
.btn-secondary:hover { background: #cbd5e1; }
.btn-info { background: #3b82f6; color: #fff; }
.btn-info:hover { background: #2563eb; }
.btn-warning { background: #f59e0b; color: #fff; }
.btn-warning:hover { background: #d97706; }
.btn-danger { background: #ef4444; color: #fff; }
.btn-danger:hover { background: #dc2626; }
.btn-sm { padding: 6px 12px; font-size: 14px; }

@media (max-width: 768px) {
  .efficiency-level-controls { flex-direction: column; align-items: flex-start; }
  .search-box { flex: 1; }
  .efficiency-level-table-container { overflow-x: auto; }
  .efficiency-level-table { min-width: 600px; }
}

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

.device-category {
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
  white-space: nowrap;
  display: inline-block;
  width: fit-content;
}

.device-category.engine { background-color: #dbeafe; color: #1e40af; }
.device-category.gearbox { background-color: #dcfce7; color: #166534; }
.device-category.waste-heat { background-color: #ffedd5; color: #c2410c; }
.device-category.incinerator { background-color: #fee2e2; color: #991b1b; }
.device-category.separator { background-color: #f3e8ff; color: #6b21a8; }
.device-category.ballast { background-color: #cffafe; color: #0e7490; }
.device-category.windlass { background-color: #fce7f3; color: #be185d; }
.device-category.crane { background-color: #e0e7ff; color: #3730a3; }
.device-category.generator { background-color: #fef3c7; color: #b45309; }
.device-category.air-conditioner { background-color: #dbeafe; color: #1e40af; }
.device-category.chiller { background-color: #e0e7ff; color: #3730a3; }
.device-category.inert-gas { background-color: #ede9fe; color: #5b21b6; }
.device-category.co2-capture { background-color: #dcfce7; color: #166534; }
.device-category.propeller { background-color: #ffedd5; color: #c2410c; }
</style>
