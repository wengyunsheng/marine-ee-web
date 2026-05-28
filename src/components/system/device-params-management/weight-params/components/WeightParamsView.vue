<template>
  <el-dialog 
    v-model="visible" 
    title="查看运行模式"
    width="700px"
    @close="$emit('close')"
  >
    <el-descriptions :column="2" border>
      <el-descriptions-item label="模式名称">
        {{ mode.name }}
      </el-descriptions-item>
      <el-descriptions-item label="工况数量">
        {{ mode.weights.length }} 个工况
      </el-descriptions-item>
      <el-descriptions-item label="描述" :span="2">
        {{ mode.description || '-' }}
      </el-descriptions-item>
    </el-descriptions>
    
    <div class="weights-section">
      <h4>权重配置</h4>
      <el-table :data="mode.weights" style="width: 100%" border stripe>
        <el-table-column label="工况编号" width="120">
          <template #default="scope">
            工况 {{ scope.row.id }}
          </template>
        </el-table-column>
        <el-table-column prop="engineSpeed" label="发动机转速" />
        <el-table-column prop="powerMode" label="功率模式" />
        <el-table-column prop="weight" label="权重" />
      </el-table>
    </div>
    
    <template #footer>
      <el-button @click="$emit('close')">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  mode: {
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
</script>

<style scoped>
.weights-section {
  margin-top: 20px;
}

.weights-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}
</style>
