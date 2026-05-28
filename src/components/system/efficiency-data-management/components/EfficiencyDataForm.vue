<template>
  <el-dialog 
    v-model="visible" 
    :title="isEdit ? '编辑能效数据' : '新增能效数据'"
    width="600px"
    @close="$emit('close')"
  >
    <el-form :model="form" label-width="120px">
      <el-form-item label="数据日期" required>
        <el-input v-model="form.dataDate" type="date" />
      </el-form-item>

      <el-form-item label="样机模型" required>
        <el-select 
          v-model="form.modelId" 
          placeholder="请选择样机模型" 
          style="width: 100%;"
          filterable
          @change="onModelChange"
        >
          <el-option 
            v-for="model in models" 
            :key="model.id" 
            :label="`${model.name}（${model.deviceType}）`" 
            :value="model.id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="版本号" v-if="isEdit">
        <el-tag>v{{ form.version }}</el-tag>
      </el-form-item>

      <el-form-item label="数据来源" required>
        <el-select v-model="form.dataSource" placeholder="请选择数据来源" style="width: 100%;">
          <el-option label="台架试验" value="台架试验" />
          <el-option label="实船运行" value="实船运行" />
        </el-select>
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
    required: true
  },
  models: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['save', 'close'])

const visible = computed({
  get: () => true,
  set: (value) => {
    if (!value) emit('close')
  }
})

const form = ref({
  dataDate: '',
  deviceType: '',
  deviceName: '',
  dataSource: '',
  modelId: '',
  version: 1
})

// 选择样机模型后，自动填充设备类型和设备名称
const onModelChange = (modelId) => {
  const model = props.models.find(m => m.id === modelId)
  if (model) {
    form.value.deviceType = model.deviceType
    form.value.deviceName = model.name
  }
}

watch(() => props.formData, (newVal) => {
  form.value = { ...newVal }
}, { immediate: true, deep: true })

const handleSubmit = () => {
  if (!form.value.modelId) {
    ElMessage.warning('请选择样机模型')
    return
  }
  emit('save', { ...form.value })
}
</script>
