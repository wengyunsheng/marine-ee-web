<template>
  <div class="eval-result-container">
    <el-breadcrumb separator=">" class="breadcrumb">
      <el-breadcrumb-item><a href="#" @click.prevent>首页</a></el-breadcrumb-item>
      <el-breadcrumb-item><a href="#" @click.prevent>能效评估</a></el-breadcrumb-item>
      <el-breadcrumb-item>评估结果</el-breadcrumb-item>
    </el-breadcrumb>
    
    <div class="module-header">
      <h2>船用发动机设备能效计算与能效分级</h2>
      <div class="module-actions">
        <el-button @click="backToConfig">返回参数配置</el-button>
        <el-button @click="exportReport">导出报告</el-button>
        <el-button type="primary" @click="newEvaluation">新建评估</el-button>
      </div>
    </div>

    <div class="eval-content">
      <div class="eval-section engine-section">
        <div class="section-header">
          <h3>台架验证模式</h3>
        </div>
        
        <div class="data-import-section">
          <el-upload
            drag
            accept=".csv,.xlsx,.xls,.json,.xml"
            :auto-upload="false"
            class="import-box"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              点击或拖拽文件到此处上传
            </div>
            <template #tip>
              <div class="el-upload__tip">
                按钮，选择发动机数据导入。
              </div>
            </template>
          </el-upload>
        </div>

        <el-form label-width="120px" class="engine-info-grid">
          <el-form-item label="发动机品牌:">
            <el-input v-model="evaluationData.brand" readonly />
            <span class="hint">由导入数据带出，不可修改。</span>
          </el-form-item>
          
          <el-form-item label="发动机类型:">
            <el-select v-model="evaluationData.engineType" style="width: 100%">
              <el-option value="低速机" label="船用柴油发动机（低速机）" />
              <el-option value="中速机" label="船用柴油发动机（中速机）" />
              <el-option value="lng-low" label="船用LNG/柴油双燃料发动机（低速机）" />
              <el-option value="lng-medium" label="船用LNG/柴油双燃料发动机（中速机）" />
              <el-option value="methanol-low" label="船用甲醇/柴油双燃料发动机（低速机）" />
              <el-option value="methanol-medium" label="船用甲醇/柴油双燃料发动机（中速机）" />
            </el-select>
            <span class="hint">下拉框，选择发动机类型。</span>
          </el-form-item>
          
          <el-form-item label="排放等级:">
            <el-select v-model="evaluationData.emissionLevel" style="width: 100%">
              <el-option value="Tier II" label="Tier II" />
              <el-option value="Tier III" label="Tier III" />
            </el-select>
            <span class="hint">由导入数据带出，可修改。</span>
          </el-form-item>
        </el-form>
      </div>

      <div class="eval-section params-section">
        <div class="section-header">
          <h3>发动机参数</h3>
          <span class="hint">根据发动机类型，显示不同的发动机参数。参数的数值可修改。</span>
        </div>
        
        <el-table :data="paramsTableData" style="width: 100%" border>
          <el-table-column prop="param" label="参数" width="250" />
          <el-table-column prop="unit" label="单位" width="120" />
          <el-table-column label="数值" min-width="200">
            <template #default="{ row }">
              <el-input-number v-model.number="row.value" style="width: 100%" />
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="eval-section calculation-section">
        <div class="section-header">
          <h3>能效指标计算</h3>
        </div>
        
        <div class="calculation-formula">
          <div class="formula-display">
            <span class="formula-label">能效指标计算:</span>
            <span class="formula-value" v-html="currentFuelConfig.formulaText"></span>
          </div>
          
          <div class="formula-explanation">
            <div class="param-explain">
              <span class="param-symbol">W<sub>i</sub>:</span>
              <span class="param-desc">加权系数</span>
            </div>
            <div class="param-explain" v-if="currentFuelConfig.formula === 'diesel'">
              <span class="param-symbol">SFOC<sub>i</sub>:</span>
              <span class="param-desc">燃油消耗率</span>
            </div>
            <div class="param-explain" v-if="currentFuelConfig.formula === 'dual-fuel'">
              <span class="param-symbol">BSGC<sub>i</sub>:</span>
              <span class="param-desc">燃气消耗率</span>
            </div>
            <div class="param-explain" v-if="currentFuelConfig.formula === 'dual-fuel'">
              <span class="param-symbol">BSPC<sub>i</sub>:</span>
              <span class="param-desc">引燃油消耗率</span>
            </div>
          </div>
        </div>

        <div class="calculate-button">
          <el-button type="primary" size="large" @click="calculateEfficiency">计算能效指标</el-button>
        </div>

        <el-alert
          v-if="showResult"
          type="success"
          :closable="false"
          class="efficiency-result"
        >
          <template #title>
            <div class="result-row">
              <label>能效指标:</label>
              <span class="result-value">{{ calculatedEfficiency.toFixed(2) }}%</span>
              <span class="result-hint">能效指标、能效分级 不可修改。</span>
            </div>
            <div class="result-row">
              <label>能效分级:</label>
              <el-tag :type="getLevelType(efficiencyLevel)" size="large" class="efficiency-level">
                {{ efficiencyLevel }}
              </el-tag>
            </div>
          </template>
        </el-alert>
      </div>

      <div class="eval-section base-values-section">
        <div class="section-header">
          <h3>能效等级和能效基值</h3>
          <span class="hint">由发动机类型带出，不可修改。</span>
        </div>
        
        <el-table :data="baseValues" style="width: 100%" border stripe>
          <el-table-column prop="engineType" label="发动机类型" width="200" />
          <el-table-column prop="emissionLevel" label="排放等级" width="120" />
          <el-table-column prop="powerRange" label="单缸功率区间 P/kW" min-width="180" />
          <el-table-column prop="efficiencyLevel" label="能效等级" width="120" />
          <el-table-column label="能效基值" width="120">
            <template #default="{ row }">
              {{ row.baseValue }}%
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'

