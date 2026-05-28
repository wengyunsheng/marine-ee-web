<template>
  <div class="system-management">
    <el-page-header @back="currentSubModule = null" v-if="currentSubModule">
      <template #content>
        <span class="text-large font-600 mr-3">{{ getSubModuleTitle(currentSubModule) }}</span>
      </template>
    </el-page-header>
    
    <h1 v-else>系统管理</h1>
    
    <el-row :gutter="20" v-if="!currentSubModule">
      <el-col :xs="24" :sm="12" :md="8" :lg="8" v-for="module in modules" :key="module.id">
        <el-card shadow="hover" class="module-section">
          <template #header>
            <div class="module-header">
              <h2>{{ module.title }}</h2>
              <el-button type="primary" @click="showSubModule(module.id)">管理</el-button>
            </div>
          </template>
          <div class="module-description">
            {{ module.description }}
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 子模块内容 -->
    <div class="sub-module-content" v-if="currentSubModule">
      <component :is="currentSubModuleComponent" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import DeviceTypeManagement from './device-type-management/DeviceTypeManagement.vue'
import DeviceParamsManagement from './device-params-management/DeviceParamsManagement.vue'
import ModelManagement from './model-management/ModelManagement.vue'
import EfficiencyLevelManagement from './efficiency-level-management/EfficiencyLevelManagement.vue'
import EfficiencyDataManagement from './efficiency-data-management/EfficiencyDataManagement.vue'

const currentSubModule = ref(null)

const modules = [
  {
    id: 'device-type',
    title: '设备类型管理',
    description: '管理船用设备的类型分类，支持添加、编辑、删除设备类型。'
  },
  {
    id: 'device-params',
    title: '设备参数管理',
    description: '管理设备的技术参数模板和加权参数配置，支持按设备类型分类管理。'
  },
  {
    id: 'model-management',
    title: '样机模型管理',
    description: '管理不同型号船型及船用设备的样机模型，支持建立三维模型与数据连接，构建不同船型能效评估样机模型。'
  },
  {
    id: 'efficiency-level',
    title: '能效等级和能效基值管理',
    description: '管理设备能效等级标准和能效基值，设置不同等级的阈值和评估规则。'
  },
  {
    id: 'history-data',
    title: '能效数据管理',
    description: '支持台架试验、实船运行历史能效数据界面结构化展示，支持船型、设备、能效、工况特性等多维度快捷检索。'
  }
]

const currentSubModuleComponent = computed(() => {
  const components = {
    'device-type': DeviceTypeManagement,
    'device-params': DeviceParamsManagement,
    'model-management': ModelManagement,
    'efficiency-level': EfficiencyLevelManagement,
    'history-data': EfficiencyDataManagement
  }
  return components[currentSubModule.value]
})

const showSubModule = (module) => {
  currentSubModule.value = module
}

const getSubModuleTitle = (module) => {
  const found = modules.find(m => m.id === module)
  return found ? found.title : '子模块'
}
</script>

<style scoped>
.system-management {
  padding: 20px;
  height: 100%;
  min-height: calc(100vh - 120px);
  overflow-y: auto;
  background-color: #f5f7fa;
  box-sizing: border-box;
}

/* 系统管理页面滚动条 */
.system-management::-webkit-scrollbar {
  width: 8px;
}

.system-management::-webkit-scrollbar-track {
  background: #e8eaed;
  border-radius: 4px;
}

.system-management::-webkit-scrollbar-thumb {
  background: #c0c4cc;
  border-radius: 4px;
  transition: background 0.3s;
}

.system-management::-webkit-scrollbar-thumb:hover {
  background: #909399;
}

.system-management h1 {
  color: #333;
  margin-bottom: 30px;
  font-size: 24px;
  font-weight: 600;
}

.module-section {
  margin-bottom: 20px;
  transition: all 0.3s ease;
  height: 100%;
}

.module-section:hover {
  transform: translateY(-2px);
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.module-header h2 {
  color: #333;
  margin: 0;
  font-size: 18px;
  font-weight: 500;
}

.module-description {
  color: #666;
  font-size: 14px;
  line-height: 1.5;
}

.sub-module-content {
  margin-top: 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .system-management {
    padding: 10px;
  }
}
</style>