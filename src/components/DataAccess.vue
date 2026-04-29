<template>
  <div class="data-access-container">
    <div class="overview-section">
      <div class="section-header">
        <h3>数据接入概览</h3>
        <div class="section-actions">
          <button class="btn btn-secondary" @click="refreshData">刷新</button>
          <button class="btn btn-secondary" @click="exportReport">导出报告</button>
          <button class="btn btn-primary" @click="createNewAccess">+ 新建接入</button>
        </div>
      </div>

      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">总接入数据量</span>
            <span class="stat-icon">📊</span>
          </div>
          <div class="stat-value">2.86 TB</div>
          <div class="stat-footer">
            <span class="stat-change">+12.5% 较上月</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">接入任务数</span>
            <span class="stat-icon">📋</span>
          </div>
          <div class="stat-value">128</div>
          <div class="stat-footer">
            <span class="stat-status">运行中: 87 | 异常: 5</span>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">数据源类型</span>
            <span class="stat-icon">📁</span>
          </div>
          <div class="stat-value">8类</div>
          <div class="stat-footer">
            <div class="data-type-tags">
              <span class="tag">CSV</span>
              <span class="tag">数据库</span>
              <span class="tag">实时采集</span>
              <span class="tag">+5</span>
            </div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">平均数据质量</span>
            <span class="stat-icon">✅</span>
          </div>
          <div class="stat-value">96.8%</div>
          <div class="stat-footer">
            <div class="quality-bar">
              <div class="quality-fill" :style="{ width: '96.8%' }"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="chart-grid">
      <div class="chart-section">
        <div class="section-header">
          <h3>数据接入趋势</h3>
          <div class="chart-controls">
            <button class="btn btn-sm" :class="{ active: trendPeriod === '7d' }" @click="trendPeriod = '7d'">近7天</button>
            <button class="btn btn-sm" :class="{ active: trendPeriod === '30d' }" @click="trendPeriod = '30d'">近30天</button>
            <button class="btn btn-sm" :class="{ active: trendPeriod === '90d' }" @click="trendPeriod = '90d'">近90天</button>
          </div>
        </div>
        <div class="chart-container">
          <div class="chart-placeholder trend-chart">
            <p>数据接入趋势图表</p>
          </div>
        </div>
      </div>

      <div class="chart-section">
        <div class="section-header">
          <h3>数据源类型分布</h3>
        </div>
        <div class="chart-container">
          <div class="chart-placeholder pie-chart">
            <p>数据源类型分布图表</p>
          </div>
          <div class="chart-legend">
            <div class="legend-item">
              <span class="legend-color" style="background-color: #3498db;"></span>
              <span>CSV/TXT文件</span>
              <span>38%</span>
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background-color: #27ae60;"></span>
              <span>关系数据库</span>
              <span>27%</span>
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background-color: #f39c12;"></span>
              <span>实时采集数据</span>
              <span>15%</span>
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background-color: #9b59b6;"></span>
              <span>时序数据库</span>
              <span>12%</span>
            </div>
            <div class="legend-item">
              <span class="legend-color" style="background-color: #e74c3c;"></span>
              <span>其他格式</span>
              <span>8%</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="table-section">
      <div class="section-header">
        <h3>数据接入任务列表</h3>
        <div class="table-controls">
          <div class="search-box">
            <input type="text" v-model="searchQuery" placeholder="搜索任务名称或ID" @keyup.enter="handleSearch">
            <button class="search-btn" @click="handleSearch">🔍</button>
          </div>
          <select class="filter-select" v-model="statusFilter" @change="filterTasks">
            <option value="">全部状态</option>
            <option value="running">运行中</option>
            <option value="completed">已完成</option>
            <option value="failed">失败</option>
          </select>
        </div>
      </div>
      <div class="table-container">
        <table class="data-table">
          <thead>
            <tr>
              <th>任务名称</th>
              <th>数据源类型</th>
              <th>接入容量</th>
              <th>数据质量</th>
              <th>运行状态</th>
              <th>更新时间</th>
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
              <td>{{ task.type }}</td>
              <td>{{ task.capacity }}</td>
              <td>
                <div class="quality-bar small">
                  <div class="quality-fill" :class="getQualityClass(task.quality)" :style="{ width: task.quality + '%' }"></div>
                </div>
                <span class="quality-text" :class="getQualityClass(task.quality)">{{ task.quality }}%</span>
              </td>
              <td><span class="status" :class="task.statusClass">{{ task.status }}</span></td>
              <td>{{ task.updateTime }}</td>
              <td>
                <button class="btn btn-sm" @click="viewTask(task)">查看</button>
                <button class="btn btn-sm" @click="editTask(task)">编辑</button>
                <button class="btn btn-sm" @click="moreActions(task)">...</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="pagination">
        <span class="pagination-info">显示 1 到 5 条，共 {{ totalTasks }} 条记录</span>
        <div class="pagination-buttons">
          <button class="btn btn-sm" @click="prevPage" :disabled="currentPage === 1">上一页</button>
          <button class="btn btn-sm" v-for="page in visiblePages" :key="page" :class="{ active: page === currentPage }" @click="goToPage(page)">{{ page }}</button>
          <button class="btn btn-sm" @click="nextPage" :disabled="currentPage === totalPages">下一页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const trendPeriod = ref('7d')

