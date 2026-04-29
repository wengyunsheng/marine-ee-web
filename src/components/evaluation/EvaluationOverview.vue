<template>
  <div class="overview-section">
    <div class="section-header">
      <h3>评估概览</h3>
    </div>

    <div class="overview-grid">
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">总评估任务</span>
            <span class="stat-icon">📋</span>
          </div>
          <div class="stat-value">368</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">本月评估任务</span>
            <span class="stat-icon">📅</span>
          </div>
          <div class="stat-value">45</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">平均能效得分</span>
            <span class="stat-icon">📊</span>
          </div>
          <div class="stat-value">82.6</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <span class="stat-label">进行中任务</span>
            <span class="stat-icon">⏳</span>
          </div>
          <div class="stat-value task-in-progress">12</div>
          <div class="stat-sub">待执行: 8</div>
        </div>
        <div class="stat-card chart-card">
          <div class="stat-header">
            <span class="stat-label">能效等级分布</span>
            <span class="stat-icon">🎯</span>
          </div>
          <div class="chart-container">
            <canvas ref="levelChart"></canvas>
          </div>
          <div class="level-legend">
            <span class="legend-item"><span class="legend-dot level-1"></span>1级 (45%)</span>
            <span class="legend-item"><span class="legend-dot level-2"></span>2级 (35%)</span>
            <span class="legend-item"><span class="legend-dot level-3"></span>3级 (20%)</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
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

.stats-cards {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.stat-card {
  flex: 1;
  min-width: 200px;
  background-color: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.stat-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
  transform: translateY(-2px);
}

.stat-card.chart-card {
  min-width: 280px;
  flex: 1.2;
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
  font-size: 16px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.stat-value.task-in-progress {
  color: #3b82f6;
}

.stat-sub {
  font-size: 12px;
  color: #9ca3af;
}

.chart-container {
  height: 120px;
  margin-bottom: 12px;
}

.level-legend {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.legend-item {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #666;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 8px;
}

.legend-dot.level-1 {
  background-color: #22c55e;
}

.legend-dot.level-2 {
  background-color: #eab308;
}

.legend-dot.level-3 {
  background-color: #ef4444;
}

.overview-grid {
  margin-top: 20px;
}

@media (max-width: 768px) {
  .stats-cards {
    flex-direction: column;
  }
  
  .stat-card {
    min-width: 100%;
  }
}
</style>