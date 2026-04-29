<template>
  <div class="app-container">
    <div class="sidebar" :class="{ collapsed: isSidebarCollapsed }">
      <div class="sidebar-header">
        <div class="logo" :class="{ collapsed: isSidebarCollapsed }">
          <h1 v-if="!isSidebarCollapsed">船用设备能效评估平台</h1>
        </div>
      </div>
      <button class="sidebar-toggle" @click="toggleSidebar">
        {{ isSidebarCollapsed ? '>>' : '<<' }}
      </button>
      <nav class="sidebar-nav">
        <ul>
<!-- 
          <li class="nav-item" :class="{ active: currentModule === 'data-access' }">
            <a href="#" @click.prevent="switchModule('data-access')">
              <span class="nav-icon">📥</span>
              <span class="nav-text">数据接入</span>
            </a>
          </li>
          -->
          <li class="nav-item" :class="{ active: currentModule === 'evaluation' }">
            <a href="#" @click.prevent="switchModule('evaluation')">
              <span class="nav-icon">📊</span>
              <span class="nav-text">能效评估</span>
            </a>
          </li>
          <li class="nav-item" :class="{ active: currentModule === 'visualization' }">
            <a href="#" @click.prevent="switchModule('visualization')">
              <span class="nav-icon">🔍</span>
              <span class="nav-text">可视化</span>
            </a>
          </li>
          <li class="nav-item nav-item-with-submenu" :class="{ active: currentModule === 'system-management' && currentSystemSubModule, open: menuState.systemManagement }">
            <a href="#" @click.prevent="toggleMenu('systemManagement')">
              <span class="nav-icon">⚙️</span>
              <span class="nav-text">系统管理</span>
              <span class="nav-arrow">{{ menuState.systemManagement ? '▼' : '▶' }}</span>
            </a>
            <ul class="submenu" v-show="menuState.systemManagement">
              <li class="submenu-item" :class="{ active: currentModule === 'system-management' && currentSystemSubModule === 'device-type-management' }">
                <a href="#" @click.prevent="switchSystemSubModule('device-type-management')">
                  <span class="nav-icon">📋</span>
                  <span class="nav-text">设备类型管理</span>
                </a>
              </li>
              <li class="submenu-item" :class="{ active: currentModule === 'system-management' && currentSystemSubModule === 'device-params' }">
                <a href="#" @click.prevent="switchSystemSubModule('device-params')">
                  <span class="nav-icon">📝</span>
                  <span class="nav-text">设备参数管理</span>
                </a>
              </li>
              <li class="submenu-item" :class="{ active: currentModule === 'system-management' && currentSystemSubModule === 'weight-params' }">
                <a href="#" @click.prevent="switchSystemSubModule('weight-params')">
                  <span class="nav-icon">⚖️</span>
                  <span class="nav-text">加权参数管理</span>
                </a>
              </li>
              <li class="submenu-item" :class="{ active: currentModule === 'system-management' && currentSystemSubModule === 'efficiency-level-management' }">
                <a href="#" @click.prevent="switchSystemSubModule('efficiency-level-management')">
                  <span class="nav-icon">🏆</span>
                  <span class="nav-text">能效等级管理</span>
                </a>
              </li>
              <li class="submenu-item" :class="{ active: currentModule === 'system-management' && currentSystemSubModule === 'model-management' }">
                <a href="#" @click.prevent="switchSystemSubModule('model-management')">
                  <span class="nav-icon">🔧</span>
                  <span class="nav-text">样机模型管理</span>
                </a>
              </li>
              <li class="submenu-item" :class="{ active: currentModule === 'system-management' && currentSystemSubModule === 'history-data' }">
                <a href="#" @click.prevent="switchSystemSubModule('history-data')">
                  <span class="nav-icon">📁</span>
                  <span class="nav-text">能效数据管理</span>
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">管</div>
          <span class="user-name" :class="{ collapsed: isSidebarCollapsed }">管理员</span>
        </div>
      </div>
    </div>

    <div class="main-container" :class="{ 'sidebar-collapsed': isSidebarCollapsed }">
      <header class="top-header">
        <div class="header-content">
          <div class="platform-name">船用设备能效评估平台 / {{ currentModuleName }}</div>
        </div>
      </header>
      <main class="content">
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
          <ModelManagement v-else-if="currentSystemSubModule === 'model-management'" :global-state="globalState" @switch-to-visualization="switchToVisualization" />
          <DeviceTypeManagement v-else-if="currentSystemSubModule === 'device-type-management'" />
          <EfficiencyLevelManagement v-else-if="currentSystemSubModule === 'efficiency-level-management'" />

          <EfficiencyDataManagement v-else-if="currentSystemSubModule === 'history-data'" />
          <DeviceParamsManagement v-else-if="currentSystemSubModule === 'device-params'" />
          <WeightParamsManagement v-else-if="currentSystemSubModule === 'weight-params'" />
        </template>
      </main>
    </div>

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
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
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
import WeightParamsManagement from './components/system/weight-params-management/WeightParamsManagement.vue'

