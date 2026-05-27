<template>
  <el-dialog 
    v-model="dialogVisible" 
    title="默认值配置"
    width="900px"
    :close-on-click-modal="false"
    @close="$emit('close')"
  >
    <div class="config-container">
      <!-- 顶部工具栏 -->
      <div class="toolbar">
        <el-button type="primary" @click="addNewParam">
          <el-icon><Plus /></el-icon>
          新增参数
        </el-button>
      </div>
      
      <!-- 参数分组表格 -->
      <el-table :data="allParams" style="width: 100%" border stripe>
        <el-table-column label="参数名称" min-width="200">
          <template #default="{ row }">
            <el-input v-model="row.name" size="default" placeholder="请输入参数名称" />
          </template>
        </el-table-column>
        <el-table-column label="单位" width="100">
          <template #default="{ row }">
            <el-input v-model="row.unit" size="default" placeholder="单位" />
          </template>
        </el-table-column>
        <el-table-column label="默认值" width="150">
          <template #default="{ row }">
            <el-input-number v-model="row.defaultValue" size="default" style="width: 100%" :controls="false" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center">
          <template #default="{ row }">
            <el-button type="danger" size="small" @click="removeParam(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <template #footer>
      <el-button @click="$emit('close')">关闭</el-button>
      <el-button type="primary" @click="saveConfig">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Plus } from '@element-plus/icons-vue'

const props = defineProps({
  deviceType: {
    type: String,
    required: true
  },
  params: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'save'])

const dialogVisible = ref(true)
const localParams = ref([])

watch(() => props.params, (newParams) => {
  localParams.value = JSON.parse(JSON.stringify(newParams))
}, { immediate: true })

const allParams = computed(() => localParams.value)

const addNewParam = () => {
  const newId = localParams.value.length > 0 
    ? Math.max(...localParams.value.map(p => p.id)) + 1 
    : 1
    
  localParams.value.push({
    id: newId,
    name: '新参数',
    unit: '',
    defaultValue: 0,
    minValue: 0,
    maxValue: 100
  })
}

const removeParam = (paramId) => {
  if (localParams.value.length <= 1) {
    import('element-plus').then(({ ElMessage }) => {
      ElMessage.warning('至少需要保留一个参数')
    })
    return
  }
  
  localParams.value = localParams.value.filter(p => p.id !== paramId)
}

const saveConfig = () => {
  emit('save', [...localParams.value])
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