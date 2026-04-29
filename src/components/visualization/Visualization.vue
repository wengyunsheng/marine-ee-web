<template>
  <div class="visualization-container">
    <div class="main-layout">
      <div class="left-panel">
        <div class="panel-section">
          <div class="section-header">
            <h3>船舶设备三维可视化</h3>
            <div class="header-actions">
              <button class="btn btn-primary btn-sm" @click="refreshData">刷新数据</button>
            </div>
          </div>
          <ThreeDModel :modelLabels="modelLabels" :selectedId="selectedEquipment" @select="selectEquipment" />
        </div>
      </div>

      <div class="right-panel">
        <EquipmentList :equipmentList="equipmentList" :selectedId="selectedEquipment" @select="selectEquipment" />
        <AnalysisPanel :data="selectedEquipmentData" @viewReport="viewDetailReport" />
        <ValidationPanel :data="selectedEquipmentData" @exportReport="exportValidationReport" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import ThreeDModel from './components/ThreeDModel.vue'
import EquipmentList from './components/EquipmentList.vue'
import AnalysisPanel from './components/AnalysisPanel.vue'
import ValidationPanel from './components/ValidationPanel.vue'

const selectedEquipment = ref('1')

const equipmentList = ref([
  { id: '1', name: '船用柴油发动机（低速机）', score: 98, level: '1', status: 'pass', source: '台架试验' },
  { id: '2', name: '船用柴油发动机（中速机）', score: 93, level: '1', status: 'pass', source: '实船运行' },
  { id: '3', name: 'LNG双燃料低速机', score: 76, level: '2', status: 'warning', source: '台架试验' },
  { id: '4', name: 'LNG双燃料中速机', score: 65, level: '3', status: 'fail', source: '台架试验' },
  { id: '5', name: '甲醇双燃料低速机', score: 85, level: '2', status: 'pass', source: '实船运行' }
])

