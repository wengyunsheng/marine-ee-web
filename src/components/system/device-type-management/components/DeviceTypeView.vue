<template>
  <el-descriptions :column="2" border>
    <el-descriptions-item label="设备类型名称">
      {{ deviceType?.name }}
    </el-descriptions-item>
    <el-descriptions-item label="类别">
      <el-tag :class="['device-category', deviceType?.category]">
        {{ getCategoryName(deviceType?.category) }}
      </el-tag>
    </el-descriptions-item>
    <el-descriptions-item label="描述" :span="2">
      {{ deviceType?.description || '暂无描述' }}
    </el-descriptions-item>
    <el-descriptions-item label="创建时间">
      {{ deviceType?.createdAt }}
    </el-descriptions-item>
  </el-descriptions>
</template>

<script setup>
const props = defineProps({
  deviceType: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])

const getCategoryName = (category) => {
  const categoryMap = {
    'engine': '船用发动机',
    'gearbox': '船用齿轮箱',
    'waste-heat': '船用余热回收发电装置',
    'incinerator': '船用焚烧炉',
    'separator': '船用碟式分离机',
    'ballast': '船用压载水处理设备',
    'windlass': '船用锚绞机',
    'crane': '船用吊机',
    'generator': '船用发电机',
    'air-conditioner': '船用组合式空调机组',
    'chiller': '船用冷水机组',
    'inert-gas': '船用惰性气体系统',
    'co2-capture': '船用二氧化碳捕集设备',
    'propeller': '船用推进器'
  }
  return categoryMap[category] || category
}
</script>

<style scoped>
.device-category {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
  white-space: nowrap;
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
