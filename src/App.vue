<template>
  <el-container class="app-container">
    <!-- 左侧边栏 -->
    <el-aside :width="isSidebarCollapsed ? '64px' : '240px'" class="sidebar">
      <div class="sidebar-header">
        <h1 v-if="!isSidebarCollapsed" class="logo-text">船舶设备运行能效智能评估系统验证平台</h1>
        <div v-else class="logo-icon">船舶设备</div>
      </div>

      <div class="sidebar-menu-container">
        <el-menu
          :default-active="activeMenu"
          class="sidebar-menu"
          background-color="#4a6b8a"
          text-color="#ffffff"
          active-text-color="#ffd04b"
          :collapse="isSidebarCollapsed"
          @select="handleMenuSelect"
        >
          <el-menu-item index="evaluation">
            <el-icon><DataAnalysis /></el-icon>
            <template #title>能效评估与标准验证</template>
          </el-menu-item>

          <el-menu-item index="visualization">
            <el-icon><View /></el-icon>
            <template #title>样机模型可视化</template>
          </el-menu-item>

          <el-sub-menu index="system-management">
            <template #title>
              <el-icon><Setting /></el-icon>
              <span>系统管理</span>
            </template>
            <el-menu-item index="device-type-management">
              <el-icon><Document /></el-icon>
              <template #title>设备类型管理</template>
            </el-menu-item>
            <el-menu-item index="device-params">
              <el-icon><Edit /></el-icon>
              <template #title>设备参数管理</template>
            </el-menu-item>
            <el-menu-item index="efficiency-level-management">
              <el-icon><TrophyBase /></el-icon>
              <template #title>能效等级和能效基值管理</template>
            </el-menu-item>
            <el-menu-item index="model-management">
              <el-icon><Tools /></el-icon>
              <template #title>样机模型管理</template>
            </el-menu-item>
            <el-menu-item index="history-data">
              <el-icon><Folder /></el-icon>
              <template #title>能效数据管理</template>
            </el-menu-item>
          </el-sub-menu>
        </el-menu>
      </div>
    </el-aside>

    <!-- 主内容区域 -->
    <el-container class="main-container">
      <!-- 顶部导航 -->
      <el-header class="top-header">
        <div class="header-left">
          <el-icon class="collapse-icon" @click="toggleSidebar">
            <Fold v-if="!isSidebarCollapsed" />
            <Expand v-else />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item>船舶设备运行能效智能评估系统验证平台</el-breadcrumb-item>
            <el-breadcrumb-item v-if="currentModule === 'evaluation'">能效评估与标准验证</el-breadcrumb-item>
            <el-breadcrumb-item v-else-if="currentModule === 'visualization'">样机模型可视化</el-breadcrumb-item>
            <el-breadcrumb-item v-else-if="currentModule === 'system-management' && !currentSystemSubModule">系统管理</el-breadcrumb-item>
            <el-breadcrumb-item v-else-if="currentModule === 'system-management' && currentSystemSubModule">{{ systemSubModuleNames[currentSystemSubModule] }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
      </el-header>

      <!-- 内容区域 -->
      <el-main class="content">
        <template v-if="currentModule === 'evaluation'">
          <Evaluation v-if="currentEvalPage === 'eval-overview'" :global-state="globalState" @navigate="navigateEvalPage" @evalComplete="handleEvalComplete" @switchToSystem="handleSwitchToSystem" />
        </template>
        <Visualization v-else-if="currentModule === 'visualization'" :global-state="globalState" />
        <template v-else-if="currentModule === 'system-management'">
          <SystemManagement v-if="!currentSystemSubModule" />
          <ModelManagement v-else-if="currentSystemSubModule === 'model-management'" :global-state="globalState" :efficiency-data="globalState.efficiencyData" @switch-to-visualization="switchToVisualization" />
          <DeviceTypeManagement v-else-if="currentSystemSubModule === 'device-type-management'" />
          <EfficiencyLevelManagement v-else-if="currentSystemSubModule === 'efficiency-level-management'" />
          <EfficiencyDataManagement v-else-if="currentSystemSubModule === 'history-data'" :models="globalState.models" :global-state="globalState" />
          <DeviceParamsManagement v-else-if="currentSystemSubModule === 'device-params'" />
        </template>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  DataAnalysis,
  View,
  Setting,
  Document,
  Edit,
  TrophyBase,
  Tools,
  Folder,
  Fold,
  Expand
} from '@element-plus/icons-vue'

