<template>
  <el-form :model="localFormData" label-width="120px">
    <el-form-item label="设备类型名称" required>
      <el-input v-model="localFormData.name" placeholder="请输入设备类型名称" />
    </el-form-item>
    
    <el-form-item label="类别" required>
      <el-select v-model="localFormData.category" placeholder="请选择类别" style="width: 100%;">
        <el-option label="船用发动机" value="engine" />
        <el-option label="船用齿轮箱" value="gearbox" />
        <el-option label="船用余热回收发电装置" value="waste-heat" />
        <el-option label="船用焚烧炉" value="incinerator" />
        <el-option label="船用碟式分离机" value="separator" />
        <el-option label="船用压载水处理设备" value="ballast" />
        <el-option label="船用锚绞机" value="windlass" />
        <el-option label="船用吊机" value="crane" />
        <el-option label="船用发电机" value="generator" />
        <el-option label="船用组合式空调机组" value="air-conditioner" />
        <el-option label="船用冷水机组" value="chiller" />
        <el-option label="船用惰性气体系统" value="inert-gas" />
        <el-option label="船用二氧化碳捕集设备" value="co2-capture" />
        <el-option label="船用推进器" value="propeller" />
      </el-select>
    </el-form-item>
    
    <el-form-item label="描述" required>
      <el-input
        v-model="localFormData.description"
        type="textarea"
        placeholder="设备类型的业务定义，如：船舶主推进系统，低速柴油发动机"
        :rows="3"
      />
    </el-form-item>
  </el-form>
</template>

<script setup>
import { ref, watch } from 'vue'

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

const localFormData = ref({ ...props.formData })

watch(() => props.formData, (newValue) => {
  localFormData.value = { ...newValue }
}, { deep: true })
</script>

<style scoped>
/* 表单样式由 Element Plus 提供 */
</style>
