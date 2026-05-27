<template>
  <div class="efficiency-level-container">
    <div class="efficiency-level-controls">
      <div class="control-group">
        <el-button type="primary" @click="openAddModal">
          <el-icon><Plus /></el-icon>
          新增能效等级和能效基值
        </el-button>
        <el-button @click="importBaseValues">导入能效等级和能效基值</el-button>
        <el-button @click="exportBaseValues">导出能效等级和能效基值</el-button>
      </div>

      <div class="search-filter">
        <el-input 
          v-model="searchQuery" 
          placeholder="搜索设备类型" 
          clearable
          style="width: 200px;"
          @keyup.enter="filterBaseValues"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-select v-model="categoryFilter" placeholder="全部类别" clearable style="width: 150px;" @change="filterBaseValues">
          <el-option label="全部类别" value="" />
          <el-option v-for="opt in categoryOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
        <el-select v-model="engineTypeFilter" placeholder="全部设备类型" clearable style="width: 200px;" @change="filterBaseValues">
          <el-option label="全部设备类型" value="" />
          <el-option v-for="opt in engineTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
      </div>
    </div>

    <div class="efficiency-level-list-section">
      <h3>能效等级和能效基值列表</h3>
      <el-table :data="paginatedBaseValues" style="width: 100%" border stripe>
        <el-table-column prop="engineType" label="设备类型名称" min-width="220" />
        <el-table-column label="类别" min-width="200">
          <template #default="scope">
            <span class="device-category" :class="scope.row.category">
              {{ getCategoryName(scope.row.category) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column v-if="showColumn('emissionLevel')" prop="emissionLevel" label="排放等级" width="120">
          <template #default="scope">
            {{ scope.row.emissionLevel || '-' }}
          </template>
        </el-table-column>
        <el-table-column v-if="showColumn('capacityRange')" prop="capacityRange" :label="capacityRangeColumnHeader" width="150">
          <template #default="scope">
            {{ scope.row.capacityRange || '-' }}
          </template>
        </el-table-column>
        <el-table-column v-if="showColumn('powerRange')" prop="powerRange" :label="powerRangeColumnHeader" width="150">
          <template #default="scope">
            {{ scope.row.powerRange || '-' }}
          </template>
        </el-table-column>
        <el-table-column v-if="showColumn('secondaryRange')" prop="secondaryRange" :label="secondaryRangeColumnHeader" width="150">
          <template #default="scope">
            {{ scope.row.secondaryRange || '-' }}
          </template>
        </el-table-column>
        <el-table-column v-if="showColumn('temperatureRange')" prop="temperatureRange" :label="temperatureRangeColumnHeader" width="150">
          <template #default="scope">
            {{ scope.row.temperatureRange || '-' }}
          </template>
        </el-table-column>
        <el-table-column v-if="showColumn('steamPressure')" prop="steamPressure" :label="steamPressureColumnHeader" width="150">
          <template #default="scope">
            {{ scope.row.steamPressure || '-' }}
          </template>
        </el-table-column>
        <el-table-column v-if="showColumn('steamType')" prop="steamType" :label="steamTypeColumnHeader" width="150">
          <template #default="scope">
            {{ scope.row.steamType || '-' }}
          </template>
        </el-table-column>
        <el-table-column v-if="showColumn('metricType')" prop="metricType" :label="getMetricTypeLabel" width="120">
          <template #default="scope">
            {{ getMetricTypeName(scope.row.metricType) }}
          </template>
        </el-table-column>
        <el-table-column prop="efficiencyLevel" label="能效等级" width="120" />
        <el-table-column prop="baseValue" label="能效基值" width="120" />
        <el-table-column prop="unit" label="单位" width="120">
          <template #default="scope">
            {{ scope.row.unit || '-' }}
          </template>
        </el-table-column>
        <el-table-column prop="remark" label="说明" width="120">
          <template #default="scope">
            {{ scope.row.remark || '-' }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="scope">
            <el-button type="primary" size="small" @click="openViewModal(scope.row)">查看</el-button>
            <el-button type="warning" size="small" @click="openEditModal(scope.row)">编辑</el-button>
            <el-button type="danger" size="small" @click="deleteBaseValue(scope.row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="pageSizes"
          :total="filteredBaseValues.length"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="resetPage"
        />
      </div>
    </div>

    <EfficiencyLevelView v-if="showViewModal" :base-value="currentBaseValue" :category-config="categoryConfig" @close="closeViewModal" />
    <EfficiencyLevelForm v-if="showFormModal" :is-edit="isEditMode" :form-data="formData" :category-config="categoryConfig" @save="saveBaseValue" @close="closeFormModal" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import EfficiencyLevelForm from './components/EfficiencyLevelForm.vue'
import EfficiencyLevelView from './components/EfficiencyLevelView.vue'

const searchQuery = ref('')
const engineTypeFilter = ref('')
const categoryFilter = ref('')
const showFormModal = ref(false)
const showViewModal = ref(false)
const isEditMode = ref(false)
const currentBaseValue = ref(null)

// ===== 类别配置（唯一数据源） =====
const categoryConfig = {
  engine: {
    label: '船用发动机',
    engineTypes: ['船用柴油发动机（低速机）', '船用柴油发动机（中速机）', '船用LNG/柴油双燃料发动机（低速机）', '船用LNG/柴油双燃料发动机（中速机）', '船用甲醇/柴油双燃料发动机（低速机）', '船用甲醇/柴油双燃料发动机（中速机）'],
    dimensions: ['emissionLevel', 'powerRange'],
    dimensionConfig: {
      emissionLevel: { label: '排放等级', type: 'select', options: ['Tier Ι', 'Tier II', 'Tier III'], required: true },
      powerRange: { label: '参数区间', rangeLabel: '单缸功率 P/kW', type: 'text', required: true }
    },
    metricTypes: [],
    metricLabel: '',
    defaultUnit: '',
    baseValueType: 'number'
  },
  gearbox: {
    label: '船用齿轮箱',
    engineTypes: ['单台齿轮箱', '两台齿轮箱'],
    dimensions: [],
    dimensionConfig: {},
    metricTypes: [],
    defaultUnit: '%',
    baseValueType: 'number'
  },
  'waste-heat': {
    label: '船用余热回收发电装置',
    engineTypes: ['船用有机朗肯循环发电装置', '船用蒸汽透平发电装置'],
    dimensions: ['temperatureRange', 'powerRange'],
    dimensionConfig: {
      temperatureRange: { label: '热源温度', rangeLabel: '热源温度(℃)', type: 'select', options: ['<100', '100~120', '120~140'], required: true },
      powerRange: { label: '额定输出功率', rangeLabel: '额定输出功率(kW)', type: 'select', options: ['<150', '150~300', '300~500'], required: true }
    },
    subEngineConfig: {
      '船用蒸汽透平发电装置': {
        dimensions: ['steamPressure', 'steamType'],
        dimensionConfig: {
          steamPressure: { label: '蒸汽压力', rangeLabel: '蒸汽压力', type: 'select', options: ['5~7barg', '7~9barg'], required: true },
          steamType: { label: '蒸汽类型', rangeLabel: '蒸汽类型', type: 'select', options: ['饱和', '过热'], required: true }
        }
      }
    },
    metricTypes: [],
    defaultUnit: '%',
    baseValueType: 'string'
  },
  incinerator: {
    label: '船用焚烧炉',
    engineTypes: ['单功能焚烧炉（固体废弃物）', '单功能焚烧炉（污油泥）', '双功能焚烧炉', '多功能焚烧炉'],
    dimensions: ['capacityRange'],
    dimensionConfig: {
      capacityRange: { label: '额定处理热容量', rangeLabel: '额定处理热容量(kW)', type: 'text', required: true }
    },
    metricTypes: [],
    defaultUnit: '%',
    baseValueType: 'number'
  },
  separator: {
    label: '船用碟式分离机',
    engineTypes: ['船用碟式分离机'],
    dimensions: [],
    dimensionConfig: {},
    metricTypes: [],
    defaultUnit: 'kW·h/m³',
    baseValueType: 'string'  // 范围表示，如'≤0.80'
  },
  ballast: {
    label: '船用压载水处理设备',
    engineTypes: ['船用压载水处理设备'],
    dimensions: [],
    dimensionConfig: {},
    metricTypes: [],
    defaultUnit: 'kWh/100m³',
    baseValueType: 'number'
  },
  windlass: {
    label: '船用锚绞机',
    engineTypes: ['船用起锚机', '船用系泊绞车'],
    dimensions: [],
    dimensionConfig: {},
    metricTypes: [],
    defaultUnit: '%',
    baseValueType: 'string'  // 范围表示，如'≥77.0'
  },
  crane: {
    label: '船用吊机',
    engineTypes: ['船用吊机'],
    dimensions: ['powerRange', 'capacityRange'],
    dimensionConfig: {
      powerRange: { label: '参数区间', rangeLabel: '工作半径', type: 'text', required: true },
      capacityRange: { label: '参数区间', rangeLabel: '额定载荷/t', type: 'text', required: true }
    },
    metricTypes: [],
    metricLabel: '',
    defaultUnit: '',
    baseValueType: 'number'
  },
  generator: {
    label: '船用发电机',
    engineTypes: ['船用低压交流三相同步发电机', '船用中压交流三相同步发电机'],
    dimensions: ['powerRange', 'capacityRange', 'secondaryRange'],
    dimensionConfig: {
      capacityRange: { label: '参数区间', rangeLabel: '额定容量/kVA', type: 'text', required: true },
      powerRange: { label: '参数区间', rangeLabel: '额定功率/kW', type: 'text', required: true },
      secondaryRange: { label: '二级参数', secondaryRangeLabel: '转子极数/转速', type: 'select', options: ['转子4极(1500r/min)', '转子6极(1000r/min)'], required: true }
    },
    metricTypes: [],
    metricLabel: '',
    defaultUnit: '',
    baseValueType: 'number'
  },
  chiller: {
    label: '船用冷水机组',
    engineTypes: ['船用冷水机组'],
    dimensions: ['powerRange'],
    dimensionConfig: {
      powerRange: { label: '参数区间', rangeLabel: '名义制冷量/kW', type: 'select', options: ['CC≤300', '300<CC≤528', '528<CC≤1163', 'CC>1163'], required: true }
    },
    metricTypes: [
      { value: 'IPLV', label: 'IPLV(综合部分负荷性能系数)' },
      { value: 'COP', label: 'COP(性能系数)' }
    ],
    metricLabel: '能效指标类型',
    defaultUnit: '',
    baseValueType: 'number'
  },
  'air-conditioner': {
    label: '船用组合式空调机组',
    engineTypes: ['船用组合式空调机组'],
    dimensions: ['powerRange', 'secondaryRange'],
    dimensionConfig: {
      powerRange: { label: '参数区间', rangeLabel: '额定风量/CMH', type: 'text', required: true },
      secondaryRange: { label: '二级参数', secondaryRangeLabel: '机组全静压/Pa', type: 'select', options: ['500', '750', '1250', '2000', '3000'], required: true }
    },
    metricTypes: [
      { value: '直联式', label: '直联式(风机与电机直联)' },
      { value: '皮带轮传动式', label: '皮带轮传动式(乘0.85系数)' }
    ],
    metricLabel: '传动方式',
    defaultUnit: 'CMH/W',
    baseValueType: 'number'
  },
  'inert-gas': {
    label: '船用惰性气体系统',
    engineTypes: ['船用惰性气体系统'],
    dimensions: [],
    dimensionConfig: {},
    metricTypes: [],
    defaultUnit: 'kW h/Nm³',
    baseValueType: 'range'
  },
  'co2-capture': {
    label: '船用二氧化碳捕集设备',
    engineTypes: ['船用二氧化碳捕集设备'],
    dimensions: [],
    dimensionConfig: {},
    metricTypes: [],
    defaultUnit: 'GJ/tCO₂',
    baseValueType: 'number'
  },
  propeller: {
    label: '船用推进器',
    engineTypes: ['船用推进器'],
    dimensions: [],
    dimensionConfig: {},
    metricTypes: [],
    defaultUnit: '%',
    baseValueType: 'number'
  }
}

// 从配置派生选项
const categoryOptions = Object.entries(categoryConfig).map(([value, cfg]) => ({ value, label: cfg.label }))
const engineTypeOptions = Object.values(categoryConfig).flatMap(cfg => cfg.engineTypes.map(name => ({ value: name, label: name })))
const metricTypeOptions = [...new Map(Object.values(categoryConfig).flatMap(cfg => cfg.metricTypes).map(m => [m.value, m])).values()]
const allUnits = [...new Set(Object.values(categoryConfig).map(cfg => cfg.defaultUnit))]

const getCategoryName = (category) => categoryConfig[category]?.label || category
const getMetricTypeName = (metricType) => metricTypeOptions.find(m => m.value === metricType)?.label || metricType || '-'
const getActiveDimensions = (category) => {
  const cfg = categoryConfig[category]
  if (!cfg) return []
  
  // 检查是否有特定发动机的子配置
  if (engineTypeFilter.value && cfg.subEngineConfig && cfg.subEngineConfig[engineTypeFilter.value]) {
    return cfg.subEngineConfig[engineTypeFilter.value].dimensions
  }
  
  return cfg.dimensions
}

const getDimConfig = (category, dim) => {
  const cfg = categoryConfig[category]
  if (!cfg) return null
  
  // 检查是否有特定发动机的子配置
  if (engineTypeFilter.value && cfg.subEngineConfig && cfg.subEngineConfig[engineTypeFilter.value]) {
    return cfg.subEngineConfig[engineTypeFilter.value].dimensionConfig?.[dim]
  }
  
  return cfg.dimensionConfig?.[dim]
}

// 表格列可见性：筛选类别时只显示该类别有数据的列，未筛选时全部显示
const showColumn = (colKey) => {
  if (!categoryFilter.value) return true
  const cfg = categoryConfig[categoryFilter.value]
  if (!cfg) return true
  
  // 获取当前有效的维度配置
  const dimensions = getActiveDimensions(categoryFilter.value)
  
  if (colKey === 'emissionLevel') return dimensions.includes('emissionLevel')
  if (colKey === 'capacityRange') return dimensions.includes('capacityRange')
  if (colKey === 'powerRange') return dimensions.includes('powerRange')
  if (colKey === 'secondaryRange') return dimensions.includes('secondaryRange')
  if (colKey === 'temperatureRange') return dimensions.includes('temperatureRange')
  if (colKey === 'steamPressure') return dimensions.includes('steamPressure')
  if (colKey === 'steamType') return dimensions.includes('steamType')
  if (colKey === 'metricType') return cfg.metricTypes.length > 0
  return true
}

// 动态列头:筛选类别时取 dimensionConfig 中的 rangeLabel/secondaryRangeLabel,未筛选时用通用名称
const capacityRangeColumnHeader = computed(() => {
  if (!categoryFilter.value) return '参数区间'
  const cfg = categoryConfig[categoryFilter.value]
  return cfg?.dimensionConfig?.capacityRange?.rangeLabel || '参数区间'
})
const powerRangeColumnHeader = computed(() => {
  if (!categoryFilter.value) return '参数区间'
  const cfg = categoryConfig[categoryFilter.value]
  return cfg?.dimensionConfig?.powerRange?.rangeLabel || '参数区间'
})
const secondaryRangeColumnHeader = computed(() => {
  if (!categoryFilter.value) return '二级参数'
  const cfg = categoryConfig[categoryFilter.value]
  return cfg?.dimensionConfig?.secondaryRange?.secondaryRangeLabel || '二级参数'
})
const temperatureRangeColumnHeader = computed(() => {
  if (!categoryFilter.value) return '热源温度'
  const dimConfig = getDimConfig(categoryFilter.value, 'temperatureRange')
  return dimConfig?.rangeLabel || '热源温度'
})
const steamPressureColumnHeader = computed(() => {
  if (!categoryFilter.value) return '蒸汽压力'
  const dimConfig = getDimConfig(categoryFilter.value, 'steamPressure')
  return dimConfig?.rangeLabel || '蒸汽压力'
})
const steamTypeColumnHeader = computed(() => {
  if (!categoryFilter.value) return '蒸汽类型'
  const dimConfig = getDimConfig(categoryFilter.value, 'steamType')
  return dimConfig?.rangeLabel || '蒸汽类型'
})

// 动态获取 metricType 列名
const getMetricTypeLabel = computed(() => {
  if (!categoryFilter.value) return '能效指标类型'
  const cfg = categoryConfig[categoryFilter.value]
  return cfg?.metricLabel || '能效指标类型'
})

const defaultFormData = { id: null, category: '', emissionLevel: '', powerRange: '', capacityRange: '', rangeLabel: '', secondaryRange: '', secondaryRangeLabel: '', metricType: '', efficiencyLevel: '', baseValue: null, engineType: '', unit: '%' }
const formData = ref({ ...defaultFormData })

// 船用低压交流三相同步发电机数据生成
const generatorPowerRanges = [
  { kVA: 30, kW: 24 },
  { kVA: 37.5, kW: 30 },
  { kVA: 50, kW: 40 },
  { kVA: 62.5, kW: 50 },
  { kVA: 80, kW: 64 },
  { kVA: 93.75, kW: 75 },
  { kVA: 112.5, kW: 90 },
  { kVA: 150, kW: 120 },
  { kVA: 187.5, kW: 150 },
  { kVA: 250, kW: 200 },
  { kVA: 312.5, kW: 250 },
  { kVA: 350, kW: 280 }
]
const generatorRotors = ['转子4极(1500r/min)', '转子6极(1000r/min)']
const generatorDataTable = [
  [[89.2, 88.2], [88.4, 87.7], [86.5, 86.6]],
  [[89.7, 88.7], [89.0, 88.3], [87.1, 87.3]],
  [[90.5, 89.5], [89.8, 89.1], [88.0, 88.3]],
  [[91.1, 90.1], [90.5, 89.8], [88.8, 89.1]],
  [[91.6, 90.8], [91.1, 90.6], [89.7, 90.0]],
  [[92.0, 91.3], [91.5, 91.1], [90.2, 90.5]],
  [[92.3, 91.8], [92.0, 91.6], [90.8, 91.1]],
  [[92.8, 92.5], [92.5, 92.3], [91.7, 91.9]],
  [[93.1, 92.9], [92.9, 92.7], [92.2, 92.3]],
  [[93.6, 93.3], [93.3, 93.2], [92.8, 92.8]],
  [[93.9, 93.6], [93.7, 93.5], [93.1, 93.0]],
  [[94.1, 93.7], [93.8, 93.6], [93.3, 93.1]]
]
function generateGeneratorRecords() {
  const records = []
  let id = 88
  for (let i = 0; i < generatorPowerRanges.length; i++) {
    const { kVA, kW } = generatorPowerRanges[i]
    for (let j = 0; j < generatorRotors.length; j++) {
      for (let k = 0; k < 3; k++) {
        records.push({
          id: id++, category: 'generator', engineType: '船用低压交流三相同步发电机', emissionLevel: '',
          capacityRange: `${kVA}`, rangeLabel: '额定容量/kVA',
          powerRange: `${kW}`, rangeLabel: '额定功率/kW',
          secondaryRange: generatorRotors[j], secondaryRangeLabel: '转子极数/转速',
          metricType: '', efficiencyLevel: `${k + 1}级`, baseValue: generatorDataTable[i][j][k], unit: ''
        })
      }
    }
  }
  return records
}

// 船用组合式空调机组数据生成
// ✓ 确认值, 其余待核实
const acAirflowRanges = [
  '2000≤L<3000', '3000≤L<5000', '5000≤L<8000', '8000≤L<10000',
  '10000≤L<15000', '15000≤L<20000', '20000≤L<25000', '25000≤L<30000',
  '30000≤L<50000', '50000≤L<80000', '80000≤L<100000', '100000≤L<160000',
  '160000≤L≤200000'
]
const acStaticPressures = ['500', '750', '1250', '2000', '3000']
const acDataTable = [
  [[2.9, 2.4, 2.2], [2.6, 2.1, 1.9], [2.2, 1.8, 1.6], [1.7, 1.4, 1.3], [1.4, 1.2, 1.0]],
  [[2.6, 2.2, 2.0], [2.3, 1.9, 1.8], [2.0, 1.7, 1.5], [1.6, 1.3, 1.2], [1.3, 1.1, 1.0]],
  [[2.3, 1.9, 1.7], [2.1, 1.7, 1.6], [1.8, 1.5, 1.4], [1.5, 1.2, 1.1], [1.3, 1.0, 0.9]],
  [[2.1, 1.7, 1.5], [1.9, 1.6, 1.4], [1.7, 1.4, 1.2], [1.4, 1.1, 1.0], [1.2, 1.0, 0.9]],
  [[1.8, 1.5, 1.3], [1.7, 1.4, 1.2], [1.5, 1.2, 1.1], [1.3, 1.0, 0.9], [1.1, 0.9, 0.8]],
  [[1.6, 1.3, 1.1], [1.5, 1.2, 1.0], [1.3, 1.1, 0.9], [1.2, 0.9, 0.8], [1.0, 0.8, 0.7]],
  [[1.4, 1.2, 1.0], [1.3, 1.1, 0.9], [1.2, 1.0, 0.8], [1.0, 0.8, 0.7], [0.9, 0.7, 0.6]],
  [[1.3, 1.1, 0.9], [1.2, 1.0, 0.8], [1.1, 0.9, 0.8], [0.9, 0.8, 0.7], [0.8, 0.7, 0.6]],
  [[1.1, 0.9, 0.8], [1.0, 0.8, 0.7], [0.9, 0.8, 0.7], [0.8, 0.7, 0.6], [0.8, 0.6, 0.5]],
  [[0.9, 0.7, 0.6], [0.8, 0.7, 0.6], [0.8, 0.6, 0.5], [0.7, 0.6, 0.5], [0.7, 0.6, 0.5]],
  [[0.8, 0.7, 0.6], [0.8, 0.6, 0.5], [0.7, 0.6, 0.5], [0.6, 0.5, 0.4], [0.6, 0.5, 0.4]],
  [[0.7, 0.6, 0.5], [0.7, 0.5, 0.4], [0.6, 0.5, 0.4], [0.5, 0.4, 0.3], [0.5, 0.4, 0.3]],
  [[0.6, 0.5, 0.4], [0.6, 0.5, 0.4], [0.5, 0.4, 0.3], [0.5, 0.4, 0.3], [0.4, 0.3, 0.3]]
]
function generateACRecords() {
  const records = []
  let id = 88
  for (let i = 0; i < acAirflowRanges.length; i++) {
    for (let j = 0; j < acStaticPressures.length; j++) {
      const values = acDataTable[i][j]
      for (let k = 0; k < 3; k++) {
        records.push({
          id: id++, category: 'air-conditioner', engineType: '船用组合式空调机组', emissionLevel: '',
          powerRange: acAirflowRanges[i], rangeLabel: '额定风量/CMH',
          secondaryRange: acStaticPressures[j], secondaryRangeLabel: '机组全静压/Pa',
          metricType: '直联式', efficiencyLevel: `${k + 1}级`, baseValue: values[k], unit: 'CMH/W'
        })
      }
    }
  }
  return records
}

// 船用吊机数据生成
const craneWorkRadiusRanges = ['R < R1', 'R1 ≤ R < R2', 'R2 ≤ R < R3', 'R ≥ R3']
const craneLoadRanges = ['G < G1', 'G1 ≤ G < G2', 'G ≥ G2']
const craneDataTable = [
  [[62, 65], [60, 63], [58, 61]],   // R < R1
  [[58, 61], [56, 59], [54, 57]],   // R1 ≤ R < R2
  [[54, 57], [52, 55], [50, 53]],   // R2 ≤ R < R3
  [[50, 53], [48, 51], [46, 49]]    // R ≥ R3
]
function generateCraneRecords() {
  const records = []
  let id = 46
  for (let i = 0; i < craneWorkRadiusRanges.length; i++) {
    for (let j = 0; j < craneLoadRanges.length; j++) {
      for (let k = 0; k < 3; k++) {
        records.push({
          id: id++, category: 'crane', engineType: '船用吊机', emissionLevel: '',
          powerRange: craneWorkRadiusRanges[i], rangeLabel: '工作半径',
          capacityRange: craneLoadRanges[j], capacityRangeLabel: '额定载荷/t',
          metricType: '', efficiencyLevel: `${k + 1}级`, baseValue: craneDataTable[i][j][k], unit: ''
        })
      }
    }
  }
  return records
}

const efficiencyBaseValues = ref([
  // ===== 船用发动机 =====
  { id: 1, category: 'engine', engineType: '船用柴油发动机（中速机）', emissionLevel: 'Tier II', powerRange: 'P<360', rangeLabel: '单缸功率 P/kW', efficiencyLevel: '1级', baseValue: 45.8, unit: '' },
  { id: 2, category: 'engine', engineType: '船用柴油发动机（中速机）', emissionLevel: 'Tier II', powerRange: 'P<360', rangeLabel: '单缸功率 P/kW', efficiencyLevel: '2级', baseValue: 43.8, unit: '' },
  { id: 3, category: 'engine', engineType: '船用柴油发动机（中速机）', emissionLevel: 'Tier II', powerRange: 'P<360', rangeLabel: '单缸功率 P/kW', efficiencyLevel: '3级', baseValue: 42.4, unit: '' },
  { id: 4, category: 'engine', engineType: '船用柴油发动机（中速机）', emissionLevel: 'Tier II', powerRange: '500≤P<850', rangeLabel: '单缸功率 P/kW', efficiencyLevel: '1级', baseValue: 48.2, unit: '' },
  { id: 5, category: 'engine', engineType: '船用柴油发动机（中速机）', emissionLevel: 'Tier II', powerRange: '500≤P<850', rangeLabel: '单缸功率 P/kW', efficiencyLevel: '2级', baseValue: 45.5, unit: '' },
  { id: 6, category: 'engine', engineType: '船用柴油发动机（中速机）', emissionLevel: 'Tier II', powerRange: '500≤P<850', rangeLabel: '单缸功率 P/kW', efficiencyLevel: '3级', baseValue: 45.7, unit: '' },
  { id: 7, category: 'engine', engineType: '船用柴油发动机（中速机）', emissionLevel: 'Tier III', powerRange: '500≤P<850', rangeLabel: '单缸功率 P/kW', efficiencyLevel: '1级', baseValue: 47.0, unit: '' },
  { id: 8, category: 'engine', engineType: '船用柴油发动机（中速机）', emissionLevel: 'Tier III', powerRange: '500≤P<850', rangeLabel: '单缸功率 P/kW', efficiencyLevel: '2级', baseValue: 46.0, unit: '' },
  { id: 9, category: 'engine', engineType: '船用柴油发动机（中速机）', emissionLevel: 'Tier III', powerRange: '500≤P<850', rangeLabel: '单缸功率 P/kW', efficiencyLevel: '3级', baseValue: 43.6, unit: '' },
  // ===== 船用二氧化碳捕集设备 =====
  { id: 10, category: 'co2-capture', engineType: '船用二氧化碳捕集设备', emissionLevel: '', powerRange: '', efficiencyLevel: '1级', baseValue: 4.2, unit: 'GJ/tCO₂' },
  { id: 11, category: 'co2-capture', engineType: '船用二氧化碳捕集设备', emissionLevel: '', powerRange: '', efficiencyLevel: '2级', baseValue: 5.1, unit: 'GJ/tCO₂' },
  { id: 12, category: 'co2-capture', engineType: '船用二氧化碳捕集设备', emissionLevel: '', powerRange: '', efficiencyLevel: '3级', baseValue: 6, unit: 'GJ/tCO₂' },
  // ===== 船用余热回收发电装置 =====
  // 船用有机朗肯循环发电装置
  // 热源温度 <100℃
  { id: 13, category: 'waste-heat', engineType: '船用有机朗肯循环发电装置', emissionLevel: '', temperatureRange: '<100', rangeLabel: '热源温度(℃)', powerRange: '<150', rangeLabel: '额定输出功率(kW)', efficiencyLevel: '1级', baseValue: '30%·ηCarnot', unit: '%' },
  { id: 14, category: 'waste-heat', engineType: '船用有机朗肯循环发电装置', emissionLevel: '', temperatureRange: '<100', rangeLabel: '热源温度(℃)', powerRange: '<150', rangeLabel: '额定输出功率(kW)', efficiencyLevel: '2级', baseValue: '27%·ηCarnot', unit: '%' },
  { id: 15, category: 'waste-heat', engineType: '船用有机朗肯循环发电装置', emissionLevel: '', temperatureRange: '<100', rangeLabel: '热源温度(℃)', powerRange: '<150', rangeLabel: '额定输出功率(kW)', efficiencyLevel: '3级', baseValue: '24%·ηCarnot', unit: '%' },
  { id: 16, category: 'waste-heat', engineType: '船用有机朗肯循环发电装置', emissionLevel: '', temperatureRange: '<100', rangeLabel: '热源温度(℃)', powerRange: '150~300', rangeLabel: '额定输出功率(kW)', efficiencyLevel: '1级', baseValue: '33%·ηCarnot', unit: '%' },
  { id: 17, category: 'waste-heat', engineType: '船用有机朗肯循环发电装置', emissionLevel: '', temperatureRange: '<100', rangeLabel: '热源温度(℃)', powerRange: '150~300', rangeLabel: '额定输出功率(kW)', efficiencyLevel: '2级', baseValue: '30%·ηCarnot', unit: '%' },
  { id: 18, category: 'waste-heat', engineType: '船用有机朗肯循环发电装置', emissionLevel: '', temperatureRange: '<100', rangeLabel: '热源温度(℃)', powerRange: '150~300', rangeLabel: '额定输出功率(kW)', efficiencyLevel: '3级', baseValue: '27%·ηCarnot', unit: '%' },
  // 热源温度 100~120℃
  { id: 100, category: 'waste-heat', engineType: '船用有机朗肯循环发电装置', emissionLevel: '', temperatureRange: '100~120', rangeLabel: '热源温度(℃)', powerRange: '<150', rangeLabel: '额定输出功率(kW)', efficiencyLevel: '1级', baseValue: '33%·ηCarnot', unit: '%' },
  { id: 101, category: 'waste-heat', engineType: '船用有机朗肯循环发电装置', emissionLevel: '', temperatureRange: '100~120', rangeLabel: '热源温度(℃)', powerRange: '<150', rangeLabel: '额定输出功率(kW)', efficiencyLevel: '2级', baseValue: '30%·ηCarnot', unit: '%' },
  { id: 102, category: 'waste-heat', engineType: '船用有机朗肯循环发电装置', emissionLevel: '', temperatureRange: '100~120', rangeLabel: '热源温度(℃)', powerRange: '<150', rangeLabel: '额定输出功率(kW)', efficiencyLevel: '3级', baseValue: '27%·ηCarnot', unit: '%' },
  { id: 103, category: 'waste-heat', engineType: '船用有机朗肯循环发电装置', emissionLevel: '', temperatureRange: '100~120', rangeLabel: '热源温度(℃)', powerRange: '150~300', rangeLabel: '额定输出功率(kW)', efficiencyLevel: '1级', baseValue: '36%·ηCarnot', unit: '%' },
  { id: 104, category: 'waste-heat', engineType: '船用有机朗肯循环发电装置', emissionLevel: '', temperatureRange: '100~120', rangeLabel: '热源温度(℃)', powerRange: '150~300', rangeLabel: '额定输出功率(kW)', efficiencyLevel: '2级', baseValue: '33%·ηCarnot', unit: '%' },
  { id: 105, category: 'waste-heat', engineType: '船用有机朗肯循环发电装置', emissionLevel: '', temperatureRange: '100~120', rangeLabel: '热源温度(℃)', powerRange: '150~300', rangeLabel: '额定输出功率(kW)', efficiencyLevel: '3级', baseValue: '30%·ηCarnot', unit: '%' },
  { id: 106, category: 'waste-heat', engineType: '船用有机朗肯循环发电装置', emissionLevel: '', temperatureRange: '100~120', rangeLabel: '热源温度(℃)', powerRange: '300~500', rangeLabel: '额定输出功率(kW)', efficiencyLevel: '1级', baseValue: '39%·ηCarnot', unit: '%' },
  { id: 107, category: 'waste-heat', engineType: '船用有机朗肯循环发电装置', emissionLevel: '', temperatureRange: '100~120', rangeLabel: '热源温度(℃)', powerRange: '300~500', rangeLabel: '额定输出功率(kW)', efficiencyLevel: '2级', baseValue: '36%·ηCarnot', unit: '%' },
  { id: 108, category: 'waste-heat', engineType: '船用有机朗肯循环发电装置', emissionLevel: '', temperatureRange: '100~120', rangeLabel: '热源温度(℃)', powerRange: '300~500', rangeLabel: '额定输出功率(kW)', efficiencyLevel: '3级', baseValue: '33%·ηCarnot', unit: '%' },
  // 热源温度 120~140℃
  { id: 109, category: 'waste-heat', engineType: '船用有机朗肯循环发电装置', emissionLevel: '', temperatureRange: '120~140', rangeLabel: '热源温度(℃)', powerRange: '150~300', rangeLabel: '额定输出功率(kW)', efficiencyLevel: '1级', baseValue: '39%·ηCarnot', unit: '%' },
  { id: 110, category: 'waste-heat', engineType: '船用有机朗肯循环发电装置', emissionLevel: '', temperatureRange: '120~140', rangeLabel: '热源温度(℃)', powerRange: '150~300', rangeLabel: '额定输出功率(kW)', efficiencyLevel: '2级', baseValue: '36%·ηCarnot', unit: '%' },
  { id: 111, category: 'waste-heat', engineType: '船用有机朗肯循环发电装置', emissionLevel: '', temperatureRange: '120~140', rangeLabel: '热源温度(℃)', powerRange: '150~300', rangeLabel: '额定输出功率(kW)', efficiencyLevel: '3级', baseValue: '33%·ηCarnot', unit: '%' },
  { id: 112, category: 'waste-heat', engineType: '船用有机朗肯循环发电装置', emissionLevel: '', temperatureRange: '120~140', rangeLabel: '热源温度(℃)', powerRange: '300~500', rangeLabel: '额定输出功率(kW)', efficiencyLevel: '1级', baseValue: '42%·ηCarnot', unit: '%' },
  { id: 113, category: 'waste-heat', engineType: '船用有机朗肯循环发电装置', emissionLevel: '', temperatureRange: '120~140', rangeLabel: '热源温度(℃)', powerRange: '300~500', rangeLabel: '额定输出功率(kW)', efficiencyLevel: '2级', baseValue: '39%·ηCarnot', unit: '%' },
  { id: 114, category: 'waste-heat', engineType: '船用有机朗肯循环发电装置', emissionLevel: '', temperatureRange: '120~140', rangeLabel: '热源温度(℃)', powerRange: '300~500', rangeLabel: '额定输出功率(kW)', efficiencyLevel: '3级', baseValue: '36%·ηCarnot', unit: '%' },
  // 船用蒸汽透平发电装置
  { id: 115, category: 'waste-heat', engineType: '船用蒸汽透平发电装置', emissionLevel: '', steamPressure: '5~7barg', rangeLabel: '蒸汽压力', steamType: '饱和', rangeLabel: '蒸汽类型', efficiencyLevel: '1级', baseValue: 0.52, unit: '' },
  { id: 116, category: 'waste-heat', engineType: '船用蒸汽透平发电装置', emissionLevel: '', steamPressure: '5~7barg', rangeLabel: '蒸汽压力', steamType: '饱和', rangeLabel: '蒸汽类型', efficiencyLevel: '2级', baseValue: 0.5, unit: '' },
  { id: 117, category: 'waste-heat', engineType: '船用蒸汽透平发电装置', emissionLevel: '', steamPressure: '5~7barg', rangeLabel: '蒸汽压力', steamType: '饱和', rangeLabel: '蒸汽类型', efficiencyLevel: '3级', baseValue: 0.48, unit: '' },
  { id: 118, category: 'waste-heat', engineType: '船用蒸汽透平发电装置', emissionLevel: '', steamPressure: '5~7barg', rangeLabel: '蒸汽压力', steamType: '过热', rangeLabel: '蒸汽类型', efficiencyLevel: '1级', baseValue: 0.6, unit: '' },
  { id: 119, category: 'waste-heat', engineType: '船用蒸汽透平发电装置', emissionLevel: '', steamPressure: '5~7barg', rangeLabel: '蒸汽压力', steamType: '过热', rangeLabel: '蒸汽类型', efficiencyLevel: '2级', baseValue: 0.55, unit: '' },
  { id: 120, category: 'waste-heat', engineType: '船用蒸汽透平发电装置', emissionLevel: '', steamPressure: '5~7barg', rangeLabel: '蒸汽压力', steamType: '过热', rangeLabel: '蒸汽类型', efficiencyLevel: '3级', baseValue: 0.52, unit: '' },
  { id: 121, category: 'waste-heat', engineType: '船用蒸汽透平发电装置', emissionLevel: '', steamPressure: '7~9barg', rangeLabel: '蒸汽压力', steamType: '饱和', rangeLabel: '蒸汽类型', efficiencyLevel: '1级', baseValue: 0.55, unit: '' },
  { id: 122, category: 'waste-heat', engineType: '船用蒸汽透平发电装置', emissionLevel: '', steamPressure: '7~9barg', rangeLabel: '蒸汽压力', steamType: '饱和', rangeLabel: '蒸汽类型', efficiencyLevel: '2级', baseValue: 0.53, unit: '' },
  { id: 123, category: 'waste-heat', engineType: '船用蒸汽透平发电装置', emissionLevel: '', steamPressure: '7~9barg', rangeLabel: '蒸汽压力', steamType: '饱和', rangeLabel: '蒸汽类型', efficiencyLevel: '3级', baseValue: 0.5, unit: '' },
  { id: 124, category: 'waste-heat', engineType: '船用蒸汽透平发电装置', emissionLevel: '', steamPressure: '7~9barg', rangeLabel: '蒸汽压力', steamType: '过热', rangeLabel: '蒸汽类型', efficiencyLevel: '1级', baseValue: 0.62, unit: '' },
  { id: 125, category: 'waste-heat', engineType: '船用蒸汽透平发电装置', emissionLevel: '', steamPressure: '7~9barg', rangeLabel: '蒸汽压力', steamType: '过热', rangeLabel: '蒸汽类型', efficiencyLevel: '2级', baseValue: 0.57, unit: '' },
  { id: 126, category: 'waste-heat', engineType: '船用蒸汽透平发电装置', emissionLevel: '', steamPressure: '7~9barg', rangeLabel: '蒸汽压力', steamType: '过热', rangeLabel: '蒸汽类型', efficiencyLevel: '3级', baseValue: 0.54, unit: '' },
  // ===== 船用焚烧炉 =====
  // 单功能焚烧炉（固体废弃物）
  { id: 19, category: 'incinerator', engineType: '单功能焚烧炉（固体废弃物）', emissionLevel: '', capacityRange: '120~2500', rangeLabel: '额定处理热容量(kW)', efficiencyLevel: '1级', baseValue: 3500, unit: '%' },
  { id: 20, category: 'incinerator', engineType: '单功能焚烧炉（固体废弃物）', emissionLevel: '', capacityRange: '120~2500', rangeLabel: '额定处理热容量(kW)', efficiencyLevel: '2级', baseValue: 1500, unit: '%' },
  { id: 21, category: 'incinerator', engineType: '单功能焚烧炉（固体废弃物）', emissionLevel: '', capacityRange: '120~2500', rangeLabel: '额定处理热容量(kW)', efficiencyLevel: '3级', baseValue: 30, unit: '%' },
  // 单功能焚烧炉（污油泥）
  { id: 22, category: 'incinerator', engineType: '单功能焚烧炉（污油泥）', emissionLevel: '', capacityRange: '120~2500', rangeLabel: '额定处理热容量(kW)', efficiencyLevel: '1级', baseValue: 3500, unit: '%' },
  { id: 23, category: 'incinerator', engineType: '单功能焚烧炉（污油泥）', emissionLevel: '', capacityRange: '120~2500', rangeLabel: '额定处理热容量(kW)', efficiencyLevel: '2级', baseValue: 1500, unit: '%' },
  { id: 24, category: 'incinerator', engineType: '单功能焚烧炉（污油泥）', emissionLevel: '', capacityRange: '120~2500', rangeLabel: '额定处理热容量(kW)', efficiencyLevel: '3级', baseValue: 30, unit: '%' },
  // 双功能焚烧炉
  { id: 25, category: 'incinerator', engineType: '双功能焚烧炉', emissionLevel: '', capacityRange: '180~4000', rangeLabel: '额定处理热容量(kW)', efficiencyLevel: '1级', baseValue: 6500, unit: '%' },
  { id: 26, category: 'incinerator', engineType: '双功能焚烧炉', emissionLevel: '', capacityRange: '180~4000', rangeLabel: '额定处理热容量(kW)', efficiencyLevel: '2级', baseValue: 5000, unit: '%' },
  { id: 27, category: 'incinerator', engineType: '双功能焚烧炉', emissionLevel: '', capacityRange: '180~4000', rangeLabel: '额定处理热容量(kW)', efficiencyLevel: '3级', baseValue: 3200, unit: '%' },
  // 多功能焚烧炉
  { id: 28, category: 'incinerator', engineType: '多功能焚烧炉', emissionLevel: '', capacityRange: '200~4000', rangeLabel: '额定处理热容量(kW)', efficiencyLevel: '1级', baseValue: 7340, unit: '%' },
  { id: 29, category: 'incinerator', engineType: '多功能焚烧炉', emissionLevel: '', capacityRange: '200~4000', rangeLabel: '额定处理热容量(kW)', efficiencyLevel: '2级', baseValue: 7000, unit: '%' },
  { id: 30, category: 'incinerator', engineType: '多功能焚烧炉', emissionLevel: '', capacityRange: '200~4000', rangeLabel: '额定处理热容量(kW)', efficiencyLevel: '3级', baseValue: 4500, unit: '%' },
  // ===== 船用碟式分离机 =====
  { id: 31, category: 'separator', engineType: '船用碟式分离机', emissionLevel: '', powerRange: '', efficiencyLevel: '1级', baseValue: '≤0.80', unit: 'kW·h/m³', remark: '高效' },
  { id: 32, category: 'separator', engineType: '船用碟式分离机', emissionLevel: '', powerRange: '', efficiencyLevel: '2级', baseValue: '0.80 ~ 1.00', unit: 'kW·h/m³', remark: '中等' },
  { id: 33, category: 'separator', engineType: '船用碟式分离机', emissionLevel: '', powerRange: '', efficiencyLevel: '3级', baseValue: '1.00 ~ 1.50', unit: 'kW·h/m³', remark: '基础' },
  // ===== 船用压载水处理设备 =====
  { id: 34, category: 'ballast', engineType: '船用压载水处理设备', emissionLevel: '', powerRange: '', efficiencyLevel: '1级', baseValue: 5, unit: 'kWh/100m³' },
  { id: 35, category: 'ballast', engineType: '船用压载水处理设备', emissionLevel: '', powerRange: '', efficiencyLevel: '2级', baseValue: 9, unit: 'kWh/100m³' },
  { id: 36, category: 'ballast', engineType: '船用压载水处理设备', emissionLevel: '', powerRange: '', efficiencyLevel: '3级', baseValue: 50, unit: 'kWh/100m³' },
  { id: 37, category: 'ballast', engineType: '船用压载水处理设备', emissionLevel: '', powerRange: '', efficiencyLevel: '4级', baseValue: 100, unit: 'kWh/100m³' },
  { id: 38, category: 'ballast', engineType: '船用压载水处理设备', emissionLevel: '', powerRange: '', efficiencyLevel: '5级', baseValue: 120, unit: 'kWh/100m³' },
  // ===== 船用齿轮箱 =====
  // 暂无数据
  
  // ===== 船用锚绞机 =====
  // 船用起锚机
  { id: 45, category: 'windlass', engineType: '船用起锚机', emissionLevel: '', powerRange: '', efficiencyLevel: '1级', baseValue: '≥77.0', unit: '%' },
  { id: 46, category: 'windlass', engineType: '船用起锚机', emissionLevel: '', powerRange: '', efficiencyLevel: '2级', baseValue: '≥65.0', unit: '%' },
  { id: 47, category: 'windlass', engineType: '船用起锚机', emissionLevel: '', powerRange: '', efficiencyLevel: '3级', baseValue: '≥43.0', unit: '%' },
  // 船用系泊绞车
  { id: 48, category: 'windlass', engineType: '船用系泊绞车', emissionLevel: '', powerRange: '', efficiencyLevel: '1级', baseValue: '≥81.0', unit: '%' },
  { id: 49, category: 'windlass', engineType: '船用系泊绞车', emissionLevel: '', powerRange: '', efficiencyLevel: '2级', baseValue: '≥65.0', unit: '%' },
  { id: 50, category: 'windlass', engineType: '船用系泊绞车', emissionLevel: '', powerRange: '', efficiencyLevel: '3级', baseValue: '≥44.5', unit: '%' },
  
  // ===== 船用吊机（由 generateCraneRecords 生成）=====
  ...generateCraneRecords(),
  // ===== 船用低压交流三相同步发电机（由 generateGeneratorRecords 生成）=====
  ...generateGeneratorRecords(),
  // ===== 船用中压交流三相同步发电机 =====
  { id: 90, category: 'generator', engineType: '船用中压交流三相同步发电机', emissionLevel: '', powerRange: '', efficiencyLevel: '1级', baseValue: 96, unit: '' },
  { id: 91, category: 'generator', engineType: '船用中压交流三相同步发电机', emissionLevel: '', powerRange: '', efficiencyLevel: '2级', baseValue: 93, unit: '' },
  { id: 92, category: 'generator', engineType: '船用中压交流三相同步发电机', emissionLevel: '', powerRange: '', efficiencyLevel: '3级', baseValue: 90, unit: '' },
  // ===== 船用组合式空调机组（由 generateACRecords 生成）=====
  ...generateACRecords(),
  // ===== 船用冷水机组（IPLV）=====
  { id: 64, category: 'chiller', engineType: '船用冷水机组', emissionLevel: '', powerRange: 'CC≤300', rangeLabel: '名义制冷量/kW', metricType: 'IPLV', efficiencyLevel: '1级', baseValue: 5.67, unit: '' },
  { id: 65, category: 'chiller', engineType: '船用冷水机组', emissionLevel: '', powerRange: 'CC≤300', rangeLabel: '名义制冷量/kW', metricType: 'IPLV', efficiencyLevel: '2级', baseValue: 5.30, unit: '' },
  { id: 66, category: 'chiller', engineType: '船用冷水机组', emissionLevel: '', powerRange: 'CC≤300', rangeLabel: '名义制冷量/kW', metricType: 'IPLV', efficiencyLevel: '3级', baseValue: 4.90, unit: '' },
  { id: 67, category: 'chiller', engineType: '船用冷水机组', emissionLevel: '', powerRange: '300<CC≤528', rangeLabel: '名义制冷量/kW', metricType: 'IPLV', efficiencyLevel: '1级', baseValue: 7.34, unit: '' },
  { id: 68, category: 'chiller', engineType: '船用冷水机组', emissionLevel: '', powerRange: '300<CC≤528', rangeLabel: '名义制冷量/kW', metricType: 'IPLV', efficiencyLevel: '2级', baseValue: 6.80, unit: '' },
  { id: 69, category: 'chiller', engineType: '船用冷水机组', emissionLevel: '', powerRange: '300<CC≤528', rangeLabel: '名义制冷量/kW', metricType: 'IPLV', efficiencyLevel: '3级', baseValue: 5.38, unit: '' },
  { id: 70, category: 'chiller', engineType: '船用冷水机组', emissionLevel: '', powerRange: '528<CC≤1163', rangeLabel: '名义制冷量/kW', metricType: 'IPLV', efficiencyLevel: '1级', baseValue: 7.65, unit: '' },
  { id: 71, category: 'chiller', engineType: '船用冷水机组', emissionLevel: '', powerRange: '528<CC≤1163', rangeLabel: '名义制冷量/kW', metricType: 'IPLV', efficiencyLevel: '2级', baseValue: 7.08, unit: '' },
  { id: 72, category: 'chiller', engineType: '船用冷水机组', emissionLevel: '', powerRange: '528<CC≤1163', rangeLabel: '名义制冷量/kW', metricType: 'IPLV', efficiencyLevel: '3级', baseValue: 5.85, unit: '' },
  { id: 73, category: 'chiller', engineType: '船用冷水机组', emissionLevel: '', powerRange: 'CC>1163', rangeLabel: '名义制冷量/kW', metricType: 'IPLV', efficiencyLevel: '1级', baseValue: 8.03, unit: '' },
  { id: 74, category: 'chiller', engineType: '船用冷水机组', emissionLevel: '', powerRange: 'CC>1163', rangeLabel: '名义制冷量/kW', metricType: 'IPLV', efficiencyLevel: '2级', baseValue: 7.65, unit: '' },
  { id: 75, category: 'chiller', engineType: '船用冷水机组', emissionLevel: '', powerRange: 'CC>1163', rangeLabel: '名义制冷量/kW', metricType: 'IPLV', efficiencyLevel: '3级', baseValue: 5.95, unit: '' },
  // ===== 船用冷水机组（COP）=====
  { id: 76, category: 'chiller', engineType: '船用冷水机组', emissionLevel: '', powerRange: 'CC≤300', rangeLabel: '名义制冷量/kW', metricType: 'COP', efficiencyLevel: '1级', baseValue: 5.00, unit: '' },
  { id: 77, category: 'chiller', engineType: '船用冷水机组', emissionLevel: '', powerRange: 'CC≤300', rangeLabel: '名义制冷量/kW', metricType: 'COP', efficiencyLevel: '2级', baseValue: 4.81, unit: '' },
  { id: 78, category: 'chiller', engineType: '船用冷水机组', emissionLevel: '', powerRange: 'CC≤300', rangeLabel: '名义制冷量/kW', metricType: 'COP', efficiencyLevel: '3级', baseValue: 3.97, unit: '' },
  { id: 79, category: 'chiller', engineType: '船用冷水机组', emissionLevel: '', powerRange: '300<CC≤528', rangeLabel: '名义制冷量/kW', metricType: 'COP', efficiencyLevel: '1级', baseValue: 5.48, unit: '' },
  { id: 80, category: 'chiller', engineType: '船用冷水机组', emissionLevel: '', powerRange: '300<CC≤528', rangeLabel: '名义制冷量/kW', metricType: 'COP', efficiencyLevel: '2级', baseValue: 5.30, unit: '' },
  { id: 81, category: 'chiller', engineType: '船用冷水机组', emissionLevel: '', powerRange: '300<CC≤528', rangeLabel: '名义制冷量/kW', metricType: 'COP', efficiencyLevel: '3级', baseValue: 4.72, unit: '' },
  { id: 82, category: 'chiller', engineType: '船用冷水机组', emissionLevel: '', powerRange: '528<CC≤1163', rangeLabel: '名义制冷量/kW', metricType: 'COP', efficiencyLevel: '1级', baseValue: 5.85, unit: '' },
  { id: 83, category: 'chiller', engineType: '船用冷水机组', emissionLevel: '', powerRange: '528<CC≤1163', rangeLabel: '名义制冷量/kW', metricType: 'COP', efficiencyLevel: '2级', baseValue: 5.67, unit: '' },
  { id: 84, category: 'chiller', engineType: '船用冷水机组', emissionLevel: '', powerRange: '528<CC≤1163', rangeLabel: '名义制冷量/kW', metricType: 'COP', efficiencyLevel: '3级', baseValue: 5.10, unit: '' },
  { id: 85, category: 'chiller', engineType: '船用冷水机组', emissionLevel: '', powerRange: 'CC>1163', rangeLabel: '名义制冷量/kW', metricType: 'COP', efficiencyLevel: '1级', baseValue: 6.04, unit: '' },
  { id: 86, category: 'chiller', engineType: '船用冷水机组', emissionLevel: '', powerRange: 'CC>1163', rangeLabel: '名义制冷量/kW', metricType: 'COP', efficiencyLevel: '2级', baseValue: 5.85, unit: '' },
  { id: 87, category: 'chiller', engineType: '船用冷水机组', emissionLevel: '', powerRange: 'CC>1163', rangeLabel: '名义制冷量/kW', metricType: 'COP', efficiencyLevel: '3级', baseValue: 5.30, unit: '' },
  // ===== 船用惰性气体系统 =====
  { id: 61, category: 'inert-gas', engineType: '船用惰性气体系统', emissionLevel: '', powerRange: '', efficiencyLevel: '1级', baseValue: '≤0.2', unit: 'kW h/Nm³' },
  { id: 62, category: 'inert-gas', engineType: '船用惰性气体系统', emissionLevel: '', powerRange: '', efficiencyLevel: '2级', baseValue: '0.2~0.45', unit: 'kW h/Nm³' },
  { id: 63, category: 'inert-gas', engineType: '船用惰性气体系统', emissionLevel: '', powerRange: '', efficiencyLevel: '3级', baseValue: '0.45~0.8', unit: 'kW h/Nm³' }
])

const filteredBaseValues = computed(() => {
  let result = efficiencyBaseValues.value
  if (searchQuery.value) {
    result = result.filter(bv => bv.engineType.toLowerCase().includes(searchQuery.value.toLowerCase()) || bv.emissionLevel.toLowerCase().includes(searchQuery.value.toLowerCase()))
  }
  if (categoryFilter.value) {
    result = result.filter(bv => bv.category === categoryFilter.value)
  }
  if (engineTypeFilter.value) {
    result = result.filter(bv => bv.engineType.includes(engineTypeFilter.value))
  }
  return result
})

const currentPage = ref(1)
const pageSize = ref(10)
const pageSizes = ref([10, 20, 50, 100, 200, 500])

const totalPages = computed(() => {
  return Math.ceil(filteredBaseValues.value.length / pageSize.value)
})

const paginatedBaseValues = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredBaseValues.value.slice(start, end)
})

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const resetPage = () => {
  currentPage.value = 1
}

const filterBaseValues = () => {
  resetPage()
}

const openAddModal = () => { isEditMode.value = false; formData.value = { ...defaultFormData }; showFormModal.value = true }
const openViewModal = (baseValue) => { currentBaseValue.value = baseValue; showViewModal.value = true }
const closeViewModal = () => { showViewModal.value = false; currentBaseValue.value = null }
const openEditModal = (baseValue) => { isEditMode.value = true; formData.value = { ...baseValue }; showFormModal.value = true }
const closeFormModal = () => { showFormModal.value = false; formData.value = { ...defaultFormData } }

const saveBaseValue = (data) => {
  if (!data.engineType || !data.efficiencyLevel || data.baseValue === null || data.baseValue === '') {
    ElMessage.warning('请填写必填项')
    return
  }
  if (isEditMode.value) {
    const index = efficiencyBaseValues.value.findIndex(bv => bv.id === data.id)
    if (index !== -1) efficiencyBaseValues.value[index] = { ...data }
  } else {
    const newId = Math.max(...efficiencyBaseValues.value.map(bv => bv.id)) + 1
    efficiencyBaseValues.value.push({ ...data, id: newId })
  }
  showFormModal.value = false
  ElMessage.success('能效基值保存成功')
}

const deleteBaseValue = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个能效基值吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    efficiencyBaseValues.value = efficiencyBaseValues.value.filter(bv => bv.id !== id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
  }
}

