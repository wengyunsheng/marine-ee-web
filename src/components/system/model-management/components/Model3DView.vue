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
        <el-descriptions-item label="设备类型名称" :span="2">{{ model?.deviceType }}</el-descriptions-item>
        <el-descriptions-item label="类别">
          <span class="device-category" :class="model?.category">{{ getCategoryName(model?.category) }}</span>
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

const categoryConfig = {
  engine: '船用发动机', gearbox: '船用齿轮箱', 'waste-heat': '船用余热回收发电装置',
  incinerator: '船用焚烧炉', separator: '船用碟式分离机', ballast: '船用压载水处理设备',
  windlass: '船用锚绞机', crane: '船用吊机', generator: '船用发电机',
  'air-conditioner': '船用组合式空调机组', chiller: '船用冷水机组',
  'inert-gas': '船用惰性气体系统', 'co2-capture': '船用二氧化碳捕集设备', propeller: '船用推进器'
}
const getCategoryName = (category) => categoryConfig[category] || category

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
.device-category {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}
.device-category.engine { background-color: #e3f2fd; color: #1976d2; }
.device-category.gearbox { background-color: #e8f5e8; color: #2e7d32; }
.device-category.waste-heat { background-color: #fff3e0; color: #ef6c00; }
.device-category.incinerator { background-color: #ffebee; color: #c62828; }
.device-category.separator { background-color: #f3e5f5; color: #7b1fa2; }
.device-category.ballast { background-color: #e0f7fa; color: #00838f; }
.device-category.windlass { background-color: #fce4ec; color: #880e4f; }
.device-category.crane { background-color: #e3f2fd; color: #0d47a1; }
.device-category.generator { background-color: #fff8e1; color: #f57c00; }
.device-category.air-conditioner { background-color: #e1f5fe; color: #0288d1; }
.device-category.chiller { background-color: #e3f2fd; color: #1565c0; }
.device-category.inert-gas { background-color: #f3e5f5; color: #6a1b9a; }
.device-category.co2-capture { background-color: #c8e6c9; color: #2e7d32; }
.device-category.propeller { background-color: #fff3e0; color: #e65100; }

/* 响应式布局 */
@media (max-width: 768px) {
  .model-image {
    height: 300px;
  }
}
</style>
