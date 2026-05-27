<template>
  <el-dialog 
    v-model="visible" 
    :title="isEdit ? '编辑运行模式' : '新增运行模式'"
    width="600px"
    @close="$emit('close')"
  >
    <el-form :model="formData" label-width="120px">
      <el-form-item label="模式名称" required>
        <el-input v-model="formData.name" placeholder="请输入模式名称，如：恒速主机运行模式 (E2)" />
      </el-form-item>
      
      <el-form-item label="描述">
        <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入模式描述，如：主机以恒定转速运行" />
      </el-form-item>
    </el-form>
    
    <template #footer>
      <el-button @click="$emit('close')">取消</el-button>
      <el-button type="primary" @click="handleSave">保存</el-button>
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
  mode: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['save', 'close'])

const visible = computed({
  get: () => true,
  set: (value) => {
    if (!value) emit('close')
  }
})

const formData = ref({ ...props.mode })

watch(() => props.mode, (newVal) => {
  formData.value = { ...newVal }
}, { deep: true })

const handleSave = () => {
  emit('save', { ...formData.value })
}
</script>

<style scoped>
/* Element Plus 组件自带样式，无需额外样式 */
</style>
