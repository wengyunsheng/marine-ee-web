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
          <span class="device-category" :class="category">{{ category }}</span>
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
        <el-table-column label="参数分组" width="120">
          <template #default="{ row }">
            <el-tag :type="getGroupTagType(row.group)" size="small">
              {{ getGroupName(row.group) }}
            </el-tag>
          </template>
        </el-table-column>
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

const basicParamKeywords = ['额定转速', '额定功率', '主燃料低热值', '引燃燃料低热值', '引燃油低热值']

// 合并所有参数并添加分组信息
const allParams = computed(() => {
  return props.params.map(p => {
    let group = 'other'
    if (basicParamKeywords.some(keyword => p.name.includes(keyword))) {
      group = 'basic'
    } else if (p.name.includes('工况') || p.name.includes('%')) {
      group = 'workingCondition'
    }
    return {
      ...p,
      group
    }
  })
})

// 获取分组名称
const getGroupName = (group) => {
  const groupMap = {
    basic: '基本参数',
    workingCondition: '工况消耗参数',
    other: '其他参数'
  }
  return groupMap[group] || '其他参数'
}

// 获取分组标签类型
const getGroupTagType = (group) => {
  const typeMap = {
    basic: 'primary',
    workingCondition: 'success',
    other: 'info'
  }
  return typeMap[group] || 'info'
}
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

.device-category.船用发动机 { background-color: #e3f2fd; color: #1976d2; }
.device-category.船用齿轮箱 { background-color: #e8f5e8; color: #2e7d32; }
.device-category.船用余热回收发电装置 { background-color: #fff3e0; color: #ef6c00; }
.device-category.船用焚烧炉 { background-color: #ffebee; color: #c62828; }
.device-category.船用碟式分离机 { background-color: #f3e5f5; color: #7b1fa2; }
.device-category.船用压载水处理设备 { background-color: #e0f7fa; color: #00838f; }
.device-category.船用起锚机,
.device-category.船用系泊绞车 { background-color: #fce4ec; color: #880e4f; }
.device-category.船用吊机 { background-color: #e3f2fd; color: #0d47a1; }
.device-category.船用发电机 { background-color: #fff8e1; color: #f57c00; }
.device-category.船用空调机组 { background-color: #e1f5fe; color: #0288d1; }
.device-category.船用冷水机组 { background-color: #e3f2fd; color: #1565c0; }
.device-category.船用惰性气体系统 { background-color: #f3e5f5; color: #6a1b9a; }
.device-category.船用二氧化碳捕集设备 { background-color: #c8e6c9; color: #2e7d32; }
.device-category.船用推进器 { background-color: #fff3e0; color: #e65100; }
</style>