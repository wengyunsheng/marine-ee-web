<template>
  <el-dialog 
    v-model="visible" 
    :title="isEdit ? '编辑样机模型' : '新增样机模型'"
    width="600px"
    @close="$emit('close')"
  >
    <el-form :model="localFormData" label-width="120px">
      <el-form-item label="模型名称" required>
        <el-input v-model="localFormData.name" placeholder="请输入模型名称" />
      </el-form-item>
      <el-form-item label="船型" required>
        <el-select v-model="localFormData.shipType" placeholder="请选择船型" style="width: 100%;">
          <el-option label="VLCC超大型油轮" value="VLCC超大型油轮" />
          <el-option label="散货船" value="散货船" />
          <el-option label="集装箱船" value="集装箱船" />
          <el-option label="液化气船" value="液化气船" />
        </el-select>
      </el-form-item>
      <el-form-item label="设备类型" required>
        <el-select v-model="localFormData.deviceType" placeholder="请选择设备类型" style="width: 100%;">
          <el-option label="船用柴油发动机（低速机）" value="船用柴油发动机（低速机）" />
          <el-option label="船用柴油发动机（中速机）" value="船用柴油发动机（中速机）" />
          <el-option label="船用LNG/柴油双燃料发动机（低速机）" value="船用LNG/柴油双燃料发动机（低速机）" />
          <el-option label="船用LNG/柴油双燃料发动机（中速机）" value="船用LNG/柴油双燃料发动机（中速机）" />
          <el-option label="船用甲醇/柴油双燃料发动机（低速机）" value="船用甲醇/柴油双燃料发动机（低速机）" />
          <el-option label="船用甲醇/柴油双燃料发动机（中速机）" value="船用甲醇/柴油双燃料发动机（中速机）" />
        </el-select>
      </el-form-item>
      <el-form-item label="模型版本">
        <el-input v-model="localFormData.version" placeholder="请输入模型版本" />
      </el-form-item>
      <el-form-item label="状态">
        <el-select v-model="localFormData.status" placeholder="请选择状态" style="width: 100%;">
          <el-option label="已连接" value="connected" />
          <el-option label="未连接" value="disconnected" />
          <el-option label="测试中" value="testing" />
          <el-option label="已验证" value="validated" />
        </el-select>
      </el-form-item>
      <el-form-item label="数据连接信息">
        <el-input v-model="localFormData.connectionInfo" type="textarea" :rows="3" placeholder="请输入数据连接信息，如数据源、连接状态等" />
      </el-form-item>
      <el-form-item label="描述">
        <el-input v-model="localFormData.description" type="textarea" :rows="3" placeholder="请输入模型描述" />
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="$emit('close')">取消</el-button>
      <el-button type="primary" @click="handleSave">{{ isEdit ? '保存' : '创建' }}</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  isEdit: {
    type: Boolean,
    default: false
  },
  formData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['save', 'close'])

const visible = computed({
  get: () => true,
  set: (value) => {
    if (!value) emit('close')
  }
})

const localFormData = ref({ ...props.formData })

watch(() => props.formData, (newValue) => {
  localFormData.value = { ...newValue }
}, { deep: true })

const handleSave = () => {
  emit('save', { ...localFormData.value })
}
</script>

<style scoped>
/* Element Plus 组件自带样式，无需额外样式 */
</style>
