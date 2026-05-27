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

      <el-form-item label="设备类型" required>
        <el-select v-model="form.deviceType" placeholder="请选择设备类型" style="width: 100%;">
          <el-option label="船用柴油发动机（低速机）" value="船用柴油发动机（低速机）" />
          <el-option label="船用柴油发动机（中速机）" value="船用柴油发动机（中速机）" />
          <el-option label="船用LNG/柴油双燃料发动机（低速机）" value="船用LNG/柴油双燃料发动机（低速机）" />
          <el-option label="船用LNG/柴油双燃料发动机（中速机）" value="船用LNG/柴油双燃料发动机（中速机）" />
          <el-option label="船用甲醇/柴油双燃料发动机（低速机）" value="船用甲醇/柴油双燃料发动机（低速机）" />
          <el-option label="船用甲醇/柴油双燃料发动机（中速机）" value="船用甲醇/柴油双燃料发动机（中速机）" />
        </el-select>
      </el-form-item>

      <el-form-item label="设备名称" required>
        <el-input v-model="form.deviceName" placeholder="请输入设备名称" />
      </el-form-item>

      <el-form-item label="数据来源" required>
        <el-select v-model="form.dataSource" placeholder="请选择数据来源" style="width: 100%;">
          <el-option label="台架试验" value="台架试验" />
          <el-option label="实船运行" value="实船运行" />
        </el-select>
      </el-form-item>

      <el-form-item label="工况特性" required>
        <el-select v-model="form.workingCondition" placeholder="请选择工况特性" style="width: 100%;">
          <el-option label="额定工况" value="额定工况" />
          <el-option label="部分负荷" value="部分负荷" />
          <el-option label="低负荷" value="低负荷" />
          <el-option label="变工况" value="变工况" />
        </el-select>
      </el-form-item>

      <el-form-item label="能效指标值">
        <el-input-number v-model="form.efficiencyValue" :precision="1" :step="0.1" style="width: 100%;" />
      </el-form-item>

      <el-form-item label="能效等级">
        <el-select v-model="form.efficiencyLevel" placeholder="请选择能效等级" style="width: 100%;">
          <el-option label="1级" value="1级" />
          <el-option label="2级" value="2级" />
          <el-option label="3级" value="3级" />
          <el-option label="4级" value="4级" />
          <el-option label="5级" value="5级" />
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

const props = defineProps({
  isEdit: {
    type: Boolean,
    default: false
  },
  formData: {
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

const form = ref({
  dataDate: '',
  deviceType: '',
  deviceName: '',
  dataSource: '',
  workingCondition: '',
  efficiencyValue: '',
  efficiencyLevel: ''
})

watch(() => props.formData, (newVal) => {
  form.value = { ...newVal }
}, { immediate: true, deep: true })

const handleSubmit = () => {
  emit('save', { ...form.value })
}
</script>
