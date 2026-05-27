<template>
  <el-dialog 
    v-model="dialogVisible" 
    :title="`${model?.name} - 3D模型查看`"
    width="80%"
    :close-on-click-modal="false"
    @close="$emit('close')"
  >
    <div class="model-info">
      <el-descriptions :column="2" border>
        <el-descriptions-item label="船型">{{ model?.shipType }}</el-descriptions-item>
        <el-descriptions-item label="设备类型">{{ model?.deviceType }}</el-descriptions-item>
        <el-descriptions-item label="模型版本">{{ model?.version }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="model?.status === 'connected' ? 'success' : 'danger'">
            {{ model?.status === 'connected' ? '已连接' : '未连接' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
    </div>
    
    <div class="model-3d-viewer">
      <div class="three-d-placeholder">
        <img
          :src="`https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=${encodeURIComponent(model?.deviceType + ' 3D model visualization with detailed components')}&image_size=landscape_16_9`"
          :alt="model?.name + ' 3D模型'"
          class="model-image"
        >
        <div class="viewer-controls">
          <el-button size="small" @click="rotateModel">旋转</el-button>
          <el-button size="small" @click="zoomModel">缩放</el-button>
          <el-button size="small" @click="resetView">重置</el-button>
          <el-button size="small" @click="fullscreenView">全屏</el-button>
        </div>
      </div>
    </div>
    
    <div class="model-metrics">
      <h5>模型性能指标</h5>
      <el-row :gutter="16">
        <el-col :xs="12" :sm="6" v-for="(metric, index) in metricsData" :key="index">
          <div class="metric-item">
            <span class="metric-label">{{ metric.label }}</span>
            <span class="metric-value">{{ metric.value }}</span>
          </div>
        </el-col>
      </el-row>
    </div>

    <template #footer>
      <el-button @click="$emit('close')">关闭</el-button>
      <el-button type="primary" @click="export3DModel">导出模型</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  model: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['close'])

const dialogVisible = ref(true)

const metricsData = computed(() => [
  { label: '能效评分', value: props.model?.metrics?.score || 85 },
  { label: '仿真精度', value: props.model?.metrics?.accuracy || '92%' },
  { label: '渲染质量', value: '高' },
  { label: '加载时间', value: '2.3s' }
])

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
.model-info {
  margin-bottom: 24px;
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

.metric-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  text-align: center;
  margin-bottom: 16px;
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

/* 响应式布局 */
@media (max-width: 768px) {
  .model-image {
    height: 300px;
  }
}
</style>