import Evaluation from './components/evaluation/Evaluation.vue'
import Visualization from './components/visualization/Visualization.vue'
import SystemManagement from './components/system/SystemManagement.vue'
import ModelManagement from './components/system/model-management/ModelManagement.vue'
import DeviceTypeManagement from './components/system/device-type-management/DeviceTypeManagement.vue'
import EfficiencyLevelManagement from './components/system/efficiency-level-management/EfficiencyLevelManagement.vue'
import EfficiencyDataManagement from './components/system/efficiency-data-management/EfficiencyDataManagement.vue'
import DeviceParamsManagement from './components/system/device-params-management/DeviceParamsManagement.vue'

const currentModule = ref('evaluation')
const currentEvalPage = ref('eval-overview')
const currentSystemSubModule = ref('')
const isSidebarCollapsed = ref(false)

// 全局状态管理
const globalState = ref({
  selectedModel: null, // 选中的模型
  models: [
    {
      id: 1,
      name: '散货船 - 船用柴油发动机（低速机）',
      deviceType: '船用柴油发动机（低速机）',
      category: 'engine',
      description: '用于散货船柴油发动机的能效评估仿真模型',
      createdAt: '2024-04-01'
    },
    {
      id: 2,
      name: '油轮 - 船用柴油发动机（中速机）',
      deviceType: '船用柴油发动机（中速机）',
      category: 'engine',
      description: '用于油轮柴油发动机的能效评估仿真模型',
      createdAt: '2024-04-02'
    },
    {
      id: 3,
      name: '集装箱船 - 船用LNG/柴油双燃料发动机（低速机）',
      deviceType: '船用LNG/柴油双燃料发动机（低速机）',
      category: 'engine',
      description: '用于集装箱船LNG/柴油双燃料发动机的能效评估仿真模型',
      createdAt: '2024-04-03'
    },
    {
      id: 4,
      name: '液化气船 - 船用LNG/柴油双燃料发动机（中速机）',
      deviceType: '船用LNG/柴油双燃料发动机（中速机）',
      category: 'engine',
      description: '用于液化气船LNG/柴油双燃料发动机的能效评估仿真模型',
      createdAt: '2024-04-04'
    },
    {
      id: 5,
      name: 'VLCC超大型油轮 - 船用甲醇/柴油双燃料发动机（低速机）',
      deviceType: '船用甲醇/柴油双燃料发动机（低速机）',
      category: 'engine',
      description: '用于VLCC超大型油轮甲醇/柴油双燃料发动机的能效评估仿真模型',
      createdAt: '2024-04-05'
    },
    {
      id: 6,
      name: '散货船 - 船用甲醇/柴油双燃料发动机（中速机）',
      deviceType: '船用甲醇/柴油双燃料发动机（中速机）',
      category: 'engine',
      description: '用于散货船甲醇/柴油双燃料发动机的能效评估仿真模型',
      createdAt: '2024-04-06'
    }
  ], // 模型列表
  efficiencyData: [] // 能效接入数据（全局共享，供样机模型查看关联数据）
})


const systemSubModuleNames = {
  'device-type-management': '设备类型管理',
  'device-params': '设备参数管理',
  'efficiency-level-management': '能效等级和能效基值管理',
  'model-management': '样机模型管理',
  'history-data': '能效数据管理'
}

// 当前激活的菜单项
const activeMenu = computed(() => {
  if (currentModule.value === 'system-management' && currentSystemSubModule.value) {
    return currentSystemSubModule.value
  }
  return currentModule.value
})

