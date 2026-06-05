<template>
  <el-container class="app-container">
    <!-- 顶部平台名称 -->
    <el-header class="platform-header">
      <div class="header-content">
        <h1 class="platform-title">船舶设备运行能效智能评估系统验证平台</h1>
      </div>
    </el-header>
    
    <!-- 导航菜单 -->
    <div class="menu-header">
      <el-menu
        :default-active="activeMenu"
        class="top-menu"
        mode="horizontal"
        @select="handleMenuSelect"
      >
        <el-menu-item index="assessment-visualization">
          <el-icon><DataAnalysis /></el-icon>
          <span>能效评估和可视化</span>
        </el-menu-item>

        <el-menu-item index="device-management">
          <el-icon><Document /></el-icon>
          <span>设备管理</span>
        </el-menu-item>
        
        <el-menu-item index="history-data">
          <el-icon><Folder /></el-icon>
          <span>能效数据管理</span>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- 主内容区域 -->
    <el-main class="content">
      <AssessmentVisualization v-if="currentModule === 'assessment-visualization'" :global-state="globalState" />
      <template v-else-if="currentModule === 'system-management'">
        <DeviceManagement v-if="currentSystemSubModule === 'device-management'" />
        <EfficiencyDataManagement v-else-if="currentSystemSubModule === 'history-data'" :models="globalState.models" :global-state="globalState" />
      </template>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  DataAnalysis,
  Document,
  Folder
} from '@element-plus/icons-vue'

import AssessmentVisualization from './components/AssessmentVisualization.vue'
import DeviceManagement from './components/system/device-management/DeviceManagement.vue'
import EfficiencyDataManagement from './components/system/efficiency-data-management/EfficiencyDataManagement.vue'

const currentModule = ref('assessment-visualization')
const currentSystemSubModule = ref('')

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

// 当前激活的菜单项
const activeMenu = computed(() => {
  if (currentSystemSubModule.value) {
    return currentSystemSubModule.value
  }
  return currentModule.value
})

