<template>
  <el-dialog
    v-model="visible"
    title="工况数据"
    width="900px"
    :close-on-click-modal="false"
  >
    <el-table
      :data="conditionsData"
      style="width: 100%"
      border
      max-height="500"
      highlight-current-row
      @row-click="handleRowClick"
    >
      <el-table-column type="index" label="序号" width="60" align="center" />
      
      <!-- 发动机工况数据列 -->
      <template v-if="deviceCode === 'engine'">
        <el-table-column prop="loadFactor" label="负荷因子" width="100" align="center">
          <template #default="{ row }">
            {{ (row.loadFactor * 100).toFixed(0) }}%
          </template>
        </el-table-column>
        <el-table-column prop="power" label="功率(kW)" width="110" align="center" />
        <el-table-column prop="speed" label="转速(rpm)" width="110" align="center" />
        <el-table-column prop="bsfc" label="燃油消耗率(g/kWh)" width="150" align="center" />
        <el-table-column prop="bspc" label="燃油消耗率(g/kWh)" width="160" align="center" />
        <el-table-column prop="bsgc" label="燃气消耗率(g/kWh)" width="160" align="center" />
        <el-table-column prop="bsec" label="能量消耗率(kJ/kWh)" width="140" align="center" />
      </template>
      
      <!-- 其他设备通用列 -->
      <template v-else>
        <el-table-column
          v-for="col in conditionsColumns"
          :key="col.prop"
          :prop="col.prop"
          :label="col.label"
          :min-width="col.minWidth || 120"
          align="center"
          show-overflow-tooltip
        />
      </template>
    </el-table>
    <template #footer>
      <el-button @click="visible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  conditionsData: {
    type: Array,
    default: () => []
  },
  conditionsColumns: {
    type: Array,
    default: () => []
  },
  deviceCode: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'condition-change'])

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

// 处理行点击事件
const handleRowClick = (row, column, event) => {
  // 找到当前行在数组中的索引
  const index = props.conditionsData.findIndex(item => item === row)
  if (index !== -1) {
    emit('condition-change', index)
  }
}
</script>
