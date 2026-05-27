<template>
  <el-dialog 
    v-model="visible" 
    :title="isEdit ? '编辑能效等级和能效基值' : '新增能效等级和能效基值'"
    width="600px"
    @close="$emit('close')"
  >
    <el-form :model="localFormData" label-width="120px">
      <el-form-item label="类别" required>
        <el-select v-model="localFormData.category" placeholder="请选择类别" style="width: 100%;" @change="onCategoryChange">
          <el-option v-for="opt in categoryOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="设备类型名称" required>
        <el-select v-model="localFormData.engineType" placeholder="请选择设备类型" style="width: 100%;" @change="onEngineTypeChange">
          <el-option v-for="opt in currentEngineTypeOptions" :key="opt.value" :label="opt.label" :value="opt.value" />
        </el-select>
      </el-form-item>

      <!-- 排放等级：仅 engine 类别显示 -->
      <el-form-item v-if="activeDimensions.includes('emissionLevel')" label="排放等级">
        <el-select v-model="localFormData.emissionLevel" placeholder="请选择排放等级" style="width: 100%;">
          <el-option v-for="opt in getDimOptions('emissionLevel')" :key="opt" :label="opt" :value="opt" />
        </el-select>
      </el-form-item>

      <!-- 参数区间说明 + 参数区间：按 dimensionConfig 动态渲染 -->
      <template v-if="activeDimensions.includes('capacityRange')">
        <el-form-item :label="capacityRangeConfig?.rangeLabel || '参数区间'">
          <el-select v-if="capacityRangeConfig?.type === 'select'" v-model="localFormData.capacityRange" placeholder="请选择" style="width: 100%;">
            <el-option v-for="opt in capacityRangeConfig.options" :key="opt" :label="opt" :value="opt" />
          </el-select>
          <el-input v-else v-model="localFormData.capacityRange" placeholder="请输入参数区间" />
        </el-form-item>
      </template>
      <template v-if="activeDimensions.includes('powerRange')">
        <el-form-item :label="powerRangeConfig?.rangeLabel || '参数区间'">
          <el-select v-if="powerRangeConfig?.type === 'select'" v-model="localFormData.powerRange" placeholder="请选择" style="width: 100%;">
            <el-option v-for="opt in powerRangeConfig.options" :key="opt" :label="opt" :value="opt" />
          </el-select>
          <el-input v-else v-model="localFormData.powerRange" placeholder="请输入参数区间" />
        </el-form-item>
      </template>
      <template v-if="activeDimensions.includes('temperatureRange')">
        <el-form-item :label="temperatureRangeConfig?.rangeLabel || '热源温度'">
          <el-select v-if="temperatureRangeConfig?.type === 'select'" v-model="localFormData.temperatureRange" placeholder="请选择" style="width: 100%;">
            <el-option v-for="opt in temperatureRangeConfig.options" :key="opt" :label="opt" :value="opt" />
          </el-select>
          <el-input v-else v-model="localFormData.temperatureRange" placeholder="请输入热源温度" />
        </el-form-item>
      </template>
      <template v-if="activeDimensions.includes('steamPressure')">
        <el-form-item :label="steamPressureConfig?.rangeLabel || '蒸汽压力'">
          <el-select v-if="steamPressureConfig?.type === 'select'" v-model="localFormData.steamPressure" placeholder="请选择" style="width: 100%;">
            <el-option v-for="opt in steamPressureConfig.options" :key="opt" :label="opt" :value="opt" />
          </el-select>
          <el-input v-else v-model="localFormData.steamPressure" placeholder="请输入蒸汽压力" />
        </el-form-item>
      </template>
      <template v-if="activeDimensions.includes('steamType')">
        <el-form-item :label="steamTypeConfig?.rangeLabel || '蒸汽类型'">
          <el-select v-if="steamTypeConfig?.type === 'select'" v-model="localFormData.steamType" placeholder="请选择" style="width: 100%;">
            <el-option v-for="opt in steamTypeConfig.options" :key="opt" :label="opt" :value="opt" />
          </el-select>
          <el-input v-else v-model="localFormData.steamType" placeholder="请输入蒸汽类型" />
        </el-form-item>
      </template>

      <!-- 二级参数说明 + 二级参数 -->
      <template v-if="activeDimensions.includes('secondaryRange')">
        <el-form-item :label="secondaryRangeConfig?.secondaryRangeLabel || '二级参数'">
          <el-select v-if="secondaryRangeConfig?.type === 'select'" v-model="localFormData.secondaryRange" placeholder="请选择" style="width: 100%;">
            <el-option v-for="opt in secondaryRangeConfig.options" :key="opt" :label="opt" :value="opt" />
          </el-select>
          <el-input v-else v-model="localFormData.secondaryRange" placeholder="请输入二级参数" />
        </el-form-item>
      </template>

      <!-- 能效指标/传动方式:根据类别动态显示 -->
      <el-form-item v-if="currentMetricTypes.length > 0" :label="metricTypeLabel">
        <el-select v-model="localFormData.metricType" :placeholder="`请选择${metricTypeLabel}`" style="width: 100%;">
          <el-option v-for="mt in currentMetricTypes" :key="mt.value" :label="mt.label" :value="mt.value" />
        </el-select>
      </el-form-item>

      <el-form-item label="能效等级" required>
        <el-select v-model="localFormData.efficiencyLevel" placeholder="请选择能效等级" style="width: 100%;">
          <el-option label="1级" value="1级" />
          <el-option label="2级" value="2级" />
          <el-option label="3级" value="3级" />
        </el-select>
      </el-form-item>

      <el-form-item label="能效基值" required>
        <el-input v-model="localFormData.baseValue" placeholder="请输入能效基值（支持区间，如 ≤0.2 或 0.2~0.45）" />
      </el-form-item>

      <el-form-item label="单位">
        <el-select v-model="localFormData.unit" style="width: 100%;">
          <el-option v-for="u in allUnits" :key="u" :label="u || '无量纲'" :value="u" />
        </el-select>
      </el-form-item>

      <el-form-item label="说明">
        <el-input v-model="localFormData.remark" placeholder="请输入说明（如：高效、中等、基础）" />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="$emit('close')">取消</el-button>
      <el-button type="primary" @click="handleSubmit">{{ isEdit ? '保存' : '创建' }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  isEdit: {
    type: Boolean,
    default: false
  },
  formData: {
    type: Object,
    default: () => ({
      id: null, category: '', emissionLevel: '', powerRange: '', rangeLabel: '',
      temperatureRange: '', steamPressure: '', steamType: '',
      secondaryRange: '', secondaryRangeLabel: '', metricType: '', efficiencyLevel: '',
      baseValue: null, engineType: '', unit: '%', remark: ''
    })
  },
  categoryConfig: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['save', 'close'])

