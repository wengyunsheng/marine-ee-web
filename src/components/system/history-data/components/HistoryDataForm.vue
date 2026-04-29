<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>{{ isEdit ? '编辑能效数据' : '新增能效数据' }}</h3>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="handleSubmit" class="data-form">
          <div class="form-row">
            <div class="form-group">
              <label>数据日期 *</label>
              <input 
                type="date" 
                v-model="form.dataDate" 
                class="form-control"
                required
              />
            </div>
            <div class="form-group">
              <label>设备类型 *</label>
              <select v-model="form.deviceType" class="form-control" required>
                <option value="">请选择设备类型</option>
                <option value="船用柴油发动机（低速机）">船用柴油发动机（低速机）</option>
                <option value="船用柴油发动机（中速机）">船用柴油发动机（中速机）</option>
                <option value="船用LNG/柴油双燃料发动机（低速机）">船用LNG/柴油双燃料发动机（低速机）</option>
                <option value="船用LNG/柴油双燃料发动机（中速机）">船用LNG/柴油双燃料发动机（中速机）</option>
                <option value="船用甲醇/柴油双燃料发动机（低速机）">船用甲醇/柴油双燃料发动机（低速机）</option>
                <option value="船用甲醇/柴油双燃料发动机（中速机）">船用甲醇/柴油双燃料发动机（中速机）</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>设备名称 *</label>
              <input 
                type="text" 
                v-model="form.deviceName" 
                class="form-control"
                placeholder="请输入设备名称"
                required
              />
            </div>
            <div class="form-group">
              <label>数据来源 *</label>
              <select v-model="form.dataSource" class="form-control" required>
                <option value="">请选择数据来源</option>
                <option value="台架试验">台架试验</option>
                <option value="实船运行">实船运行</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>工况特性 *</label>
              <select v-model="form.workingCondition" class="form-control" required>
                <option value="">请选择工况特性</option>
                <option value="额定工况">额定工况</option>
                <option value="部分负荷">部分负荷</option>
                <option value="低负荷">低负荷</option>
                <option value="变工况">变工况</option>
              </select>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>能效指标值</label>
              <input 
                type="number" 
                v-model.number="form.efficiencyValue" 
                class="form-control"
                placeholder="请输入能效指标值"
                step="0.1"
              />
            </div>
            <div class="form-group">
              <label>能效等级</label>
              <select v-model="form.efficiencyLevel" class="form-control">
                <option value="">请选择能效等级</option>
                <option value="1级">1级</option>
                <option value="2级">2级</option>
                <option value="3级">3级</option>
                <option value="4级">4级</option>
                <option value="5级">5级</option>
              </select>
            </div>
          </div>
        </form>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('close')">取消</button>
        <button class="btn btn-primary" @click="handleSubmit">保存</button>
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
    required: true
  }
})

const emit = defineEmits(['save', 'close'])

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
  color: #1e293b;
}

.modal-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #64748b;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.modal-close:hover {
  background-color: #e2e8f0;
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.data-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.form-control {
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 14px;
  outline: none;
  transition: border-color 0.3s, box-shadow 0.3s;
}

.form-control:focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.btn-secondary {
  background-color: #e2e8f0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #cbd5e1;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: 95%;
  }
}
</style>