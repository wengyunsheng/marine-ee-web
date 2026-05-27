<template>
  <el-dialog 
    v-model="visible" 
    title="查看能效等级和能效基值"
    width="600px"
    @close="$emit('close')"
  >
    <el-descriptions :column="1" border>
      <el-descriptions-item label="设备类型名称">
        {{ baseValue.engineType }}
      </el-descriptions-item>
      <el-descriptions-item label="类别">
        <span class="device-category" :class="baseValue.category">{{ getCategoryName(baseValue.category) }}</span>
      </el-descriptions-item>
      <el-descriptions-item v-if="activeDimensions.includes('emissionLevel')" label="排放等级">
        {{ baseValue.emissionLevel || '-' }}
      </el-descriptions-item>
      <el-descriptions-item v-if="activeDimensions.includes('capacityRange')" :label="capacityRangeLabel">
        {{ baseValue.capacityRange || '-' }}
      </el-descriptions-item>
      <el-descriptions-item v-if="activeDimensions.includes('powerRange')" :label="powerRangeLabel">
        {{ baseValue.powerRange || '-' }}
      </el-descriptions-item>
      <el-descriptions-item v-if="activeDimensions.includes('temperatureRange')" :label="temperatureRangeLabel">
        {{ baseValue.temperatureRange || '-' }}
      </el-descriptions-item>
      <el-descriptions-item v-if="activeDimensions.includes('steamPressure')" :label="steamPressureLabel">
        {{ baseValue.steamPressure || '-' }}
      </el-descriptions-item>
      <el-descriptions-item v-if="activeDimensions.includes('steamType')" :label="steamTypeLabel">
        {{ baseValue.steamType || '-' }}
      </el-descriptions-item>
      <el-descriptions-item v-if="activeDimensions.includes('secondaryRange')" :label="secondaryRangeLabel">
        {{ baseValue.secondaryRange || '-' }}
      </el-descriptions-item>
      <el-descriptions-item v-if="currentMetricTypes.length > 0" :label="metricTypeLabel">
        {{ getMetricTypeName(baseValue.metricType) }}
      </el-descriptions-item>
      <el-descriptions-item label="能效等级">
        {{ baseValue.efficiencyLevel }}
      </el-descriptions-item>
      <el-descriptions-item label="能效基值">
        {{ baseValue.baseValue }}
      </el-descriptions-item>
      <el-descriptions-item label="单位">
        {{ baseValue.unit || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="说明">
        {{ baseValue.remark || '-' }}
      </el-descriptions-item>
    </el-descriptions>
    
    <template #footer>
      <el-button @click="$emit('close')">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  baseValue: {
    type: Object,
    required: true
  },
  categoryConfig: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const visible = computed({
  get: () => true,
  set: (value) => {
    if (!value) emit('close')
  }
})

const getCategoryName = (category) => props.categoryConfig[category]?.label || category

const currentConfig = computed(() => props.categoryConfig[props.baseValue.category])
const activeDimensions = computed(() => {
  const cfg = currentConfig.value
  if (!cfg) return []
  
  // 检查是否有特定发动机的子配置
  if (props.baseValue.engineType && cfg.subEngineConfig && cfg.subEngineConfig[props.baseValue.engineType]) {
    return cfg.subEngineConfig[props.baseValue.engineType].dimensions
  }
  
  return cfg.dimensions
})

// 获取有效配置
const getEffectiveConfig = () => {
  const cfg = currentConfig.value
  if (!cfg) return null
  
  if (props.baseValue.engineType && cfg.subEngineConfig && cfg.subEngineConfig[props.baseValue.engineType]) {
    return cfg.subEngineConfig[props.baseValue.engineType]
  }
  
  return cfg
}

const currentMetricTypes = computed(() => {
  const effectiveConfig = getEffectiveConfig()
  return effectiveConfig?.metricTypes || []
})

const capacityRangeLabel = computed(() => {
  const effectiveConfig = getEffectiveConfig()
  return effectiveConfig?.dimensionConfig?.capacityRange?.rangeLabel || '参数区间'
})
const powerRangeLabel = computed(() => {
  const effectiveConfig = getEffectiveConfig()
  return effectiveConfig?.dimensionConfig?.powerRange?.rangeLabel || '参数区间'
})
const temperatureRangeLabel = computed(() => {
  const effectiveConfig = getEffectiveConfig()
  return effectiveConfig?.dimensionConfig?.temperatureRange?.rangeLabel || '热源温度'
})
const steamPressureLabel = computed(() => {
  const effectiveConfig = getEffectiveConfig()
  return effectiveConfig?.dimensionConfig?.steamPressure?.rangeLabel || '蒸汽压力'
})
const steamTypeLabel = computed(() => {
  const effectiveConfig = getEffectiveConfig()
  return effectiveConfig?.dimensionConfig?.steamType?.rangeLabel || '蒸汽类型'
})
const secondaryRangeLabel = computed(() => {
  const effectiveConfig = getEffectiveConfig()
  return effectiveConfig?.dimensionConfig?.secondaryRange?.secondaryRangeLabel || '二级参数'
})
const metricTypeLabel = computed(() => {
  const effectiveConfig = getEffectiveConfig()
  return effectiveConfig?.metricLabel || '能效指标类型'
})

const getMetricTypeName = (metricType) => {
  const allMetrics = Object.values(props.categoryConfig).flatMap(cfg => cfg.metricTypes)
  return allMetrics.find(m => m.value === metricType)?.label || metricType || '-'
}
</script>

<style scoped>
.device-category {
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
  white-space: nowrap;
  display: inline-block;
}

.device-category.engine { background-color: #e3f2fd; color: #1976d2; }
.device-category.gearbox { background-color: #e8f5e8; color: #2e7d32; }
.device-category.waste_heat { background-color: #fff3e0; color: #ef6c00; }
.device-category.incinerator { background-color: #ffebee; color: #c62828; }
.device-category.separator { background-color: #f3e5f5; color: #7b1fa2; }
.device-category.boiler { background-color: #e0f2f1; color: #00695c; }
.device-category.pump { background-color: #fce4ec; color: #ad1457; }
.device-category.fan { background-color: #f1f8e9; color: #558b2f; }
.device-category.compressor { background-color: #e8eaf6; color: #283593; }
.device-category.crane { background-color: #fff8e1; color: #f57f17; }
.device-category.deck_machinery { background-color: #efebe9; color: #4e342e; }
.device-category.propeller { background-color: #e1f5fe; color: #0277bd; }
.device-category.energy_storage { background-color: #f3e5f5; color: #6a1b9a; }
.device-category.solar { background-color: #fffde7; color: #f9a825; }
</style>