const visible = computed({
  get: () => true,
  set: (value) => {
    if (!value) emit('close')
  }
})

const localFormData = ref({ ...props.formData })

watch(() => props.formData, (newValue) => {
  localFormData.value = { ...newValue }
}, { deep: true })

// 从 categoryConfig 派生选项
const categoryOptions = Object.entries(props.categoryConfig).map(([value, cfg]) => ({ value, label: cfg.label }))
const allUnits = [...new Set(Object.values(props.categoryConfig).map(cfg => cfg.defaultUnit))]
const allEngineTypeOptions = Object.values(props.categoryConfig).flatMap(cfg => cfg.engineTypes.map(name => ({ value: name, label: name })))

// 当前类别对应的配置
const currentConfig = computed(() => props.categoryConfig[localFormData.value.category])

// 获取当前有效的维度配置（支持子配置）
const getEffectiveConfig = () => {
  const cfg = currentConfig.value
  if (!cfg) return null
  
  // 检查是否有特定发动机的子配置
  if (localFormData.value.engineType && cfg.subEngineConfig && cfg.subEngineConfig[localFormData.value.engineType]) {
    return {
      ...cfg,
      dimensions: cfg.subEngineConfig[localFormData.value.engineType].dimensions,
      dimensionConfig: cfg.subEngineConfig[localFormData.value.engineType].dimensionConfig
    }
  }
  
  return cfg
}

const activeDimensions = computed(() => {
  const effectiveConfig = getEffectiveConfig()
  return effectiveConfig?.dimensions || []
})

const currentMetricTypes = computed(() => {
  const effectiveConfig = getEffectiveConfig()
  return effectiveConfig?.metricTypes || []
})

const currentEngineTypeOptions = computed(() => {
  if (!localFormData.value.category) return allEngineTypeOptions
  const cfg = currentConfig.value
  if (!cfg) return allEngineTypeOptions
  return cfg.engineTypes.map(name => ({ value: name, label: name }))
})