const equipmentDataMap = ref({
  '1': {
    name: '船用柴油发动机（低速机）',
    level: '1',
    status: 'pass',
    currentValue: 57.2,
    baselineLevel1: 57.14,
    baselineLevel2: 54.02,
    baselineLevel3: 49.93,
    gapToLevel2: 3.18,
    gapToLevel1: 0.06,
    standardNo: 'ISO 15550:2016',
    emissionLevel: 'Tier II',
    powerRange: 'P<1800 kW',
    testCycle: 'E3（推进特性）',
    conditions: [
      { name: '25%', current: 163.8, baseline: 165.0, diff: -1.2 },
      { name: '50%', current: 156.7, baseline: 158.0, diff: -1.3 },
      { name: '75%', current: 154.2, baseline: 156.0, diff: -1.8 },
      { name: '100%', current: 161.5, baseline: 162.0, diff: -0.5 }
    ],
    warningConditions: '',
    validationItems: [
      { item: '能效指标 ≥ 1级基准', result: '57.2>57.14', status: '通过' },
      { item: '能效指标 ≥ 2级基准', result: '57.2>54.02', status: '通过' },
      { item: '能效指标 ≥ 3级基准', result: '57.2>49.93', status: '通过' },
      { item: '各工况数据完整性', result: '齐全', status: '通过' },
      { item: '数据来源可靠性', result: '台架试验', status: '通过' }
    ]
  },
  '2': {
    name: '船用柴油发动机（中速机）',
    level: '1',
    status: 'pass',
    currentValue: 56.8,
    baselineLevel1: 57.14,
    baselineLevel2: 54.02,
    baselineLevel3: 49.93,
    gapToLevel2: 2.78,
    gapToLevel1: -0.34,
    standardNo: 'ISO 15550:2016',
    emissionLevel: 'Tier II',
    powerRange: '1800≤P<7500 kW',
    testCycle: 'E3（推进特性）',
    conditions: [
      { name: '25%', current: 164.2, baseline: 165.0, diff: -0.8 },
      { name: '50%', current: 157.3, baseline: 158.0, diff: -0.7 },
      { name: '75%', current: 155.1, baseline: 156.0, diff: -0.9 },
      { name: '100%', current: 162.3, baseline: 162.0, diff: 0.3 }
    ],
    warningConditions: '100%工况燃油消耗率略高于基准',
    validationItems: [
      { item: '能效指标 ≥ 1级基准', result: '56.8<57.14', status: '未通过' },
      { item: '能效指标 ≥ 2级基准', result: '56.8>54.02', status: '通过' },
      { item: '能效指标 ≥ 3级基准', result: '56.8>49.93', status: '通过' },
      { item: '各工况数据完整性', result: '齐全', status: '通过' },
      { item: '数据来源可靠性', result: '实船运行', status: '通过' }
    ]
  },
  '3': {
    name: 'LNG双燃料低速机',
    level: '2',
    status: 'warning',
    currentValue: 52.3,
    baselineLevel1: 57.14,
    baselineLevel2: 54.02,
    baselineLevel3: 49.93,
    gapToLevel2: -1.72,
    gapToLevel1: -4.84,
    standardNo: 'ISO 15550:2016',
    emissionLevel: 'Tier III',
    powerRange: 'P<1800 kW',
    testCycle: 'E3（推进特性）',
    conditions: [
      { name: '25%', current: 163.8, baseline: 165.0, diff: -1.2 },
      { name: '50%', current: 156.7, baseline: 158.0, diff: -1.3 },
      { name: '75%', current: 157.8, baseline: 156.0, diff: 1.8 },
      { name: '100%', current: 164.6, baseline: 162.0, diff: 2.6 }
    ],
    warningConditions: '75%和100%工况燃油消耗率高于基准',
    validationItems: [
      { item: '能效指标 ≥ 2级基准', result: '52.3<54.02', status: '未通过' },
      { item: '能效指标 ≥ 3级基准', result: '52.3>49.93', status: '通过' },
      { item: '各工况数据完整性', result: '齐全', status: '通过' },
      { item: '数据来源可靠性', result: '台架试验', status: '通过' },
      { item: '参数范围合规', result: '正常', status: '通过' }
    ]
  },
  '4': {
    name: 'LNG双燃料中速机',
    level: '3',
    status: 'fail',
    currentValue: 48.5,
    baselineLevel1: 57.14,
    baselineLevel2: 54.02,
    baselineLevel3: 49.93,
    gapToLevel2: -5.52,
    gapToLevel1: -8.64,
    standardNo: 'ISO 15550:2016',
    emissionLevel: 'Tier III',
    powerRange: '1800≤P<7500 kW',
    testCycle: 'E3（推进特性）',
    conditions: [
      { name: '25%', current: 172.3, baseline: 165.0, diff: 7.3 },
      { name: '50%', current: 165.8, baseline: 158.0, diff: 7.8 },
      { name: '75%', current: 166.2, baseline: 156.0, diff: 10.2 },
      { name: '100%', current: 171.5, baseline: 162.0, diff: 9.5 }
    ],
    warningConditions: '所有工况燃油消耗率均高于基准，需优化',
    validationItems: [
      { item: '能效指标 ≥ 3级基准', result: '48.5<49.93', status: '未通过' },
      { item: '各工况数据完整性', result: '齐全', status: '通过' },
      { item: '数据来源可靠性', result: '台架试验', status: '通过' },
      { item: '参数范围合规', result: '正常', status: '通过' },
      { item: '排放达标验证', result: 'Tier III', status: '通过' }
    ]
  },
  '5': {
    name: '甲醇双燃料低速机',
    level: '2',
    status: 'pass',
    currentValue: 54.8,
    baselineLevel1: 57.14,
    baselineLevel2: 54.02,
    baselineLevel3: 49.93,
    gapToLevel2: 0.78,
    gapToLevel1: -2.34,
    standardNo: 'ISO 15550:2016',
    emissionLevel: 'Tier II',
    powerRange: 'P<1800 kW',
    testCycle: 'E3（推进特性）',
    conditions: [
      { name: '25%', current: 165.1, baseline: 165.0, diff: 0.1 },
      { name: '50%', current: 157.8, baseline: 158.0, diff: -0.2 },
      { name: '75%', current: 155.5, baseline: 156.0, diff: -0.5 },
      { name: '100%', current: 162.8, baseline: 162.0, diff: 0.8 }
    ],
    warningConditions: '',
    validationItems: [
      { item: '能效指标 ≥ 2级基准', result: '54.8>54.02', status: '通过' },
      { item: '能效指标 ≥ 3级基准', result: '54.8>49.93', status: '通过' },
      { item: '各工况数据完整性', result: '齐全', status: '通过' },
      { item: '数据来源可靠性', result: '实船运行', status: '通过' },
      { item: '参数范围合规', result: '正常', status: '通过' }
    ]
  }
})

