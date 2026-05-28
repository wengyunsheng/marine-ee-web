<template>
  <el-dialog 
    v-model="visible" 
    title="查看能效数据"
    width="600px"
    @close="$emit('close')"
  >
    <el-descriptions :column="1" border>
      <el-descriptions-item label="数据日期">
        {{ data.dataDate }}
      </el-descriptions-item>
      <el-descriptions-item label="样机模型">
        {{ modelName }}
      </el-descriptions-item>
      <el-descriptions-item label="数据来源">
        {{ data.dataSource }}
      </el-descriptions-item>
    </el-descriptions>

    <template #footer>
      <el-button type="primary" @click="$emit('close')">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    required: true
  },
  models: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close'])

const modelName = computed(() => {
  if (!props.data?.modelId) return '-'
  const model = props.models.find(m => m.id === props.data.modelId)
  return model ? model.name : '-'
})

const visible = computed({
  get: () => true,
  set: (value) => {
    if (!value) emit('close')
  }
})
</script>

<style scoped>
</style>