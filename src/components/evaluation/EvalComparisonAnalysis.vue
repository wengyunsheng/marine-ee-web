<template>
  <el-dialog 
    v-model="dialogVisible" 
    title="对比分析"
    width="80%"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="comparison-analysis-container">
        <!-- 模式选择页面 -->
        <div v-if="currentView === 'mode-select'" class="mode-select-view">
          <div class="mode-section">
            <h4>选择对比模式</h4>
            <el-row :gutter="16" class="mode-cards">
              <el-col :span="12">
                <el-card 
                  shadow="hover" 
                  class="mode-card"
                  :class="{ selected: selectedMode === 'A' }"
                  @click="selectMode('A')"
                >
                  <div class="mode-icon">🔄</div>
                  <div class="mode-title">模式A：同型号-不同工况</div>
                  <div class="mode-desc">同一设备型号，在不同运行工况下的能效对比</div>
                </el-card>
              </el-col>

              <el-col :span="12">
                <el-card 
                  shadow="hover" 
                  class="mode-card"
                  :class="{ selected: selectedMode === 'B' }"
                  @click="selectMode('B')"
                >
                  <div class="mode-icon">⚙️</div>
                  <div class="mode-title">模式B：同设备-不同工况</div>
                  <div class="mode-desc">同一设备，在不同运行工况下的能效对比</div>
                </el-card>
              </el-col>

              <el-col :span="12">
                <el-card 
                  shadow="hover" 
                  class="mode-card"
                  :class="{ selected: selectedMode === 'C' }"
                  @click="selectMode('C')"
                >
                  <div class="mode-icon">📊</div>
                  <div class="mode-title">模式C：同设备-不同数据来源</div>
                  <div class="mode-desc">出厂定额 vs 台架试验 vs 实船运行数据对比</div>
                </el-card>
              </el-col>

              <el-col :span="12">
                <el-card 
                  shadow="hover" 
                  class="mode-card"
                  :class="{ selected: selectedMode === 'D' }"
                  @click="selectMode('D')"
                >
                  <div class="mode-icon">📋</div>
                  <div class="mode-title">模式D：自由对比</div>
                  <div class="mode-desc">自定义选择多个已完成评估任务进行对比</div>
                </el-card>
              </el-col>
            </el-row>
          </div>

          <div class="action-bar">
            <el-button type="primary" :disabled="!selectedMode" @click="goToConfig">
              下一步：配置对比条件
            </el-button>
          </div>
        </div>

        <!-- 模式A：同型号-不同工况 配置页面 -->
        <div v-else-if="currentView === 'config-A'" class="config-view">
          <div class="config-header">
            <el-button link @click="backToModeSelect">← 返回模式选择</el-button>
            <span class="config-title">对比分析 > 同型号-不同工况</span>
          </div>

          <div class="config-steps">
            <div class="step">
              <h4>步骤1：选择设备型号</h4>
              <div class="step-content">
                <el-form label-width="120px">
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <el-form-item label="设备品牌">
                        <el-select v-model="configA.brand" placeholder="请选择品牌" style="width: 100%" @change="onBrandChange">
                          <el-option value="MAN B&W" label="MAN B&W" />
                          <el-option value="Wärtsilä" label="Wärtsilä" />
                          <el-option value="Cummins" label="Cummins" />
                          <el-option value="Caterpillar" label="Caterpillar" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item label="设备型号">
                        <el-select v-model="configA.model" placeholder="请选择型号" :disabled="!configA.brand" style="width: 100%">
                          <el-option v-for="m in filteredModelsA" :key="m" :label="m" :value="m" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form>
                <div class="form-hint">型号联动，仅展示该品牌下的型号</div>
              </div>
            </div>

            <div class="step">
              <h4>步骤2：选择工况条件</h4>
              <div class="step-content">
                <el-form label-width="120px">
                  <el-row :gutter="20">
                    <el-col :span="8">
                      <el-form-item label="运行工况">
                        <el-select v-model="configA.loadCondition" placeholder="请选择工况" style="width: 100%">
                          <el-option value="100%" label="100%额定工况" />
                          <el-option value="75%" label="75%工况" />
                          <el-option value="50%" label="50%工况" />
                          <el-option value="25%" label="25%工况" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="试验循环">
                        <el-select v-model="configA.testCycle" placeholder="请选择循环" style="width: 100%">
                          <el-option value="E2" label="E2（恒速辅机运行模式）" />
                          <el-option value="E3" label="E3（推进特性）" />
                          <el-option value="D2" label="D2（恒速辅机运行模式）" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="数据来源">
                        <el-select v-model="configA.dataSource" placeholder="全部" style="width: 100%">
                          <el-option value="" label="全部" />
                          <el-option value="台架试验" label="台架试验" />
                          <el-option value="实船运行" label="实船运行" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form>
              </div>
            </div>

            <div class="step">
              <h4>步骤3：选择对比工况（多选）</h4>
              <div class="step-content">
                <el-checkbox-group v-model="configA.selectedConditions" class="condition-list">
                  <el-checkbox 
                    v-for="cond in loadConditions" 
                    :key="cond.value"
                    :label="cond.value"
                    class="condition-item"
                  >
                    <span class="condition-name">{{ cond.label }}</span>
                    <span class="condition-weight">加权系数：{{ cond.weight }}</span>
                  </el-checkbox>
                </el-checkbox-group>
              </div>
            </div>
          </div>

          <div class="action-bar">
            <el-button @click="handleClose">取消</el-button>
            <el-button type="primary" :disabled="!canStartComparisonA" @click="startComparison">
              开始对比分析
            </el-button>
          </div>
        </div>

        <!-- 模式B：同设备-不同工况 配置页面 -->
        <div v-else-if="currentView === 'config-B'" class="config-view">
          <div class="config-header">
            <el-button link @click="backToModeSelect">← 返回模式选择</el-button>
            <span class="config-title">对比分析 > 同设备-不同工况</span>
          </div>

          <div class="config-steps">
            <div class="step">
              <h4>步骤1：选择设备</h4>
              <div class="step-content">
                <el-form label-width="120px">
                  <el-row :gutter="20">
                    <el-col :span="8">
                      <el-form-item label="设备品牌">
                        <el-select v-model="configB.brand" placeholder="请选择品牌" style="width: 100%">
                          <el-option value="MAN B&W" label="MAN B&W" />
                          <el-option value="Wärtsilä" label="Wärtsilä" />
                          <el-option value="Cummins" label="Cummins" />
                          <el-option value="Caterpillar" label="Caterpillar" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="设备型号">
                        <el-select v-model="configB.model" placeholder="请选择型号" :disabled="!configB.brand" style="width: 100%">
                          <el-option v-for="m in filteredModelsB" :key="m" :label="m" :value="m" />
                        </el-select>
                      </el-form-item>
                    </el-col>

                  </el-row>
                </el-form>
              </div>
            </div>

            <div class="step">
              <h4>步骤2：选择对比的工况点（多选）</h4>
              <div class="step-content">
                <el-checkbox-group v-model="configB.conditions" class="condition-list">
                  <el-checkbox 
                    v-for="cond in loadConditions" 
                    :key="cond.value"
                    :label="cond.value"
                    class="condition-item"
                  >
                    <span class="condition-name">{{ cond.label }}</span>
                    <span class="condition-weight">加权系数：{{ cond.weight }}</span>
                  </el-checkbox>
                </el-checkbox-group>
                <el-form label-width="120px" style="margin-top: 16px">
                  <el-row :gutter="20">
                    <el-col :span="8">
                      <el-form-item label="试验循环">
                        <el-select v-model="configB.testCycle" placeholder="请选择循环" style="width: 100%">
                          <el-option value="E2" label="E2（恒速辅机运行模式）" />
                          <el-option value="E3" label="E3（推进特性）" />
                          <el-option value="D2" label="D2（恒速辅机运行模式）" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form>
              </div>
            </div>

            <div class="step">
              <h4>步骤3：选择数据来源</h4>
              <div class="step-content">
                <el-radio-group v-model="configB.dataSource">
                  <el-radio value="台架试验">仅台架试验数据</el-radio>
                  <el-radio value="实船运行">仅实船运行数据</el-radio>
                  <el-radio value="">全部可用数据</el-radio>
                </el-radio-group>
              </div>
            </div>
          </div>

          <div class="action-bar">
            <el-button @click="handleClose">取消</el-button>
            <el-button type="primary" :disabled="!canStartComparisonB" @click="startComparison">
              开始对比分析
            </el-button>
          </div>
        </div>

        <!-- 模式C：同设备-不同数据来源 配置页面 -->
        <div v-else-if="currentView === 'config-C'" class="config-view">
          <div class="config-header">
            <el-button link @click="backToModeSelect">← 返回模式选择</el-button>
            <span class="config-title">对比分析 > 同设备-不同数据来源</span>
          </div>

          <div class="config-steps">
            <div class="step">
              <h4>步骤1：选择设备</h4>
              <div class="step-content">
                <el-form label-width="120px">
                  <el-row :gutter="20">
                    <el-col :span="8">
                      <el-form-item label="设备品牌">
                        <el-select v-model="configC.brand" placeholder="请选择品牌" style="width: 100%">
                          <el-option value="MAN B&W" label="MAN B&W" />
                          <el-option value="Wärtsilä" label="Wärtsilä" />
                          <el-option value="Cummins" label="Cummins" />
                          <el-option value="Caterpillar" label="Caterpillar" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="8">
                      <el-form-item label="设备型号">
                        <el-select v-model="configC.model" placeholder="请选择型号" :disabled="!configC.brand" style="width: 100%">
                          <el-option v-for="m in filteredModelsC" :key="m" :label="m" :value="m" />
                        </el-select>
                      </el-form-item>
                    </el-col>

                  </el-row>
                </el-form>
              </div>
            </div>

            <div class="step">
              <h4>步骤2：选择工况</h4>
              <div class="step-content">
                <el-form label-width="120px">
                  <el-row :gutter="20">
                    <el-col :span="8">
                      <el-form-item label="运行工况">
                        <el-select v-model="configC.loadCondition" placeholder="请选择工况" style="width: 100%">
                          <el-option value="100%" label="100%额定工况" />
                          <el-option value="75%" label="75%工况" />
                          <el-option value="50%" label="50%工况" />
                          <el-option value="25%" label="25%工况" />
                        </el-select>
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form>
              </div>
            </div>

            <div class="step">
              <h4>步骤3：选择对比的数据来源</h4>
              <div class="step-content">
                <el-checkbox-group v-model="configC.dataSources">
                  <el-checkbox value="出厂定额">出厂定额（设备参数管理中的默认值）</el-checkbox>
                  <el-checkbox value="台架试验">台架试验数据</el-checkbox>
                  <el-checkbox value="实船运行">实船运行数据</el-checkbox>
                </el-checkbox-group>
              </div>
            </div>
          </div>

          <div class="action-bar">
            <el-button @click="handleClose">取消</el-button>
            <el-button type="primary" :disabled="!canStartComparisonC" @click="startComparison">
              开始对比分析
            </el-button>
          </div>
        </div>

        <!-- 模式D：自由对比 配置页面 -->
        <div v-else-if="currentView === 'config-D'" class="config-view">
          <div class="config-header">
            <el-button link @click="backToModeSelect">← 返回模式选择</el-button>
            <span class="config-title">对比分析 > 自由对比</span>
          </div>

          <div class="config-steps">
            <div class="step">
              <h4>选择评估任务（至少选择2个）</h4>
              <div class="step-content">
                <div class="task-selector">
                  <div class="selector-header">
                    <span>已完成评估任务</span>
                    <span class="count">已选 {{ selectedTaskIds.length }} 个</span>
                  </div>
                  <el-table 
                    :data="completedTasks" 
                    style="width: 100%"
                    highlight-current-row
                    @row-click="toggleTask"
                  >
                    <el-table-column type="selection" width="55" align="center">
                      <template #default="{ row }">
                        <el-checkbox 
                          :model-value="selectedTaskIds.includes(row.id)"
                          @change="() => toggleTask(row)"
                          @click.stop
                        />
                      </template>
                    </el-table-column>
                    <el-table-column label="任务名称" prop="name" min-width="200" />
                    <el-table-column label="设备" prop="device" min-width="150" />
                    <el-table-column label="得分" prop="score" width="80" align="center" />
                    <el-table-column label="等级" width="80" align="center">
                      <template #default="{ row }">
                        <el-tag :type="getLevelType(row.levelClass)" size="small">{{ row.level }}</el-tag>
                      </template>
                    </el-table-column>
                  </el-table>
                </div>
              </div>
            </div>
          </div>

          <div class="action-bar">
            <el-button @click="handleClose">取消</el-button>
            <el-button type="primary" :disabled="selectedTaskIds.length < 2" @click="startComparison">
              开始对比分析
            </el-button>
          </div>
        </div>

        <!-- 结果展示页面 -->
        <div v-else-if="currentView === 'results'" class="results-view">
          <div class="results-header">
            <el-button link @click="backToConfig">← 返回配置</el-button>
            <span class="results-title">对比分析结果</span>
            <div class="header-actions">
              <el-button size="small" @click="exportPDF">导出PDF</el-button>
              <el-button size="small" @click="exportExcel">导出Excel</el-button>
            </div>
          </div>

          <div class="results-content">
            <div class="comparison-condition">
              对比条件：{{ comparisonConditionText }}
            </div>

            <div class="results-section">
              <h4>一、能效指标对比总览</h4>
              <div class="efficiency-chart">
                <div class="chart-container">
                  <div class="bar-chart">
                    <div 
                      v-for="(item, index) in chartData" 
                      :key="index"
                      class="bar-item"
                    >
                      <div class="bar-label">{{ item.label }}</div>
                      <div class="bar-wrapper">
                        <div class="bar" :style="{ height: item.value * 2 + '%', backgroundColor: item.color }"></div>
                      </div>
                      <div class="bar-value">{{ item.value }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="results-section">
              <h4>二、详细数据对比表</h4>
              <div class="comparison-table-container">
                <el-table :data="comparisonTableData" style="width: 100%" border>
                  <el-table-column prop="indicator" label="指标" width="150" />
                  <el-table-column 
                    v-for="(col, index) in comparisonColumns" 
                    :key="col"
                    :label="col"
                    align="center"
                  >
                    <template #default="{ row }">
                      {{ row.values[index] }}
                    </template>
                  </el-table-column>
                  <el-table-column label="对比差异" align="center">
                    <template #default="{ row }">
                      <span :class="row.diffClass">{{ row.diff }}</span>
                    </template>
                  </el-table-column>
                </el-table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  tasks: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close'])

const handleClose = () => {
  emit('close')
}

// 对话框可见性
const dialogVisible = ref(true)

// 当前视图状态
const currentView = ref('mode-select')
const selectedMode = ref('')

// 模式A配置
const configA = ref({
  brand: '',
  model: '',
  loadCondition: '',
  testCycle: '',
  dataSource: '',
  selectedConditions: []
})

// 模式B配置
const configB = ref({
  brand: '',
  model: '',
  conditions: [],
  testCycle: '',
  dataSource: ''
})

// 模式C配置
const configC = ref({
  brand: '',
  model: '',
  loadCondition: '',
  dataSources: []
})

// 模式D选择的任务
const selectedTaskIds = ref([])

// 品牌对应的型号
const brandModels = {
  'MAN B&W': ['6S70MC', '5S80MC', '7S80ME'],
  'Wärtsilä': ['50DF', '32 Methanol', '31SG'],
  'Cummins': ['QSK60', 'QSK50', 'KTA50'],
  'Caterpillar': ['3516E', '3500C', 'C280']
}

const filteredModelsA = computed(() => {
  return configA.value.brand ? brandModels[configA.value.brand] || [] : []
})

const filteredModelsB = computed(() => {
  return configB.value.brand ? brandModels[configB.value.brand] || [] : []
})

const filteredModelsC = computed(() => {
  return configC.value.brand ? brandModels[configC.value.brand] || [] : []
})

// 工况列表
const loadConditions = ref([
  { value: '25%', label: '25%工况', weight: '0.15' },
  { value: '50%', label: '50%工况', weight: '0.15' },
  { value: '75%', label: '75%工况', weight: '0.5' },
  { value: '100%', label: '100%工况', weight: '0.2' }
])

// 完成的评估任务
const completedTasks = computed(() => {
  return props.tasks.filter(task => task.status === '已完成' || task.status === 'completed')
})

// 结果数据
const chartData = ref([
  { label: 'VLCC', value: 52.3, color: '#3b82f6' },
  { label: '散货船', value: 54.1, color: '#22c55e' },
  { label: '集装箱船', value: 51.8, color: '#f59e0b' }
])

const comparisonColumns = ref(['VLCC', '散货船', '集装箱船'])

const comparisonTableData = ref([
  { indicator: '能效指标值', values: [52.3, 54.1, 51.8], diff: '+2.3', diffClass: 'positive' },
  { indicator: '额定功率(kW)', values: [15000, 15000, 15000], diff: '0', diffClass: 'neutral' },
  { indicator: '额定转速(r/min)', values: [100, 100, 100], diff: '0', diffClass: 'neutral' },
  { indicator: 'EEDI指数', values: [5.2, 4.8, 5.5], diff: '+0.7', diffClass: 'negative' }
])

const comparisonConditionText = computed(() => {
  if (selectedMode.value === 'A') {
    return `${configA.value.brand} ${configA.value.model} | ${configA.value.loadCondition} | ${configA.value.testCycle}循环`
  } else if (selectedMode.value === 'B') {
    return `${configB.value.brand} ${configB.value.model} | ${configB.value.conditions.join('/')} | ${configB.value.testCycle}循环`
  } else if (selectedMode.value === 'C') {
    return `${configC.value.brand} ${configC.value.model} | ${configC.value.loadCondition} | ${configC.value.dataSources.join('/')}`
  }
  return '自由对比'
})

// 计算属性
const canStartComparisonA = computed(() => {
  return configA.value.brand && configA.value.model && 
         configA.value.loadCondition && configA.value.testCycle && 
         configA.value.selectedConditions.length >= 2
})

const canStartComparisonB = computed(() => {
  return configB.value.brand && configB.value.model && 
         configB.value.conditions.length >= 2 && configB.value.testCycle
})

const canStartComparisonC = computed(() => {
  return configC.value.brand && configC.value.model && 
         configC.value.loadCondition && configC.value.dataSources.length >= 2
})

// 方法
const selectMode = (mode) => {
  selectedMode.value = mode
}

const goToConfig = () => {
  if (selectedMode.value === 'A') {
    currentView.value = 'config-A'
  } else if (selectedMode.value === 'B') {
    currentView.value = 'config-B'
  } else if (selectedMode.value === 'C') {
    currentView.value = 'config-C'
  } else if (selectedMode.value === 'D') {
    currentView.value = 'config-D'
  }
}

const backToModeSelect = () => {
  currentView.value = 'mode-select'
  selectedMode.value = ''
}

const backToConfig = () => {
  if (selectedMode.value === 'A') {
    currentView.value = 'config-A'
  } else if (selectedMode.value === 'B') {
    currentView.value = 'config-B'
  } else if (selectedMode.value === 'C') {
    currentView.value = 'config-C'
  } else if (selectedMode.value === 'D') {
    currentView.value = 'config-D'
  }
}

const onBrandChange = () => {
  configA.value.model = ''
}

const toggleConditionA = (cond) => {
  const index = configA.value.selectedConditions.indexOf(cond)
  if (index > -1) {
    configA.value.selectedConditions.splice(index, 1)
  } else {
    configA.value.selectedConditions.push(cond)
  }
}

const toggleConditionB = (cond) => {
  const index = configB.value.conditions.indexOf(cond.value)
  if (index > -1) {
    configB.value.conditions.splice(index, 1)
  } else {
    configB.value.conditions.push(cond.value)
  }
}

const toggleTask = (task) => {
  const index = selectedTaskIds.value.indexOf(task.id)
  if (index > -1) {
    selectedTaskIds.value.splice(index, 1)
  } else {
    selectedTaskIds.value.push(task.id)
  }
}

const startComparison = () => {
  currentView.value = 'results'
}

const exportPDF = () => {
  alert('导出PDF功能开发中')
}

const exportExcel = () => {
  alert('导出Excel功能开发中')
}

// 获取等级标签类型
const getLevelType = (levelClass) => {
  const typeMap = {
    'level-1': 'success',
    'level-2': '',
    'level-3': 'warning',
    'level-4': 'danger',
    'level-5': 'danger'
  }
  return typeMap[levelClass] || ''
}
</script>

<style scoped>
.comparison-analysis-container {
  padding: 20px;
}

/* 模式选择视图 */
.mode-section h4 {
  margin: 0 0 16px 0;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.mode-cards {
  margin-top: 16px;
}

.mode-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.mode-card.selected {
  border-color: #2563eb;
  background: #eff6ff;
}

.mode-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.mode-title {
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.mode-desc {
  font-size: 12px;
  color: #64748b;
  line-height: 1.4;
}


.form-hint {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 6px;
}

/* 工况列表 */

.ship-name,
.condition-name {
  flex: 1;
  font-size: 13px;
  color: #333;
}

.data-count {
  font-size: 12px;
  color: #64748b;
}

.condition-weight {
  font-size: 12px;
  color: #64748b;
}
/* 单选组和复选框组样式调整 */
:deep(.el-radio-group),
:deep(.el-checkbox-group) {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

:deep(.el-checkbox),
:deep(.el-radio) {
  margin-right: 0;
}

/* 任务选择器 */
.task-selector {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
}

.selector-header {
  display: flex;
  justify-content: space-between;
  padding: 10px 12px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  font-size: 13px;
  font-weight: 500;
}

.selector-header .count {
  color: #2563eb;
}
/* 操作栏 */
.action-bar {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

/* 结果视图 */
.results-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.results-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
  flex: 1;
}

.header-actions {
  display: flex;
  gap: 8px;
}
</style>
