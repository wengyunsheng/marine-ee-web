<template>
  <el-dialog
    v-model="visible"
    title="测试条件"
    width="800px"
    :close-on-click-modal="false"
  >
    <div v-if="testCondition && Object.keys(testCondition).length > 0" class="test-condition-content">
      <el-descriptions :column="3" border>
        <el-descriptions-item label="环境温度">{{ testCondition.ambientTemp }}℃</el-descriptions-item>
        <el-descriptions-item label="环境湿度">{{ testCondition.ambientHumidity }}%</el-descriptions-item>
        <el-descriptions-item label="环境压力">{{ testCondition.ambientPressure }}kPa</el-descriptions-item>
        <el-descriptions-item label="排气温度">{{ testCondition.exhaustTemp }}℃</el-descriptions-item>
        <el-descriptions-item label="冷却水进口温度">{{ testCondition.coolantInlet }}℃</el-descriptions-item>
        <el-descriptions-item label="冷却水出口温度">{{ testCondition.coolantOutlet }}℃</el-descriptions-item>
        <el-descriptions-item label="润滑油温度">{{ testCondition.lubeOilTemp }}℃</el-descriptions-item>
      </el-descriptions>
    </div>
    <el-empty v-else description="暂无测试条件数据" />
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
