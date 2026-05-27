<template>
  <el-card class="overview-section">
    <template #header>
      <div class="section-header">
        <h3>评估概览</h3>
      </div>
    </template>

    <el-row :gutter="16" class="overview-grid" align="stretch">
      <el-col :xs="24" :sm="12" :md="6" :lg="4">
        <el-card shadow="hover" class="stat-card-modern">
          <div class="stat-icon-wrapper">
            <el-icon :size="24" color="#409eff"><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">总评估任务</div>
            <div class="stat-value">368</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6" :lg="4">
        <el-card shadow="hover" class="stat-card-modern">
          <div class="stat-icon-wrapper">
            <el-icon :size="24" color="#67c23a"><Calendar /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">本月评估任务</div>
            <div class="stat-value">45</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6" :lg="4">
        <el-card shadow="hover" class="stat-card-modern">
          <div class="stat-icon-wrapper">
            <el-icon :size="24" color="#e6a23c"><TrendCharts /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">平均能效得分</div>
            <div class="stat-value">82.6</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="12" :md="6" :lg="4">
        <el-card shadow="hover" class="stat-card-modern">
          <div class="stat-icon-wrapper">
            <el-icon :size="24" color="#f56c6c"><Clock /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-label">进行中任务</div>
            <div class="stat-value">12</div>
            <div class="stat-sub">待执行: 8</div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="24" :md="12" :lg="8">
        <el-card shadow="hover" class="chart-card">
          <div class="chart-header">
            <span class="chart-title">能效等级分布</span>
            <el-icon><PieChart /></el-icon>
          </div>
          <div class="chart-container">
            <canvas ref="levelChart"></canvas>
          </div>
          <div class="level-legend">
            <el-tag type="success" size="small">1级 (45%)</el-tag>
            <el-tag type="warning" size="small">2级 (35%)</el-tag>
            <el-tag type="danger" size="small">3级 (20%)</el-tag>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Document, Calendar, TrendCharts, PieChart, Clock } from '@element-plus/icons-vue'
import { Chart, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js'

Chart.register(ArcElement, Tooltip, Legend, DoughnutController)

const levelChart = ref(null)

onMounted(() => {
  if (levelChart.value) {
    new Chart(levelChart.value, {
      type: 'doughnut',
      data: {
        labels: ['1级', '2级', '3级'],
        datasets: [{
          data: [165, 129, 74],
          backgroundColor: ['#22c55e', '#eab308', '#ef4444'],
          borderWidth: 0,
          cutout: '65%'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0)
                const value = context.raw
                const percentage = ((value / total) * 100).toFixed(1)
                return `${context.label}: ${value} (${percentage}%)`
              }
            }
          }
        }
      }
    })
  }
})
</script>

<style scoped>
.overview-section {
  margin-bottom: 24px;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.stat-card-modern {
  height: 100%;
  border: none;
  border-left: 4px solid;
  transition: all 0.3s ease;
  cursor: pointer;
  padding: 20px !important;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.overview-grid .el-col:nth-child(1) .stat-card-modern {
  border-left-color: #409eff;
}

.overview-grid .el-col:nth-child(2) .stat-card-modern {
  border-left-color: #67c23a;
}

.overview-grid .el-col:nth-child(3) .stat-card-modern {
  border-left-color: #e6a23c;
}

.overview-grid .el-col:nth-child(4) .stat-card-modern {
  border-left-color: #f56c6c;
}

.stat-card-modern:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.stat-icon-wrapper {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  background: linear-gradient(135deg, rgba(64, 158, 255, 0.1), rgba(64, 158, 255, 0.05));
}

.overview-grid .el-col:nth-child(2) .stat-icon-wrapper {
  background: linear-gradient(135deg, rgba(103, 194, 58, 0.1), rgba(103, 194, 58, 0.05));
}

.overview-grid .el-col:nth-child(3) .stat-icon-wrapper {
  background: linear-gradient(135deg, rgba(230, 162, 60, 0.1), rgba(230, 162, 60, 0.05));
}

.overview-grid .el-col:nth-child(4) .stat-icon-wrapper {
  background: linear-gradient(135deg, rgba(245, 108, 108, 0.1), rgba(245, 108, 108, 0.05));
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-bottom: 8px;
  font-weight: 500;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #303133;
  line-height: 1;
}

.stat-sub {
  font-size: 12px;
  color: #c0c4cc;
  margin-top: 6px;
}

.chart-card {
  height: 100%;
  border: none;
  padding: 20px !important;
  display: flex;
  flex-direction: column;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.chart-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.chart-container {
  height: 180px;
  margin-bottom: 16px;
  flex: 1;
}

.level-legend {
  display: flex;
  justify-content: space-around;
  gap: 12px;
  flex-shrink: 0;
}

/* 响应式 */
@media (max-width: 768px) {
  .chart-container {
    height: 120px;
  }
}
</style>