<template>
  <div class="modal-overlay" @click="handleClose">
    <div class="modal-content comparison-modal" @click.stop>
      <div class="modal-header">
        <h2>对比分析</h2>
        <button class="close-btn" @click="handleClose">×</button>
      </div>
      
      <div class="comparison-analysis-container">
        <!-- 模式选择页面 -->
        <div v-if="currentView === 'mode-select'" class="mode-select-view">
          <div class="mode-section">
            <h4>选择对比模式</h4>
            <div class="mode-cards">
              <div 
                class="mode-card" 
                :class="{ selected: selectedMode === 'A' }"
                @click="selectMode('A')"
              >
                <div class="mode-icon">🔄</div>
                <div class="mode-title">模式A：同型号-不同船型</div>
                <div class="mode-desc">同一设备型号，在不同船舶类型上的能效对比</div>
              </div>

              <div 
                class="mode-card" 
                :class="{ selected: selectedMode === 'B' }"
                @click="selectMode('B')"
              >
                <div class="mode-icon">⚙️</div>
                <div class="mode-title">模式B：同设备-不同工况</div>
                <div class="mode-desc">同一设备/船型，在不同运行工况下的能效对比</div>
              </div>

              <div 
                class="mode-card" 
                :class="{ selected: selectedMode === 'C' }"
                @click="selectMode('C')"
              >
                <div class="mode-icon">📊</div>
                <div class="mode-title">模式C：同设备-不同数据来源</div>
                <div class="mode-desc">出厂定额 vs 台架试验 vs 实船运行数据对比</div>
              </div>

              <div 
                class="mode-card" 
                :class="{ selected: selectedMode === 'D' }"
                @click="selectMode('D')"
              >
                <div class="mode-icon">📋</div>
                <div class="mode-title">模式D：自由对比</div>
                <div class="mode-desc">自定义选择多个已完成评估任务进行对比</div>
              </div>
            </div>
          </div>

          <div class="action-bar">
            <button class="btn btn-primary" :disabled="!selectedMode" @click="goToConfig">
              下一步：配置对比条件
            </button>
          </div>
        </div>

        <!-- 模式A：同型号-不同船型 配置页面 -->
        <div v-else-if="currentView === 'config-A'" class="config-view">
          <div class="config-header">
            <button class="btn btn-link" @click="backToModeSelect">← 返回模式选择</button>
            <span class="config-title">对比分析 > 同型号-不同船型</span>
          </div>

          <div class="config-steps">
            <div class="step">
              <h4>步骤1：选择设备型号</h4>
              <div class="step-content">
                <div class="form-row">
                  <div class="form-group">
                    <label>设备品牌</label>
                    <select v-model="configA.brand" @change="onBrandChange">
                      <option value="">请选择品牌</option>
                      <option value="MAN B&W">MAN B&W</option>
                      <option value="Wärtsilä">Wärtsilä</option>
                      <option value="Cummins">Cummins</option>
                      <option value="Caterpillar">Caterpillar</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>设备型号</label>
                    <select v-model="configA.model" :disabled="!configA.brand">
                      <option value="">请选择型号</option>
                      <option v-for="m in filteredModelsA" :key="m" :value="m">{{ m }}</option>
                    </select>
                  </div>
                </div>
                <div class="form-hint">型号联动，仅展示该品牌下的型号</div>
              </div>
            </div>

            <div class="step">
              <h4>步骤2：选择工况条件</h4>
              <div class="step-content">
                <div class="form-row">
                  <div class="form-group">
                    <label>运行工况</label>
                    <select v-model="configA.loadCondition">
                      <option value="">请选择工况</option>
                      <option value="100%">100%额定工况</option>
                      <option value="75%">75%工况</option>
                      <option value="50%">50%工况</option>
                      <option value="25%">25%工况</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>试验循环</label>
                    <select v-model="configA.testCycle">
                      <option value="">请选择循环</option>
                      <option value="E2">E2（恒速辅机运行模式）</option>
                      <option value="E3">E3（推进特性）</option>
                      <option value="D2">D2（恒速辅机运行模式）</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>数据来源</label>
                    <select v-model="configA.dataSource">
                      <option value="">全部</option>
                      <option value="台架试验">台架试验</option>
                      <option value="实船运行">实船运行</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div class="step">
              <h4>步骤3：选择船型（多选）</h4>
              <div class="step-content">
                <div class="ship-type-list">
                  <div 
                    v-for="ship in shipTypes" 
                    :key="ship.id"
                    class="ship-type-item"
                    :class="{ selected: configA.shipTypes.includes(ship.id), disabled: ship.dataCount === 0 }"
                    @click="toggleShipTypeA(ship)"
                  >
                    <input type="checkbox" :checked="configA.shipTypes.includes(ship.id)" :disabled="ship.dataCount === 0">
                    <span class="ship-name">{{ ship.name }}</span>
                    <span class="data-count">数据：{{ ship.dataCount }}条可用</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="action-bar">
            <button class="btn btn-secondary" @click="handleClose">取消</button>
            <button class="btn btn-primary" :disabled="!canStartComparisonA" @click="startComparison">
              开始对比分析
            </button>
          </div>
        </div>

        <!-- 模式B：同设备-不同工况 配置页面 -->
        <div v-else-if="currentView === 'config-B'" class="config-view">
          <div class="config-header">
            <button class="btn btn-link" @click="backToModeSelect">← 返回模式选择</button>
            <span class="config-title">对比分析 > 同设备-不同工况</span>
          </div>

          <div class="config-steps">
            <div class="step">
              <h4>步骤1：选择设备</h4>
              <div class="step-content">
                <div class="form-row">
                  <div class="form-group">
                    <label>设备品牌</label>
                    <select v-model="configB.brand">
                      <option value="">请选择品牌</option>
                      <option value="MAN B&W">MAN B&W</option>
                      <option value="Wärtsilä">Wärtsilä</option>
                      <option value="Cummins">Cummins</option>
                      <option value="Caterpillar">Caterpillar</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>设备型号</label>
                    <select v-model="configB.model" :disabled="!configB.brand">
                      <option value="">请选择型号</option>
                      <option v-for="m in filteredModelsB" :key="m" :value="m">{{ m }}</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>所属船型（可选）</label>
                    <select v-model="configB.shipType">
                      <option value="">不限制</option>
                      <option value="VLCC">VLCC超大型油轮</option>
                      <option value="散货船">散货船</option>
                      <option value="集装箱船">集装箱船</option>
                      <option value="液化气船">液化气船</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div class="step">
              <h4>步骤2：选择对比的工况点（多选）</h4>
              <div class="step-content">
                <div class="condition-list">
                  <div 
                    v-for="cond in loadConditions" 
                    :key="cond.value"
                    class="condition-item"
                    :class="{ selected: configB.conditions.includes(cond.value) }"
                    @click="toggleConditionB(cond)"
                  >
                    <input type="checkbox" :checked="configB.conditions.includes(cond.value)">
                    <span class="condition-name">{{ cond.label }}</span>
                    <span class="condition-weight">加权系数：{{ cond.weight }}</span>
                  </div>
                </div>
                <div class="form-row" style="margin-top: 16px;">
                  <div class="form-group">
                    <label>试验循环</label>
                    <select v-model="configB.testCycle">
                      <option value="">请选择循环</option>
                      <option value="E2">E2（恒速辅机运行模式）</option>
                      <option value="E3">E3（推进特性）</option>
                      <option value="D2">D2（恒速辅机运行模式）</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div class="step">
              <h4>步骤3：选择数据来源</h4>
              <div class="step-content">
                <div class="radio-group">
                  <label class="radio-item">
                    <input type="radio" v-model="configB.dataSource" value="台架试验">
                    <span>仅台架试验数据</span>
                  </label>
                  <label class="radio-item">
                    <input type="radio" v-model="configB.dataSource" value="实船运行">
                    <span>仅实船运行数据</span>
                  </label>
                  <label class="radio-item">
                    <input type="radio" v-model="configB.dataSource" value="">
                    <span>全部可用数据</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="action-bar">
            <button class="btn btn-secondary" @click="handleClose">取消</button>
            <button class="btn btn-primary" :disabled="!canStartComparisonB" @click="startComparison">
              开始对比分析
            </button>
          </div>
        </div>

        <!-- 模式C：同设备-不同数据来源 配置页面 -->
        <div v-else-if="currentView === 'config-C'" class="config-view">
          <div class="config-header">
            <button class="btn btn-link" @click="backToModeSelect">← 返回模式选择</button>
            <span class="config-title">对比分析 > 同设备-不同数据来源</span>
          </div>

          <div class="config-steps">
            <div class="step">
              <h4>步骤1：选择设备</h4>
              <div class="step-content">
                <div class="form-row">
                  <div class="form-group">
                    <label>设备品牌</label>
                    <select v-model="configC.brand">
                      <option value="">请选择品牌</option>
                      <option value="MAN B&W">MAN B&W</option>
                      <option value="Wärtsilä">Wärtsilä</option>
                      <option value="Cummins">Cummins</option>
                      <option value="Caterpillar">Caterpillar</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>设备型号</label>
                    <select v-model="configC.model" :disabled="!configC.brand">
                      <option value="">请选择型号</option>
                      <option v-for="m in filteredModelsC" :key="m" :value="m">{{ m }}</option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>所属船型（可选）</label>
                    <select v-model="configC.shipType">
                      <option value="">不限制</option>
                      <option value="VLCC">VLCC超大型油轮</option>
                      <option value="散货船">散货船</option>
                      <option value="集装箱船">集装箱船</option>
                      <option value="液化气船">液化气船</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div class="step">
              <h4>步骤2：选择工况</h4>
              <div class="step-content">
                <div class="form-row">
                  <div class="form-group">
                    <label>运行工况</label>
                    <select v-model="configC.loadCondition">
                      <option value="">请选择工况</option>
                      <option value="100%">100%额定工况</option>
                      <option value="75%">75%工况</option>
                      <option value="50%">50%工况</option>
                      <option value="25%">25%工况</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div class="step">
              <h4>步骤3：选择对比的数据来源</h4>
              <div class="step-content">
                <div class="checkbox-group">
                  <label class="checkbox-item">
                    <input type="checkbox" v-model="configC.dataSources" value="出厂定额">
                    <span>出厂定额（设备参数管理中的默认值）</span>
                  </label>
                  <label class="checkbox-item">
                    <input type="checkbox" v-model="configC.dataSources" value="台架试验">
                    <span>台架试验数据</span>
                  </label>
                  <label class="checkbox-item">
                    <input type="checkbox" v-model="configC.dataSources" value="实船运行">
                    <span>实船运行数据</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div class="action-bar">
            <button class="btn btn-secondary" @click="handleClose">取消</button>
            <button class="btn btn-primary" :disabled="!canStartComparisonC" @click="startComparison">
              开始对比分析
            </button>
          </div>
        </div>

        <!-- 模式D：自由对比 配置页面 -->
        <div v-else-if="currentView === 'config-D'" class="config-view">
          <div class="config-header">
            <button class="btn btn-link" @click="backToModeSelect">← 返回模式选择</button>
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
                  <div class="task-list">
                    <div class="list-header">
                      <span class="col-checkbox"></span>
                      <span class="col-name">任务名称</span>
                      <span class="col-device">设备</span>
                      <span class="col-score">得分</span>
                      <span class="col-level">等级</span>
                    </div>
                    <div 
                      v-for="task in completedTasks" 
                      :key="task.id" 
                      class="task-item"
                      :class="{ selected: selectedTaskIds.includes(task.id) }"
                      @click="toggleTask(task)"
                    >
                      <input type="checkbox" :checked="selectedTaskIds.includes(task.id)">
                      <div class="task-name">{{ task.name }}</div>
                      <div class="task-device">{{ task.device }}</div>
                      <div class="task-score">{{ task.score }}</div>
                      <div class="task-level"><span class="level-badge" :class="'level-' + task.levelClass">{{ task.level }}</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="action-bar">
            <button class="btn btn-secondary" @click="handleClose">取消</button>
            <button class="btn btn-primary" :disabled="selectedTaskIds.length < 2" @click="startComparison">
              开始对比分析
            </button>
          </div>
        </div>

        <!-- 结果展示页面 -->
        <div v-else-if="currentView === 'results'" class="results-view">
          <div class="results-header">
            <button class="btn btn-link" @click="backToConfig">← 返回配置</button>
            <span class="results-title">对比分析结果</span>
            <div class="header-actions">
              <button class="btn btn-sm btn-secondary" @click="exportPDF">导出PDF</button>
              <button class="btn btn-sm btn-secondary" @click="exportExcel">导出Excel</button>
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
                <table class="comparison-table">
                  <thead>
                    <tr>
                      <th>指标</th>
                      <th v-for="col in comparisonColumns" :key="col">{{ col }}</th>
                      <th>对比差异</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in comparisonTableData" :key="row.indicator">
                      <td>{{ row.indicator }}</td>
                      <td v-for="(val, i) in row.values" :key="i">{{ val }}</td>
                      <td :class="row.diffClass">{{ row.diff }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
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
  shipTypes: []
})