const currentModule = ref('evaluation')
const activeSidebarItem = ref('overview')
const searchQuery = ref('')
const currentEvalPage = ref('eval-overview')
const currentSystemSubModule = ref('')
const showModal = ref(false)
const currentModal = ref('')
const isSidebarCollapsed = ref(false)

// 全局状态管理
const globalState = ref({
  selectedModel: null, // 选中的模型
  models: [] // 模型列表
})

// 菜单状态
const menuState = ref({
  systemManagement: false
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
  'weight-params': '加权参数管理',
  'efficiency-level-management': '能效等级管理',
  'model-management': '样机模型管理',
  'history-data': '能效数据管理'
}

const currentModuleName = computed(() => {
  if (currentModule.value === 'system-management' && currentSystemSubModule.value) {
    return '系统管理 / ' + (systemSubModuleNames[currentSystemSubModule.value] || '')
  }
  return moduleNames[currentModule.value] || ''
})

const moduleProgress = computed(() => {
  const progressMap = {
    'data-access': 85,
    'evaluation': 72,
    'visualization': 60
  }
  return progressMap[currentModule.value] || 0
})

const sidebarItems = computed(() => {
  if (currentModule.value === 'data-access') {
    return [
      { id: 'overview', name: '数据概览', icon: '📊' },
      { id: 'heterogeneous', name: '数据异构接入', icon: '📥' },
      { id: 'preprocess', name: '数据预处理', icon: '🔧' },
      { id: 'storage', name: '数据存储', icon: '💾' },
      { id: 'api', name: '标准API接口', icon: '🔗' }
    ]
  } else if (currentModule.value === 'evaluation') {
    return [
      { id: 'eval-overview', name: '评估概览', icon: '📊' },
      { id: 'device-select', name: '设备选择', icon: '⚙️' },
      { id: 'data-load', name: '数据加载', icon: '📥' },
      { id: 'param-config', name: '参数配置', icon: '🔧' },
      { id: 'eval-result', name: '评估结果', icon: '📊' }
    ]
  } else if (currentModule.value === 'visualization') {
    return [
      { id: 'vis-overview', name: '可视化概览', icon: '📊' },
      { id: '3d-model', name: '三维模型', icon: '3️⃣' },
      { id: 'data-analysis', name: '数据分析', icon: '📈' },
      { id: 'model-manage', name: '模型管理', icon: '⚙️' }
    ]
  }
  return []
})

const switchModule = (module) => {
  currentModule.value = module
  currentSystemSubModule.value = ''
  activeSidebarItem.value = 'overview'
  // 关闭所有菜单
  Object.keys(menuState.value).forEach(key => {
    menuState.value[key] = false
  })
}

// 切换系统子模块
const switchSystemSubModule = (subModule) => {
  // 确保当前模块是系统管理
  currentModule.value = 'system-management'
  // 设置当前子模块
  currentSystemSubModule.value = subModule
  // 这里可以根据子模块显示不同的内容
  console.log('切换到系统子模块:', subModule)
}

// 切换菜单展开/收起
const toggleMenu = (menuName) => {
  const wasOpen = menuState.value[menuName]
  Object.keys(menuState.value).forEach(key => {
    menuState.value[key] = false
  })
  if (!wasOpen) {
    menuState.value[menuName] = true
  }
}

const handleSearch = () => {
  alert(`搜索：${searchQuery.value}`)
}

const handleQuickAction = (action) => {
  if (action === 'new-task') {
    alert('新建接入任务')
  } else if (action === 'import-config') {
    alert('导入配置')
  }
}

const navigateEvalPage = (page) => {
  if (['device-select', 'data-load', 'param-config', 'eval-result'].includes(page)) {
    // 打开弹窗
    currentModal.value = page
    showModal.value = true
  } else {
    // 切换页面
    currentEvalPage.value = page
    activeSidebarItem.value = page
  }
}

const closeModal = () => {
  showModal.value = false
  currentModal.value = ''
}

const navigateEvalModal = (page) => {
  if (page === 'eval-overview') {
    // 关闭弹窗，返回评估概览页面
    closeModal()
    currentEvalPage.value = 'eval-overview'
    activeSidebarItem.value = 'eval-overview'
  } else {
    // 在弹窗之间切换
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
  activeSidebarItem.value = 'overview'
  // 关闭所有菜单
  Object.keys(menuState.value).forEach(key => {
    menuState.value[key] = false
  })
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
  display: flex;
  min-height: 100vh;
  background-color: #f5f5f5;
}

/* 侧边栏样式 */
.sidebar {
  width: 250px;
  background-color: #4a6b8a;
  color: white;
  transition: width 0.3s ease;
  box-shadow: 2px 0 8px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  position: relative;
  margin: 0;
  padding: 0;
  flex-shrink: 0;
}

.sidebar.collapsed {
  width: 60px;
  margin: 0;
  padding: 0;
  flex-shrink: 0;
}

.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid rgba(255,255,255,0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

.logo.collapsed {
  align-items: center;
}

.logo h1 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
  transition: opacity 0.3s ease;
}

.logo.collapsed h1 {
  opacity: 0;
  position: absolute;
  pointer-events: none;
}

.logo-text {
  font-size: 12px;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.logo.collapsed .logo-text {
  opacity: 0;
  position: absolute;
  pointer-events: none;
}

.sidebar-toggle {
  position: absolute;
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  background: #3498db;
  border: none;
  color: white;
  font-size: 12px;
  font-weight: bold;
  cursor: pointer;
  padding: 8px 6px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
  z-index: 10;
  width: 24px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.sidebar-toggle:hover {
  background-color: #2980b9;
  transform: translateY(-50%) scale(1.05);
}

.sidebar.collapsed .sidebar-toggle {
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
}

.sidebar-nav {
  flex: 1;
  padding: 20px 0;
}

.sidebar-nav ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 4px;
}

.nav-item a {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.nav-item-with-submenu a {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.nav-arrow {
  font-size: 12px;
  transition: transform 0.3s ease;
  margin-left: auto;
  margin-right: 0;
}

.nav-item-with-submenu.open .nav-arrow {
  transform: rotate(90deg);
}

.nav-item-with-submenu.open a {
  background-color: rgba(255,255,255,0.08);
}

.submenu {
  list-style: none;
  padding: 0;
  margin: 0;
  background-color: rgba(0,0,0,0.05);
  transition: all 0.3s ease;
  overflow: hidden;
}

.submenu-item a {
  padding-left: 40px;
  font-size: 14px;
  border-left: 3px solid transparent;
  background-color: transparent;
}

.submenu-item a:hover {
  background-color: rgba(255,255,255,0.1);
  border-left-color: rgba(52,152,219,0.5);
}

.submenu-item.active a {
  background-color: rgba(255,255,255,0.25);
  border-left-color: #3498db;
  font-weight: 600;
  box-shadow: inset 0 0 0 1px rgba(52,152,219,0.3);
}

/* 系统子模块样式 */
.system-submodule {
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin: 20px;
}

.system-submodule h2 {
  margin-top: 0;
  color: #2c3e50;
  font-size: 20px;
  margin-bottom: 15px;
}

.system-submodule p {
  color: #666;
  line-height: 1.6;
}



.nav-item a:hover {
  background-color: rgba(255,255,255,0.1);
}

.nav-item.active > a {
  background-color: rgba(255,255,255,0.25);
  border-left-color: #3498db;
  font-weight: 600;
  box-shadow: inset 0 0 0 1px rgba(52,152,219,0.3);
}

.nav-item-with-submenu.active > a {
  background-color: rgba(255,255,255,0.25);
  border-left-color: #3498db;
  font-weight: 600;
  box-shadow: inset 0 0 0 1px rgba(52,152,219,0.3);
}

.nav-icon {
  font-size: 18px;
  margin-right: 12px;
  width: 20px;
  text-align: center;
}

.nav-text {
  transition: opacity 0.3s ease;
}

.sidebar.collapsed .nav-text {
  opacity: 0;
  position: absolute;
  pointer-events: none;
}

/* 悬浮显示菜单名称 */
.sidebar.collapsed .nav-item {
  position: relative;
}

.sidebar.collapsed .nav-item:hover .nav-text {
  opacity: 1;
  position: absolute;
  left: 60px;
  top: 50%;
  transform: translateY(-50%);
  background-color: rgba(74, 107, 138, 0.95);
  padding: 8px 12px;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

/* 调整收起状态下的图标位置，避免与展开收起按钮重叠 */
.sidebar.collapsed .nav-icon {
  margin-left: 10px;
}

.sidebar-footer {
  padding: 20px;
  border-top: 1px solid rgba(255,255,255,0.1);
}

.sidebar-footer .user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.sidebar-footer .user-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #3498db;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
}

.user-name {
  font-size: 14px;
  transition: opacity 0.3s ease;
}

.user-name.collapsed {
  opacity: 0;
  position: absolute;
  pointer-events: none;
}

/* 主容器样式 */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
  overflow: hidden;
}

.top-header {
  background-color: #4a6b8a;
  padding: 15px 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-bottom: 1px solid rgba(255,255,255,0.1);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.platform-name {
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.header-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 15px;
}

.content {
  flex: 1;
  padding: 0;
  overflow-y: auto;
  background-color: #f5f5f5;
  margin: 0;
  min-height: 100%;
}

/* 移除强制所有子元素高度为100%的规则 */

/* 弹窗样式 */
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