const emit = defineEmits(['back', 'new'])

const evaluationData = ref({
  brand: 'MAN Energy Solutions',
  engineType: '中速机',
  emissionLevel: 'Tier II'
})

const engineParams = ref({
  ratedSpeed: 500,
  ratedPower: 5000,
  mainFuelLHV: 42700,
  pilotFuelLHV: 42700,
  bsgc25: 180,
  bsfc25: 18,
  bsgc50: 170,
  bsfc50: 16,
  bsgc75: 165,
  bsfc75: 14,
  bsgc100: 175,
  bsfc100: 12
})

const showResult = ref(false)
const calculatedEfficiency = ref(0)

const fuelTypeConfig = {
  '柴油': {
    formula: 'diesel',
    constant: 84.309133,
    formulaText: '84.309133 × Σ(W<sub>i</sub> / SFOC<sub>i</sub>)',
    paramDesc: 'Wᵢ: 加权系数; SFOC: 燃油消耗率'
  },
  'LNG': {
    formula: 'dual-fuel',
    constant: 3600000,
    gasLHV: 50000,
    pilotLHV: 42700,
    formulaText: '3600000 × Σ(1 / (W<sub>i</sub> × BSGC<sub>i</sub> × 50000 + BSPC<sub>i</sub> × 42700))<sup>-1</sup>',
    paramDesc: 'Wᵢ: 加权系数; BSGC: 燃气消耗率; BSPC: 引燃油消耗率'
  },
  '甲醇': {
    formula: 'dual-fuel',
    constant: 3600000,
    gasLHV: 19900,
    pilotLHV: 42700,
    formulaText: '3600000 × Σ(1 / (W<sub>i</sub> × BSGC<sub>i</sub> × 19900 + BSPC<sub>i</sub> × 42700))<sup>-1</sup>',
    paramDesc: 'Wᵢ: 加权系数; BSGC: 燃气消耗率; BSPC: 引燃油消耗率'
  }
}

const engineTypeNameMap = {
  '低速机': '船用柴油发动机（低速机）',
  '中速机': '船用柴油发动机（中速机）',
  'lng-low': '船用LNG/柴油双燃料发动机（低速机）',
  'lng-medium': '船用LNG/柴油双燃料发动机（中速机）',
  'methanol-low': '船用甲醇/柴油双燃料发动机（低速机）',
  'methanol-medium': '船用甲醇/柴油双燃料发动机（中速机）'
}

const currentFuelConfig = computed(() => {
  const engineType = evaluationData.value.engineType
  const fullTypeName = engineTypeNameMap[engineType] || engineType
  
  if (fullTypeName.includes('LNG')) return fuelTypeConfig['LNG']
  if (fullTypeName.includes('甲醇')) return fuelTypeConfig['甲醇']
  return fuelTypeConfig['柴油']
})

const baseValues = ref([
  { id: 1, engineType: '中速机', emissionLevel: 'Tier II', powerRange: 'P<360', efficiencyLevel: '1级', baseValue: 45.8 },
  { id: 2, engineType: '中速机', emissionLevel: 'Tier II', powerRange: 'P<360', efficiencyLevel: '2级', baseValue: 43.8 },
  { id: 3, engineType: '中速机', emissionLevel: 'Tier II', powerRange: 'P<360', efficiencyLevel: '3级', baseValue: 42.4 },
  { id: 4, engineType: '中速机', emissionLevel: 'Tier II', powerRange: '500≤P<850', efficiencyLevel: '1级', baseValue: 48.2 },
  { id: 5, engineType: '中速机', emissionLevel: 'Tier II', powerRange: '500≤P<850', efficiencyLevel: '2级', baseValue: 45.5 },
  { id: 6, engineType: '中速机', emissionLevel: 'Tier II', powerRange: '500≤P<850', efficiencyLevel: '3级', baseValue: 45.7 },
  { id: 7, engineType: '中速机', emissionLevel: 'Tier III', powerRange: '500≤P<850', efficiencyLevel: '1级', baseValue: 47.0 },
  { id: 8, engineType: '中速机', emissionLevel: 'Tier III', powerRange: '500≤P<850', efficiencyLevel: '2级', baseValue: 46.0 },
  { id: 9, engineType: '中速机', emissionLevel: 'Tier III', powerRange: '500≤P<850', efficiencyLevel: '3级', baseValue: 43.6 }
])

