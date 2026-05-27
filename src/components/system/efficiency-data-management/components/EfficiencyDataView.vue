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
      <el-descriptions-item label="设备类型">
        {{ data.deviceType }}
      </el-descriptions-item>
      <el-descriptions-item label="设备名称">
        {{ data.deviceName }}
      </el-descriptions-item>
      <el-descriptions-item label="数据来源">
        {{ data.dataSource }}
      </el-descriptions-item>
      <el-descriptions-item label="工况特性">
        {{ data.workingCondition }}
      </el-descriptions-item>
      <el-descriptions-item label="能效指标值">
        {{ data.efficiencyValue || '-' }}
      </el-descriptions-item>
      <el-descriptions-item label="能效等级">
        <el-tag v-if="data.efficiencyLevel" :type="getEfficiencyLevelType(data.efficiencyLevel)">
          {{ data.efficiencyLevel }}
        </el-tag>
        <span v-else class="text-muted">-</span>
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
  }
})

const emit = defineEmits(['close'])

const visible = computed({
  get: () => true,
  set: (value) => {
    if (!value) emit('close')
  }
})

const getEfficiencyLevelType = (level) => {
  const levelNum = parseInt(level.replace('级', ''))
  if (levelNum === 1) return 'success'
  if (levelNum === 2) return ''
  if (levelNum === 3) return 'warning'
  if (levelNum >= 4) return 'danger'
  return ''
}
</script>

<style scoped>
.text-muted {
  color: #94a3b8;
}
</style>