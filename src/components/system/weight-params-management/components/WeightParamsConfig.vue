<template>
  <el-dialog 
    v-model="dialogVisible" 
    title="权重配置"
    width="900px"
    :close-on-click-modal="false"
    @close="$emit('close')"
  >
    <div class="config-container">
      <!-- 顶部工具栏 -->
      <div class="toolbar">
        <el-button type="primary" @click="addWeight">
          <el-icon><Plus /></el-icon>
          添加工况
        </el-button>
      </div>
      
      <!-- 权重配置表格 -->
      <el-table :data="localWeights" style="width: 100%" border stripe>
        <el-table-column label="工况编号" width="100" align="center">
          <template #default="{ row }">
            <el-tag type="info">工况 {{ row.id }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发动机转速" min-width="150">
          <template #default="{ row }">
            <el-input v-model="row.engineSpeed" placeholder="例：100%" size="default" />
          </template>
        </el-table-column>
        <el-table-column label="功率模式" min-width="150">
          <template #default="{ row }">
            <el-input v-model="row.powerMode" placeholder="例：100%" size="default" />
          </template>
        </el-table-column>
        <el-table-column label="权重" width="200">
          <template #default="{ row }">
            <el-input-number 
              v-model="row.weight" 
              :min="0" 
              :max="1" 
              :step="0.05" 
              :precision="2"
              size="default" 
              style="width: 100%" 
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center">
          <template #default="{ $index }">
            <el-button 
              type="danger" 
              size="small" 
              @click="removeWeight($index)" 
              :disabled="localWeights.length <= 1"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 权重总计提示 -->
      <el-alert 
        v-if="totalWeight !== 1" 
        :title="`当前权重总计：${(totalWeight * 100).toFixed(0)}%，建议调整为 100%`" 
        type="warning" 
        :closable="false" 
        show-icon
        style="margin-top: 16px"
      />
    </div>

    <template #footer>
      <el-button @click="$emit('close')">关闭</el-button>
      <el-button type="primary" @click="saveWeights">保存权重</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  mode: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close', 'save'])

const dialogVisible = ref(true)
const localWeights = ref([])

watch(() => props.mode.weights, (newWeights) => {
  localWeights.value = JSON.parse(JSON.stringify(newWeights))
}, { immediate: true })

// 计算权重总计
const totalWeight = computed(() => {
  return localWeights.value.reduce((sum, item) => sum + (item.weight || 0), 0)
})

const addWeight = () => {
  const newId = localWeights.value.length + 1
  localWeights.value.push({
    id: newId,
    engineSpeed: '100%',
    powerMode: '50%',
    weight: 0.1
  })
}

const removeWeight = (index) => {
  if (localWeights.value.length > 1) {
    localWeights.value.splice(index, 1)
    localWeights.value.forEach((item, i) => {
      item.id = i + 1
    })
  }
}

const saveWeights = () => {
  if (Math.abs(totalWeight.value - 1) > 0.01) {
    ElMessage.warning(`当前权重总计为 ${(totalWeight.value * 100).toFixed(0)}%，建议调整为 100%`)
    return
  }
  emit('save', [...localWeights.value])
}
</script>

<style scoped>
.config-container {
  padding: 0;
}

.toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}
</style>