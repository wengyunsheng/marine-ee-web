<template>
  <el-card class="table-section">
    <template #header>
      <div class="section-header">
        <h3>评估任务列表</h3>
        <div class="table-controls">
          <el-button type="success" @click="showComparison = true">对比分析</el-button>
          <el-input 
            v-model="searchQuery" 
            placeholder="搜索任务名称或ID" 
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-select v-model="deviceTypeFilter" placeholder="设备类型" clearable style="width: 250px">
            <el-option label="全部" value="" />
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
          <el-select v-model="efficiencyFilter" placeholder="能效等级" clearable style="width: 140px">
            <el-option label="全部" value="" />
            <el-option label="1级" value="1" />
            <el-option label="2级" value="2" />
            <el-option label="3级" value="3" />
          </el-select>
          <el-select v-model="statusFilter" placeholder="状态" clearable style="width: 120px">
            <el-option label="全部" value="" />
            <el-option label="已完成" value="completed" />
            <el-option label="评估中" value="running" />
            <el-option label="待执行" value="pending" />
          </el-select>
          <el-button @click="resetFilters">重置筛选</el-button>
        </div>
      </div>
    </template>

    <el-table :data="paginatedTasks" style="width: 100%" stripe>
      <el-table-column label="任务名称" min-width="200">
        <template #default="{ row }">
          <div class="task-info">
            <div class="task-name">{{ row.name }}</div>
            <div class="task-id">{{ row.id }}</div>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="设备类型" min-width="180">
        <template #default="{ row }">
          <el-tag :class="row.deviceClass" size="small">{{ row.device }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="model" label="评估模型" min-width="140" />
      <el-table-column label="能效得分" width="100" align="center">
        <template #default="{ row }">
          <span class="score-text" :class="getScoreClass(row.score)">{{ row.score || '-' }}</span>
        </template>
      </el-table-column>
      <el-table-column label="能效等级" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getLevelTagType(row.levelClass)" size="small">{{ row.level }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusTagType(row.statusClass)" size="small">{{ row.status }}</el-tag>
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
    :tasks="tasks" 
    @close="closeComparison" 
  />
</template>

<script setup>
import { ref, computed } from 'vue'
import { Search } from '@element-plus/icons-vue'
import EvalComparisonAnalysis from './EvalComparisonAnalysis.vue'

const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const pageSizes = [10, 20, 50, 100, 200, 500]

// 多维度筛选变量
const deviceTypeFilter = ref('')
const efficiencyFilter = ref('')
const workingConditionFilter = ref('')

const tasks = ref([
  { id: 'EVAL-20240707-001', name: '船用柴油发动机（低速机）能效评估', device: '船用柴油发动机（低速机）', deviceClass: '船用柴油发动机（低速机）', model: 'ISO 15550:2016', score: 89, level: '2级', levelClass: 'level-2', status: '已完成', statusClass: 'success', evalTime: '2024-04-07 13:45' },
  { id: 'EVAL-20240707-002', name: '船用柴油发动机（中速机）能效评估', device: '船用柴油发动机（中速机）', deviceClass: '船用柴油发动机（中速机）', model: 'GB/T 38999-2020', score: 93, level: '1级', levelClass: 'level-1', status: '已完成', statusClass: 'success', evalTime: '2024-04-07 12:30' },
  { id: 'EVAL-20240605-003', name: '船用LNG/柴油双燃料发动机（低速机）能效评估', device: '船用LNG/柴油双燃料发动机（低速机）', deviceClass: '船用LNG/柴油双燃料发动机（低速机）', model: 'TSG G0003-2010', score: 76, level: '2级', levelClass: 'level-2', status: '已完成', statusClass: 'success', evalTime: '2024-04-05 15:20' },
  { id: 'EVAL-20240604-004', name: '船用LNG/柴油双燃料发动机（中速机）能效评估', device: '船用LNG/柴油双燃料发动机（中速机）', deviceClass: '船用LNG/柴油双燃料发动机（中速机）', model: 'GB/T 13006-2013', score: 65, level: '3级', levelClass: 'level-3', status: '评估中', statusClass: 'running', evalTime: '进行中' },
  { id: 'EVAL-20240601-005', name: '船用甲醇/柴油双燃料发动机（低速机）能效评估', device: '船用甲醇/柴油双燃料发动机（低速机）', deviceClass: '船用甲醇/柴油双燃料发动机（低速机）', model: 'IMO EEXI标准', score: null, level: '待评估', levelClass: 'pending', status: '待执行', statusClass: 'warning', evalTime: '2024-04-01 16:00' }
])

const totalTasks = computed(() => filteredTasks.value.length)

const filteredTasks = computed(() => {
  let result = tasks.value
  if (statusFilter.value) {
    result = result.filter(task => task.statusClass === statusFilter.value)
  }
  if (deviceTypeFilter.value) {
    result = result.filter(task => task.deviceClass === deviceTypeFilter.value)
  }
  if (efficiencyFilter.value) {
    result = result.filter(task => task.levelClass === `level-${efficiencyFilter.value}`)
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

const getStatusTagType = (statusClass) => {
  if (statusClass === 'success') return 'success'
  if (statusClass === 'running') return 'primary'
  if (statusClass === 'warning') return 'warning'
  return 'info'
}

const handleSearch = () => {
  // 搜索功能
}

const viewTask = (task) => {
  // 查看任务
}

const downloadReport = (task) => {
  // 下载报告
}

const resetPage = () => { 
  currentPage.value = 1 
}

const resetFilters = () => {
  deviceTypeFilter.value = ''
  efficiencyFilter.value = ''
  workingConditionFilter.value = ''
  statusFilter.value = ''
  searchQuery.value = ''
  currentPage.value = 1
}

// 添加新任务的方法
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
    model: taskData.evalModel || 'ISO 15550:2016',
    score: taskData.score,
    level: taskData.level,
    levelClass: taskData.levelClass,
    status: '已完成',
    statusClass: 'success',
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

const closeComparison = () => {
  showComparison.value = false
}

// 获取所有任务数据（用于同步到历史数据）
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
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.table-controls {
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

.task-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  line-height: 1.5;
}

.task-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.task-id {
  font-size: 12px;
  color: #666;
}

.device-tag {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
}

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