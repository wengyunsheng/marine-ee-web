<template>
  <el-dialog 
    v-model="visible" 
    :title="isEdit ? '编辑设备参数' : '新增设备参数'"
    width="600px"
    @close="$emit('close')"
  >
    <el-form :model="localFormData" label-width="120px">
      <el-form-item label="设备类型名称" required>
        <el-select v-model="localFormData.deviceType" placeholder="请选择设备类型" style="width: 100%;">
          <el-option label="船用柴油发动机（低速机）" value="船用柴油发动机（低速机）" />
          <el-option label="船用柴油发动机（中速机）" value="船用柴油发动机（中速机）" />
          <el-option label="船用LNG/柴油双燃料发动机（低速机）" value="船用LNG/柴油双燃料发动机（低速机）" />
          <el-option label="船用LNG/柴油双燃料发动机（中速机）" value="船用LNG/柴油双燃料发动机（中速机）" />
          <el-option label="船用甲醇/柴油双燃料发动机（低速机）" value="船用甲醇/柴油双燃料发动机（低速机）" />
          <el-option label="船用甲醇/柴油双燃料发动机（中速机）" value="船用甲醇/柴油双燃料发动机（中速机）" />
          <el-option label="单台齿轮箱" value="单台齿轮箱" />
          <el-option label="两台齿轮箱" value="两台齿轮箱" />
          <el-option label="船用有机朗肯循环发电装置" value="船用有机朗肯循环发电装置" />
          <el-option label="船用蒸汽透平发电装置" value="船用蒸汽透平发电装置" />
          <el-option label="单功能焚烧炉（固体废弃物）" value="单功能焚烧炉（固体废弃物）" />
          <el-option label="单功能焚烧炉（污油泥）" value="单功能焚烧炉（污油泥）" />
          <el-option label="双功能焚烧炉" value="双功能焚烧炉" />
          <el-option label="多功能焚烧炉" value="多功能焚烧炉" />
          <el-option label="船用碟式分离机" value="船用碟式分离机" />
          <el-option label="船用压载水处理设备" value="船用压载水处理设备" />
          <el-option label="船用起锚机" value="船用起锚机" />
          <el-option label="船用系泊绞车" value="船用系泊绞车" />
          <el-option label="船用吊机" value="船用吊机" />
          <el-option label="船用低压交流三相同步发电机" value="船用低压交流三相同步发电机" />
          <el-option label="船用中压交流三相同步发电机" value="船用中压交流三相同步发电机" />
          <el-option label="船用组合式空调机组" value="船用组合式空调机组" />
          <el-option label="船用冷水机组" value="船用冷水机组" />
          <el-option label="船用惰性气体系统" value="船用惰性气体系统" />
          <el-option label="船用二氧化碳捕集设备" value="船用二氧化碳捕集设备" />
          <el-option label="船用推进器" value="船用推进器" />
        </el-select>
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
          <el-option label="船用空调机组" value="air-conditioner" />
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
          placeholder="请输入设备参数描述"
          :rows="3"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="$emit('close')">取消</el-button>
      <el-button type="primary" @click="handleSubmit">保存</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  isEdit: {
    type: Boolean,
    default: false
  },
  formData: {
    type: Object,
    default: () => ({
      id: null,
      category: '',
      deviceType: '',
      description: '',
      params: []
    })
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

const handleSubmit = () => {
  if (!localFormData.value.category || !localFormData.value.deviceType || !localFormData.value.description) {
    ElMessage.warning('请填写必填项')
    return
  }
  
  emit('save', { ...localFormData.value })
}
</script>

<style scoped>
/* Element Plus 组件自带样式，无需额外样式 */
</style>