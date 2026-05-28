<template>
  <el-card class="table-section">
    <template #header>
      <div class="section-header">
        <h3>能效评估列表</h3>
        <el-button type="success" @click="handleComparison">对比分析</el-button>
      </div>
      <div class="filter-bar">
        <el-input 
          v-model="searchQuery" 
          placeholder="搜索样机模型名称" 
          clearable
          style="width: 200px"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="categoryFilter" placeholder="全部类别" clearable style="width: 180px" @change="resetPage">
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
          <el-option label="船用组合式空调机组" value="air-conditioner" />
          <el-option label="船用冷水机组" value="chiller" />
          <el-option label="船用惰性气体系统" value="inert-gas" />
          <el-option label="船用二氧化碳捕集设备" value="co2-capture" />
          <el-option label="船用推进器" value="propeller" />
        </el-select>
        <el-select v-model="deviceTypeFilter" placeholder="全部设备类型" clearable style="width: 250px" @change="resetPage">
          <el-option label="全部设备类型" value="" />
          <el-option v-for="opt in filteredDeviceTypeOptions" :key="opt" :label="opt" :value="opt" />
        </el-select>
        <el-select v-model="efficiencyFilter" placeholder="全部能效等级" clearable style="width: 140px">
          <el-option label="全部" value="" />
          <el-option label="1级" value="1" />
          <el-option label="2级" value="2" />
          <el-option label="3级" value="3" />
        </el-select>
        <el-date-picker
          v-model="dataDateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="数据日期起"
          end-placeholder="数据日期止"
          style="width: 240px"
          value-format="YYYY-MM-DD"
        />
        <el-select v-model="versionFilter" placeholder="全部版本" clearable style="width: 120px">
          <el-option label="全部版本" value="" />
          <el-option label="v1" value="1" />
          <el-option label="v2" value="2" />
          <el-option label="v3" value="3" />
        </el-select>
        <el-button @click="resetFilters">重置筛选</el-button>
      </div>
    </template>

    <el-table 
      :data="paginatedTasks" 
      style="width: 100%" 
      stripe
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="55" />
      <el-table-column label="样机模型名称" min-width="250">
        <template #default="{ row }">
          <div class="model-name">{{ row.device }}</div>
        </template>
      </el-table-column>
      <el-table-column label="设备类型名称" min-width="200">
        <template #default="{ row }">
          <span>{{ row.deviceClass }}</span>
        </template>
      </el-table-column>
      <el-table-column label="类别" min-width="120">
        <template #default="{ row }">
          <el-tag :class="['category-tag', row.category]" size="small">
            {{ getCategoryName(row.category) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="能效基值" width="100" align="center">
        <template #default="{ row }">
          <span class="score-text" :class="getScoreClass(row.score)">{{ row.score || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="能效等级" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getLevelTagType(row.levelClass)" size="small">{{ row.level }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="dataDate" label="数据日期" width="120" />
      <el-table-column prop="version" label="版本" width="80" align="center">
        <template #default="{ row }">
          <el-tag size="small">v{{ row.version }}</el-tag>
        </template>
      </el-table-column>

      <el-table-column prop="evalTime" label="评估时间" width="160" />
      <el-table-column label="操作" width="150" fixed="right" align="center">
        <template #default="{ row }">
          <el-button type="primary" size="small" @click="viewTask(row)">查看</el-button>
          <el-button type="warning" size="small" @click="downloadReport(row)">下载</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="pageSizes"
        :total="totalTasks"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="resetPage"
      />
    </div>
  </el-card>
  
  <!-- 对比分析弹窗 -->
  <EvalComparisonAnalysis 
    v-if="showComparison" 
    :selected-items="selectedTasks"
    @close="closeComparison" 
  />
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import EvalComparisonAnalysis from './EvalComparisonAnalysis.vue'

const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const pageSizes = [10, 20, 50, 100, 200, 500]

// 多维度筛选变量
const categoryFilter = ref('')
const deviceTypeFilter = ref('')
const efficiencyFilter = ref('')
const dataDateRange = ref([])
const versionFilter = ref('')

// 类别映射
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
  'air-conditioner': '船用组合式空调机组',
  chiller: '船用冷水机组',
  'inert-gas': '船用惰性气体系统',
  'co2-capture': '船用二氧化碳捕集设备',
  propeller: '船用推进器'
}

// 设备类型→类别映射
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

// 所有设备类型列表
const allDeviceTypes = Object.keys(deviceTypeToCategoryMap)

// 根据类别过滤设备类型选项
const filteredDeviceTypeOptions = computed(() => {
  if (!categoryFilter.value) {
    return allDeviceTypes
  }
  return allDeviceTypes.filter(dt => deviceTypeToCategoryMap[dt] === categoryFilter.value)
})

// 类别变化时清空设备类型筛选
watch(categoryFilter, (newVal, oldVal) => {
  if (oldVal !== undefined && newVal !== oldVal) {
    deviceTypeFilter.value = ''
  }
})

// 设备类型变化时自动带出类别
watch(deviceTypeFilter, (newVal) => {
  if (newVal && deviceTypeToCategoryMap[newVal]) {
    categoryFilter.value = deviceTypeToCategoryMap[newVal]
  } else if (!newVal) {
    categoryFilter.value = ''
  }
})

const getCategoryName = (category) => {
  return categoryMap[category] || category
}

const tasks = ref([
  { id: 'EVAL-20240707-001', name: 'VLCC超大型油轮 - 船用柴油发动机（低速机）能效评估', device: 'VLCC超大型油轮 - 船用柴油发动机（低速机）', deviceClass: '船用柴油发动机（低速机）', category: 'engine', model: 'ISO 15550:2016', dataDate: '2024-04-20', version: 1, score: 89, level: '2级', levelClass: 'level-2', evalTime: '2024-04-07 13:45' },
  { id: 'EVAL-20240707-002', name: '散货船 - 船用柴油发动机（中速机）能效评估', device: '散货船 - 船用柴油发动机（中速机）', deviceClass: '船用柴油发动机（中速机）', category: 'engine', model: 'GB/T 38999-2020', dataDate: '2024-04-15', version: 1, score: 93, level: '1级', levelClass: 'level-1', evalTime: '2024-04-07 12:30' },
  { id: 'EVAL-20240605-003', name: '集装箱船 - 船用LNG/柴油双燃料发动机（低速机）能效评估', device: '集装箱船 - 船用LNG/柴油双燃料发动机（低速机）', deviceClass: '船用LNG/柴油双燃料发动机（低速机）', category: 'engine', model: 'TSG G0003-2010', dataDate: '2024-04-10', version: 1, score: 76, level: '2级', levelClass: 'level-2', evalTime: '2024-04-05 15:20' },
  { id: 'EVAL-20240604-004', name: '液化气船 - 船用LNG/柴油双燃料发动机（中速机）能效评估', device: '液化气船 - 船用LNG/柴油双燃料发动机（中速机）', deviceClass: '船用LNG/柴油双燃料发动机（中速机）', category: 'engine', model: 'GB/T 13006-2013', dataDate: '2024-04-05', version: 1, score: 65, level: '3级', levelClass: 'level-3', evalTime: '2024-04-04 10:15' },
  { id: 'EVAL-20240601-005', name: 'VLCC超大型油轮 - 船用甲醇/柴油双燃料发动机（低速机）能效评估', device: 'VLCC超大型油轮 - 船用甲醇/柴油双燃料发动机（低速机）', deviceClass: '船用甲醇/柴油双燃料发动机（低速机）', category: 'engine', model: 'IMO EEXI标准', dataDate: '2024-04-01', version: 1, score: 82, level: '2级', levelClass: 'level-2', evalTime: '2024-04-01 16:00' }
])

const totalTasks = computed(() => filteredTasks.value.length)

const filteredTasks = computed(() => {
  let result = tasks.value
  if (categoryFilter.value) {
    result = result.filter(task => task.category === categoryFilter.value)
  }
  if (deviceTypeFilter.value) {
    result = result.filter(task => task.device === deviceTypeFilter.value)
  }
  if (efficiencyFilter.value) {
    result = result.filter(task => task.levelClass === `level-${efficiencyFilter.value}`)
  }
  if (dataDateRange.value && dataDateRange.value.length === 2) {
    const [startDate, endDate] = dataDateRange.value
    result = result.filter(task => {
      return task.dataDate >= startDate && task.dataDate <= endDate
    })
  }
  if (versionFilter.value) {
    result = result.filter(task => task.version === parseInt(versionFilter.value))
  }
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(task => 
      task.name.toLowerCase().includes(query) || 
      task.id.toLowerCase().includes(query)
    )
  }
  return result
})

const paginatedTasks = computed(() => {
  return filteredTasks.value.slice((currentPage.value - 1) * pageSize.value, currentPage.value * pageSize.value)
})

const getScoreClass = (score) => {
  if (!score) return ''
  if (score >= 85) return 'excellent'
  if (score >= 70) return 'good'
  return 'poor'
}

const getLevelTagType = (levelClass) => {
  if (levelClass === 'level-1') return 'success'
  if (levelClass === 'level-2') return 'warning'
  if (levelClass === 'level-3') return 'danger'
  return 'info'
}

const handleSearch = () => {
  // 搜索功能
}

const viewTask = (task) => {
  // 查看评估
}

const downloadReport = (task) => {
  // 下载报告
}

const resetPage = () => { 
  currentPage.value = 1 
}

const resetFilters = () => {
  categoryFilter.value = ''
  deviceTypeFilter.value = ''
  efficiencyFilter.value = ''
  dataDateRange.value = []
  versionFilter.value = ''
  searchQuery.value = ''
  currentPage.value = 1
}

// 添加新评估的方法
const addTask = (taskData) => {
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
  const randomNum = Math.floor(Math.random() * 900) + 100
  const taskId = `EVAL-${dateStr}-${randomNum}`
  
  const newTask = {
    id: taskId,
    name: `${taskData.deviceName}能效评估`,
    device: taskData.deviceName,
    deviceClass: taskData.deviceClass,
    category: deviceTypeToCategoryMap[taskData.deviceName] || 'engine',
    model: taskData.evalModel || 'ISO 15550:2016',
    score: taskData.score,
    level: taskData.level,
    levelClass: taskData.levelClass,
    evalTime: now.toLocaleString('zh-CN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit', 
      hour: '2-digit', 
      minute: '2-digit' 
    }).replace(/\//g, '-')
  }
  
  tasks.value.unshift(newTask)
}

// 对比分析相关
const showComparison = ref(false)
const selectedTasks = ref([])

const handleSelectionChange = (selection) => {
  selectedTasks.value = selection
}

const handleComparison = () => {
  if (selectedTasks.value.length < 2) {
    ElMessage.warning('请至少勾选两条数据进行对比分析')
    return
  }
  showComparison.value = true
}

const closeComparison = () => {
  showComparison.value = false
}

// 获取所有评估数据（用于同步到历史数据）
const getAllTasks = () => {
  return tasks.value
}

// 暴露方法给父组件
defineExpose({
  addTask,
  getAllTasks
})
</script>

<style scoped>
/* 表格区域样式 */
.table-section {
  margin-top: 24px;
  border-radius: 12px;
}

/* 移除el-card默认内边距，让内容贴边 */
.table-section :deep(.el-card__header) {
  padding: 12px 20px 12px 0;
}

.table-section :deep(.el-card__body) {
  padding: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
}

.filter-bar {
  display: flex;
  gap: 12px;
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

.search-box:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-color: #93c5fd;
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

.filter-select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
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

.btn-success {
  background-color: #10b981;
  color: white;
}

.btn-success:hover {
  background-color: #059669;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

/* 表格样式 */
.table-container {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border: 1px solid #e2e8f0;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table th {
  background-color: #f8fafc;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e2e8f0;
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  color: #333;
  vertical-align: middle;
}

.data-table tr:hover {
  background-color: #f8fafc;
}

/* 样机模型名称样式 */
.model-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

/* 类别标签样式 */
.category-tag {
  font-size: 14px;
  font-weight: 500;
}

.category-tag.engine { background-color: #e3f2fd; color: #1976d2; }
.category-tag.gearbox { background-color: #e8f5e8; color: #2e7d32; }
.category-tag.waste-heat { background-color: #fff3e0; color: #ef6c00; }
.category-tag.incinerator { background-color: #ffebee; color: #c62828; }
.category-tag.separator { background-color: #f3e5f5; color: #7b1fa2; }
.category-tag.ballast { background-color: #e0f7fa; color: #00838f; }
.category-tag.windlass { background-color: #fce4ec; color: #880e4f; }
.category-tag.crane { background-color: #e3f2fd; color: #0d47a1; }
.category-tag.generator { background-color: #fff8e1; color: #f57c00; }
.category-tag.air-conditioner { background-color: #e1f5fe; color: #0288d1; }
.category-tag.chiller { background-color: #e3f2fd; color: #1565c0; }
.category-tag.inert-gas { background-color: #f3e5f5; color: #6a1b9a; }
.category-tag.co2-capture { background-color: #c8e6c9; color: #2e7d32; }
.category-tag.propeller { background-color: #fff3e0; color: #e65100; }

.score-text {
  font-size: 14px;
  font-weight: 500;
}

.score-text.excellent {
  color: #27ae60;
}

.score-text.good {
  color: #2563eb;
}

.score-text.poor {
  color: #e74c3c;
}

.level-tag {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
}

.level-tag.level-1 {
  background-color: #d1fae5;
  color: #065f46;
}

.level-tag.level-2 {
  background-color: #dbeafe;
  color: #1e40af;
}

.level-tag.level-3 {
  background-color: #fef3c7;
  color: #92400e;
}

.level-tag.pending {
  background-color: #f8fafc;
  color: #64748b;
}

.status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
}

.status.success {
  background-color: #d1fae5;
  color: #065f46;
}

.status.running {
  background-color: #dbeafe;
  color: #1e40af;
}

.status.warning {
  background-color: #fef3c7;
  color: #92400e;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0;
}

.pagination-page-size {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
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
  cursor: pointer;
  font-size: 14px;
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
  .table-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .table-controls .search-box,
  .table-controls .filter-select,
  .table-controls .btn {
    width: 100%;
    margin-bottom: 8px;
  }
}
</style>