const tasks = ref([
  { id: 'TASK-20240701-001', name: '主机燃油消耗数据接入', type: 'CSV/TXT', capacity: '28.6 GB', quality: 99, status: '运行中', statusClass: 'running', updateTime: '2024-07-14 14:25' },
  { id: 'TASK-20240701-002', name: '船舶性能数据库同步', type: '数据库', capacity: '156.2 GB', quality: 95, status: '运行中', statusClass: 'running', updateTime: '2024-07-14 14:10' },
  { id: 'TASK-20240702-003', name: '实时工况数据采集', type: '实时采集', capacity: '89.3 GB', quality: 89, status: '异常', statusClass: 'warning', updateTime: '2024-07-14 13:45' },
  { id: 'TASK-20240704-003', name: '历史数据导入', type: '时序数据库', capacity: '342.8 GB', quality: 92, status: '同步中', statusClass: 'running', updateTime: '2024-07-14 12:30' },
  { id: 'TASK-20240705-005', name: '第三方系统数据对接', type: 'API接口', capacity: '15.7 GB', quality: 76, status: '失败', statusClass: 'error', updateTime: '2024-07-14 10:15' }
])

const totalTasks = computed(() => tasks.value.length)
const totalPages = computed(() => Math.ceil(totalTasks.value / 5))
const filteredTasks = computed(() => {
  let result = tasks.value
  if (statusFilter.value) {
    result = result.filter(task => task.statusClass === statusFilter.value)
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

const getQualityClass = (quality) => {
  if (quality >= 95) return ''
  if (quality >= 80) return 'warning'
  return 'error'
}

const refreshData = () => alert('刷新数据')
const exportReport = () => alert('导出报告')
const createNewAccess = () => alert('新建接入')
const handleSearch = () => alert(`搜索：${searchQuery.value}`)
const filterTasks = () => alert(`筛选：${statusFilter.value}`)
const viewTask = (task) => alert(`查看任务：${task.name}`)
const editTask = (task) => alert(`编辑任务：${task.name}`)
const moreActions = (task) => alert(`更多操作：${task.name}`)
const prevPage = () => { if (currentPage.value > 1) currentPage.value-- }
const nextPage = () => { if (currentPage.value < totalPages.value) currentPage.value++ }
const goToPage = (page) => { currentPage.value = page }
</script>

<style scoped>
.data-access-container {
  padding: 20px;
  height: calc(100vh - 120px);
  overflow-y: auto;
}



/* 概览区域样式 */
.overview-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
  border: 1px solid #e2e8f0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.section-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

/* 统计卡片样式 */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.stat-card {
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
  border-color: #93c5fd;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.stat-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.stat-icon {
  font-size: 20px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.stat-footer {
  font-size: 12px;
  color: #666;
}

.stat-change {
  color: #27ae60;
  font-weight: 500;
}

.stat-status {
  color: #666;
}

.data-type-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 4px;
}

.tag {
  background: #e0f2fe;
  color: #2563eb;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.quality-bar {
  height: 8px;
  background: #e2e8f0;
  border-radius: 4px;
  overflow: hidden;
  margin-top: 4px;
}

.quality-fill {
  height: 100%;
  background: #27ae60;
  border-radius: 4px;
  transition: width 0.5s ease;
}

/* 图表网格样式 */
.chart-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.chart-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
  border: 1px solid #e2e8f0;
}

.chart-controls {
  display: flex;
  gap: 8px;
  align-items: center;
}

.chart-container {
  margin-top: 16px;
}

.chart-placeholder {
  height: 300px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  font-size: 14px;
}

.trend-chart {
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
}

.pie-chart {
  background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
}

.chart-legend {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #666;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
}

.legend-item span:last-child {
  margin-left: auto;
  font-weight: 500;
  color: #333;
}

/* 表格区域样式 */
.table-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
  border: 1px solid #e2e8f0;
}

.table-controls {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box input {
  padding: 8px 32px 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  width: 200px;
  transition: all 0.3s ease;
}

.search-box input:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-color: #93c5fd;
}

.search-box input:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  outline: none;
}

