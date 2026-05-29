<template>
  <el-dialog 
    v-model="dialogVisible" 
    title="能效评估向导"
    width="1100px"
    :close-on-click-modal="false"
    @close="closeWizard"
  >
    <div class="eval-wizard">
      <!-- 步骤条 -->
      <el-steps :active="currentStep + 1" finish-status="success" align-center class="wizard-progress" simple>
        <el-step 
          v-for="(step, index) in steps" 
          :key="index"
          :title="step.label"
          :icon="getStepIcon(index)"
        />
      </el-steps>

      <div class="wizard-content">
        <!-- 第一步：选择样机模型 -->
        <StepModelSelect 
          v-if="currentStep === 0"
          :model-options="modelOptions"
          :selected-model-id="selectedModelId"
          @update:selected-model-id="selectedModelId = $event"
          @add="handleAddModel"
        />

        <!-- 第二步：选择能效数据 -->
        <StepDataSelect
          v-if="currentStep === 1"
          :history-data="historyData"
          :selected-history-data="selectedHistoryData"
          @update:selected-history-data="selectedHistoryData = $event"
        />

        <!-- 第三步：计算评估 -->
        <StepCalculation
          v-if="currentStep === 2"
          :selected-model="selectedModel"
          :engine-info="engineInfo"
          :selected-history-data="selectedHistoryData"
          :show-result="showEfficiencyResult"
          :calculated-efficiency="calculatedEfficiency"
          :efficiency-level="efficiencyLevel"
          :efficiency-level-class="efficiencyLevelClass"
          :current-fuel-config="currentFuelConfig"
          @calculate="handleCalculate"
        />

        <!-- 向导底部按钮 -->
        <div class="wizard-footer">
          <el-button @click="prevStep" :disabled="currentStep === 0">
            ← 上一步
          </el-button>
          <el-button 
            v-if="currentStep < 2" 
            type="primary" 
            @click="nextStep"
          >
            下一步 →
          </el-button>
          <el-button 
            v-if="currentStep === 2 && showEfficiencyResult" 
            type="success" 
            @click="finishWizard"
          >
            完成
          </el-button>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { Box, Document, Cpu } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import StepModelSelect from './process/StepModelSelect.vue'
import StepDataSelect from './process/StepDataSelect.vue'
import StepCalculation from './process/StepCalculation.vue'

const emit = defineEmits(['close', 'complete', 'switch-to-system'])

const props = defineProps({
  globalState: {
    type: Object,
    default: () => ({})
  }
})

// 对话框可见性
const dialogVisible = ref(true)
const currentStep = ref(0)
const selectedModelId = ref('')
const selectedHistoryData = ref(null)

// 步骤定义
const steps = [
  { label: '选择样机模型' },
  { label: '选择能效数据' },
  { label: '计算评估' }
]

// 获取步骤图标
const getStepIcon = (index) => {
  const icons = [Box, Document, Cpu]
  return icons[index] || Box
}

// 样机模型数据
const models = computed(() => {
  return props.globalState?.models || []
})

const modelOptions = computed(() => {
  return models.value.map(model => ({
    id: model.id,
    name: model.name,
    deviceType: model.deviceType,
    category: model.category,
    description: model.description
  }))
})

// 选中的样机模型
const selectedModel = computed(() => {
  return modelOptions.value.find(m => m.id === selectedModelId.value) || null
})

// 历史数据
const historyData = ref([
  { id: 1, dataDate: '2024-04-20', deviceType: '船用柴油发动机（低速机）', deviceName: 'MAN B&W 6S70MC', dataSource: '台架试验', workingCondition: '额定工况' },
  { id: 2, dataDate: '2024-04-15', deviceType: '船用柴油发动机（中速机）', deviceName: 'Cummins QSK60', dataSource: '实船运行', workingCondition: '额定工况' },
  { id: 3, dataDate: '2024-04-10', deviceType: '船用LNG/柴油双燃料发动机（低速机）', deviceName: 'Wärtsilä 50DF', dataSource: '台架试验', workingCondition: '额定工况' },
  { id: 4, dataDate: '2024-04-05', deviceType: '船用LNG/柴油双燃料发动机（中速机）', deviceName: 'Caterpillar 3516E', dataSource: '实船运行', workingCondition: '变工况' },
  { id: 5, dataDate: '2024-04-01', deviceType: '船用甲醇/柴油双燃料发动机（低速机）', deviceName: 'MAN B&W ME-LGIM', dataSource: '台架试验', workingCondition: '低负荷' },
  { id: 6, dataDate: '2024-03-25', deviceType: '船用甲醇/柴油双燃料发动机（中速机）', deviceName: 'Wärtsilä 32 Methanol', dataSource: '实船运行', workingCondition: '额定工况' }
])

// 设备信息
const engineInfo = ref({
  brand: '',
  engineType: '',
  emissionLevel: 'Tier II'
})

// 燃料配置
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
    paramDesc: 'W: 加权系数; BSGC: 燃气消耗率; BSPC: 引燃油消耗率'
  }
}

const currentFuelConfig = computed(() => {
  const engineType = engineInfo.value.engineType
  if (!engineType) return null
  
  if (engineType.includes('LNG')) return fuelTypeConfig['LNG']
  if (engineType.includes('甲醇')) return fuelTypeConfig['甲醇']
  return fuelTypeConfig['柴油']
})

