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
          <span>能效评估与可视化</span>
        </el-menu-item>

        <el-menu-item index="device-management">
          <el-icon><Document /></el-icon>
          <span>设备信息管理</span>
        </el-menu-item>
      </el-menu>
    </div>

    <!-- 主内容区域 -->
    <el-main class="content">
      <AssessmentVisualization v-if="currentModule === 'assessment-visualization'" />
      <DeviceManagement v-else-if="currentModule === 'device-management'" />
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  DataAnalysis,
  Document
} from '@element-plus/icons-vue'

import AssessmentVisualization from './components/assessment-visualization/AssessmentVisualization.vue'
import DeviceManagement from './components/device-management/DeviceManagement.vue'

const currentModule = ref('assessment-visualization')

// 当前激活的菜单项
const activeMenu = computed(() => {
  return currentModule.value
})

// 处理菜单选择
const handleMenuSelect = (index) => {
  currentModule.value = index
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
  background-color: #1e3a5f !important;
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
  background-color: #1e3a5f !important;
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

/* ---- 表格固定列 Fixed Columns ---- */
.el-table__fixed-right {
  background: #1e3a5f !important;
  background-color: #1e3a5f !important;
}

.el-table__fixed-right::before {
  background-color: #1e3a5f !important;
}

.el-table__fixed-right .el-table__cell,
.el-table__fixed-right td,
.el-table__fixed-right th,
.el-table__fixed-right tr,
.el-table__fixed-right .el-table__row,
.el-table__fixed-right tbody,
.el-table__fixed-right thead {
  background-color: #1e3a5f !important;
  background: #1e3a5f !important;
}

/* 固定列悬停时也保持完全不透明 */
.el-table__fixed-right .el-table__row:hover > td {
  background-color: #1e3a5f !important;
  background: #1e3a5f !important;
}

/* 最强力的选择器 - 覆盖所有可能的子元素 */
.el-table__fixed-right .el-table__row td {
  background-color: #1e3a5f !important;
  background: #1e3a5f !important;
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

/* ---- 描述列表 Descriptions ---- */
.el-descriptions {
  background-color: #1e3a5f !important;
  --el-descriptions-table-border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.el-descriptions__label {
  color: #e0e0e0 !important;
  font-weight: 500 !important;
  background-color: rgba(30, 58, 95, 0.6) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

.el-descriptions__content {
  color: #e0e0e0 !important;
  background-color: rgba(30, 58, 95, 0.3) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

.el-descriptions__header {
  margin-bottom: 16px;
}

.el-descriptions__body {
  background-color: #1e3a5f !important;
}

/* ---- 搜索筛选栏 Search Filter Bar ---- */
.search-filter-bar {
  background: rgba(30, 58, 95, 0.4) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 6px;
  padding: 8px;
  margin-bottom: 8px;
}

.search-filter-bar .el-form {
  margin-bottom: 0 !important;
}

.search-filter-bar .el-form-item {
  margin-bottom: 0 !important;
  margin-right: 12px !important;
}

/* ---- 数据展示区域 Data Display Section ---- */
.assessment-section {
  background: rgba(30, 58, 95, 0.3) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 6px;
  padding: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #e0e0e0 !important;
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 3px solid #409eff;
}

/* ---- 空状态 Empty State ---- */
.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #909399;
  font-size: 14px;
}

/* ---- 评估结果详情卡片 Evaluation Result Detail Card ---- */
.detail-card {
  background: rgba(30, 58, 95, 0.6) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-radius: 8px;
  padding: 16px 20px;
  transition: all 0.3s ease;
}

.detail-card:hover {
  background: rgba(30, 58, 95, 0.8) !important;
  border-color: rgba(64, 158, 255, 0.4) !important;
  transform: translateX(4px);
}

.detail-name {
  font-size: 14px;
  color: #b0b0b0 !important;
}

.detail-value {
  font-size: 16px;
  font-weight: 600;
  color: #e0e0e0 !important;
  margin: 0 20px;
  min-width: 120px;
  text-align: center;
}

/* ---- 设备树形选择器 Device Tree Select ---- */
.device-tree-select-popper.el-tree-select__popper,
.el-tree-select__popper.device-tree-select-popper {
  background-color: #1e3a5f !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
}

.device-tree-select-popper .el-tree,
.el-tree-select__popper.device-tree-select-popper .el-tree {
  background-color: #1e3a5f !important;
}

.device-tree-select-popper .el-tree-node__content,
.el-tree-select__popper.device-tree-select-popper .el-tree-node__content {
  background-color: #1e3a5f !important;
  color: #e0e0e0 !important;
}

.device-tree-select-popper .el-tree-node__content:hover,
.el-tree-select__popper.device-tree-select-popper .el-tree-node__content:hover {
  background-color: rgba(64, 158, 255, 0.2) !important;
}

.device-tree-select-popper .el-tree-node.is-current > .el-tree-node__content,
.el-tree-select__popper.device-tree-select-popper .el-tree-node.is-current > .el-tree-node__content {
  background-color: rgba(64, 158, 255, 0.3) !important;
}

.device-tree-select-popper .el-tree-node__content .el-tree-node__label,
.el-tree-select__popper.device-tree-select-popper .el-tree-node__content .el-tree-node__label {
  color: #e0e0e0 !important;
}

.device-tree-select-popper .el-tree-node.is-disabled > .el-tree-node__content,
.el-tree-select__popper.device-tree-select-popper .el-tree-node.is-disabled > .el-tree-node__content {
  opacity: 0.5;
  cursor: not-allowed;
}

.device-tree-select-popper .el-tree-node__expand-icon,
.el-tree-select__popper.device-tree-select-popper .el-tree-node__expand-icon {
  color: #e0e0e0 !important;
}
</style>