const importBaseValues = () => { ElMessage.info('导入能效基值功能开发中') }

const exportBaseValues = () => {
  const data = JSON.stringify(efficiencyBaseValues.value, null, 2)
  const blob = new Blob([data], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'efficiency-base-values.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  ElMessage.success('导出成功')
}

</script>

<style scoped>
.efficiency-level-container { 
  padding: 20px; 
  height: 100%; 
  min-height: calc(100vh - 120px); 
  overflow-y: auto; 
  box-sizing: border-box; 
}

.efficiency-level-controls { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 24px; 
  flex-wrap: wrap; 
  gap: 16px; 
}

.control-group { 
  display: flex; 
  gap: 12px; 
  flex-wrap: wrap; 
}

.search-filter { 
  display: flex; 
  gap: 16px; 
  align-items: center; 
  flex-wrap: wrap; 
}

.efficiency-level-list-section { 
  margin-bottom: 24px; 
}

.efficiency-level-list-section h3 { 
  margin: 0 0 16px 0; 
  font-size: 18px; 
  font-weight: 600; 
  color: #333; 
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0;
}

.device-category {
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
  white-space: nowrap;
  display: inline-block;
  width: fit-content;
}

.device-category.engine { background-color: #e3f2fd; color: #1976d2; }
.device-category.gearbox { background-color: #e8f5e8; color: #2e7d32; }
.device-category.waste-heat { background-color: #fff3e0; color: #ef6c00; }
.device-category.incinerator { background-color: #ffebee; color: #c62828; }
.device-category.separator { background-color: #f3e5f5; color: #7b1fa2; }
.device-category.ballast { background-color: #e0f7fa; color: #00838f; }
.device-category.windlass { background-color: #fce4ec; color: #880e4f; }
.device-category.crane { background-color: #e3f2fd; color: #0d47a1; }
.device-category.generator { background-color: #fff8e1; color: #f57c00; }
.device-category.air-conditioner { background-color: #e1f5fe; color: #0288d1; }
.device-category.chiller { background-color: #e3f2fd; color: #1565c0; }
.device-category.inert-gas { background-color: #f3e5f5; color: #6a1b9a; }
.device-category.co2-capture { background-color: #c8e6c9; color: #2e7d32; }
.device-category.propeller { background-color: #fff3e0; color: #e65100; }
</style>
