<template>
  <el-dialog
    v-model="visible"
    title="测试条件"
    width="800px"
    :close-on-click-modal="false"
  >
    <el-table 
      v-if="testCondition && Object.keys(testCondition).length > 0" 
      :data="[testCondition]" 
      border 
      stripe
    >
      <el-table-column prop="ambientTemp" label="环境温度(℃)" width="140" align="center" />
      <el-table-column prop="ambientHumidity" label="环境湿度(%)" width="140" align="center" />
      <el-table-column prop="ambientPressure" label="环境压力(kPa)" width="140" align="center" />
      <el-table-column prop="exhaustTemp" label="排气温度(℃)" width="140" align="center" />
      <el-table-column prop="coolantInlet" label="冷却水进口温度(℃)" width="160" align="center" />
      <el-table-column prop="coolantOutlet" label="冷却水出口温度(℃)" width="160" align="center" />
      <el-table-column prop="lubeOilTemp" label="润滑油温度(℃)" width="140" align="center" />
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
  testCondition: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue'])

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>