// 处理菜单选择
const handleMenuSelect = (index) => {
  if (index === 'assessment-visualization') {
    currentModule.value = index
    currentSystemSubModule.value = ''
  } else if (index === 'device-management' || index === 'history-data') {
    // 系统管理子模块直接切换到对应模块
    currentModule.value = 'system-management'
    currentSystemSubModule.value = index
  }
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

/* 顶部平台名称 */
.platform-header {
  background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  height: 60px;
}

.header-content {
  width: 100%;
  padding: 0 24px;
}

.platform-title {
  font-size: 18px;
  font-weight: 600;
  color: white;
  margin: 0;
  text-align: center;
}

/* 导航菜单 */
.menu-header {
  background: #4a6b8a;
  padding: 0;
  height: 50px;
}

/* 顶部菜单样式 */
:deep(.top-menu.el-menu--horizontal) {
  border-bottom: none !important;
  background: #4a6b8a;
  height: 50px;
}

:deep(.top-menu.el-menu--horizontal > ul) {
  margin: 0 !important;
  padding: 0 !important;
  height: 50px;
}

:deep(.top-menu.el-menu--horizontal > .el-menu-item) {
  height: 50px;
  line-height: 50px;
  color: #ffffff;
  background: #4a6b8a;
}

:deep(.top-menu.el-menu--horizontal > .el-menu-item.is-active) {
  color: #409eff !important;
  background: rgba(64, 158, 255, 0.2) !important;
  border-bottom: 2px solid #409eff !important;
}

:deep(.top-menu.el-menu--horizontal > .el-menu-item:hover) {
  background: rgba(255, 255, 255, 0.1);
}

:deep(.top-menu.el-menu--horizontal > .el-sub-menu .el-sub-menu__title) {
  height: 50px;
  line-height: 50px;
  color: #ffffff;
  background: #4a6b8a;
}

/* 内容区域 */
.content {
  flex: 1;
  padding: 0;
  background-color: #f5f7fa;
  overflow: hidden;
}
</style>

<!-- 全局样式 - 按钮 -->
<style>
.el-button {
  background-color: rgba(255, 255, 255, 0.1) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  color: #e0e0e0 !important;
}

.el-button:hover {
  background-color: rgba(255, 255, 255, 0.15) !important;
  border-color: rgba(255, 255, 255, 0.3) !important;
  color: #ffffff !important;
}

.el-button.el-button--primary {
  background-color: #409eff !important;
  border-color: #409eff !important;
  color: #ffffff !important;
}

.el-button.el-button--primary:hover {
  background-color: #66b1ff !important;
  border-color: #66b1ff !important;
}

.el-button.el-button--success {
  background-color: #67c23a !important;
  border-color: #67c23a !important;
  color: #ffffff !important;
}

.el-button.el-button--success:hover {
  background-color: #85ce61 !important;
  border-color: #85ce61 !important;
}

.el-button.el-button--info {
  background-color: rgba(144, 147, 153, 0.3) !important;
  border-color: rgba(144, 147, 153, 0.5) !important;
  color: #e0e0e0 !important;
}

.el-button.el-button--info:hover {
  background-color: rgba(144, 147, 153, 0.4) !important;
  border-color: rgba(144, 147, 153, 0.6) !important;
  color: #ffffff !important;
}

.el-button.el-button--danger {
  background-color: #f56c6c !important;
  border-color: #f56c6c !important;
  color: #ffffff !important;
}

.el-button.el-button--danger:hover {
  background-color: #f78989 !important;
  border-color: #f78989 !important;
}

/* ---- 表格 Table ---- */
.el-table {
  background-color: transparent !important;
  color: #e0e0e0;
  --el-table-border-color: rgba(255, 255, 255, 0.1) !important;
  --el-table-border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.el-table::before {
  background-color: rgba(255, 255, 255, 0.1) !important;
  height: 1px !important;
}

.el-table th {
  background-color: rgba(30, 58, 95, 0.9) !important;
  color: #e0e0e0 !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  font-weight: 600;
}

.el-table td {
  border-color: rgba(255, 255, 255, 0.1) !important;
  color: #e0e0e0;
}

.el-table--border {
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.el-table--border::after,
.el-table--border::before {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.el-table__row {
  background-color: transparent !important;
}

.el-table__row:hover > td {
  background-color: rgba(255, 255, 255, 0.05) !important;
}

.el-table__row--level-0 {
  background-color: rgba(30, 58, 95, 0.6) !important;
}

.el-table__row--level-0:hover > td {
  background-color: rgba(30, 58, 95, 0.8) !important;
}

.el-table--striped .el-table__body tr.el-table__row--striped td {
  background-color: rgba(255, 255, 255, 0.02) !important;
}

.el-table__empty-text {
  color: #b0b0b0 !important;
}

/* ---- 表格展开按钮 ---- */
.el-table__expand-icon {
  color: #409eff !important;
  font-size: 18px !important;
  font-weight: bold !important;
  transition: all 0.3s ease;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
  line-height: 1;
  margin-right: 4px;
}

.el-table__expand-icon:hover {
  color: #66b1ff !important;
  background-color: rgba(64, 158, 255, 0.15) !important;
  transform: scale(1.1);
  border-radius: 4px;
}

.el-table__expand-icon .el-icon {
  color: #409eff !important;
  font-size: 18px !important;
  display: inline-flex;
  align-items: center;
}

/* ---- 表单组件 Form ---- */
/* 输入框 Input */
.el-input__wrapper {
  background-color: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  box-shadow: none !important;
}

.el-input__wrapper:hover {
  border-color: rgba(255, 255, 255, 0.3) !important;
}

.el-input__wrapper.is-focus {
  border-color: #409eff !important;
}

.el-input__inner {
  color: #e0e0e0 !important;
}

.el-input__inner::placeholder {
  color: rgba(255, 255, 255, 0.4) !important;
}

/* 选择器 Select */
.el-select .el-input__wrapper {
  background-color: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
}

.el-select .el-input__wrapper:hover {
  border-color: rgba(255, 255, 255, 0.3) !important;
}

.el-select .el-input__wrapper.is-focus {
  border-color: #409eff !important;
}

.el-select-dropdown {
  background-color: #1e3a5f !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
}

.el-select-dropdown__item {
  color: #e0e0e0 !important;
}

.el-select-dropdown__item:hover {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

.el-select-dropdown__item.is-selected {
  color: #409eff !important;
  background-color: rgba(64, 158, 255, 0.1) !important;
}

.el-select-dropdown__item.is-disabled {
  color: rgba(255, 255, 255, 0.3) !important;
}

/* 日期选择器 DatePicker */
.el-date-editor .el-input__wrapper {
  background-color: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
}

.el-picker-panel {
  background-color: #1e3a5f !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  color: #e0e0e0 !important;
}

.el-date-table td {
  color: #e0e0e0 !important;
}

.el-date-table td.available:hover {
  color: #409eff !important;
}

.el-date-table td.today span {
  color: #409eff !important;
  font-weight: bold !important;
}

.el-date-table td.current:not(.disabled) span {
  background-color: #409eff !important;
  color: #ffffff !important;
}

.el-picker-panel__icon-btn {
  color: #e0e0e0 !important;
}

.el-picker-panel__icon-btn:hover {
  color: #409eff !important;
}

/* 表单标签 */
.el-form-item__label {
  color: #e0e0e0 !important;
}

/* 下拉箭头图标 */
.el-select .el-input__suffix {
  color: #e0e0e0 !important;
}

.el-input__suffix {
  color: #e0e0e0 !important;
}

/* ---- 加载 Loading ---- */
.el-loading-mask {
  background-color: rgba(30, 58, 95, 0.8) !important;
}

/* ---- 消息框 MessageBox ---- */
.el-message-box {
  background-color: #1e3a5f !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
}

.el-message-box__title {
  color: #e0e0e0 !important;
}

.el-message-box__content {
  color: #b0b0b0 !important;
}

/* ---- 图标 Icon ---- */
.el-icon {
  color: inherit;
}

/* ---- 对话框 Dialog ---- */
.el-dialog {
  background-color: #1e3a5f !important;
  border-radius: 4px;
}

.el-dialog__header {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px 20px 16px;
}

.el-dialog__title {
  color: #e0e0e0 !important;
  font-weight: 600;
}

.el-dialog__headerbtn .el-dialog__close {
  color: #b0b0b0 !important;
}

.el-dialog__headerbtn:hover .el-dialog__close {
  color: #e0e0e0 !important;
}

.el-dialog__body {
  color: #e0e0e0;
  padding: 20px;
}

.el-dialog__footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 16px 20px 20px;
}

/* ---- 上传组件 Upload ---- */
.el-upload-dragger {
  background-color: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  border-radius: 4px;
}

.el-upload-dragger:hover {
  border-color: #409eff !important;
  background-color: rgba(255, 255, 255, 0.08) !important;
}

.el-upload__text {
  color: #e0e0e0 !important;
}

.el-upload__text em {
  color: #409eff !important;
  font-style: normal;
  font-weight: 600;
}

.el-upload__tip {
  color: #b0b0b0 !important;
  margin-top: 8px;
}

.el-icon--upload {
  color: #409eff !important;
  font-size: 48px;
}

/* ---- 消息提示 Message ---- */
.el-message {
  background-color: #1e3a5f !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  color: #e0e0e0 !important;
}

.el-message--success {
  border-left-color: #67c23a !important;
}

.el-message--warning {
  border-left-color: #e6a23c !important;
}

.el-message--error {
  border-left-color: #f56c6c !important;
}

.el-message--info {
  border-left-color: #409eff !important;
}
</style>