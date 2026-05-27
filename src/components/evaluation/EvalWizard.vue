<template>
  <el-dialog 
    v-model="dialogVisible" 
    title="能效评估向导"
    width="80%"
    :close-on-click-modal="false"
    @close="closeWizard"
  >
    <div class="eval-wizard">
      <!-- 步骤条 -->
      <el-steps :active="currentStep" finish-status="success" align-center class="wizard-progress">
        <el-step 
          v-for="(step, index) in steps" 
          :key="index"
          :title="step.label"
        />
      </el-steps>

      <div class="wizard-content">
      <div v-show="currentStep === 0" class="step-panel">
        <div class="step-header">
          <h3>第一步：选择设备</h3>
          <p>请从以下船用核心设备中选择需要评估的设备类型</p>
        </div>
        
        <div class="device-selection">
          <el-form label-width="100px">
            <el-form-item label="设备类型">
              <el-select 
                v-model="selectedDevice" 
                placeholder="请选择设备类型"
                style="width: 100%"
                @change="console.log('selectedDevice changed:', selectedDevice)"
              >
                <el-option 
                  v-for="device in devices" 
                  :key="device.id" 
                  :label="device.name" 
                  :value="device.id"
                />
              </el-select>
            </el-form-item>
          </el-form>
          <el-alert
            v-if="selectedDevice"
            :title="'设备描述'"
            :description="getDeviceDescription(selectedDevice)"
            type="info"
            :closable="false"
            show-icon
            style="margin-top: 16px"
          />
        </div>
      </div>

      <div v-show="currentStep === 1" class="step-panel">
        <div class="step-header">
          <h3>第二步：配置参数</h3>
          <p>请设置设备的基本信息和技术参数</p>
        </div>
        
        <div class="device-params-container">
          <div v-if="selectedDevice">
            <h4>{{ getDeviceName(selectedDevice) }}</h4>
            
            <el-form label-width="120px">
              <el-divider content-position="left">基本信息</el-divider>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="设备品牌">
                    <el-input v-model="currentDeviceParams.brand" placeholder="输入设备品牌" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="设备型号">
                    <el-input v-model="currentDeviceParams.model" placeholder="输入设备型号" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-divider content-position="left">技术参数</el-divider>
              <el-row :gutter="20">
                <el-col 
                  v-for="param in getDeviceParams(selectedDevice)" 
                  :key="param.id" 
                  :span="8"
                >
                  <el-form-item :label="param.name">
                    <el-input-number 
                      :model-value="getParamValue(selectedDevice, param.id)"
                      @update:model-value="(val) => updateParamValue(selectedDevice, param.id, val)"
                      :placeholder="'输入' + param.name"
                      :min="param.minValue"
                      :max="param.maxValue"
                      style="width: 100%"
                    />
                    <div class="param-unit-hint">{{ param.unit }}</div>
                  </el-form-item>
                </el-col>
                <el-col v-if="getDeviceParams(selectedDevice).length === 0" :span="24">
                  <el-empty description="未找到设备的技术参数模板" />
                </el-col>
              </el-row>

              <el-divider content-position="left">运行参数</el-divider>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="运行负荷">
                    <el-input-number 
                      v-model="currentDeviceParams.load" 
                      placeholder="输入运行负荷"
                      :min="0"
                      :max="100"
                      style="width: 100%"
                    >
                      <template #suffix>%</template>
                    </el-input-number>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="运行温度">
                    <el-input-number 
                      v-model="currentDeviceParams.temperature" 
                      placeholder="输入运行温度"
                      style="width: 100%"
                    >
                      <template #suffix>°C</template>
                    </el-input-number>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-form>
          </div>
          <div v-else class="no-device-selected">
            <p>请先选择一个设备进行参数配置</p>
          </div>
        </div>
      </div>

      <div v-show="currentStep === 2" class="step-panel">
        <div class="step-header">
          <h3>第三步：选择评估数据</h3>
          <p>请从能效数据管理中选择评估数据</p>
        </div>

        <div class="history-section">
          <el-table 
            :data="historyData" 
            style="width: 100%"
            @row-click="(row) => toggleHistoryData(row.id)"
            highlight-current-row
          >
            <el-table-column type="selection" width="55" align="center">
              <template #default="{ row }">
                <el-checkbox 
                  :model-value="selectedHistoryData.includes(row.id)"
                  @change="toggleHistoryData(row.id)"
                  @click.stop
                />
              </template>
            </el-table-column>
            <el-table-column label="设备信息" min-width="200">
              <template #default="{ row }">
                <div class="device-info-cell">
                  <div class="device-name">{{ row.deviceName }}</div>
                  <div class="device-detail">{{ row.deviceType }} · {{ row.dataSource }} · {{ row.workingCondition }}</div>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="dataDate" label="数据日期" width="120" align="center" />
          </el-table>
          <el-empty v-if="historyData.length === 0" description="暂无可用的能效数据，请先在系统管理中添加" />
        </div>
      </div>

      <div v-show="currentStep === 3" class="step-panel">
        <div class="step-header">
          <h2>船用发动机设备能效计算与能效分级</h2>
        </div>

        <div class="eval-content-grid">
          <div class="eval-section">
            <div class="section-title">
              <h3>台架验证模式</h3>
            </div>
            
            <div class="info-row">
              <label>发动机品牌:</label>
              <span class="info-value readonly">{{ engineInfo.brand }}</span>
              <span class="info-hint">由第二步配置参数带出，不可修改。</span>
            </div>

            <div class="info-row">
              <label>发动机类型:</label>
              <span class="info-value readonly">{{ engineInfo.engineType || '请先选择设备类型' }}</span>
              <span class="info-hint">由第一步选择的设备类型带出，不可修改。</span>
            </div>

            <div class="info-row">
              <label>排放等级:</label>
              <select v-model="engineInfo.emissionLevel" class="info-select">
                <option value="Tier II">Tier II</option>
                <option value="Tier III">Tier III</option>
              </select>
              <span class="info-hint">由导入数据带出，可修改。</span>
            </div>
          </div>

          <div class="eval-section">
            <div class="section-title">
              <h3>能效等级和能效基值</h3>
              <span class="section-hint">由发动机类型带出，不可修改。</span>
            </div>
            
            <div class="base-values-table">
              <table>
                <thead>
                  <tr>
                    <th>发动机类型</th>
                    <th>排放等级</th>
                    <th>单缸功率区间 P/kW</th>
                    <th>能效等级</th>
                    <th>能效基值</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in filteredBaseValues" :key="item.id">
                    <td>{{ item.engineType }}</td>
                    <td>{{ item.emissionLevel }}</td>
                    <td>{{ item.powerRange }}</td>
                    <td>{{ item.efficiencyLevel }}</td>
                    <td>{{ item.baseValue }}%</td>
                  </tr>
                  <tr v-if="filteredBaseValues.length === 0">
                    <td colspan="5" style="text-align: center; color: #9ca3af;">请先选择设备类型</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="eval-section calculation-section">
            <div class="section-title">
              <h3>能效指标计算</h3>
            </div>
            
            <div class="formula-display">
              <span class="formula-label">能效指标计算:</span>
              <span class="formula-value" v-if="currentFuelConfig" v-html="currentFuelConfig.formulaText"></span>
              <span class="formula-value" v-else style="color: #9ca3af;">请先选择设备类型</span>
            </div>
            
            <div class="formula-explanation">
              <div class="param-explain" v-if="currentFuelConfig">
                <span class="param-symbol">W<sub>i</sub>:</span>
                <span class="param-desc">加权系数</span>
              </div>
              <div class="param-explain" v-if="currentFuelConfig && currentFuelConfig.formula === 'diesel'">
                <span class="param-symbol">SFOC<sub>i</sub>:</span>
                <span class="param-desc">燃油消耗率</span>
              </div>
              <div class="param-explain" v-if="currentFuelConfig && currentFuelConfig.formula === 'dual-fuel'">
                <span class="param-symbol">BSGC<sub>i</sub>:</span>
                <span class="param-desc">燃气消耗率</span>
              </div>
              <div class="param-explain" v-if="currentFuelConfig && currentFuelConfig.formula === 'dual-fuel'">
                <span class="param-symbol">BSPC<sub>i</sub>:</span>
                <span class="param-desc">引燃油消耗率</span>
              </div>
            </div>

            <div class="calculate-btn-container">
              <button class="btn btn-primary btn-lg" @click="calculateEfficiency">计算能效指标</button>
            </div>

            <div v-if="showEfficiencyResult" class="efficiency-result">
              <div class="result-row">
                <label>能效指标:</label>
                <span class="result-value">{{ calculatedEfficiency.toFixed(2) }}%</span>
                <span class="result-hint">能效指标、能效分级 不可修改。</span>
              </div>
              <div class="result-row">
                <label>能效分级:</label>
                <span class="result-value efficiency-level" :class="efficiencyLevelClass">{{ efficiencyLevel }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="wizard-footer">
      <button 
        class="btn btn-secondary" 
        @click="prevStep" 
        :disabled="currentStep === 0"
      >
        ← 上一步
      </button>
      <button 
        v-if="currentStep < 3" 
        class="btn btn-primary" 
        @click="nextStep"
      >
        下一步 →
      </button>
      <button 
        v-if="currentStep === 3 && evalScore" 
        class="btn btn-primary" 
        @click="finishWizard"
      >
        完成
      </button>
    </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const emit = defineEmits(['close', 'complete'])

// 对话框可见性
const dialogVisible = ref(true)

const currentStep = ref(0)

const selectedDevice = ref('')
const selectedHistoryData = ref([])
const activeDevice = ref('')

const steps = [
  { label: '选择设备' },
  { label: '配置参数' },
  { label: '加载数据' },
  { label: '执行评估与分析' }
]

const devices = ref([
  { id: 'diesel-low', name: '船用柴油发动机（低速机）', icon: '🚢', description: '船舶主推进动力系统，低速柴油发动机' },
  { id: 'diesel-medium', name: '船用柴油发动机（中速机）', icon: '⚙️', description: '船舶辅助发电系统，中速柴油发动机' },
  { id: 'lng-diesel-low', name: '船用LNG/柴油双燃料发动机（低速机）', icon: '🔥', description: '船舶主推进动力系统，LNG/柴油双燃料低速发动机' },
  { id: 'lng-diesel-medium', name: '船用LNG/柴油双燃料发动机（中速机）', icon: '💦', description: '船舶辅助发电系统，LNG/柴油双燃料中速发动机' },
  { id: 'methanol-diesel-low', name: '船用甲醇/柴油双燃料发动机（低速机）', icon: '❄️', description: '船舶主推进动力系统，甲醇/柴油双燃料低速发动机' },
  { id: 'methanol-diesel-medium', name: '船用甲醇/柴油双燃料发动机（中速机）', icon: '⚡', description: '船舶辅助发电系统，甲醇/柴油双燃料中速发动机' }
])

const historyData = ref([
  { id: 1, dataDate: '2024-04-20', deviceType: '船用柴油发动机（低速机）', deviceName: 'MAN B&W 6S70MC', dataSource: '台架试验', workingCondition: '额定工况' },
  { id: 2, dataDate: '2024-04-15', deviceType: '船用柴油发动机（中速机）', deviceName: 'Cummins QSK60', dataSource: '实船运行', workingCondition: '部分负荷' },
  { id: 3, dataDate: '2024-04-10', deviceType: '船用LNG/柴油双燃料发动机（低速机）', deviceName: 'Wärtsilä 50DF', dataSource: '台架试验', workingCondition: '额定工况' },
  { id: 4, dataDate: '2024-04-05', deviceType: '船用LNG/柴油双燃料发动机（中速机）', deviceName: 'Caterpillar 3516E', dataSource: '实船运行', workingCondition: '变工况' },
  { id: 5, dataDate: '2024-04-01', deviceType: '船用甲醇/柴油双燃料发动机（低速机）', deviceName: 'MAN B&W ME-LGIM', dataSource: '台架试验', workingCondition: '低负荷' },
  { id: 6, dataDate: '2024-03-25', deviceType: '船用甲醇/柴油双燃料发动机（中速机）', deviceName: 'Wärtsilä 32 Methanol', dataSource: '实船运行', workingCondition: '额定工况' }
])

const deviceParams = ref({
  'diesel-low': { brand: 'MAN B&W', model: '6S70MC', load: 85, temperature: 85 },
  'diesel-medium': { brand: 'Cummins', model: 'QSK60', load: 65, temperature: 75 },
  'lng-diesel-low': { brand: 'Wärtsilä', model: '50DF', load: 80, temperature: 80 },
  'lng-diesel-medium': { brand: 'Caterpillar', model: '3516E', load: 70, temperature: 75 },
  'methanol-diesel-low': { brand: 'MAN B&W', model: 'ME-LGIM', load: 85, temperature: 85 },
  'methanol-diesel-medium': { brand: 'Wärtsilä', model: '32 Methanol', load: 75, temperature: 75 }
})



const evalScore = ref(null)
const scoreLevel = ref('')
const scoreClass = ref('')

const evalDetails = ref([
  { label: '评估时间', value: '2024-04-15 14:30' },
  { label: '设备数量', value: '3 台' },
  { label: '数据样本', value: '1,250 条' },
  { label: '评估周期', value: '30 天' }
])

const engineInfo = ref({
  brand: '',
  engineType: '',
  emissionLevel: 'Tier II'
})

const currentEngineParams = ref([])

const baseValues = ref([
  { id: 1, engineType: '船用柴油发动机（低速机）', emissionLevel: 'Tier II', powerRange: 'P<1800', efficiencyLevel: '1级', baseValue: 57.02 },
  { id: 2, engineType: '船用柴油发动机（低速机）', emissionLevel: 'Tier II', powerRange: 'P<1800', efficiencyLevel: '2级', baseValue: 53.42 },
  { id: 3, engineType: '船用柴油发动机（低速机）', emissionLevel: 'Tier II', powerRange: 'P<1800', efficiencyLevel: '3级', baseValue: 49.82 },
  { id: 4, engineType: '船用柴油发动机（中速机）', emissionLevel: 'Tier II', powerRange: 'P<360', efficiencyLevel: '1级', baseValue: 45.8 },
  { id: 5, engineType: '船用柴油发动机（中速机）', emissionLevel: 'Tier II', powerRange: 'P<360', efficiencyLevel: '2级', baseValue: 43.8 },
  { id: 6, engineType: '船用柴油发动机（中速机）', emissionLevel: 'Tier II', powerRange: 'P<360', efficiencyLevel: '3级', baseValue: 42.4 },
  { id: 7, engineType: '船用柴油发动机（中速机）', emissionLevel: 'Tier II', powerRange: '500≤P<850', efficiencyLevel: '1级', baseValue: 48.2 },
  { id: 8, engineType: '船用柴油发动机（中速机）', emissionLevel: 'Tier II', powerRange: '500≤P<850', efficiencyLevel: '2级', baseValue: 45.5 },
  { id: 9, engineType: '船用柴油发动机（中速机）', emissionLevel: 'Tier II', powerRange: '500≤P<850', efficiencyLevel: '3级', baseValue: 45.7 },
  { id: 10, engineType: '船用柴油发动机（中速机）', emissionLevel: 'Tier III', powerRange: '500≤P<850', efficiencyLevel: '1级', baseValue: 47.0 },
  { id: 11, engineType: '船用柴油发动机（中速机）', emissionLevel: 'Tier III', powerRange: '500≤P<850', efficiencyLevel: '2级', baseValue: 46.0 },
  { id: 12, engineType: '船用柴油发动机（中速机）', emissionLevel: 'Tier III', powerRange: '500≤P<850', efficiencyLevel: '3级', baseValue: 43.6 },
  { id: 13, engineType: '船用LNG/柴油双燃料发动机（低速机）', emissionLevel: 'Tier II', powerRange: 'P<1800', efficiencyLevel: '1级', baseValue: 55.0 },
  { id: 14, engineType: '船用LNG/柴油双燃料发动机（低速机）', emissionLevel: 'Tier II', powerRange: 'P<1800', efficiencyLevel: '2级', baseValue: 51.5 },
  { id: 15, engineType: '船用LNG/柴油双燃料发动机（低速机）', emissionLevel: 'Tier II', powerRange: 'P<1800', efficiencyLevel: '3级', baseValue: 48.0 },
  { id: 16, engineType: '船用LNG/柴油双燃料发动机（中速机）', emissionLevel: 'Tier II', powerRange: '500≤P<850', efficiencyLevel: '1级', baseValue: 46.5 },
  { id: 17, engineType: '船用LNG/柴油双燃料发动机（中速机）', emissionLevel: 'Tier II', powerRange: '500≤P<850', efficiencyLevel: '2级', baseValue: 44.0 },
  { id: 18, engineType: '船用LNG/柴油双燃料发动机（中速机）', emissionLevel: 'Tier II', powerRange: '500≤P<850', efficiencyLevel: '3级', baseValue: 41.5 },
  { id: 19, engineType: '船用甲醇/柴油双燃料发动机（低速机）', emissionLevel: 'Tier II', powerRange: 'P<1800', efficiencyLevel: '1级', baseValue: 42.0 },
  { id: 20, engineType: '船用甲醇/柴油双燃料发动机（低速机）', emissionLevel: 'Tier II', powerRange: 'P<1800', efficiencyLevel: '2级', baseValue: 39.5 },
  { id: 21, engineType: '船用甲醇/柴油双燃料发动机（低速机）', emissionLevel: 'Tier II', powerRange: 'P<1800', efficiencyLevel: '3级', baseValue: 37.0 },
  { id: 22, engineType: '船用甲醇/柴油双燃料发动机（中速机）', emissionLevel: 'Tier II', powerRange: '500≤P<850', efficiencyLevel: '1级', baseValue: 40.5 },
  { id: 23, engineType: '船用甲醇/柴油双燃料发动机（中速机）', emissionLevel: 'Tier II', powerRange: '500≤P<850', efficiencyLevel: '2级', baseValue: 38.2 },
  { id: 24, engineType: '船用甲醇/柴油双燃料发动机（中速机）', emissionLevel: 'Tier II', powerRange: '500≤P<850', efficiencyLevel: '3级', baseValue: 35.9 }
])

const filteredBaseValues = computed(() => {
  if (!engineInfo.value.engineType) {
    return []
  }
  return baseValues.value.filter(item => item.engineType === engineInfo.value.engineType)
})

const brandMap = {
  '船用柴油发动机（低速机）': 'MAN B&W',
  '船用柴油发动机（中速机）': 'Cummins',
  '船用LNG/柴油双燃料发动机（低速机）': 'Wärtsilä',
  '船用LNG/柴油双燃料发动机（中速机）': 'Caterpillar',
  '船用甲醇/柴油双燃料发动机（低速机）': 'MAN B&W',
  '船用甲醇/柴油双燃料发动机（中速机）': 'Wärtsilä'
}

watch(selectedDevice, (newDevice) => {
  if (newDevice) {
    const deviceName = deviceTypeMap[newDevice]
    engineInfo.value.engineType = deviceName || ''
    engineInfo.value.brand = brandMap[deviceName] || ''
    // 同步到 currentDeviceParams
    if (deviceParams.value[newDevice]) {
      deviceParams.value[newDevice].brand = brandMap[deviceName] || ''
    }
    loadEngineParams(deviceName)
  }
})



const loadEngineParams = (deviceTypeName) => {
  const template = paramTemplates.value.find(t => t.deviceType === deviceTypeName)
  if (template) {
    currentEngineParams.value = template.params.map(p => ({
      id: p.id,
      name: p.name,
      unit: p.unit,
      value: p.defaultValue
    }))
  } else {
    currentEngineParams.value = []
  }
}

const showEfficiencyResult = ref(false)
const calculatedEfficiency = ref(0)

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

const currentFuelConfig = computed(() => {
  const engineType = engineInfo.value.engineType
  if (!engineType) return null
  
  if (engineType.includes('LNG')) return fuelTypeConfig['LNG']
  if (engineType.includes('甲醇')) return fuelTypeConfig['甲醇']
  return fuelTypeConfig['柴油']
})

const calculateEfficiency = () => {
  const params = currentEngineParams.value
  const config = currentFuelConfig.value
  
  if (!config || params.length === 0) {
    alert('请先选择设备类型')
    return
  }
  
  const weights = [0.15, 0.25, 0.40, 0.20]
  
  if (config.formula === 'diesel') {
    const sfoc25 = params.find(p => p.name.includes('25%工况下'))?.value || 200
    const sfoc50 = params.find(p => p.name.includes('50%工况下'))?.value || 190
    const sfoc75 = params.find(p => p.name.includes('75%工况下'))?.value || 185
    const sfoc100 = params.find(p => p.name.includes('100%工况下'))?.value || 195
    
    const sfocValues = [sfoc25, sfoc50, sfoc75, sfoc100]
    
    let sum = 0
    for (let i = 0; i < 4; i++) {
      sum += weights[i] / sfocValues[i]
    }
    
    calculatedEfficiency.value = config.constant * sum
  } else {
    const bsgc25 = params.find(p => p.name.includes('25%工况下燃气消耗率'))?.value || params.find(p => p.name.includes('25%工况下'))?.value || 180
    const bsgc50 = params.find(p => p.name.includes('50%工况下燃气消耗率'))?.value || params.find(p => p.name.includes('50%工况下'))?.value || 170
    const bsgc75 = params.find(p => p.name.includes('75%工况下燃气消耗率'))?.value || params.find(p => p.name.includes('75%工况下'))?.value || 165
    const bsgc100 = params.find(p => p.name.includes('100%工况下燃气消耗率'))?.value || params.find(p => p.name.includes('100%工况下'))?.value || 175
    
    const bsfc25 = params.find(p => p.name.includes('25%工况下引燃燃油消耗率'))?.value || 18
    const bsfc50 = params.find(p => p.name.includes('50%工况下引燃燃油消耗率'))?.value || 16
    const bsfc75 = params.find(p => p.name.includes('75%工况下引燃燃油消耗率'))?.value || 14
    const bsfc100 = params.find(p => p.name.includes('100%工况下引燃燃油消耗率'))?.value || 12
    
    const bsgcValues = [bsgc25, bsgc50, bsgc75, bsgc100]
    const bsfcValues = [bsfc25, bsfc50, bsfc75, bsfc100]
    
    let sum = 0
    for (let i = 0; i < 4; i++) {
      sum += weights[i] / (bsgcValues[i] * config.gasLHV + bsfcValues[i] * config.pilotLHV)
    }
    
    calculatedEfficiency.value = config.constant * sum
  }
  
  showEfficiencyResult.value = true
}

const getDeviceDescription = (deviceId) => {
  const device = devices.value.find(d => d.id === deviceId)
  return device ? device.description : ''
}

const getDeviceName = (deviceId) => {
  const device = devices.value.find(d => d.id === deviceId)
  return device ? device.name : ''
}

const selectedDevicesData = computed(() => {
  return selectedDevice.value ? [devices.value.find(d => d.id === selectedDevice.value)] : []
})

const currentDeviceParams = computed({
  get: () => {
    const deviceId = selectedDevice.value
    if (!deviceId) {
      return { brand: '', model: '', load: '', temperature: '' }
    }
    return deviceParams.value[deviceId]
  },
  set: (value) => {
    const deviceId = selectedDevice.value
    if (deviceId) {
      deviceParams.value[deviceId] = value
    }
  }
})

// 同步 currentDeviceParams.brand 到 engineInfo.brand
watch(() => currentDeviceParams.value?.brand, (newBrand) => {
  if (newBrand !== undefined && newBrand !== null) {
    engineInfo.value.brand = newBrand
  }
})

const configuredParamsCount = computed(() => {
  return selectedDevice.value ? 4 : 0
})

// 设备参数模板数据
const paramTemplates = ref([
  {
    id: 1,
    deviceType: '船用柴油发动机（低速机）',
    description: '船用柴油发动机（低速机）参数模板',
    params: [
      { id: 1, name: '额定功率', unit: 'kW', defaultValue: 15000, minValue: 0, maxValue: 30000 },
      { id: 2, name: '额定转速', unit: 'r/min', defaultValue: 100, minValue: 50, maxValue: 150 },
      { id: 3, name: '主燃料低热值', unit: 'kJ/kg', defaultValue: 42700, minValue: 40000, maxValue: 45000 },
      { id: 4, name: '25%工况下燃油消耗率', unit: 'g/kWh', defaultValue: 180, minValue: 150, maxValue: 250 },
      { id: 5, name: '50%工况下燃油消耗率', unit: 'g/kWh', defaultValue: 170, minValue: 140, maxValue: 230 },
      { id: 6, name: '75%工况下燃油消耗率', unit: 'g/kWh', defaultValue: 165, minValue: 130, maxValue: 220 },
      { id: 7, name: '100%工况下燃油消耗率', unit: 'g/kWh', defaultValue: 175, minValue: 140, maxValue: 240 }
    ]
  },
  {
    id: 2,
    deviceType: '船用柴油发动机（中速机）',
    description: '船用柴油发动机（中速机）参数模板',
    params: [
      { id: 8, name: '额定功率', unit: 'kW', defaultValue: 2000, minValue: 500, maxValue: 5000 },
      { id: 9, name: '额定转速', unit: 'r/min', defaultValue: 1500, minValue: 1000, maxValue: 2000 },
      { id: 10, name: '主燃料低热值', unit: 'kJ/kg', defaultValue: 42700, minValue: 40000, maxValue: 45000 },
      { id: 11, name: '25%工况下燃油消耗率', unit: 'g/kWh', defaultValue: 200, minValue: 160, maxValue: 280 },
      { id: 12, name: '50%工况下燃油消耗率', unit: 'g/kWh', defaultValue: 190, minValue: 150, maxValue: 260 },
      { id: 13, name: '75%工况下燃油消耗率', unit: 'g/kWh', defaultValue: 185, minValue: 140, maxValue: 250 },
      { id: 14, name: '100%工况下燃油消耗率', unit: 'g/kWh', defaultValue: 195, minValue: 150, maxValue: 270 }
    ]
  },
  {
    id: 3,
    deviceType: '船用LNG/柴油双燃料发动机（低速机）',
    description: '船用LNG/柴油双燃料发动机（低速机）参数模板',
    params: [
      { id: 15, name: '额定功率', unit: 'kW', defaultValue: 15000, minValue: 0, maxValue: 30000 },
      { id: 16, name: '额定转速', unit: 'r/min', defaultValue: 100, minValue: 50, maxValue: 150 },
      { id: 17, name: '主燃料低热值', unit: 'kJ/kg', defaultValue: 50000, minValue: 48000, maxValue: 52000 },
      { id: 18, name: '引燃燃料低热值', unit: 'kJ/kg', defaultValue: 42700, minValue: 40000, maxValue: 45000 },
      { id: 19, name: '25%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 150, minValue: 120, maxValue: 200 },
      { id: 20, name: '25%工况下引燃燃油消耗率', unit: 'g/kWh', defaultValue: 10, minValue: 5, maxValue: 20 },
      { id: 21, name: '50%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 140, minValue: 110, maxValue: 190 },
      { id: 22, name: '50%工况下引燃燃油消耗率', unit: 'g/kWh', defaultValue: 8, minValue: 4, maxValue: 15 },
      { id: 23, name: '75%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 135, minValue: 105, maxValue: 185 },
      { id: 24, name: '75%工况下引燃燃油消耗率', unit: 'g/kWh', defaultValue: 7, minValue: 3, maxValue: 12 },
      { id: 25, name: '100%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 145, minValue: 115, maxValue: 195 },
      { id: 26, name: '100%工况下引燃燃油消耗率', unit: 'g/kWh', defaultValue: 9, minValue: 4, maxValue: 16 }
    ]
  },
  {
    id: 4,
    deviceType: '船用LNG/柴油双燃料发动机（中速机）',
    description: '船用LNG/柴油双燃料发动机（中速机）参数模板',
    params: [
      { id: 27, name: '额定功率', unit: 'kW', defaultValue: 2000, minValue: 500, maxValue: 5000 },
      { id: 28, name: '额定转速', unit: 'r/min', defaultValue: 1500, minValue: 1000, maxValue: 2000 },
      { id: 29, name: '主燃料低热值', unit: 'kJ/kg', defaultValue: 50000, minValue: 48000, maxValue: 52000 },
      { id: 30, name: '引燃燃料低热值', unit: 'kJ/kg', defaultValue: 42700, minValue: 40000, maxValue: 45000 },
      { id: 31, name: '25%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 170, minValue: 130, maxValue: 220 },
      { id: 32, name: '25%工况下引燃燃油消耗率', unit: 'g/kWh', defaultValue: 12, minValue: 6, maxValue: 24 },
      { id: 33, name: '50%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 160, minValue: 120, maxValue: 210 },
      { id: 34, name: '50%工况下引燃燃油消耗率', unit: 'g/kWh', defaultValue: 10, minValue: 5, maxValue: 20 },
      { id: 35, name: '75%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 155, minValue: 115, maxValue: 205 },
      { id: 36, name: '75%工况下引燃燃油消耗率', unit: 'g/kWh', defaultValue: 9, minValue: 4, maxValue: 18 },
      { id: 37, name: '100%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 165, minValue: 125, maxValue: 215 },
      { id: 38, name: '100%工况下引燃燃油消耗率', unit: 'g/kWh', defaultValue: 11, minValue: 5, maxValue: 22 }
    ]
  },
  {
    id: 5,
    deviceType: '船用甲醇/柴油双燃料发动机（低速机）',
    description: '船用甲醇/柴油双燃料发动机（低速机）参数模板',
    params: [
      { id: 39, name: '额定功率', unit: 'kW', defaultValue: 15000, minValue: 0, maxValue: 30000 },
      { id: 40, name: '额定转速', unit: 'r/min', defaultValue: 100, minValue: 50, maxValue: 150 },
      { id: 41, name: '主燃料低热值', unit: 'kJ/kg', defaultValue: 19900, minValue: 19000, maxValue: 21000 },
      { id: 42, name: '引燃燃料低热值', unit: 'kJ/kg', defaultValue: 42700, minValue: 40000, maxValue: 45000 },
      { id: 43, name: '25%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 350, minValue: 300, maxValue: 400 },
      { id: 44, name: '25%工况下引燃燃油消耗率', unit: 'g/kWh', defaultValue: 15, minValue: 8, maxValue: 25 },
      { id: 45, name: '50%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 330, minValue: 280, maxValue: 380 },
      { id: 46, name: '50%工况下引燃燃油消耗率', unit: 'g/kWh', defaultValue: 12, minValue: 6, maxValue: 20 },
      { id: 47, name: '75%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 320, minValue: 270, maxValue: 370 },
      { id: 48, name: '75%工况下引燃燃油消耗率', unit: 'g/kWh', defaultValue: 10, minValue: 5, maxValue: 18 },
      { id: 49, name: '100%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 340, minValue: 290, maxValue: 390 },
      { id: 50, name: '100%工况下引燃燃油消耗率', unit: 'g/kWh', defaultValue: 13, minValue: 7, maxValue: 22 }
    ]
  },
  {
    id: 6,
    deviceType: '船用甲醇/柴油双燃料发动机（中速机）',
    description: '船用甲醇/柴油双燃料发动机（中速机）参数模板',
    params: [
      { id: 51, name: '额定功率', unit: 'kW', defaultValue: 2000, minValue: 500, maxValue: 5000 },
      { id: 52, name: '额定转速', unit: 'r/min', defaultValue: 1500, minValue: 1000, maxValue: 2000 },
      { id: 53, name: '主燃料低热值', unit: 'kJ/kg', defaultValue: 19900, minValue: 19000, maxValue: 21000 },
      { id: 54, name: '引燃燃料低热值', unit: 'kJ/kg', defaultValue: 42700, minValue: 40000, maxValue: 45000 },
      { id: 55, name: '25%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 380, minValue: 330, maxValue: 430 },
      { id: 56, name: '25%工况下引燃燃油消耗率', unit: 'g/kWh', defaultValue: 18, minValue: 9, maxValue: 30 },
      { id: 57, name: '50%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 360, minValue: 310, maxValue: 410 },
      { id: 58, name: '50%工况下引燃燃油消耗率', unit: 'g/kWh', defaultValue: 15, minValue: 7, maxValue: 25 },
      { id: 59, name: '75%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 350, minValue: 300, maxValue: 400 },
      { id: 60, name: '75%工况下引燃燃油消耗率', unit: 'g/kWh', defaultValue: 13, minValue: 6, maxValue: 22 },
      { id: 61, name: '100%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 370, minValue: 320, maxValue: 420 },
      { id: 62, name: '100%工况下引燃燃油消耗率', unit: 'g/kWh', defaultValue: 16, minValue: 8, maxValue: 28 }
    ]
  }
])

// 设备类型映射
const deviceTypeMap = {
  'diesel-low': '船用柴油发动机（低速机）',
  'diesel-medium': '船用柴油发动机（中速机）',
  'lng-diesel-low': '船用LNG/柴油双燃料发动机（低速机）',
  'lng-diesel-medium': '船用LNG/柴油双燃料发动机（中速机）',
  'methanol-diesel-low': '船用甲醇/柴油双燃料发动机（低速机）',
  'methanol-diesel-medium': '船用甲醇/柴油双燃料发动机（中速机）'
}

// 设备参数数据
const deviceTechnicalParams = ref({
  'diesel-low': {},
  'diesel-medium': {},
  'lng-diesel-low': {},
  'lng-diesel-medium': {},
  'methanol-diesel-low': {},
  'methanol-diesel-medium': {}
})

// 获取设备参数模板
const getDeviceParams = (deviceId) => {
  console.log('getDeviceParams called with deviceId:', deviceId)
  if (!deviceId) {
    console.log('deviceId is empty')
    return []
  }
  const deviceTypeName = deviceTypeMap[deviceId]
  console.log('deviceTypeName:', deviceTypeName)
  if (!deviceTypeName) {
    console.log('deviceTypeName not found')
    return []
  }
  const template = paramTemplates.value.find(t => t.deviceType === deviceTypeName)
  console.log('template found:', template)
  const params = template ? template.params : []
  console.log('params returned:', params)
  return params
}

// 获取参数值
const getParamValue = (deviceId, paramId) => {
  if (!deviceTechnicalParams.value[deviceId]) {
    deviceTechnicalParams.value[deviceId] = {}
  }
  if (deviceTechnicalParams.value[deviceId][paramId] === undefined) {
    // 如果参数值未设置，使用模板中的默认值
    const params = getDeviceParams(deviceId)
    const param = params.find(p => p.id === paramId)
    if (param) {
      deviceTechnicalParams.value[deviceId][paramId] = param.defaultValue
    }
  }
  return deviceTechnicalParams.value[deviceId][paramId]
}

// 更新参数值
const updateParamValue = (deviceId, paramId, value) => {
  if (!deviceTechnicalParams.value[deviceId]) {
    deviceTechnicalParams.value[deviceId] = {}
  }
  deviceTechnicalParams.value[deviceId][paramId] = parseFloat(value)
}

const toggleHistoryData = (id) => {
  const index = selectedHistoryData.value.indexOf(id)
  if (index > -1) {
    selectedHistoryData.value.splice(index, 1)
  } else {
    selectedHistoryData.value.push(id)
  }
}



const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const nextStep = () => {
  if (currentStep.value === 0 && !selectedDevice.value) {
    alert('请先选择设备类型')
    return
  }
  
  if (currentStep.value === 1 && !currentDeviceParams.value?.brand) {
    alert('请先填写设备品牌')
    return
  }
  
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

const executeEval = () => {
  // 执行评估逻辑
  console.log('执行能效评估...')
  
  // 模拟评估结果
  evalScore.value = Math.floor(Math.random() * 20) + 75 // 75-95之间的随机数
  
  // 根据得分设置能效等级
  if (evalScore.value >= 90) {
    scoreLevel.value = '1级'
    scoreClass.value = 'excellent'
  } else if (evalScore.value >= 80) {
    scoreLevel.value = '2级'
    scoreClass.value = 'good'
  } else {
    scoreLevel.value = '3级'
    scoreClass.value = 'average'
  }
  
  // 保持在当前步骤，显示评估结果
  // currentStep.value = 4 // 不再跳转，因为已合并为一个步骤
}

const finishWizard = () => {
  // 构建评估数据
  const evalData = {
    deviceName: engineInfo.value.engineType || getDeviceName(selectedDevice.value),
    deviceClass: selectedDevice.value,
    evalModel: 'ISO 15550:2016',
    score: Math.round(calculatedEfficiency.value),
    level: efficiencyLevel.value,
    levelClass: efficiencyLevelClass.value.replace('level-', 'level-')
  }
  emit('complete', evalData)
}



const closeWizard = () => {
  dialogVisible.value = false
  emit('close')
}
</script>

<style scoped>
.eval-wizard {
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.wizard-progress {
  margin-bottom: 24px;
  padding: 20px 0;
}

.wizard-content {
  flex: 1;
  overflow-y: auto;
  padding: 0 20px;
}

/* 设备信息单元格 */
.device-info-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.device-name {
  font-weight: 600;
  color: #333;
}

.device-detail {
  font-size: 12px;
  color: #999;
}

/* 参数单位提示 */
.param-unit-hint {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.step-panel {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.step-header {
  margin-bottom: 24px;
}

.step-header h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.step-header p {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.device-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
}

.device-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.device-card:hover {
  border-color: #2563eb;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.device-card.selected {
  border-color: #2563eb;
  background: #eff6ff;
}

.device-icon {
  font-size: 32px;
}

.device-info {
  flex: 1;
}

.device-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.device-info p {
  margin: 0;
  font-size: 12px;
  color: #64748b;
}

.device-checkbox {
  margin-top: 4px;
}

.device-selection {
  margin-top: 24px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #64748b;
}

.form-control {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.device-description {
  margin-top: 20px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.device-description h4 {
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.device-description p {
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: #64748b;
}

.device-checkbox input {
  width: 16px;
  height: 16px;
}

.data-source-tabs {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.source-tab {
  padding: 10px 20px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.source-tab.active {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.history-section {
  margin-top: 16px;
}

.no-data {
  padding: 40px;
  text-align: center;
  color: #64748b;
  border: 1px dashed #e2e8f0;
  border-radius: 8px;
  margin-top: 16px;
}

.history-data-list {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
  background-color: white;
}

.history-data-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8fafc;
  border-bottom: 2px solid #e2e8f0;
  font-weight: 600;
  font-size: 13px;
  color: #475569;
}

.history-data-header .header-info {
  flex: 1;
}

.history-data-header .header-meta {
  width: 120px;
  text-align: center;
}

.history-data-header .header-checkbox {
  width: 48px;
  text-align: center;
}

.history-data-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  transition: all 0.3s ease;
}

.history-data-item .data-info {
  flex: 1;
  min-width: 0;
}

.history-data-item:hover {
  background-color: #f8fafc;
}

.history-data-item.selected {
  background: #eff6ff;
}

.history-data-item .data-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.history-data-item .data-info p {
  margin: 0;
  font-size: 12px;
  color: #64748b;
}

.history-data-item .data-meta {
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
  width: 120px;
  text-align: center;
}

.history-data-item .data-checkbox {
  width: 48px;
  text-align: center;
}

.config-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.config-tab {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.3s ease;
}

.config-tab.active {
  background: #2563eb;
  color: white;
  border-color: #2563eb;
}

.device-params-container {
  margin-top: 20px;
  padding: 20px;
  background-color: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.params-grid {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.param-group {
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
}

.param-group h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
}

.form-group input {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
}

.form-group input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.param-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.param-unit {
  font-size: 12px;
  color: #64748b;
  font-weight: normal;
}

.param-range {
  font-size: 12px;
  color: #64748b;
  margin-top: 4px;
}

.tech-params-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.param-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.param-item input {
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
}

.param-item input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.param-label label {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
}

.weight-settings {
  margin-top: 24px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
}

.weight-settings h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.weight-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.weight-item label {
  width: 100px;
  font-size: 13px;
  color: #64748b;
}

.weight-item input[type="range"] {
  flex: 1;
  height: 6px;
  border-radius: 3px;
  background: #e2e8f0;
}

.weight-item span {
  width: 50px;
  text-align: right;
  font-size: 13px;
  color: #64748b;
}

.eval-summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.summary-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: #f8fafc;
  border-radius: 8px;
}

.summary-icon {
  font-size: 32px;
}

.summary-info h4 {
  margin: 0 0 4px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.summary-info p {
  margin: 0;
  font-size: 13px;
  color: #64748b;
}

.eval-action {
  text-align: center;
  padding: 40px 0;
}

.btn-lg {
  padding: 14px 40px;
  font-size: 16px;
  font-weight: 600;
}

.eval-result {
  text-align: center;
  padding: 20px 0;
}

.result-score {
  margin-bottom: 32px;
}

.score-circle {
  width: 160px;
  height: 160px;
  border-radius: 50%;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.score-circle.excellent {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.score-circle.good {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
}

.score-circle.poor {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

.score-value {
  font-size: 48px;
  font-weight: 700;
  line-height: 1;
}

.score-label {
  font-size: 14px;
  opacity: 0.9;
  margin-top: 4px;
}

.score-level {
  font-size: 20px;
  font-weight: 600;
}

.score-level.excellent { color: #10b981; }
.score-level.good { color: #2563eb; }
.score-level.poor { color: #ef4444; }

.result-details {
  background: #f8fafc;
  border-radius: 8px;
  padding: 24px;
  text-align: left;
  max-width: 500px;
  margin: 0 auto;
}

.result-details h4 {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e2e8f0;
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 13px;
  color: #64748b;
}

.detail-value {
  font-size: 13px;
  font-weight: 500;
  color: #1e293b;
}

.wizard-footer {
  display: flex;
  justify-content: space-between;
  padding: 20px 24px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.btn {
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary {
  background: white;
  border: 1px solid #e2e8f0;
  color: #64748b;
}

.btn-secondary:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: #2563eb;
  border: 1px solid #2563eb;
  color: white;
}

.btn-primary:hover {
  background: #1d4ed8;
}

@media (max-width: 768px) {
  .wizard-progress {
    padding: 16px;
  }
  
  .step-label {
    font-size: 11px;
  }
  
  .eval-summary {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}

.eval-content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.eval-section {
  background: #f8fafc;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
}

.section-title h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.section-hint {
  font-size: 12px;
  color: #9ca3af;
}

.data-import-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 32px;
  background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 20px;
}

.data-import-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
}

.import-icon {
  font-size: 48px;
  margin-bottom: 12px;
}

.data-import-box h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

.data-import-box p {
  margin: 0;
  font-size: 14px;
  color: #666;
}

.info-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.info-row label {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.info-value {
  font-size: 16px;
  color: #1e293b;
}

.info-value.readonly {
  padding: 8px 12px;
  background: white;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.info-hint {
  font-size: 12px;
  color: #9ca3af;
}

.info-select {
  padding: 10px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  outline: none;
  transition: all 0.3s ease;
}

.info-select:focus {
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.base-values-table table {
  width: 100%;
  border-collapse: collapse;
}

.base-values-table th,
.base-values-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  font-size: 13px;
}

.base-values-table th {
  background: white;
  font-weight: 600;
  color: #333;
}

.base-values-table tr:hover {
  background: white;
}

.params-table table {
  width: 100%;
  border-collapse: collapse;
}

.params-table th,
.params-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  font-size: 13px;
}

.params-table th {
  background: white;
  font-weight: 600;
  color: #333;
}

.param-input {
  width: 100px;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  text-align: right;
  outline: none;
  transition: all 0.3s ease;
}

.param-input:focus {
  border-color: #2563eb;
}

.formula-display {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
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
  margin-bottom: 20px;
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

.calculate-btn-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.btn-lg {
  padding: 12px 32px;
  font-size: 16px;
}

.efficiency-result {
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border-radius: 12px;
  padding: 20px;
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

.result-value.efficiency-level {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 16px;
}

.efficiency-level.level-1 {
  background: #22c55e;
  color: white;
}

.efficiency-level.level-2 {
  background: #f59e0b;
  color: white;
}

.efficiency-level.level-3 {
  background: #ef4444;
  color: white;
}

.result-hint {
  font-size: 12px;
  color: #9ca3af;
}

@media (max-width: 1024px) {
  .eval-content-grid {
    grid-template-columns: 1fr;
  }
}
</style>
