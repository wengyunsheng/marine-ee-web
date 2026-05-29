<template>
  <div class="visualization-container">
    <ThreeDModel 
      ref="threeDModelRef" 
      :model-parts="modelParts" 
      @part-click="handlePartClick"
    />

    <!-- 部件数据弹窗 -->
    <el-dialog
      v-model="showPartDialog"
      :title="currentPartData?.name || '部件详情'"
      width="700px"
      :close-on-click-modal="false"
      append-to-body
      :z-index="10001"
    >
      <div v-if="currentPartData" class="part-detail">
        <!-- 基本信息 -->
        <el-descriptions :column="2" border>
          <el-descriptions-item label="部件名称">{{ currentPartData.name }}</el-descriptions-item>
          <el-descriptions-item label="部件类型">{{ currentPartData.type }}</el-descriptions-item>
          <el-descriptions-item label="能效等级">
            <el-tag :type="getLevelType(currentPartData.efficiencyLevel)" size="small">
              {{ currentPartData.efficiencyLevel }}级
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="能效评分">{{ currentPartData.efficiencyScore }}</el-descriptions-item>
        </el-descriptions>

        <!-- 工况数据 -->
        <div class="section-title">工况数据</div>
        <el-table :data="currentPartData.conditions" border stripe max-height="250">
          <el-table-column prop="load" label="负荷" width="100" />
          <el-table-column prop="currentValue" label="当前值" width="120" />
          <el-table-column prop="baselineValue" label="基准值" width="120" />
          <el-table-column prop="difference" label="差异" width="100">
            <template #default="{ row }">
              <span :class="row.difference >= 0 ? 'positive' : 'negative'">
                {{ row.difference >= 0 ? '+' : '' }}{{ row.difference }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="状态">
            <template #default="{ row }">
              <el-tag :type="row.status === '达标' ? 'success' : row.status === '待改进' ? 'warning' : 'danger'" size="small">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>

        <!-- 能效计算结果 -->
        <div class="section-title">能效计算结果</div>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="能效指标计算值">{{ currentPartData.calculatedValue }}</el-descriptions-item>
          <el-descriptions-item label="适用标准">{{ currentPartData.standard }}</el-descriptions-item>
          <el-descriptions-item label="1级基准">{{ currentPartData.baselineLevel1 }}</el-descriptions-item>
          <el-descriptions-item label="2级基准">{{ currentPartData.baselineLevel2 }}</el-descriptions-item>
          <el-descriptions-item label="3级基准">{{ currentPartData.baselineLevel3 }}</el-descriptions-item>
          <el-descriptions-item label="距1级基准差距">
            <span :class="currentPartData.gapToLevel1 >= 0 ? 'positive' : 'negative'">
              {{ currentPartData.gapToLevel1 >= 0 ? '+' : '' }}{{ currentPartData.gapToLevel1 }}
            </span>
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <el-button @click="showPartDialog = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ThreeDModel from './components/ThreeDModel.vue'

const threeDModelRef = ref(null)
const showPartDialog = ref(false)
const currentPartData = ref(null)

// 部件数据（包含工况数据和能效计算结果）
const modelParts = ref([
  {
    id: 'engine',
    name: '发动机主体',
    type: '船用柴油发动机（低速机）',
    efficiencyLevel: '1',
    efficiencyScore: 98,
    calculatedValue: 57.2,
    standard: 'ISO 15550:2016',
    baselineLevel1: 57.14,
    baselineLevel2: 54.02,
    baselineLevel3: 49.93,
    gapToLevel1: 0.06,
    conditions: [
      { load: '25%', currentValue: 163.8, baselineValue: 165.0, difference: -1.2, status: '达标' },
      { load: '50%', currentValue: 156.7, baselineValue: 158.0, difference: -1.3, status: '达标' },
      { load: '75%', currentValue: 154.2, baselineValue: 156.0, difference: -1.8, status: '达标' },
      { load: '100%', currentValue: 161.5, baselineValue: 162.0, difference: -0.5, status: '达标' }
    ],
    position: { top: '15%', left: '20%' }
  },
  {
    id: 'fuel',
    name: '燃料系统',
    type: 'LNG双燃料低速机',
    efficiencyLevel: '2',
    efficiencyScore: 76,
    calculatedValue: 52.3,
    standard: 'ISO 15550:2016',
    baselineLevel1: 57.14,
    baselineLevel2: 54.02,
    baselineLevel3: 49.93,
    gapToLevel1: -4.84,
    conditions: [
      { load: '25%', currentValue: 163.8, baselineValue: 165.0, difference: -1.2, status: '达标' },
      { load: '50%', currentValue: 156.7, baselineValue: 158.0, difference: -1.3, status: '达标' },
      { load: '75%', currentValue: 157.8, baselineValue: 156.0, difference: 1.8, status: '待改进' },
      { load: '100%', currentValue: 164.6, baselineValue: 162.0, difference: 2.6, status: '待改进' }
    ],
    position: { top: '45%', right: '15%' }
  },
  {
    id: 'emission',
    name: '排放出口',
    type: 'LNG双燃料中速机',
    efficiencyLevel: '3',
    efficiencyScore: 65,
    calculatedValue: 48.5,
    standard: 'ISO 15550:2016',
    baselineLevel1: 57.14,
    baselineLevel2: 54.02,
    baselineLevel3: 49.93,
    gapToLevel1: -8.64,
    conditions: [
      { load: '25%', currentValue: 172.3, baselineValue: 165.0, difference: 7.3, status: '未达标' },
      { load: '50%', currentValue: 165.8, baselineValue: 158.0, difference: 7.8, status: '未达标' },
      { load: '75%', currentValue: 166.2, baselineValue: 156.0, difference: 10.2, status: '未达标' },
      { load: '100%', currentValue: 171.5, baselineValue: 162.0, difference: 9.5, status: '未达标' }
    ],
    position: { bottom: '20%', left: '25%' }
  },
  {
    id: 'auxiliary',
    name: '辅助系统',
    type: '船用柴油发动机（中速机）',
    efficiencyLevel: '1',
    efficiencyScore: 93,
    calculatedValue: 56.8,
    standard: 'ISO 15550:2016',
    baselineLevel1: 57.14,
    baselineLevel2: 54.02,
    baselineLevel3: 49.93,
    gapToLevel1: -0.34,
    conditions: [
      { load: '25%', currentValue: 164.2, baselineValue: 165.0, difference: -0.8, status: '达标' },
      { load: '50%', currentValue: 157.3, baselineValue: 158.0, difference: -0.7, status: '达标' },
      { load: '75%', currentValue: 155.1, baselineValue: 156.0, difference: -0.9, status: '达标' },
      { load: '100%', currentValue: 162.3, baselineValue: 162.0, difference: 0.3, status: '达标' }
    ],
    position: { bottom: '30%', right: '20%' }
  }
])

const handlePartClick = (partId) => {
  const part = modelParts.value.find(p => p.id === partId)
  if (part) {
    currentPartData.value = part
    showPartDialog.value = true
  }
}

const getLevelType = (level) => {
  if (level === '1') return 'success'
  if (level === '2') return ''
  return 'danger'
}
</script>

<style scoped>
.visualization-container {
  width: 100%;
  height: 100%;
  min-height: calc(100vh - 120px);
  background-color: #0f172a;
}

.part-detail {
  padding: 0;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 24px 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
}

.section-title:first-child {
  margin-top: 0;
}

.positive {
  color: #67c23a;
  font-weight: 600;
}

.negative {
  color: #f56c6c;
  font-weight: 600;
}
</style>