const selectedEquipmentData = computed(() => {
  if (!selectedEquipment.value) return null
  return equipmentDataMap.value[selectedEquipment.value]
})

const modelLabels = computed(() => [
  { deviceId: '1', title: '发动机主体', value: '转速: 105 rpm', subValue: '功率: 5000 kW', percentage: 98, status: 'pass', position: { top: '15%', left: '20%' } },
  { deviceId: '3', title: '燃料系统', value: '消耗率: 164.6g/kWh', subValue: '效率: 76%', percentage: 76, status: 'warning', position: { top: '45%', right: '15%' } },
  { deviceId: '4', title: '排放出口', value: 'CO₂: 620 ppm', subValue: 'NOx: 12.3 g/kWh', percentage: 65, status: 'fail', position: { bottom: '20%', left: '25%' } },
  { deviceId: '2', title: '辅助系统', value: '温度: 380°C', subValue: '压力: 2.5 MPa', percentage: 93, status: 'pass', position: { bottom: '30%', right: '20%' } }
])

const selectEquipment = (id) => {
  selectedEquipment.value = id
}

const refreshData = () => {
  console.log('刷新数据')
}

const viewDetailReport = () => {
  console.log('查看详细分析报告')
}

const exportValidationReport = () => {
  const data = selectedEquipmentData.value
  if (!data) return
  const item = equipmentList.value.find(e => e.id === selectedEquipment.value)
  const report = `船舶设备能效验证报告

一、设备基本信息
设备名称: ${data.name}
能效等级: ${data.level}级
数据来源: ${item ? item.source : ''}

二、适用标准信息
标准编号: ${data.standardNo}
排放等级: ${data.emissionLevel}
功率区间: ${data.powerRange}
试验循环: ${data.testCycle}

三、能效指标计算结果
能效指标计算值: ${data.currentValue}
1级基准值: ${data.baselineLevel1}
2级基准值: ${data.baselineLevel2}
3级基准值: ${data.baselineLevel3}

四、标准验证结论
验证结果: ${data.status === 'pass' ? '通过' : data.status === 'warning' ? '待改进' : '未达标'}
达到 ${data.level}级 能效标准

五、各工况详细数据与基准对比
工况    当前值   基准值   差异
${data.conditions.map(c => `${c.name}\t${c.current}\t${c.baseline}\t${c.diff >= 0 ? '+' : ''}${c.diff}`).join('\n')}

六、验证明细
${data.validationItems.map(item => `${item.item}: ${item.result} ${item.status === '通过' ? '✓' : '✗'}`).join('\n')}

七、建议措施
${data.status === 'fail' ? '设备能效未达到最低等级标准，建议进行技术改造或优化运行参数。' : data.status === 'warning' ? '设备达到能效标准，但距上一等级仍有差距，建议进一步优化。' : '设备能效表现优秀，建议保持当前运行状态。'}
`
  const blob = new Blob([report], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${data.name}_验证报告.txt`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
</script>

<style scoped>
.visualization-container {
  height: calc(100vh - 120px);
  overflow-y: auto;
  padding: 20px;
  background-color: #0f172a;
  color: white;
  box-sizing: border-box;
}

.panel-section {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9));
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: white;
}

.header-actions {
  display: flex;
  gap: 12px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

.main-layout {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 20px;
  height: calc(100% - 60px);
}

.left-panel {
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.9), rgba(30, 41, 59, 0.9));
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  overflow: hidden;
}

.right-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  overflow-y: auto;
}

@media (max-width: 1200px) {
  .main-layout {
    grid-template-columns: 1fr;
  }
}
</style>