// 模式B配置
const configB = ref({
  brand: '',
  model: '',
  shipType: '',
  conditions: [],
  testCycle: '',
  dataSource: ''
})

// 模式C配置
const configC = ref({
  brand: '',
  model: '',
  shipType: '',
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

// 船型列表
const shipTypes = ref([
  { id: 'VLCC', name: 'VLCC超大型油轮', dataCount: 2 },
  { id: '散货船', name: '散货船', dataCount: 1 },
  { id: '集装箱船', name: '集装箱船', dataCount: 3 },
  { id: '液化气船', name: '液化气船', dataCount: 0 }
])

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
         configA.value.shipTypes.length >= 2
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

const toggleShipTypeA = (ship) => {
  if (ship.dataCount === 0) return
  const index = configA.value.shipTypes.indexOf(ship.id)
  if (index > -1) {
    configA.value.shipTypes.splice(index, 1)
  } else {
    configA.value.shipTypes.push(ship.id)
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
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
  max-width: 900px;
  width: 90%;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e2e8f0;
  background: #f8fafc;
}

.modal-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  font-size: 24px;
  color: #64748b;
  cursor: pointer;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: #e2e8f0;
  color: #333;
}

.comparison-analysis-container {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

/* 模式选择视图 */
.mode-section h4 {
  margin: 0 0 16px 0;
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.mode-cards {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.mode-card {
  padding: 16px;
  background: #fff;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.mode-card:hover {
  border-color: #2563eb;
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);
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

/* 配置视图 */
.config-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.config-title {
  font-size: 15px;
  font-weight: 600;
  color: #333;
}

.config-steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.step {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
}

.step h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.step-content {
  padding: 0 4px;
}

.form-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.form-group {
  flex: 1;
  min-width: 150px;
}

.form-group label {
  display: block;
  font-size: 12px;
  color: #64748b;
  margin-bottom: 4px;
}

.form-group select,
.form-group input {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 13px;
  background: #fff;
}

.form-group select:focus,
.form-group input:focus {
  outline: none;
  border-color: #2563eb;
}

.form-hint {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 6px;
}

/* 船型列表 */
.ship-type-list,
.condition-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.ship-type-item,
.condition-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.ship-type-item:hover:not(.disabled),
.condition-item:hover {
  background: #f1f5f9;
}

.ship-type-item.selected,
.condition-item.selected {
  background: #eff6ff;
  border-color: #2563eb;
}

.ship-type-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

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

/* 单选组 */
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  cursor: pointer;
}

/* 复选框组 */
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.checkbox-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  cursor: pointer;
}

/* 任务选择器 */
.task-selector {
  background: #fff;
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

.list-header {
  display: flex;
  padding: 8px 12px;
  background: #f1f5f9;
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
}

.task-item {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid #e2e8f0;
  cursor: pointer;
  transition: background 0.2s;
}

.task-item:last-child {
  border-bottom: none;
}

.task-item:hover {
  background: #f8fafc;
}

.task-item.selected {
  background: #eff6ff;
}

.col-checkbox { width: 30px; }
.col-name { flex: 2; }
.col-device { flex: 1; }
.col-score { width: 60px; text-align: center; }
.col-level { width: 60px; text-align: center; }

.task-name { flex: 2; font-size: 13px; }
.task-device { flex: 1; font-size: 12px; color: #64748b; }
.task-score { width: 60px; text-align: center; font-size: 13px; font-weight: 500; }
.task-level { width: 60px; text-align: center; }

.level-badge {
  display: inline-block;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  color: white;
}

.level-badge.level-1 { background-color: #22c55e; }
.level-badge.level-2 { background-color: #3b82f6; }
.level-badge.level-3 { background-color: #f59e0b; }
.level-badge.level-4 { background-color: #f97316; }
.level-badge.level-5 { background-color: #ef4444; }

/* 操作栏 */
.action-bar {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid #e2e8f0;
}

/* 按钮样式 */
.btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1d4ed8;
}

.btn-primary:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #e2e8f0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #cbd5e1;
}

.btn-link {
  background: none;
  border: none;
  color: #2563eb;
  cursor: pointer;
  font-size: 13px;
}

.btn-link:hover {
  text-decoration: underline;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
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

.results-content {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
}

.comparison-condition {
  padding: 10px 12px;
  background: #fff;
  border-radius: 6px;
  font-size: 13px;
  color: #64748b;
  margin-bottom: 16px;
}

.results-section {
  margin-bottom: 20px;
}

.results-section:last-child {
  margin-bottom: 0;
}

.results-section h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
}

.efficiency-chart {
  padding: 16px;
  background: #fff;
  border-radius: 6px;
}

.chart-container {
  height: 200px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 30px;
  padding-top: 16px;
}

.bar-chart {
  display: flex;
  align-items: flex-end;
  gap: 20px;
}

.bar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.bar-label {
  font-size: 12px;
  font-weight: 500;
  color: #333;
}

.bar-wrapper {
  width: 50px;
  height: 150px;
  background: #e2e8f0;
  border-radius: 4px;
  display: flex;
  align-items: flex-end;
  overflow: hidden;
}

.bar {
  width: 100%;
  border-radius: 4px;
  transition: height 0.5s ease;
}

.bar-value {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

/* 对比表格 */
.comparison-table-container {
  overflow-x: auto;
  background: #fff;
  border-radius: 6px;
}

.comparison-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.comparison-table th,
.comparison-table td {
  padding: 10px 12px;
  text-align: left;
  border: 1px solid #e2e8f0;
}

.comparison-table th {
  background: #f8fafc;
  font-weight: 600;
}

.comparison-table td.positive {
  color: #22c55e;
}

.comparison-table td.negative {
  color: #ef4444;
}

.comparison-table td.neutral {
  color: #64748b;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .mode-cards {
    grid-template-columns: 1fr;
  }

  .form-row {
    flex-direction: column;
  }

  .form-group {
    min-width: 100%;
  }
}
</style>
