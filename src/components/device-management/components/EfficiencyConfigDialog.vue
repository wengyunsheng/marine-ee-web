<template>
  <el-dialog
    v-model="visible"
    :title="`能效等级和能效基值-${deviceData?.name || ''}`"
    width="60%"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div v-if="deviceData" class="efficiency-config-container">
      <div class="efficiency-content">
        <el-table 
          :data="efficiencyData" 
          style="width: 100%" 
          border
          v-loading="loading"
        >
          <el-table-column type="index" label="序号" width="60" align="center" />
          
          <!-- 动态渲染表格列 -->
          <template v-for="col in tableColumns" :key="col.prop || col.label">
            <!-- 区间类型的列（需要特殊格式化） -->
            <el-table-column 
              v-if="col.type === 'range'"
              :label="col.label" 
              :min-width="col.minWidth || 140" 
              align="center"
            >
              <template #default="scope">
                <!-- 只有最大值(min为0或null):显示 <max 或 variable<max -->
                <span v-if="scope.row[col.maxField] !== null && (scope.row[col.minField] === 0 || scope.row[col.minField] === null)">
                  <template v-if="col.variableName">{{ col.variableName }}&lt;{{ scope.row[col.maxField] }}</template>
                  <template v-else>&lt;{{ scope.row[col.maxField] }}</template>
                </span>
                <!-- 只有最小值(max为null):显示 ≥min 或 variable≥min -->
                <span v-else-if="scope.row[col.maxField] === null && scope.row[col.minField] !== null">
                  <template v-if="col.variableName">{{ col.variableName }}≥{{ scope.row[col.minField] }}</template>
                  <template v-else>≥{{ scope.row[col.minField] }}</template>
                </span>
                <!-- 正常区间:显示 min≤variable<max 或 min~max -->
                <span v-else-if="scope.row[col.minField] !== null && scope.row[col.maxField] !== null">
                  <template v-if="col.variableName">{{ scope.row[col.minField] }}≤{{ col.variableName }}&lt;{{ scope.row[col.maxField] }}</template>
                  <template v-else>{{ scope.row[col.minField] }}~{{ scope.row[col.maxField] }}</template>
                </span>
                <!-- 其他情况:显示 - -->
                <span v-else>-</span>
              </template>
            </el-table-column>
            
            <!-- 能效等级列（带颜色标签） -->
            <el-table-column 
              v-else-if="col.type === 'level'"
              :prop="col.prop" 
              :label="col.label" 
              :min-width="col.minWidth || 100" 
              align="center"
            >
              <template #default="scope">
                <el-tag :type="scope.row[col.prop] === 1 ? 'success' : scope.row[col.prop] === 2 ? 'warning' : 'info'">
                  {{ scope.row[col.prop] }}级
                </el-tag>
              </template>
            </el-table-column>
            
            <!-- 固定值列 -->
            <el-table-column 
              v-else-if="col.defaultValue"
              :label="col.label" 
              :min-width="col.minWidth || 120" 
              align="center"
            >
              <template #default>
                {{ col.defaultValue }}
              </template>
            </el-table-column>
            
            <!-- 带前缀的只读列(如≥) -->
            <el-table-column 
              v-else-if="col.prefix"
              :label="col.label" 
              :min-width="col.minWidth || 120" 
              align="center"
            >
              <template #default="scope">
                {{ col.prefix }}{{ scope.row[col.prop] }}
              </template>
            </el-table-column>
            
            <!-- 普通列 -->
            <el-table-column 
              v-else
              :prop="col.prop" 
              :label="col.label" 
              :min-width="col.minWidth || 120" 
              align="center"
            />
          </template>
        </el-table>
      </div>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  deviceData: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loading = ref(false)
const efficiencyData = ref([])
const tableColumns = ref([])

// 监听弹窗打开，加载数据
watch(() => props.modelValue, (newVal) => {
  if (newVal && props.deviceData) {
    fetchEfficiencyData()
  }
})