// 品牌映射
const brandMap = {
  '船用柴油发动机（低速机）': 'MAN B&W',
  '船用柴油发动机（中速机）': 'Cummins',
  '船用LNG/柴油双燃料发动机（低速机）': 'Wärtsilä',
  '船用LNG/柴油双燃料发动机（中速机）': 'Caterpillar',
  '船用甲醇/柴油双燃料发动机（低速机）': 'MAN B&W',
  '船用甲醇/柴油双燃料发动机（中速机）': 'Wärtsilä'
}

// 监听样机选择变化
watch(selectedModelId, (newModelId) => {
  if (newModelId) {
    const model = modelOptions.value.find(m => m.id === newModelId)
    if (model) {
      engineInfo.value.engineType = model.deviceType || ''
      engineInfo.value.brand = brandMap[model.deviceType] || ''
    }
  }
})

// 计算结果
const showEfficiencyResult = ref(false)
const calculatedEfficiency = ref(0)

const efficiencyLevel = computed(() => {
  if (calculatedEfficiency.value >= 85) return '1级'
  if (calculatedEfficiency.value >= 75) return '2级'
  return '3级'
})

const efficiencyLevelClass = computed(() => {
  if (calculatedEfficiency.value >= 85) return 'level-1'
  if (calculatedEfficiency.value >= 75) return 'level-2'
  return 'level-3'
})

// 计算能效
const handleCalculate = () => {
  // 模拟计算过程
  setTimeout(() => {
    calculatedEfficiency.value = Math.random() * 20 + 75 // 75-95之间的随机数
    showEfficiencyResult.value = true
  }, 1500)
}

// 步骤导航
const prevStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

const nextStep = () => {
  // 第一步：校验样机模型
  if (currentStep.value === 0 && !selectedModelId.value) {
    ElMessage.warning('请先选择样机模型')
    return
  }
  
  // 第二步：校验能效数据
  if (currentStep.value === 1 && !selectedHistoryData.value) {
    ElMessage.warning('请选择或导入能效数据')
    return
  }
  
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  }
}

// 关闭向导
const closeWizard = () => {
  emit('close')
}

// 完成向导
const finishWizard = () => {
  const evalData = {
    deviceName: selectedModel.value?.name || engineInfo.value.engineType,
    deviceClass: selectedModel.value?.deviceType || '',
    evalModel: 'ISO 15550:2016',
    score: Math.round(calculatedEfficiency.value),
    level: efficiencyLevel.value,
    levelClass: efficiencyLevelClass.value
  }
  emit('complete', evalData)
}

// 新增样机模型
const handleAddModel = () => {
  // 关闭向导弹窗
  closeWizard()
  // 通知父组件切换到系统管理-样机模型管理
  emit('switch-to-system')
  // 触发新增操作
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('openModelForm', { detail: { mode: 'add' } }))
  }, 100)
}
</script>

<style scoped>
.eval-wizard {
  display: flex;
  flex-direction: column;
  height: 600px;
}

/* 步骤条样式 */
.wizard-progress {
  margin-bottom: 24px;
  padding: 0 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e8eaf0 100%);
  border-radius: 8px;
  padding-top: 16px;
  padding-bottom: 16px;
}

.wizard-progress :deep(.el-step__title) {
  font-size: 14px;
  font-weight: 500;
}

.wizard-progress :deep(.el-step__icon) {
  width: 40px;
  height: 40px;
}

.wizard-progress :deep(.el-step__icon-inner) {
  font-size: 20px;
}

/* 对话框美化 */
:deep(.el-dialog) {
  border-radius: 12px;
  overflow: hidden;
}

:deep(.el-dialog__header) {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  padding: 20px 24px;
  margin-right: 0;
}

:deep(.el-dialog__title) {
  color: #ffffff;
  font-size: 20px;
  font-weight: 600;
}

:deep(.el-dialog__headerbtn .el-dialog__close) {
  color: #ffffff;
  font-size: 20px;
}

:deep(.el-dialog__headerbtn:hover .el-dialog__close) {
  color: #f0f0f0;
}

:deep(.el-dialog__body) {
  padding: 24px;
  background-color: #fafbfc;
}

/* 内容区域 */
.wizard-content {
  flex: 1;
  overflow-y: auto;
  padding: 0;
  background: #ffffff;
  border-radius: 8px;
  margin-bottom: 20px;
}

.wizard-content::-webkit-scrollbar {
  width: 6px;
}

.wizard-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.wizard-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.wizard-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 底部按钮区域 */
.wizard-footer {
  display: flex;
  justify-content: space-between;
  padding: 20px;
  margin-top: 20px;
  border-top: 2px solid #e4e7ed;
  background: #fafbfc;
  margin-left: -20px;
  margin-right: -20px;
  margin-bottom: -24px;
  border-radius: 0 0 8px 8px;
}

.wizard-footer .el-button {
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 500;
}

.wizard-footer .el-button--primary {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  border: none;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.3);
}

.wizard-footer .el-button--primary:hover {
  background: linear-gradient(135deg, #66b1ff 0%, #409eff 100%);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}

.wizard-footer .el-button--success {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  border: none;
  box-shadow: 0 2px 8px rgba(103, 194, 58, 0.3);
}

.wizard-footer .el-button--success:hover {
  background: linear-gradient(135deg, #85ce61 0%, #67c23a 100%);
  box-shadow: 0 4px 12px rgba(103, 194, 58, 0.4);
}
</style>