// 各维度配置（使用有效配置）
const capacityRangeConfig = computed(() => {
  const effectiveConfig = getEffectiveConfig()
  return effectiveConfig?.dimensionConfig?.capacityRange
})
const powerRangeConfig = computed(() => {
  const effectiveConfig = getEffectiveConfig()
  return effectiveConfig?.dimensionConfig?.powerRange
})
const temperatureRangeConfig = computed(() => {
  const effectiveConfig = getEffectiveConfig()
  return effectiveConfig?.dimensionConfig?.temperatureRange
})
const steamPressureConfig = computed(() => {
  const effectiveConfig = getEffectiveConfig()
  return effectiveConfig?.dimensionConfig?.steamPressure
})
const steamTypeConfig = computed(() => {
  const effectiveConfig = getEffectiveConfig()
  return effectiveConfig?.dimensionConfig?.steamType
})
const secondaryRangeConfig = computed(() => {
  const effectiveConfig = getEffectiveConfig()
  return effectiveConfig?.dimensionConfig?.secondaryRange
})
const metricTypeLabel = computed(() => {
  const effectiveConfig = getEffectiveConfig()
  return effectiveConfig?.metricLabel || '能效指标类型'
})

const getDimOptions = (dim) => {
  const effectiveConfig = getEffectiveConfig()
  return effectiveConfig?.dimensionConfig?.[dim]?.options || []
}

// 设备类型变更联动
const onEngineTypeChange = () => {
  const cfg = currentConfig.value
  if (!cfg) return
  
  // 清空当前设备类型不使用的维度字段
  const effectiveConfig = getEffectiveConfig()
  const activeDims = effectiveConfig?.dimensions || []
  
  if (!activeDims.includes('emissionLevel')) localFormData.value.emissionLevel = ''
  if (!activeDims.includes('capacityRange')) localFormData.value.capacityRange = ''
  if (!activeDims.includes('powerRange')) localFormData.value.powerRange = ''
  if (!activeDims.includes('temperatureRange')) localFormData.value.temperatureRange = ''
  if (!activeDims.includes('steamPressure')) localFormData.value.steamPressure = ''
  if (!activeDims.includes('steamType')) localFormData.value.steamType = ''
  if (!activeDims.includes('secondaryRange')) localFormData.value.secondaryRange = ''
  
  // 自动填充默认单位
  localFormData.value.unit = effectiveConfig?.defaultUnit || '%'
}

// 类别变更联动
const onCategoryChange = () => {
  const cfg = currentConfig.value
  if (!cfg) return
  // 重置设备类型（不在当前类别的要清空）
  if (cfg.engineTypes.length > 0 && !cfg.engineTypes.includes(localFormData.value.engineType)) {
    localFormData.value.engineType = ''
  }
  // 清空当前类别不使用的维度字段
  if (!activeDimensions.value.includes('emissionLevel')) localFormData.value.emissionLevel = ''
  if (!activeDimensions.value.includes('capacityRange')) {
    localFormData.value.capacityRange = ''
  }
  if (!activeDimensions.value.includes('powerRange')) {
    localFormData.value.powerRange = ''
    localFormData.value.rangeLabel = ''
  }
  if (!activeDimensions.value.includes('temperatureRange')) {
    localFormData.value.temperatureRange = ''
  }
  if (!activeDimensions.value.includes('steamPressure')) {
    localFormData.value.steamPressure = ''
  }
  if (!activeDimensions.value.includes('steamType')) {
    localFormData.value.steamType = ''
  }
  if (!activeDimensions.value.includes('secondaryRange')) {
    localFormData.value.secondaryRange = ''
    localFormData.value.secondaryRangeLabel = ''
  }
  if (currentMetricTypes.value.length === 0) localFormData.value.metricType = ''
  // 自动填充默认单位
  localFormData.value.unit = cfg.defaultUnit || '%'
  // 自动填充参数区间说明
  if (powerRangeConfig.value?.rangeLabel) localFormData.value.rangeLabel = powerRangeConfig.value.rangeLabel
  if (secondaryRangeConfig.value?.secondaryRangeLabel) localFormData.value.secondaryRangeLabel = secondaryRangeConfig.value.secondaryRangeLabel
}

const handleSubmit = () => {
  if (!localFormData.value.engineType || !localFormData.value.category ||
      !localFormData.value.efficiencyLevel || localFormData.value.baseValue === null || localFormData.value.baseValue === '') {
    alert('请填写必填项')
    return
  }
  emit('save', { ...localFormData.value })
}
</script>
