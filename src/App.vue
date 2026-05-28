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
            <template #title>能效评估</template>
          </el-menu-item>

          <el-menu-item index="visualization">
            <el-icon><View /></el-icon>
            <template #title>可视化</template>
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
            <el-breadcrumb-item v-if="currentModule === 'evaluation'">能效评估</el-breadcrumb-item>
            <el-breadcrumb-item v-else-if="currentModule === 'visualization'">可视化</el-breadcrumb-item>
            <el-breadcrumb-item v-else-if="currentModule === 'system-management' && !currentSystemSubModule">系统管理</el-breadcrumb-item>
            <el-breadcrumb-item v-else-if="currentModule === 'system-management' && currentSystemSubModule">{{ systemSubModuleNames[currentSystemSubModule] }}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
      </el-header>

      <!-- 内容区域 -->
      <el-main class="content">
        <DataAccess v-if="false" />
        <template v-else-if="currentModule === 'evaluation'">
          <Evaluation v-if="currentEvalPage === 'eval-overview'" @navigate="navigateEvalPage" @evalComplete="handleEvalComplete" />
          <DeviceSelect v-else-if="currentEvalPage === 'device-select'" @navigate="navigateEvalPage" />
          <DataLoad v-else-if="currentEvalPage === 'data-load'" @navigate="navigateEvalPage" />
          <ParamConfig v-else-if="currentEvalPage === 'param-config'" @navigate="navigateEvalPage" />
          <EvalResult v-else-if="currentEvalPage === 'eval-result'" @navigate="navigateEvalPage" />
        </template>
        <Visualization v-else-if="currentModule === 'visualization'" :global-state="globalState" />
        <template v-else-if="currentModule === 'system-management'">
          <SystemManagement v-if="!currentSystemSubModule" @navigate="navigateSystemModule" />
          <ModelManagement v-else-if="currentSystemSubModule === 'model-management'" :global-state="globalState" :efficiency-data="globalState.efficiencyData" @switch-to-visualization="switchToVisualization" />
          <DeviceTypeManagement v-else-if="currentSystemSubModule === 'device-type-management'" />
          <EfficiencyLevelManagement v-else-if="currentSystemSubModule === 'efficiency-level-management'" />
          <EfficiencyDataManagement v-else-if="currentSystemSubModule === 'history-data'" :models="globalState.models" :global-state="globalState" />
          <DeviceParamsManagement v-else-if="currentSystemSubModule === 'device-params'" />
        </template>
      </el-main>
    </el-container>

    <!-- 弹窗组件 -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>{{ modalTitles[currentModal] || '弹窗' }}</h3>
          <button class="modal-close" @click="closeModal">×</button>
        </div>
        <div class="modal-body">
          <DeviceSelect v-if="currentModal === 'device-select'" @navigate="navigateEvalModal" />
          <DataLoad v-else-if="currentModal === 'data-load'" @navigate="navigateEvalModal" />
          <ParamConfig v-else-if="currentModal === 'param-config'" @navigate="navigateEvalModal" />
          <EvalResult v-else-if="currentModal === 'eval-result'" @navigate="navigateEvalModal" />
        </div>
      </div>
    </div>
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
  ScaleToOriginal,
  TrophyBase,
  Tools,
  Folder,
  Fold,
  Expand
} from '@element-plus/icons-vue'
import DataAccess from './components/DataAccess.vue'
import Evaluation from './components/evaluation/Evaluation.vue'
import Visualization from './components/visualization/Visualization.vue'
import SystemManagement from './components/system/SystemManagement.vue'
import DeviceSelect from './components/evaluation/process/DeviceSelect.vue'
import DataLoad from './components/evaluation/process/DataLoad.vue'
import ParamConfig from './components/evaluation/process/ParamConfig.vue'
import EvalResult from './components/evaluation/process/EvalResult.vue'
import ModelManagement from './components/system/model-management/ModelManagement.vue'
import DeviceTypeManagement from './components/system/device-type-management/DeviceTypeManagement.vue'
import EfficiencyLevelManagement from './components/system/efficiency-level-management/EfficiencyLevelManagement.vue'
import EfficiencyDataManagement from './components/system/efficiency-data-management/EfficiencyDataManagement.vue'
import DeviceParamsManagement from './components/system/device-params-management/DeviceParamsManagement.vue'

const currentModule = ref('evaluation')
const currentEvalPage = ref('eval-overview')
const currentSystemSubModule = ref('')
const showModal = ref(false)
const currentModal = ref('')
const isSidebarCollapsed = ref(false)

// 全局状态管理
const globalState = ref({
  selectedModel: null, // 选中的模型
  models: [], // 模型列表
  efficiencyData: [] // 能效接入数据（全局共享，供样机模型查看关联数据）
})

