<template>
  <div class="system-management">
    <h1>系统管理</h1>
    
    <div class="module-section">
      <div class="module-header">
        <h2>设备类型管理</h2>
        <button class="btn btn-primary" @click="showSubModule('device-type')">管理</button>
      </div>
      <div class="module-description">
        管理船用设备的类型分类，支持添加、编辑、删除设备类型。
      </div>
    </div>

    <div class="module-section">
      <div class="module-header">
        <h2>设备参数管理</h2>
        <button class="btn btn-primary" @click="showSubModule('device-params')">管理</button>
      </div>
      <div class="module-description">
        管理设备的技术参数和性能指标，支持批量导入导出。
      </div>
    </div>

    <div class="module-section">
      <div class="module-header">
        <h2>加权参数管理</h2>
        <button class="btn btn-primary" @click="showSubModule('weight-params')">管理</button>
      </div>
      <div class="module-description">
        管理能效评估的加权参数，调整各指标的权重比例。
      </div>
    </div>

    <div class="module-section">
      <div class="module-header">
        <h2>模型管理</h2>
        <button class="btn btn-primary" @click="showSubModule('model-management')">管理</button>
      </div>
      <div class="module-description">
        管理能效评估模型，支持自定义评估算法和标准。
      </div>
    </div>

    <div class="module-section">
      <div class="module-header">
        <h2>能效等级管理</h2>
        <button class="btn btn-primary" @click="showSubModule('efficiency-level')">管理</button>
      </div>
      <div class="module-description">
        管理设备能效等级标准，设置不同等级的阈值和评估规则。
      </div>
    </div>

    <div class="module-section">
      <div class="module-header">
        <h2>历史数据管理</h2>
        <button class="btn btn-primary" @click="showSubModule('history-data')">管理</button>
      </div>
      <div class="module-description">
        管理历史评估数据，支持数据备份、恢复和导出。
      </div>
    </div>

    <!-- 子模块内容 -->
    <div class="sub-module-content" v-if="currentSubModule">
      <div class="sub-module-header">
        <h2>{{ getSubModuleTitle(currentSubModule) }}</h2>
        <button class="btn btn-secondary" @click="currentSubModule = null">返回</button>
      </div>
      
      <component :is="currentSubModuleComponent" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import DeviceTypeManagement from './device-type-management/DeviceTypeManagement.vue'
import DeviceParamsManagement from './device-params-management/DeviceParamsManagement.vue'
import WeightParams from './weight-params/WeightParams.vue'
import ModelManagement from './model-management/ModelManagement.vue'
import EfficiencyLevelManagement from './efficiency-level-management/EfficiencyLevelManagement.vue'
import HistoryData from './history-data/HistoryData.vue'

const currentSubModule = ref(null)

const currentSubModuleComponent = computed(() => {
  const components = {
    'device-type': DeviceTypeManagement,
    'device-params': DeviceParamsManagement,
    'weight-params': WeightParams,
    'model-management': ModelManagement,
    'efficiency-level': EfficiencyLevelManagement,
    'history-data': HistoryData
  }
  return components[currentSubModule.value]
})

const showSubModule = (module) => {
  currentSubModule.value = module
}

const getSubModuleTitle = (module) => {
  const titles = {
    'device-type': '设备类型管理',
    'device-params': '设备参数管理',
    'weight-params': '加权参数管理',
    'model-management': '模型管理',
    'efficiency-level': '能效等级管理',
    'history-data': '历史数据管理'
  }
  return titles[module] || '子模块'
}
</script>

<style scoped>
.system-management {
  padding: 20px;
  height: calc(100vh - 120px);
  overflow-y: auto;
  background-color: #f5f7fa;
}

.system-management h1 {
  color: #333;
  margin-bottom: 30px;
  font-size: 24px;
  font-weight: 600;
}

.module-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
}

.module-section:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e8e8e8;
}

.module-header h2 {
  color: #333;
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #1890ff;
  color: white;
}

.btn-primary:hover {
  background-color: #40a9ff;
}

.btn-secondary {
  background-color: #f0f0f0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #e0e0e0;
}

.module-description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.sub-module-content {
  margin-top: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.sub-module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e8e8e8;
}

.sub-module-header h2 {
  color: #333;
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .system-management {
    padding: 10px;
  }
  
  .module-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
  
  .btn {
    width: 100%;
    text-align: center;
  }
  
  .sub-module-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
}
</style>