// 获取能效等级和能效基值数据
const fetchEfficiencyData = async () => {
  if (!props.deviceData?.code) {
    ElMessage.warning('设备编码不存在')
    return
  }

  loading.value = true
  try {
    // 根据设备类型调用不同的接口
    let apiUrl = ''
    const parentCode = props.deviceData.parentCode || ''
    
    // 根据 parentCode 的值判断设备类型,调用对应接口
    const deviceName = props.deviceData.name || ''
    const deviceCode = props.deviceData.code || ''
    
    if (parentCode.includes('engine')) {
      // 船用发动机
      apiUrl = `/api/efficiency/engine/list?engineType=${deviceCode}`
      // 设置表格列配置
      tableColumns.value = [
        { prop: 'emissionLevel', label: '排放等级', minWidth: 100 },
        { type: 'range', label: '单缸功率区间 P/kW', minField: 'powerRangeMin', maxField: 'powerRangeMax', variableName: 'P', unit: ' kW', minWidth: 180 },
        { prop: 'efficiencyLevel', label: '能效等级', minWidth: 100 },
        { prop: 'baseValue', label: '能效基值', minWidth: 100 },
        { prop: 'unit', label: '单位', minWidth: 80 }
      ]
    } else if (parentCode.includes('waste-heat') || parentCode.includes('organic-rankine')) {
      // 余热回收类设备，根据设备名称或编码进一步区分
      if (deviceName.includes('蒸汽透平') || deviceCode.includes('waste-heat-02')) {
        // 船用蒸汽透平发电装置
        apiUrl = `/api/efficiency/steam-turbine/list`
        // 设置表格列配置
        tableColumns.value = [
          { type: 'range', label: '蒸汽压力(barg)', minField: 'steamPressureMin', maxField: 'steamPressureMax', variableName: 'P', minWidth: 140 },
          { prop: 'steamType', label: '蒸汽类型', minWidth: 100 },
          { prop: 'efficiencyLevel', label: '能效等级', minWidth: 100 },
          { prop: 'baseValue', label: '能效基值', minWidth: 100 },
          { prop: 'unit', label: '单位', minWidth: 80 }
        ]
      } else {
        // 船用有机朗肯循环发电装置（默认）
        apiUrl = `/api/efficiency/organic-rankine/list`
        // 设置表格列配置
        tableColumns.value = [
          { type: 'range', label: '热源温度(°C)', minField: 'heatSourceTempMin', maxField: 'heatSourceTempMax', variableName: 'T', minWidth: 140 },
          { type: 'range', label: '额定输出功率(kW)', minField: 'powerOutputMin', maxField: 'powerOutputMax', variableName: 'P', minWidth: 160 },
          { prop: 'efficiencyLevel', label: '能效等级', minWidth: 100 },
          { prop: 'baseValue', label: '能效基值', minWidth: 120 },
          { prop: 'unit', label: '单位', minWidth: 120 }
        ]
      }
    } else if (parentCode.includes('incinerator')) {
      // 船用焚烧炉
      apiUrl = `/api/efficiency/incinerator/list?incineratorType=${deviceCode}`
      // 设置表格列配置
      tableColumns.value = [
        { type: 'range', label: '额定处理热容量(kW)', minField: 'heatCapacityMin', maxField: 'heatCapacityMax', variableName: 'P', minWidth: 180 },
        { prop: 'efficiencyLevel', label: '能效等级', minWidth: 100 },
        { prop: 'baseValue', label: '能效基值', minWidth: 100 },
        { prop: 'unit', label: '单位', minWidth: 80 }
      ]
    } else if (parentCode.includes('separator')) {
      // 船用碟式分离机
      apiUrl = `/api/efficiency/disc-separator/list`
      // 设置表格列配置
      tableColumns.value = [
        { prop: 'efficiencyLevel', label: '能效等级', minWidth: 100 },
        { type: 'range', label: '能效值范围(kW·h/m³)', minField: 'efficiencyValueMin', maxField: 'efficiencyValueMax', variableName: 'η', minWidth: 180 },
        { prop: 'description', label: '说明', minWidth: 100 }
      ]
    } else if (parentCode.includes('ballast')) {
      // 船用压载水处理设备
      apiUrl = `/api/efficiency/ballast-water-treatment/list`
      // 设置表格列配置
      tableColumns.value = [
        { prop: 'efficiencyLevel', label: '能效等级', minWidth: 100 },
        { prop: 'baseValue', label: '能效基值', minWidth: 100 },
        { prop: 'unit', label: '单位', minWidth: 100 }
      ]
    } else if (parentCode.includes('windlass')) {
      // 船用锚绞机
      apiUrl = `/api/efficiency/windlass/list?windlassType=${deviceCode}`
      // 设置表格列配置
      tableColumns.value = [
        { prop: 'efficiencyLevel', label: '能效等级', minWidth: 100 },
        { prop: 'baseValue', label: '能效基值', minWidth: 120, prefix: '≥' },
        { prop: 'unit', label: '单位', minWidth: 80 }
      ]
    } else if (parentCode.includes('crane')) {
      // 船用吊机
      apiUrl = `/api/efficiency/crane/list`
      // 设置表格列配置
      tableColumns.value = [
        { type: 'range', label: '工作半径', minField: 'workRadiusMin', maxField: 'workRadiusMax', unit: ' m', minWidth: 140 },
        { prop: 'loadRange', label: '载荷区间', minWidth: 100 },
        { prop: 'efficiencyLevel', label: '能效等级', minWidth: 100 },
        { prop: 'thresholdExpression', label: '能效阈值', minWidth: 140 }
      ]
    } else if (parentCode.includes('generator')) {
      // 船用发电机
      apiUrl = `/api/efficiency/generator/list?generatorType=${deviceCode}`
      // 设置表格列配置
      tableColumns.value = [
        { prop: 'ratedCapacity', label: '额定容量(kVA)', minWidth: 120 },
        { prop: 'ratedPower', label: '额定功率(kW)', minWidth: 120, variableName: 'P' },
        { prop: 'rotorPoles', label: '转子极数', minWidth: 100 },
        { prop: 'rotorSpeed', label: '转子转速(1000r/min)', minWidth: 140 },
        { prop: 'efficiencyLevel', label: '能效等级', minWidth: 100 },
        { prop: 'baseValue', label: '能效基值', minWidth: 100 },
        { prop: 'unit', label: '单位', minWidth: 80 }
      ]
    } else if (parentCode.includes('air-conditioner')) {
      // 船用组合式空调机组
      apiUrl = `/api/efficiency/ahu/list`
      // 设置表格列配置
      tableColumns.value = [
        { type: 'range', label: '额定风量(CMH)', minField: 'airFlowMin', maxField: 'airFlowMax', variableName: 'L', minWidth: 160 },
        { prop: 'staticPressure', label: '机组全静压(Pa)', minWidth: 140 },
        { prop: 'efficiencyLevel', label: '能效等级', minWidth: 100 },
        { prop: 'baseValue', label: '能效基值', minWidth: 100 },
        { prop: 'unit', label: '单位', minWidth: 100 }
      ]
    } else if (parentCode.includes('chiller')) {
      // 船用冷水机组
      apiUrl = `/api/efficiency/chiller/list`
      // 设置表格列配置
      tableColumns.value = [
        { prop: 'evaluationType', label: '评定类型', minWidth: 100 },
        { prop: 'productStandard', label: '产品标准', minWidth: 200 },
        { prop: 'unitType', label: '机组型式', minWidth: 100 },
        { type: 'range', label: '名义制冷量(kW)', minField: 'coolingCapacityMin', maxField: 'coolingCapacityMax', variableName: 'CC', minWidth: 160 },
        { prop: 'efficiencyLevel', label: '能效等级', minWidth: 100 },
        { prop: 'baseValue', label: '能效基值', minWidth: 100 },
        { prop: 'unit', label: '单位', minWidth: 100 }
      ]
    } else if (parentCode.includes('inert-gas')) {
      // 船用惰性气体系统
      apiUrl = `/api/efficiency/inert-gas/list`
      // 设置表格列配置
      tableColumns.value = [
        { prop: 'efficiencyLevel', label: '能效等级', minWidth: 100 },
        { type: 'range', label: '能效基值', minField: 'baseValueMin', maxField: 'baseValueMax', variableName: 'η', minWidth: 160 },
        { prop: 'unit', label: '单位', minWidth: 120 }
      ]
    } else if (parentCode.includes('co2-capture')) {
      // 船用二氧化碳捕集设备
      apiUrl = `/api/efficiency/co2-capture/list`
      // 设置表格列配置
      tableColumns.value = [
        { prop: 'efficiencyLevel', label: '能效等级', minWidth: 100 },
        { prop: 'baseValue', label: '能效基值', minWidth: 100 },
        { prop: 'unit', label: '单位', minWidth: 100 }
      ]
    } else {
      // 其他设备类型，未配置接口
      ElMessage.error(`设备类型 "${parentCode}" 暂未配置能效接口`)
      loading.value = false
      visible.value = false
      return
    }

    const response = await fetch(apiUrl)
    const result = await response.json()
    
    if (result.code === 200) {
      efficiencyData.value = result.data || []
    } else {
      ElMessage.error(result.message || '获取数据失败')
      efficiencyData.value = []
    }
  } catch (error) {
    ElMessage.error('获取数据失败')
    efficiencyData.value = []
    tableColumns.value = []
  } finally {
    loading.value = false
  }
}

const handleClose = () => {
  visible.value = false
  efficiencyData.value = []
  tableColumns.value = []
  emit('close')
}
</script>

<style scoped>
.efficiency-config-container {
  min-height: 300px;
}

.efficiency-content {
  padding: 20px 0;
}
</style>
