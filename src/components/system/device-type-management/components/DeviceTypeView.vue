<template>
  <div class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h3>查看设备类型详情</h3>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">设备类型名称</span>
            <span class="detail-value">{{ deviceType?.name }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">类别</span>
            <span class="detail-value">
              <span class="device-category" :class="deviceType?.category">
                {{ getCategoryName(deviceType?.category) }}
              </span>
            </span>
          </div>
          <div class="detail-item">
            <span class="detail-label">创建时间</span>
            <span class="detail-value">{{ deviceType?.createdAt }}</span>
          </div>
          <div class="detail-item full-width">
            <span class="detail-label">描述</span>
            <span class="detail-value">{{ deviceType?.description || '暂无描述' }}</span>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('close')">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  deviceType: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])

const getCategoryName = (category) => {
  const categoryMap = {
    'engine': '船用发动机',
    'gearbox': '船用齿轮箱',
    'waste-heat': '船用余热回收发电装置',
    'incinerator': '船用焚烧炉',
    'separator': '船用碟式分离机',
    'ballast': '船用压载水处理设备',
    'windlass': '船用锚绞机',
    'crane': '船用吊机',
    'generator': '船用发电机',
    'air-conditioner': '船用组合式空调机组',
    'chiller': '船用冷水机组',
    'inert-gas': '船用惰性气体系统',
    'co2-capture': '船用二氧化碳捕集设备',
    'propeller': '船用推进器'
  }
  return categoryMap[category] || category
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
  max-width: 500px;
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

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #e2e8f0;
  background-color: #f8fafc;
}

/* 详情样式 */
.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

.detail-value {
  font-size: 14px;
  color: #1f2937;
}

.device-category {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.device-category.engine {
  background-color: #e3f2fd;
  color: #1976d2;
}

.device-category.gearbox {
  background-color: #e8f5e8;
  color: #2e7d32;
}

.device-category.waste-heat {
  background-color: #fff3e0;
  color: #ef6c00;
}

.device-category.incinerator {
  background-color: #ffebee;
  color: #c62828;
}

.device-category.separator {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.device-category.ballast {
  background-color: #e0f7fa;
  color: #00838f;
}

.device-category.windlass {
  background-color: #fce4ec;
  color: #880e4f;
}

.device-category.crane {
  background-color: #e3f2fd;
  color: #0d47a1;
}

.device-category.generator {
  background-color: #fff8e1;
  color: #f57c00;
}

.device-category.air-conditioner {
  background-color: #e1f5fe;
  color: #0288d1;
}

.device-category.chiller {
  background-color: #e3f2fd;
  color: #1565c0;
}

.device-category.inert-gas {
  background-color: #f3e5f5;
  color: #6a1b9a;
}

.device-category.co2-capture {
  background-color: #c8e6c9;
  color: #2e7d32;
}

.device-category.propeller {
  background-color: #fff3e0;
  color: #e65100;
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

.btn-secondary {
  background-color: #e2e8f0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #cbd5e1;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 20px;
  }

  .modal-footer {
    flex-direction: column;
  }

  .modal-footer button {
    width: 100%;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
