<template>
  <div class="modal-overlay">
    <div class="modal-content modal-3d">
      <div class="modal-header">
        <h4>{{ model?.name }} - 3D模型查看</h4>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <div class="model-info">
          <div class="info-item">
            <span class="info-label">船型：</span>
            <span class="info-value">{{ model?.shipType }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">设备类型：</span>
            <span class="info-value">{{ model?.deviceType }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">模型版本：</span>
            <span class="info-value">{{ model?.version }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">状态：</span>
            <span class="info-value">
              <span class="model-status" :class="model?.status">
                {{ model?.status === 'connected' ? '已连接' : '未连接' }}
              </span>
            </span>
          </div>
        </div>
        <div class="model-3d-viewer">
          <div class="three-d-placeholder">
            <img
              :src="`https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(model?.deviceType + ' 3D model visualization with detailed components')}&image_size=landscape_16_9`"
              :alt="model?.name + ' 3D模型'"
              class="model-image"
            >
            <div class="viewer-controls">
              <button class="btn btn-sm" @click="rotateModel">旋转</button>
              <button class="btn btn-sm" @click="zoomModel">缩放</button>
              <button class="btn btn-sm" @click="resetView">重置</button>
              <button class="btn btn-sm" @click="fullscreenView">全屏</button>
            </div>
          </div>
        </div>
        <div class="model-metrics">
          <h5>模型性能指标</h5>
          <div class="metrics-grid">
            <div class="metric-item">
              <span class="metric-label">能效评分</span>
              <span class="metric-value">{{ model?.metrics?.score || 85 }}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">仿真精度</span>
              <span class="metric-value">{{ model?.metrics?.accuracy || '92%' }}</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">渲染质量</span>
              <span class="metric-value">高</span>
            </div>
            <div class="metric-item">
              <span class="metric-label">加载时间</span>
              <span class="metric-value">2.3s</span>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('close')">关闭</button>
        <button class="btn btn-primary" @click="export3DModel">导出模型</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  model: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])

const rotateModel = () => {
  alert('旋转模型')
}

const zoomModel = () => {
  alert('缩放模型')
}

const resetView = () => {
  alert('重置视角')
}

const fullscreenView = () => {
  alert('全屏查看')
}

const export3DModel = () => {
  alert('导出3D模型')
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

.modal-3d {
  max-width: 900px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e2e8f0;
  background-color: #f8fafc;
}

.modal-header h4 {
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

/* 模型信息样式 */
.model-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
  padding: 16px;
  background-color: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 14px;
  color: #666;
  font-weight: 500;
}

.info-value {
  font-size: 16px;
  color: #333;
  font-weight: 600;
}

.model-status {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.model-status.connected {
  background-color: #d1fae5;
  color: #065f46;
}

.model-status.disconnected {
  background-color: #fee2e2;
  color: #b91c1c;
}

/* 3D查看器样式 */
.model-3d-viewer {
  margin-bottom: 24px;
}

.three-d-placeholder {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
}

.model-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: 8px;
  transition: transform 0.3s ease;
}

.model-image:hover {
  transform: scale(1.02);
}

.viewer-controls {
  position: absolute;
  bottom: 16px;
  left: 16px;
  display: flex;
  gap: 8px;
  background: rgba(255, 255, 255, 0.9);
  padding: 8px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

/* 模型指标样式 */
.model-metrics {
  background-color: #f8fafc;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.model-metrics h5 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  text-align: center;
}

.metric-label {
  font-size: 14px;
  color: #666;
}

.metric-value {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

/* 按钮样式 */
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

.btn-sm {
  padding: 6px 12px;
  font-size: 12px;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 20px;
  }

  .model-image {
    height: 300px;
  }

  .model-info {
    grid-template-columns: 1fr;
  }

  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .viewer-controls {
    flex-wrap: wrap;
  }

  .modal-footer {
    flex-direction: column;
  }

  .modal-footer button {
    width: 100%;
  }
}
</style>
