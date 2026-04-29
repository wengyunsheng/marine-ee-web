<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ isEdit ? '编辑能效基值' : '新增能效基值' }}</h3>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>发动机类型 <span class="required">*</span></label>
            <select v-model="localFormData.engineType" class="form-select">
              <option value="">请选择发动机类型</option>
              <option value="船用柴油发动机（低速机）">船用柴油发动机（低速机）</option>
              <option value="船用柴油发动机（中速机）">船用柴油发动机（中速机）</option>
              <option value="船用LNG/柴油双燃料发动机（低速机）">船用LNG/柴油双燃料发动机（低速机）</option>
              <option value="船用LNG/柴油双燃料发动机（中速机）">船用LNG/柴油双燃料发动机（中速机）</option>
              <option value="船用甲醇/柴油双燃料发动机（低速机）">船用甲醇/柴油双燃料发动机（低速机）</option>
              <option value="船用甲醇/柴油双燃料发动机（中速机）">船用甲醇/柴油双燃料发动机（中速机）</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>排放等级 <span class="required">*</span></label>
            <select v-model="localFormData.emissionLevel" class="form-select">
              <option value="">请选择排放等级</option>
              <option value="Tier Ι">Tier Ι</option>
              <option value="Tier II">Tier II</option>
              <option value="Tier III">Tier III</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>单缸功率区间 <span class="required">*</span></label>
            <input type="text" v-model="localFormData.powerRange" placeholder="例如：P < 1800" class="form-input">
          </div>
          
          <div class="form-group">
            <label>能效等级 <span class="required">*</span></label>
            <select v-model="localFormData.efficiencyLevel" class="form-select">
              <option value="">请选择能效等级</option>
              <option value="1级">1级</option>
              <option value="2级">2级</option>
              <option value="3级">3级</option>
            </select>
          </div>
          
          <div class="form-group">
            <label>能效基值 <span class="required">*</span></label>
            <input type="number" v-model.number="localFormData.baseValue" placeholder="请输入能效基值" class="form-input" step="0.01">
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('close')">取消</button>
        <button class="btn btn-primary" @click="handleSubmit">{{ isEdit ? '保存' : '创建' }}</button>
      </div>
    </div>
  </div>
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
    default: () => ({
      id: null,
      emissionLevel: '',
      powerRange: '',
      efficiencyLevel: '',
      baseValue: null,
      engineType: ''
    })
  }
})

const emit = defineEmits(['save', 'close'])

const localFormData = ref({ ...props.formData })

watch(() => props.formData, (newValue) => {
  localFormData.value = { ...newValue }
}, { deep: true })

const handleSubmit = () => {
  if (!localFormData.value.engineType || !localFormData.value.emissionLevel || 
      !localFormData.value.powerRange || !localFormData.value.efficiencyLevel || 
      localFormData.value.baseValue === null) {
    alert('请填写必填项')
    return
  }
  
  emit('save', { ...localFormData.value })
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 90%;
  max-width: 600px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  background-color: #f8fafc;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.modal-close:hover {
  background-color: #e2e8f0;
  color: #333;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s;
  box-sizing: border-box;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 80px;
}

.required {
  color: #ef4444;
  margin-left: 4px;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #e2e8f0;
  background-color: #f8fafc;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary {
  background-color: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background-color: #e5e7eb;
}

.btn-primary {
  background-color: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background-color: #2563eb;
}
</style>