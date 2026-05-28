<template>
  <div class="evaluation-overview">
    <!-- 核心功能卡片 -->
    <el-row :gutter="20" class="overview-grid">
      <!-- 已评估设备 -->
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <el-icon :size="28"><DataAnalysis /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">已评估设备</div>
              <div class="stat-value">368</div>
              <div class="stat-desc">覆盖14类船用设备</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 本月评估 -->
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
              <el-icon :size="28"><Calendar /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">本月评估</div>
              <div class="stat-value">45</div>
              <div class="stat-desc">较上月增长12%</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 平均能效基值 -->
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
              <el-icon :size="28"><TrendCharts /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">平均能效基值</div>
              <div class="stat-value">82.6</div>
              <div class="stat-desc">整体能效水平良好</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <!-- 设备类型覆盖 -->
      <el-col :span="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
              <el-icon :size="28"><Setting /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-label">设备类型覆盖</div>
              <div class="stat-value">14</div>
              <div class="stat-desc">支持全部设备类型</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 能效等级分布 -->
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card shadow="hover" class="chart-card">
          <template #header>
            <div class="card-header">
              <h3 class="card-title">能效等级分布</h3>
              <el-select 
                v-model="selectedDeviceType" 
                placeholder="全部设备类型" 
                clearable 
                size="small"
                style="width: 220px"
                @change="updateChart"
              >
                <el-option label="全部设备类型" value="" />
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
            </div>
          </template>
          <div class="chart-container">
            <canvas ref="levelChart"></canvas>
          </div>
          <div class="level-legend">
            <el-tag type="success" size="large" effect="dark">1级 (45%)</el-tag>
            <el-tag type="warning" size="large" effect="dark">2级 (35%)</el-tag>
            <el-tag type="danger" size="large" effect="dark">3级 (20%)</el-tag>
          </div>
        </el-card>
      </el-col>

      <!-- 快速开始 -->
      <el-col :span="12">
        <el-card shadow="hover" class="quick-start-card">
          <template #header>
            <div class="card-header">
              <h3 class="card-title">快速开始评估</h3>
              <el-icon><VideoPlay /></el-icon>
            </div>
          </template>
          <div class="quick-start-content">
            <div class="step-list">
              <div class="step-item">
                <div class="step-number">1</div>
                <div class="step-text">
                  <div class="step-title">选择样机模型</div>
                  <div class="step-desc">选择要评估的样机模型</div>
                </div>
              </div>
              <div class="step-item">
                <div class="step-number">2</div>
                <div class="step-text">
                  <div class="step-title">选择能效数据</div>
                  <div class="step-desc">选择已有数据或上传新数据</div>
                </div>
              </div>
              <div class="step-item">
                <div class="step-number">3</div>
                <div class="step-text">
                  <div class="step-title">自动计算评估</div>
                  <div class="step-desc">根据标准公式快速计算</div>
                </div>
              </div>
              <div class="step-item">
                <div class="step-number">4</div>
                <div class="step-text">
                  <div class="step-title">查看评估结果</div>
                  <div class="step-desc">获取能效等级和指标</div>
                </div>
              </div>
            </div>
            <el-button type="primary" size="default" class="start-btn" @click="$emit('navigate', 'device-select')">
              <el-icon><VideoPlay /></el-icon>
              开始评估
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { DataAnalysis, Calendar, TrendCharts, PieChart, Setting, VideoPlay } from '@element-plus/icons-vue'
import { Chart, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js'

Chart.register(ArcElement, Tooltip, Legend, DoughnutController)

const levelChart = ref(null)
const selectedDeviceType = ref('')
let chartInstance = null

defineEmits(['navigate'])

// 模拟数据：按设备类型统计能效等级分布
const deviceData = {
  '': { level1: 165, level2: 129, level3: 74 }, // 全部
  '船用柴油发动机（低速机）': { level1: 45, level2: 38, level3: 17 },
  '船用柴油发动机（中速机）': { level1: 32, level2: 28, level3: 12 },
  '船用LNG/柴油双燃料发动机（低速机）': { level1: 28, level2: 22, level3: 10 },
  '船用碟式分离机': { level1: 20, level2: 15, level3: 8 },
  '船用压载水处理设备': { level1: 18, level2: 12, level3: 9 },
  '船用起锚机': { level1: 12, level2: 8, level3: 5 },
  '船用吊机': { level1: 10, level2: 6, level3: 4 }
}

const updateChart = () => {
  if (!chartInstance) return
  
  const data = deviceData[selectedDeviceType.value] || deviceData['']
  const total = data.level1 + data.level2 + data.level3
  
  chartInstance.data.datasets[0].data = [data.level1, data.level2, data.level3]
  chartInstance.update()
  
  // 更新图例
  const legendItems = document.querySelectorAll('.level-legend .el-tag')
  if (legendItems.length >= 3) {
    legendItems[0].textContent = `1级 (${((data.level1 / total) * 100).toFixed(0)}%)`
    legendItems[1].textContent = `2级 (${((data.level2 / total) * 100).toFixed(0)}%)`
    legendItems[2].textContent = `3级 (${((data.level3 / total) * 100).toFixed(0)}%)`
  }
}

onMounted(() => {
  if (levelChart.value) {
    chartInstance = new Chart(levelChart.value, {
      type: 'doughnut',
      data: {
        labels: ['1级', '2级', '3级'],
        datasets: [{
          data: [165, 129, 74],
          backgroundColor: ['#67c23a', '#e6a23c', '#f56c6c'],
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
.evaluation-overview {
  width: 100%;
}

.overview-grid {
  margin-bottom: 0;
}

/* 统计卡片 */
.stat-card {
  border: none;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.stat-info {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #303133;
  line-height: 1;
  margin-bottom: 8px;
}

.stat-desc {
  font-size: 12px;
  color: #909399;
}

/* 图表卡片 */
.chart-card,
.quick-start-card {
  border-radius: 12px;
  height: 480px;
  display: flex;
  flex-direction: column;
}

/* 强制卡片内容区域高度一致 */
.chart-card :deep(.el-card__body),
.quick-start-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

/* 降低卡片头部高度 */
.chart-card :deep(.el-card__header),
.quick-start-card :deep(.el-card__header) {
  padding: 12px 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.card-header .el-icon {
  font-size: 20px;
  color: #909399;
}

.chart-container {
  height: 280px;
  margin: 20px 0;
}

.level-legend {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding-top: 16px;
  margin-top: auto;
}

/* 快速开始卡片 */
.quick-start-content {
  padding: 8px 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.step-list {
  margin-bottom: 16px;
  flex: 1;
}

.step-item {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.3s;
}

.step-item:hover {
  background-color: #f5f7fa;
}

.step-number {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 13px;
  flex-shrink: 0;
}

.step-text {
  flex: 1;
}

.step-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 2px;
}

.step-desc {
  font-size: 12px;
  color: #909399;
}

.start-btn {
  width: 100%;
  height: 40px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 8px;
  margin-top: auto;
}

.start-btn .el-icon {
  margin-right: 8px;
}

/* 响应式 */
@media (max-width: 768px) {
  .chart-container {
    height: 200px;
  }
}
</style>