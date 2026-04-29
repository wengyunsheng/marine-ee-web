<template>
  <div class="table-section">
    <div class="section-header">
      <h3>评估任务列表</h3>
      <div class="table-controls">
        <button class="btn btn-success" @click="showComparison = true">对比分析</button>
        <div class="search-box">
          <input type="text" v-model="searchQuery" placeholder="搜索任务名称或ID" @keyup.enter="handleSearch">
          <button class="search-btn" @click="handleSearch">🔍</button>
        </div>
        <select class="filter-select" v-model="deviceTypeFilter" @change="filterTasks">
          <option value="">设备：全部</option>
          <option value="diesel-low">船用柴油发动机（低速机）</option>
          <option value="diesel-medium">船用柴油发动机（中速机）</option>
          <option value="lng-diesel-low">船用LNG/柴油双燃料发动机（低速机）</option>
          <option value="lng-diesel-medium">船用LNG/柴油双燃料发动机（中速机）</option>
          <option value="methanol-diesel-low">船用甲醇/柴油双燃料发动机（低速机）</option>
          <option value="methanol-diesel-medium">船用甲醇/柴油双燃料发动机（中速机）</option>
        </select>
        <select class="filter-select" v-model="efficiencyFilter" @change="filterTasks">
          <option value="">能效等级：全部</option>
          <option value="1">1级</option>
          <option value="2">2级</option>
          <option value="3">3级</option>
        </select>
        <select class="filter-select" v-model="statusFilter" @change="filterTasks">
          <option value="">全部状态</option>
          <option value="completed">已完成</option>
          <option value="running">评估中</option>
          <option value="pending">待执行</option>
        </select>
        <button class="btn btn-secondary" @click="resetFilters">重置筛选</button>
      </div>
    </div>
    <div class="table-container">
      <table class="data-table">
        <thead>
          <tr>
            <th>任务名称</th>
            <th>设备类型</th>
            <th>评估模型</th>
            <th>能效得分</th>
            <th>能效等级</th>
            <th>状态</th>
            <th>评估时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="task in filteredTasks" :key="task.id">
            <td>
              <div class="task-info">
                <div class="task-name">{{ task.name }}</div>
                <div class="task-id">{{ task.id }}</div>
              </div>
            </td>
            <td><span class="device-tag" :class="task.deviceClass">{{ task.device }}</span></td>
            <td>{{ task.model }}</td>
            <td>
              <span class="score-text" :class="getScoreClass(task.score)">{{ task.score || '-' }}</span>
            </td>
            <td><span class="level-tag" :class="task.levelClass">{{ task.level }}</span></td>
            <td><span class="status" :class="task.statusClass">{{ task.status }}</span></td>
            <td>{{ task.evalTime }}</td>
            <td class="action-buttons">
              <button class="btn btn-sm btn-info" @click="viewTask(task)">查看</button>
              <button class="btn btn-sm btn-warning" @click="downloadReport(task)">下载</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="pagination-container">
      <div class="pagination-info">
        共 {{ totalTasks }} 条记录，第 {{ currentPage }} / {{ totalPages }} 页
      </div>
      <div class="pagination">
        <button 
          class="pagination-btn" 
          :disabled="currentPage === 1" 
          @click="prevPage"
        >
          上一页
        </button>
        <button 
          v-for="page in visiblePages" 
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
          @click="nextPage"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
  
  <!-- 对比分析弹窗 -->
  <EvalComparisonAnalysis 
    v-if="showComparison" 
    :tasks="tasks" 
    @close="closeComparison" 
  />
</template>

<script setup>
import { ref, computed } from 'vue'
import EvalComparisonAnalysis from './EvalComparisonAnalysis.vue'

const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)

// 多维度筛选变量
const shipTypeFilter = ref('')
const deviceTypeFilter = ref('')
const efficiencyFilter = ref('')
const workingConditionFilter = ref('')

const tasks = ref([
  { id: 'EVAL-20240707-001', name: '船用柴油发动机（低速机）能效评估', device: '船用柴油发动机（低速机）', deviceClass: 'diesel-low', model: 'ISO 15550:2016', score: 89, level: '2级', levelClass: 'level-2', status: '已完成', statusClass: 'success', evalTime: '2024-04-07 13:45' },
  { id: 'EVAL-20240707-002', name: '船用柴油发动机（中速机）能效评估', device: '船用柴油发动机（中速机）', deviceClass: 'diesel-medium', model: 'GB/T 38999-2020', score: 93, level: '1级', levelClass: 'level-1', status: '已完成', statusClass: 'success', evalTime: '2024-04-07 12:30' },
  { id: 'EVAL-20240605-003', name: '船用LNG/柴油双燃料发动机（低速机）能效评估', device: '船用LNG/柴油双燃料发动机（低速机）', deviceClass: 'lng-diesel-low', model: 'TSG G0003-2010', score: 76, level: '2级', levelClass: 'level-2', status: '已完成', statusClass: 'success', evalTime: '2024-04-05 15:20' },
  { id: 'EVAL-20240604-004', name: '船用LNG/柴油双燃料发动机（中速机）能效评估', device: '船用LNG/柴油双燃料发动机（中速机）', deviceClass: 'lng-diesel-medium', model: 'GB/T 13006-2013', score: 65, level: '3级', levelClass: 'level-3', status: '评估中', statusClass: 'running', evalTime: '进行中' },
  { id: 'EVAL-20240601-005', name: '船用甲醇/柴油双燃料发动机（低速机）能效评估', device: '船用甲醇/柴油双燃料发动机（低速机）', deviceClass: 'methanol-diesel-low', model: 'IMO EEXI标准', score: null, level: '待评估', levelClass: 'pending', status: '待执行', statusClass: 'warning', evalTime: '2024-04-01 16:00' }
])

const totalTasks = computed(() => tasks.value.length)
const totalPages = computed(() => Math.ceil(totalTasks.value / 5))
const filteredTasks = computed(() => {
  let result = tasks.value
  if (statusFilter.value) {
    result = result.filter(task => task.statusClass === statusFilter.value)
  }
  if (deviceTypeFilter.value) {
    result = result.filter(task => task.deviceClass === deviceTypeFilter.value)
  }
  if (efficiencyFilter.value) {
    result = result.filter(task => task.levelClass === efficiencyFilter.value)
  }
  return result.slice((currentPage.value - 1) * 5, currentPage.value * 5)
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const getScoreClass = (score) => {
  if (!score) return ''
  if (score >= 85) return 'excellent'
  if (score >= 70) return 'good'
  return 'poor'
}

const handleSearch = () => alert(`搜索：${searchQuery.value}`)
const filterTasks = () => alert(`筛选：${statusFilter.value}`)
const viewTask = (task) => alert(`查看任务：${task.name}`)
const downloadReport = (task) => alert(`下载报告：${task.name}`)
const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }
const goToPage = (page) => { currentPage.value = page }

const resetFilters = () => {
  shipTypeFilter.value = ''
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
  justify-content: space-between;
  align-items: center;
  padding: 16px;
}

.pagination-info {
  font-size: 14px;
  color: #666;
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