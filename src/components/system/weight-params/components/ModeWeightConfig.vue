<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>权重配置 - {{ mode.name }}</h3>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <div class="mode-weights">
          <div class="mode-weight-item" v-for="(item, index) in localWeights" :key="index">
            <div class="mode-weight-info">
              <label>工况 {{ item.id }}：</label>
              <div class="mode-params">
                <div class="param-input">
                  <span>发动机转速：</span>
                  <input 
                    type="text" 
                    v-model="item.engineSpeed"
                    placeholder="例如：100%"
                    class="small-input"
                  >
                </div>
                <div class="param-input">
                  <span>功率模式：</span>
                  <input 
                    type="text" 
                    v-model="item.powerMode"
                    placeholder="例如：100%"
                    class="small-input"
                  >
                </div>
              </div>
            </div>
            <div class="mode-weight-control">
              <input 
                type="range" 
                :min="0" 
                :max="1" 
                :step="0.05"
                v-model.number="item.weight" 
              >
              <span class="mode-weight">{{ item.weight }}</span>
              <button class="btn btn-sm btn-danger" @click="removeWeight(index)" :disabled="localWeights.length <= 1">
                删除
              </button>
            </div>
          </div>

          <div class="mode-actions">
            <button class="btn btn-secondary" @click="addWeight">添加工况</button>
            <button class="btn btn-primary" @click="saveWeights">保存权重</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>import { ref, watch } from 'vue';
const props = defineProps({
 mode: {
 type: Object,
 required: true
 }
});
const emit = defineEmits(['close', 'save']);
const localWeights = ref([]);
watch(() => props.mode.weights, (newWeights) => {
 localWeights.value = JSON.parse(JSON.stringify(newWeights));
}, { immediate: true });
const addWeight = () => {
 const newId = localWeights.value.length + 1;
 localWeights.value.push({
 id: newId,
 engineSpeed: '100%',
 powerMode: '50%',
 weight: 0.1
 });
};
const removeWeight = (index) => {
 if (localWeights.value.length > 1) {
 localWeights.value.splice(index, 1);
 localWeights.value.forEach((item, i) => {
 item.id = i + 1;
 });
 }
};
const saveWeights = () => {
 emit('save', [...localWeights.value]);
};
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
  max-width: 800px;
  max-height: 80vh;
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

.mode-weights {
  margin-bottom: 24px;
}

.mode-weight-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px;
  background-color: #f8fafc;
  border-radius: 6px;
}

.mode-weight-info {
  flex: 1;
  margin-right: 20px;
}

.mode-weight-info label {
  font-size: 14px;
  font-weight: 500;
  color: #1e293b;
  margin-bottom: 8px;
  display: block;
}

.mode-params {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}

.param-input {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 180px;
}

.param-input span {
  font-size: 14px;
  color: #64748b;
  white-space: nowrap;
  width: 80px;
}

.small-input {
  padding: 4px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
  width: 120px;
}

.small-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}

.mode-weight-control {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 350px;
}

.mode-weight-control input[type="range"] {
  flex: 1;
}

.mode-weight {
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
  min-width: 50px;
  text-align: right;
}

.mode-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn {
  padding: 8px 16px;
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

.btn-danger {
  background-color: #ef4444;
  color: white;
}

.btn-danger:hover {
  background-color: #dc2626;
}

.btn-danger:disabled {
  background-color: #fca5a5;
  cursor: not-allowed;
}

.btn-sm {
  padding: 4px 8px;
  font-size: 14px;
}

@media (max-width: 768px) {
  .mode-weight-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .mode-weight-control {
    width: 100%;
    margin-top: 12px;
  }
  
  .mode-actions {
    flex-direction: column;
    align-items: stretch;
  }
  
  .mode-actions .btn {
    width: 100%;
  }
}
</style>