.search-btn {
  position: absolute;
  right: 8px;
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  font-size: 14px;
  transition: color 0.3s ease;
}

.search-btn:hover {
  color: #2563eb;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.filter-select:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  border-color: #93c5fd;
}

.filter-select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  outline: none;
}

.table-container {
  margin-top: 16px;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.data-table th {
  background: #f8fafc;
  padding: 12px 16px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e2e8f0;
}

.data-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  color: #666;
}

.data-table tr:hover {
  background: #f8fafc;
}

.task-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.task-name {
  font-weight: 500;
  color: #333;
}

.task-id {
  font-size: 12px;
  color: #94a3b8;
}

.quality-bar.small {
  height: 4px;
  margin-bottom: 4px;
}

.quality-text {
  font-size: 12px;
  font-weight: 500;
}

.quality-text.warning {
  color: #f59e0b;
}

.quality-text.error {
  color: #ef4444;
}

.status {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status.running {
  background: #d1fae5;
  color: #065f46;
}

.status.completed {
  background: #dbeafe;
  color: #1e40af;
}

.status.failed {
  background: #fee2e2;
  color: #b91c1c;
}

.status.warning {
  background: #fef3c7;
  color: #92400e;
}

.pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  font-size: 14px;
  color: #666;
}

.pagination-info {
  flex: 1;
}

.pagination-buttons {
  display: flex;
  gap: 8px;
  align-items: center;
}

/* 按钮样式 */
.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
  box-shadow: 0 1px 3px 0 rgba(37, 99, 235, 0.4);
}

.btn-primary:hover {
  background-color: #1d4ed8;
  box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
  transform: translateY(-1px);
}

.btn-secondary {
  background-color: #f1f5f9;
  color: #334155;
  border: 1px solid #e2e8f0;
}

.btn-secondary:hover {
  background-color: #e2e8f0;
  border-color: #cbd5e1;
  transform: translateY(-1px);
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 4px;
}

.btn-sm.active {
  background-color: #2563eb;
  color: white;
  border-color: #2563eb;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .chart-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-cards {
    grid-template-columns: 1fr;
  }
  
  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .section-actions {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .table-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .search-box input {
    width: 100%;
  }
  
  .pagination {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .pagination-buttons {
    width: 100%;
    justify-content: center;
  }
}
</style>