// 历史评估数据（全局共享）
const historyData = ref([
  {
    id: 1,
    evalDate: '2024-04-20',
    deviceType: '船用柴油发动机（低速机）',
    deviceName: 'MAN B&W 6S70MC',
    score: 85.6,
    level: '2级',
    levelClass: 'good'
  },
  {
    id: 2,
    evalDate: '2024-04-15',
    deviceType: '船用柴油发动机（中速机）',
    deviceName: 'Cummins QSK60',
    score: 78.2,
    level: '2级',
    levelClass: 'good'
  },
  {
    id: 3,
    evalDate: '2024-04-10',
    deviceType: '船用LNG/柴油双燃料发动机（低速机）',
    deviceName: 'Wärtsilä 50DF',
    score: 92.1,
    level: '1级',
    levelClass: 'excellent'
  },
  {
    id: 4,
    evalDate: '2024-04-05',
    deviceType: '船用LNG/柴油双燃料发动机（中速机）',
    deviceName: 'Caterpillar 3516E',
    score: 72.5,
    level: '3级',
    levelClass: 'level-c'
  },
  {
    id: 5,
    evalDate: '2024-04-01',
    deviceType: '船用甲醇/柴油双燃料发动机（低速机）',
    deviceName: 'MAN B&W ME-LGIM',
    score: 88.7,
    level: '2级',
    levelClass: 'good'
  },
  {
    id: 6,
    evalDate: '2024-03-25',
    deviceType: '船用甲醇/柴油双燃料发动机（中速机）',
    deviceName: 'Wärtsilä 32 Methanol',
    score: 90.3,
    level: '1级',
    levelClass: 'excellent'
  }
])

// 添加历史数据
const addHistoryData = (data) => {
  const maxId = Math.max(...historyData.value.map(d => d.id), 0)
  historyData.value.unshift({
    id: maxId + 1,
    ...data
  })
}

// 删除历史数据
const deleteHistoryData = (id) => {
  historyData.value = historyData.value.filter(d => d.id !== id)
}

const moduleNames = {
  'data-access': '数据接入',
  'evaluation': '能效评估',
  'visualization': '可视化'
}

const modalTitles = {
  'device-select': '设备选择',
  'data-load': '数据加载',
  'param-config': '参数配置',
  'eval-result': '评估结果',
  'model-management': '样机模型管理',
  'device-type-management': '设备类型管理'
}

const systemSubModuleNames = {
  'device-type-management': '设备类型管理',
  'device-params': '设备参数管理',
  'efficiency-level-management': '能效等级和能效基值管理',
  'model-management': '样机模型管理',
  'history-data': '能效数据管理'
}

const currentModuleName = computed(() => {
  if (currentModule.value === 'system-management' && currentSystemSubModule.value) {
    return '系统管理 / ' + (systemSubModuleNames[currentSystemSubModule.value] || '')
  }
  return moduleNames[currentModule.value] || ''
})

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

const handleSearch = () => {
  // 搜索功能
}

const handleQuickAction = (action) => {
  // 快捷操作
}

const navigateEvalPage = (page) => {
  if (['device-select', 'data-load', 'param-config', 'eval-result'].includes(page)) {
    currentModal.value = page
    showModal.value = true
  } else {
    currentEvalPage.value = page
  }
}

const closeModal = () => {
  showModal.value = false
  currentModal.value = ''
}

const navigateEvalModal = (page) => {
  if (page === 'eval-overview') {
    closeModal()
    currentEvalPage.value = 'eval-overview'
  } else {
    currentModal.value = page
  }
}

const navigateSystemModule = (module) => {
  if (module === 'model-management' || module === 'device-type-management') {
    // 打开系统管理相关弹窗
    currentModal.value = module
    showModal.value = true
  } else {
    // 其他系统管理模块的处理
    console.log('导航到系统管理模块:', module)
    alert(`导航到: ${module}`)
  }
}

const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}

const switchToVisualization = () => {
  currentModule.value = 'visualization'
  currentSystemSubModule.value = ''
}

// 处理评估完成事件，同步到历史数据
const handleEvalComplete = (evalData) => {
  addHistoryData({
    evalDate: evalData.evalDate,
    deviceType: mapDeviceClassToName(evalData.deviceType),
    deviceName: evalData.deviceName,
    score: evalData.score,
    level: evalData.level,
    levelClass: evalData.levelClass === '1' ? 'excellent' : evalData.levelClass === '2' ? 'good' : 'level-c'
  })
}

// 设备类型映射
const mapDeviceClassToName = (deviceClass) => {
  const deviceTypeMap = {
    'diesel-low': '船用柴油发动机（低速机）',
    'diesel-medium': '船用柴油发动机（中速机）',
    'lng-diesel-low': '船用LNG/柴油双燃料发动机（低速机）',
    'lng-diesel-medium': '船用LNG/柴油双燃料发动机（中速机）',
    'methanol-diesel-low': '船用甲醇/柴油双燃料发动机（低速机）',
    'methanol-diesel-medium': '船用甲醇/柴油双燃料发动机（中速机）'
  }
  return deviceTypeMap[deviceClass] || deviceClass
}
</script>

<style scoped>
.app-container {
  height: 100vh;
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
}
</style>

<style>
/* 全局弹窗样式（不使用scoped） */
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
  z-index: 2000;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  width: 90%;
  max-width: 1000px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
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
  padding: 24px;
  overflow-y: auto;
  flex: 1;
}

/* 响应式弹窗 */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    max-height: 95vh;
  }
  
  .modal-header {
    padding: 16px;
  }
  
  .modal-body {
    padding: 16px;
  }
}
</style>