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
        <select class="filter-select" v-model="engineTypeFilter" @change="filterBaseValues">
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

    <div class="efficiency-level-list-section">
      <h4>能效等级和能效基值</h4>
      <div class="efficiency-level-table-container">
        <table class="efficiency-level-table">
          <thead>
            <tr>
              <th>设备类型</th>
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
              <td>{{ baseValue.emissionLevel }}</td>
              <td>{{ baseValue.powerRange }}</td>
              <td>{{ baseValue.efficiencyLevel }}</td>
              <td>{{ baseValue.baseValue }}%</td>
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
        <div class="pagination-info">
          共 {{ filteredBaseValues.length }} 条记录，第 {{ currentPage }} / {{ totalPages }} 页
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

    <BaseValueView v-if="showViewModal" :base-value="currentBaseValue" @close="closeViewModal" />
    <BaseValueForm v-if="showFormModal" :is-edit="isEditMode" :form-data="formData" @save="saveBaseValue" @close="closeFormModal" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import BaseValueForm from './components/BaseValueForm.vue'
import BaseValueView from './components/BaseValueView.vue'

const searchQuery = ref('')
const engineTypeFilter = ref('')
const showFormModal = ref(false)
const showViewModal = ref(false)
const isEditMode = ref(false)
const currentBaseValue = ref(null)

const defaultFormData = { id: null, emissionLevel: '', powerRange: '', efficiencyLevel: '', baseValue: null, engineType: '' }
const formData = ref({ ...defaultFormData })

const efficiencyBaseValues = ref([
  { id: 1, engineType: '船用柴油发动机（中速机）', emissionLevel: 'Tier II', powerRange: 'P<360', efficiencyLevel: '1级', baseValue: 45.8 },
  { id: 2, engineType: '船用柴油发动机（中速机）', emissionLevel: 'Tier II', powerRange: 'P<360', efficiencyLevel: '2级', baseValue: 43.8 },
  { id: 3, engineType: '船用柴油发动机（中速机）', emissionLevel: 'Tier II', powerRange: 'P<360', efficiencyLevel: '3级', baseValue: 42.4 },
  { id: 4, engineType: '船用柴油发动机（中速机）', emissionLevel: 'Tier II', powerRange: '500≤P<850', efficiencyLevel: '1级', baseValue: 48.2 },
  { id: 5, engineType: '船用柴油发动机（中速机）', emissionLevel: 'Tier II', powerRange: '500≤P<850', efficiencyLevel: '2级', baseValue: 45.5 },
  { id: 6, engineType: '船用柴油发动机（中速机）', emissionLevel: 'Tier II', powerRange: '500≤P<850', efficiencyLevel: '3级', baseValue: 45.7 },
  { id: 7, engineType: '船用柴油发动机（中速机）', emissionLevel: 'Tier III', powerRange: '500≤P<850', efficiencyLevel: '1级', baseValue: 47.0 },
  { id: 8, engineType: '船用柴油发动机（中速机）', emissionLevel: 'Tier III', powerRange: '500≤P<850', efficiencyLevel: '2级', baseValue: 46.0 },
  { id: 9, engineType: '船用柴油发动机（中速机）', emissionLevel: 'Tier III', powerRange: '500≤P<850', efficiencyLevel: '3级', baseValue: 43.6 }
])

const filteredBaseValues = computed(() => {
  let result = efficiencyBaseValues.value
  if (searchQuery.value) {
    result = result.filter(bv => bv.engineType.toLowerCase().includes(searchQuery.value.toLowerCase()) || bv.emissionLevel.toLowerCase().includes(searchQuery.value.toLowerCase()))
  }
  if (engineTypeFilter.value) {
    result = result.filter(bv => bv.engineType.includes(engineTypeFilter.value))
  }
  return result
})

const currentPage = ref(1)
const pageSize = ref(10)

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
.efficiency-level-container { padding: 20px; height: calc(100vh - 120px); overflow-y: auto; }
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
.efficiency-level-list-section h4 { margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #333; }

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
