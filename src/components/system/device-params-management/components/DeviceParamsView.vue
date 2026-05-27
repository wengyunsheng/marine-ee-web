<template>
  <el-dialog 
    v-model="visible" 
    title="查看设备参数"
    width="700px"
    @close="$emit('close')"
  >
    <div class="view-section">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="设备类型名称">
          {{ deviceType }}
        </el-descriptions-item>
        <el-descriptions-item label="类别">
          <span class="device-category" :class="category">{{ getCategoryName(category) }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="参数数量">
          {{ params.length }} 个参数
        </el-descriptions-item>
        <el-descriptions-item label="描述" :span="2">
          {{ description }}
        </el-descriptions-item>
      </el-descriptions>
    </div>
    
    <div class="params-section">
      <h4>默认值配置</h4>
      <el-table :data="allParams" style="width: 100%" border stripe>
        <el-table-column prop="name" label="参数名称" min-width="200" />
        <el-table-column prop="unit" label="单位" width="100" />
        <el-table-column prop="defaultValue" label="默认值" width="120" />
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
  category: {
    type: String,
    required: true
  },
  deviceType: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  params: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close'])

const visible = computed({
  get: () => true,
  set: (value) => {
    if (!value) emit('close')
  }
})

const getCategoryName = (category) => {
  const categoryMap = {
    engine: '船用发动机',
    gearbox: '船用齿轮箱',
    'waste-heat': '船用余热回收发电装置',
    incinerator: '船用焚烧炉',
    separator: '船用碟式分离机',
    ballast: '船用压载水处理设备',
    windlass: '船用锚绞机',
    crane: '船用吊机',
    generator: '船用发电机',
    'air-conditioner': '船用组合式空调机组',
    chiller: '船用冷水机组',
    'inert-gas': '船用惰性气体系统',
    'co2-capture': '船用二氧化碳捕集设备',
    propeller: '船用推进器'
  }
  return categoryMap[category] || category
}

const allParams = computed(() => props.params)
</script>

<style scoped>
.view-section {
  margin-bottom: 24px;
}

.params-section {
  margin-top: 20px;
}

.params-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.device-category {
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
  white-space: nowrap;
  display: inline-block;
  width: fit-content;
}

.device-category.engine { background-color: #e3f2fd; color: #1976d2; }
.device-category.gearbox { background-color: #e8f5e8; color: #2e7d32; }
.device-category.waste-heat { background-color: #fff3e0; color: #ef6c00; }
.device-category.incinerator { background-color: #ffebee; color: #c62828; }
.device-category.separator { background-color: #f3e5f5; color: #7b1fa2; }
.device-category.ballast { background-color: #e0f7fa; color: #00838f; }
.device-category.windlass { background-color: #fce4ec; color: #880e4f; }
.device-category.crane { background-color: #e3f2fd; color: #0d47a1; }
.device-category.generator { background-color: #fff8e1; color: #f57c00; }
.device-category.air-conditioner { background-color: #e1f5fe; color: #0288d1; }
.device-category.chiller { background-color: #e3f2fd; color: #1565c0; }
.device-category.inert-gas { background-color: #f3e5f5; color: #6a1b9a; }
.device-category.co2-capture { background-color: #c8e6c9; color: #2e7d32; }
.device-category.propeller { background-color: #fff3e0; color: #e65100; }
</style>