<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>查看运行模式 - {{ mode.name }}</h3>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <div class="info-section">
          <div class="info-item">
            <label>模式ID：</label>
            <span>{{ mode.id }}</span>
          </div>
          <div class="info-item">
            <label>模式名称：</label>
            <span>{{ mode.name }}</span>
          </div>
          <div class="info-item">
            <label>描述：</label>
            <span>{{ mode.description || '-' }}</span>
          </div>
          <div class="info-item">
            <label>工况数量：</label>
            <span>{{ mode.weights.length }} 个工况</span>
          </div>
        </div>
        
        <div class="weights-section">
          <h4>工况权重列表</h4>
          <table class="weights-table">
            <thead>
              <tr>
                <th>工况编号</th>
                <th>发动机转速</th>
                <th>功率模式</th>
                <th>权重</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in mode.weights" :key="item.id">
                <td>工况 {{ item.id }}</td>
                <td>{{ item.engineSpeed }}</td>
                <td>{{ item.powerMode }}</td>
                <td>{{ item.weight }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" @click="$emit('close')">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  mode: {
    type: Object,
    required: true
  }
})

defineEmits(['close'])
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

.info-section {
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  margin-bottom: 12px;
}

.info-item label {
  font-weight: 600;
  color: #333;
  min-width: 100px;
}

.info-item span {
  color: #666;
}

.weights-section {
  margin-top: 24px;
}

.weights-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.weights-table {
  width: 100%;
  border-collapse: collapse;
}

.weights-table th {
  background-color: #f8fafc;
  padding: 8px 12px;
  text-align: left;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #e2e8f0;
}

.weights-table td {
  padding: 8px 12px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #e2e8f0;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 20px;
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
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #2563eb;
  color: white;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}
</style>