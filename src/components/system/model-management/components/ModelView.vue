<template>
  <el-dialog 
    v-model="visible" 
    title="查看样机模型"
    width="600px"
    @close="$emit('close')"
  >
    <el-descriptions :column="1" border>
      <el-descriptions-item label="模型名称">
        {{ model?.name }}
      </el-descriptions-item>
      <el-descriptions-item label="船型">
        {{ model?.shipType }}
      </el-descriptions-item>
      <el-descriptions-item label="设备类型">
        {{ model?.deviceType }}
      </el-descriptions-item>
      <el-descriptions-item label="模型版本">
        {{ model?.version }}
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag :type="getStatusTagType(model?.status)">
          {{ getStatusText(model?.status) }}
        </el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="创建时间">
        {{ model?.createdAt }}
      </el-descriptions-item>
      <el-descriptions-item label="数据连接信息">
        {{ model?.connectionInfo || '暂无数据连接信息' }}
      </el-descriptions-item>
      <el-descriptions-item label="描述">
        {{ model?.description || '暂无描述' }}
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
  model: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])

const visible = computed({
  get: () => true,
  set: (value) => {
    if (!value) emit('close')
  }
})

const getStatusText = (status) => {
  const statusMap = {
    connected: '已连接',
    disconnected: '未连接',
    testing: '测试中',
    validated: '已验证'
  }
  return statusMap[status] || status
}

const getStatusTagType = (status) => {
  const typeMap = {
    connected: 'success',
    disconnected: 'info',
    testing: 'warning',
    validated: ''
  }
  return typeMap[status] || ''
}
</script>

<style scoped>
/* Element Plus 组件自带样式，无需额外样式 */
</style>