// 处理菜单选择
const handleMenuSelect = (index) => {
  if (index === 'evaluation' || index === 'visualization') {
    switchModule(index)
  } else {
    // 系统管理子模块
    switchSystemSubModule(index)
  }
}

const switchModule = (module) => {
  currentModule.value = module
  currentSystemSubModule.value = ''
}

// 切换系统子模块
const switchSystemSubModule = (subModule) => {
  currentModule.value = 'system-management'
  currentSystemSubModule.value = subModule
}

const navigateEvalPage = (page) => {
  currentEvalPage.value = page
}

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

const switchToVisualization = () => {
  currentModule.value = 'visualization'
  currentSystemSubModule.value = ''
}

// 切换到系统管理
const handleSwitchToSystem = () => {
  currentModule.value = 'system-management'
  currentSystemSubModule.value = 'model-management'
}

const handleEvalComplete = (evalData) => {
  // 评估完成后同步数据到全局状态
  console.log('评估完成:', evalData)
}
</script>

<style scoped>
.app-container {
  height: 100vh;
  overflow: hidden;
}

/* 可视化页面不需要内边距 */
.app-container:has(.visualization-container) .content {
  padding: 0 0 0 0;
}

/* 侧边栏样式 */
.sidebar {
  background: linear-gradient(180deg, #2c3e50 0%, #34495e 50%, #2c3e50 100%);
  transition: width 0.3s ease;
  overflow-x: hidden;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.15);
}

.sidebar-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.1) 100%);
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: white;
  margin: 0;
  text-align: center;
  line-height: 1.4;
}

.logo-icon {
  font-size: 14px;
  font-weight: 600;
  color: white;
  text-align: center;
}

.sidebar-menu-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

/* 侧边栏滚动条样式 */
.sidebar-menu-container::-webkit-scrollbar {
  width: 6px;
}

.sidebar-menu-container::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.sidebar-menu-container::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  transition: background 0.3s;
}

.sidebar-menu-container::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.3);
}

.sidebar-menu {
  border-right: none;
}

/* 覆盖 Element Plus 菜单样式 */
:deep(.el-menu) {
  background: transparent !important;
}

:deep(.el-menu-item) {
  color: rgba(255, 255, 255, 0.85) !important;
  border-left: 3px solid transparent;
  transition: all 0.3s;
}

:deep(.el-menu-item:hover) {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%) !important;
  color: #ffffff !important;
}

:deep(.el-menu-item.is-active) {
  background: linear-gradient(90deg, rgba(255, 208, 75, 0.2) 0%, rgba(255, 208, 75, 0.08) 100%) !important;
  color: #ffd04b !important;
  border-left: 3px solid #ffd04b;
  font-weight: 600;
}

:deep(.el-sub-menu__title) {
  color: rgba(255, 255, 255, 0.85) !important;
  border-left: 3px solid transparent;
  transition: all 0.3s;
}

:deep(.el-sub-menu__title:hover) {
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.03) 100%) !important;
  color: #ffffff !important;
}

/* 主容器样式 */
.main-container {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 顶部导航 */
.top-header {
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: center;
  padding: 0 24px;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
  flex: 1;
}

.collapse-icon {
  font-size: 20px;
  cursor: pointer;
  color: #606266;
  transition: color 0.3s;
}

.collapse-icon:hover {
  color: #409eff;
}

/* 面包屑样式优化 */
:deep(.el-breadcrumb) {
  font-size: 15px;
}

:deep(.el-breadcrumb__inner) {
  color: #606266;
  font-weight: 500;
  transition: color 0.3s;
}

:deep(.el-breadcrumb__inner:hover) {
  color: #409eff;
}

:deep(.el-breadcrumb__separator) {
  color: #c0c4cc;
  margin: 0 8px;
}

:deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: #303133;
  font-weight: 600;
}

/* 内容区域 */
.content {
  flex: 1;
  padding: 20px;
  background-color: #f5f7fa;
  overflow: hidden;
}
</style>