const efficiencyLevel = computed(() => {
  const eff = calculatedEfficiency.value
  if (eff >= 48) return '1级'
  if (eff >= 45) return '2级'
  return '3级'
})

const efficiencyLevelClass = computed(() => {
  const level = efficiencyLevel.value
  if (level === '1级') return 'level-1'
  if (level === '2级') return 'level-2'
  return 'level-3'
})

const getLevelType = (level) => {
  if (level === '1级') return 'success'
  if (level === '2级') return ''
  return 'danger'
}

const paramsTableData = computed(() => [
  { param: '额定转速', unit: 'r/min', value: engineParams.value.ratedSpeed },
  { param: '额定功率', unit: 'kW', value: engineParams.value.ratedPower },
  { param: '主燃料低热值', unit: 'kJ/kg', value: engineParams.value.mainFuelLHV },
  { param: '引燃油低热值', unit: 'kJ/kg', value: engineParams.value.pilotFuelLHV },
  { param: '25%工况下燃气消耗率', unit: 'g/kWh', value: engineParams.value.bsgc25 },
  { param: '25%工况下引燃油消耗率', unit: 'g/kWh', value: engineParams.value.bsfc25 },
  { param: '50%工况下燃气消耗率', unit: 'g/kWh', value: engineParams.value.bsgc50 },
  { param: '50%工况下引燃油消耗率', unit: 'g/kWh', value: engineParams.value.bsfc50 },
  { param: '75%工况下燃气消耗率', unit: 'g/kWh', value: engineParams.value.bsgc75 },
  { param: '75%工况下引燃油消耗率', unit: 'g/kWh', value: engineParams.value.bsfc75 },
  { param: '100%工况下燃气消耗率', unit: 'g/kWh', value: engineParams.value.bsgc100 },
  { param: '100%工况下引燃油消耗率', unit: 'g/kWh', value: engineParams.value.bsfc100 }
])

const calculateEfficiency = () => {
  const params = engineParams.value
  const config = currentFuelConfig.value
  const weights = [0.15, 0.25, 0.40, 0.20]
  
  if (config.formula === 'diesel') {
    const sfocValues = [params.bsgc25, params.bsgc50, params.bsgc75, params.bsgc100]
    
    let sum = 0
    for (let i = 0; i < 4; i++) {
      sum += weights[i] / sfocValues[i]
    }
    
    calculatedEfficiency.value = config.constant * sum
  } else {
    const bsgcValues = [params.bsgc25, params.bsgc50, params.bsgc75, params.bsgc100]
    const bsfcValues = [params.bsfc25, params.bsfc50, params.bsfc75, params.bsfc100]
    
    let sum = 0
    for (let i = 0; i < 4; i++) {
      sum += weights[i] / (bsgcValues[i] * config.gasLHV + bsfcValues[i] * config.pilotLHV)
    }
    
    calculatedEfficiency.value = config.constant * sum
  }
  
  showResult.value = true
}

const backToConfig = () => {
  emit('back')
}

const exportReport = () => {
  alert('报告导出功能开发中')
}

const newEvaluation = () => {
  emit('new')
}
</script>

<style scoped>
.eval-result-container {
  padding: 20px;
}

.breadcrumb {
  margin-bottom: 16px;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.module-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.module-actions {
  display: flex;
  gap: 12px;
}

.eval-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.eval-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.section-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.section-header .hint {
  font-size: 12px;
  color: #9ca3af;
}

.data-import-section {
  margin-bottom: 24px;
}

.import-box {
  cursor: pointer;
}

.engine-info-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hint {
  font-size: 12px;
  color: #9ca3af;
  display: block;
  margin-top: 4px;
}

.calculation-formula {
  background: #f8fafc;
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.formula-display {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.formula-label {
  font-weight: 600;
  color: #333;
}

.formula-value {
  font-family: 'Courier New', monospace;
  font-size: 14px;
  color: #1e293b;
  background: white;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.formula-explanation {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

.param-explain {
  display: flex;
  align-items: center;
  gap: 8px;
}

.param-symbol {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: #2563eb;
}

.param-desc {
  color: #666;
  font-size: 14px;
}

.calculate-button {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.efficiency-result {
  :deep(.el-alert__content) {
    width: 100%;
  }
}

.result-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.result-row:last-child {
  margin-bottom: 0;
}

.result-row label {
  font-weight: 600;
  color: #333;
  min-width: 100px;
}

.result-value {
  font-size: 20px;
  font-weight: 700;
  color: #16a34a;
}

.efficiency-level {
  padding: 6px 16px;
  font-size: 16px;
}

.result-hint {
  font-size: 12px;
  color: #9ca3af;
}

@media (max-width: 1024px) {
  .eval-content {
    grid-template-columns: 1fr;
  }
}
</style>