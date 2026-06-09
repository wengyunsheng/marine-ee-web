<template>
  <div class="assessment-visualization-container">
    <!-- 顶部全局控制栏 -->
    <div class="global-control-bar">
      <el-select 
        v-model="selectedCategoryId" 
        placeholder="全部设备类别"
        clearable
        @change="handleCategoryChange"
        style="width: 240px;"
      >
        <el-option
          v-for="category in categoryList"
          :key="category.code"
          :label="category.name"
          :value="category.code"
        />
      </el-select>
    </div>

    <!-- 左右布局内容区 -->
    <div class="content-area">
      <!-- 左侧:3D可视化 -->
      <div class="visualization-panel" :style="{ width: leftWidth + 'px' }">
        <div class="panel-content">
          <!-- 3D模型展示区域 -->
          <div class="model-display">
            <ThreeDModel 
              ref="threeDModelRef" 
              :model-parts="modelParts" 
              @part-click="handlePartClick"
            />
          </div>
        </div>
      </div>

      <!-- 拖拽分割线 -->
      <div class="resize-handle" @mousedown="startResize"></div>

      <!-- 右侧:能效评估 -->
      <div class="assessment-panel" :style="{ width: rightWidth + 'px' }">
        <div class="panel-content">
          <!-- 右侧所有内容包裹在一个卡片中 -->
          <div class="assessment-section">
            <!-- 顶部操作区 -->
            <div class="action-bar">
              <el-button @click="handleOpenImportDialog">
                导入数据
              </el-button>
              <span v-if="importedFileName" class="file-name">{{ importedFileName }}</span>
            </div>
            
            <!-- 搜索筛选区 -->
            <div class="search-filter-bar">
              <el-form :inline="true" :model="searchForm">
                <el-form-item label="品牌">
                  <el-input 
                    v-model="searchForm.brand" 
                    placeholder="请输入品牌"
                    clearable
                    style="width: 180px;"
                  />
                </el-form-item>
                <el-form-item label="型号">
                  <el-input 
                    v-model="searchForm.model" 
                    placeholder="请输入型号"
                    clearable
                    style="width: 220px;"
                  />
                </el-form-item>
                <el-form-item>
                  <el-button @click="handleSearch">查询</el-button>
                  <el-button @click="handleReset">重置筛选</el-button>
                </el-form-item>
              </el-form>
            </div>
            
            <!-- 数据展示区 -->
            <DataDisplaySection
              :engine-list="basicInfoData.engineList"
              :evaluating="evaluating"
              :evaluating-row-id="evaluatingRow"
              @view-test-condition="viewTestCondition"
              @view-conditions-data="viewConditionsData"
              @start-evaluation="startEvaluation"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 评估结果弹窗 -->
    <EvaluationResultDialog
      v-model="showEvaluationResultDialog"
      :evaluation-result="evaluationResult"
    />

    <!-- 部件详情弹窗 -->
    <el-dialog
      v-model="showPartDialog"
      :title="currentPartData?.name || '部件详情'"
      width="700px"
      :close-on-click-modal="false"
    >
      <div v-if="currentPartData" class="part-detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="部件名称">{{ currentPartData.name }}</el-descriptions-item>
          <el-descriptions-item label="部件类型">{{ currentPartData.type }}</el-descriptions-item>
          <el-descriptions-item label="能效等级">
            <el-tag :type="getLevelType(currentPartData.efficiencyLevel)" size="small">
              {{ currentPartData.efficiencyLevel }}级
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="能效评分">{{ currentPartData.efficiencyScore }}</el-descriptions-item>
        </el-descriptions>

        <div class="section-title">工况数据</div>
        <el-table :data="currentPartData.conditions" border stripe max-height="250">
          <el-table-column prop="load" label="负荷" width="100" />
          <el-table-column prop="currentValue" label="当前值" width="120" />
          <el-table-column prop="baselineValue" label="基准值" width="120" />
          <el-table-column prop="difference" label="差异" width="100">
            <template #default="{ row }">
              <span :class="row.difference >= 0 ? 'positive' : 'negative'">
                {{ row.difference >= 0 ? '+' : '' }}{{ row.difference }}
              </span>
            </template>
          </el-table-column>
          <el-table-column label="状态">
            <template #default="{ row }">
              <el-tag :type="row.status === '达标' ? 'success' : row.status === '待改进' ? 'warning' : 'danger'" size="small">
                {{ row.status }}
              </el-tag>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <template #footer>
        <el-button @click="showPartDialog = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 导入数据弹窗 -->
    <FileUploadDialog
      v-model="showImportDialog"
      @file-change="handleFileChange"
      @close="closeImportDialog"
    />


    <!-- 测试条件弹窗 -->
    <TestConditionDialog
      v-model="showTestConditionDialog"
      :test-condition="currentTestCondition"
    />

    <!-- 工况数据弹窗 -->
    <ConditionsDataDialog
      v-model="showConditionsDialog"
      :conditions-data="conditionsData"
      :conditions-columns="conditionsColumns"
      :category-id="selectedCategoryId"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload, View } from '@element-plus/icons-vue'
import ThreeDModel from './components/ThreeDModel.vue'
import EvaluationResultDialog from './components/EvaluationResultDialog.vue'
import TestConditionDialog from './components/TestConditionDialog.vue'
import ConditionsDataDialog from './components/ConditionsDataDialog.vue'
import FileUploadDialog from './components/FileUploadDialog.vue'
import DataDisplaySection from './components/DataDisplaySection.vue'

// Props
const props = defineProps({
  globalState: {
    type: Object,
    required: true
  }
})

// 可视化相关
const threeDModelRef = ref(null)
const modelParts = ref([])
const showPartDialog = ref(false)
const currentPartData = ref(null)

// 评估相关
const selectedCategoryId = ref('')
const importedFileName = ref('')
const importedEngineId = ref(null)  // 导入的发动机ID
const evaluating = ref(false)
const evaluationResult = ref(null)
const showImportDialog = ref(false)
const showTestConditionDialog = ref(false)  // 测试条件弹窗
const showConditionsDialog = ref(false)  // 工况数据弹窗
const showEvaluationResultDialog = ref(false)  // 评估结果弹窗
const currentTestCondition = ref({})  // 当前查看的测试条件
const evaluatingRow = ref(null)  // 当前评估的行ID
const conditionsData = ref([])
const conditionsColumns = ref([])
const basicInfoData = ref({})  // 基本信息数据
const searchForm = ref({  // 搜索表单
  brand: '',
  model: ''
})

// 拖拽相关变量
const leftWidth = ref(0)  // 左侧面板宽度
const rightWidth = ref(0)  // 右侧面板宽度
const isResizing = ref(false)  // 是否正在拖拽
const startX = ref(0)  // 拖拽起始位置
const startLeftWidth = ref(0)  // 拖拽起始左侧宽度

// 类别列表（从API获取）
const categoryList = ref([])

// 获取类别选项
const fetchCategoryOptions = async () => {
  try {
    const response = await fetch('/api/devices/parent-options', {
      method: 'GET'
    })
    const result = await response.json()
    if (result.code === 200) {
      categoryList.value = result.data || []
      
      // 页面加载时默认选中第一个类别
      if (categoryList.value.length > 0 && !selectedCategoryId.value) {
        selectedCategoryId.value = categoryList.value[0].code
        handleCategoryChange(selectedCategoryId.value)
      }
    } else {
      ElMessage.error(result.message || '获取类别列表失败')
    }
  } catch (error) {
    ElMessage.error('获取类别列表失败')
    console.error(error)
  }
}

// 类别变化处理
const handleCategoryChange = (categoryId) => {
  if (!categoryId) {
    // 清空类别时，重置所有状态
    modelParts.value = []
    conditionsColumns.value = []
    conditionsData.value = []
    basicInfoData.value = {}
    return
  }
  
  // 自动查询数据
  fetchConditionsData()
}

// 组件挂载时获取类别列表
onMounted(() => {
  fetchCategoryOptions()
  
  // 页面加载后自动查询发动机数据
  selectedCategoryId.value = 'engine'  // 默认选中发动机
  fetchConditionsData()
  
  // 初始化左右面板宽度为50%
  initPanelWidth()
  
  // 监听窗口大小变化
  window.addEventListener('resize', handleWindowResize)
})

// 初始化面板宽度
const initPanelWidth = () => {
  const containerWidth = document.querySelector('.content-area')?.clientWidth || 0
  const halfWidth = Math.floor(containerWidth / 2)
  leftWidth.value = halfWidth
  rightWidth.value = containerWidth - halfWidth - 5 // 减去分割线宽度
}

// 窗口大小变化处理
const handleWindowResize = () => {
  if (!isResizing.value) {
    initPanelWidth()
  }
}

// 开始拖拽
const startResize = (e) => {
  isResizing.value = true
  startX.value = e.clientX
  startLeftWidth.value = leftWidth.value
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', stopResize)
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
}

// 拖拽中
const handleMouseMove = (e) => {
  if (!isResizing.value) return
  
  const deltaX = e.clientX - startX.value
  const newLeftWidth = startLeftWidth.value + deltaX
  
  // 限制最小宽度为200px
  const minWidth = 200
  const containerWidth = document.querySelector('.content-area')?.clientWidth || 0
  const maxWidth = containerWidth - minWidth - 5
  
  if (newLeftWidth >= minWidth && newLeftWidth <= maxWidth) {
    leftWidth.value = newLeftWidth
    rightWidth.value = containerWidth - newLeftWidth - 5
  }
}

// 停止拖拽
const stopResize = () => {
  isResizing.value = false
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', stopResize)
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
}

// 部件点击处理
const handlePartClick = (part) => {
  currentPartData.value = part
  showPartDialog.value = true
}

// 打开导入数据弹窗
const handleOpenImportDialog = () => {
  // 检查是否选择了设备类别
  if (!selectedCategoryId.value) {
    ElMessage.warning('请先选择设备类别')
    return
  }
  
  showImportDialog.value = true
}

// 文件上传处理
const handleFileChange = async (file) => {
  // 检查是否选择了设备类别
  if (!selectedCategoryId.value) {
    ElMessage.warning('请先选择设备类别')
    return
  }
  
  try {
    // 显示加载状态
    const loadingMsg = ElMessage({
      message: '正在导入数据...',
      type: 'info',
      duration: 0
    })
    
    // 构建 FormData
    const formData = new FormData()
    formData.append('file', file.raw)
    
    // 根据不同设备类别调用不同的导入接口
    const importApiUrl = getImportApiUrl(selectedCategoryId.value)
    
    const response = await fetch(importApiUrl, {
      method: 'POST',
      body: formData
    })
    
    const result = await response.json()
    
    // 关闭加载提示
    loadingMsg.close()
    
    if (result.code === 200) {
      importedFileName.value = file.name
      
      // 打印后端返回的完整数据结构，用于调试
      console.log('导入接口返回数据:', result.data)
      
      // 如果是发动机，保存返回的 engineId
      if (selectedCategoryId.value === 'engine' && result.data) {
        // 尝试多种可能的字段名
        importedEngineId.value = result.data.engineId || result.data.id || result.data
        console.log('保存的engineId:', importedEngineId.value)
      }
      
      showImportDialog.value = false
      
      ElMessage.success(result.message || '导入成功')
      
      // 导入成功后获取工况数据
      await fetchConditionsData()
    } else {
      ElMessage.error(result.message || '导入失败')
    }
  } catch (error) {
    ElMessage.error('导入失败：' + error.message)
    console.error('导入错误:', error)
  }
}

// 根据不同设备类别获取导入接口URL
const getImportApiUrl = (categoryId) => {
  const apiMap = {
    'engine': '/api/engine/import',           // 船用发动机
    'gearbox': '/api/gearbox/import',         // 船用齿轮箱
    'waste-heat': '/api/waste-heat/import',   // 船用余热回收发电装置
    'incinerator': '/api/incinerator/import', // 船用焚烧炉
    'separator': '/api/separator/import',     // 船用碟式分离机
    'ballast': '/api/ballast/import',         // 船用压载水处理设备
    'windlass': '/api/windlass/import',       // 船用锚绞机
    'crane': '/api/crane/import',             // 船用吊机
    'generator': '/api/generator/import',     // 船用发电机
    'air-conditioner': '/api/air-conditioner/import', // 船用组合式空调机组
    'chiller': '/api/chiller/import',         // 船用冷水机组
    'inert-gas': '/api/inert-gas/import',     // 船用惰性气体系统
    'co2-capture': '/api/co2-capture/import', // 船用二氧化碳捕集设备
    'propeller': '/api/propeller/import',     // 船用推进器
    'default': '/api/device/import'
  }
  
  return apiMap[categoryId] || apiMap['default']
}

// 获取工况数据
const fetchConditionsData = async () => {
  try {
    // 根据不同设备类别调用不同的查询接口
    const queryApiUrl = getQueryApiUrl(selectedCategoryId.value)
    
    console.log('查询接口URL:', queryApiUrl)
    
    // 构建查询参数
    let requestBody = {}
    if (selectedCategoryId.value === 'engine') {
      // 发动机：使用搜索表单的条件
      requestBody = {
        brand: searchForm.value.brand || '',
        model: searchForm.value.model || ''
      }
    }
    
    console.log('查询参数:', requestBody)
    
    const response = await fetch(queryApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })
    const result = await response.json()
    
    console.log('查询接口返回数据:', result)
    
    if (result.code === 200 && result.data) {
      // 根据设备类别处理不同的数据结构
      if (selectedCategoryId.value === 'engine') {
        // 发动机：返回的是数组，直接展示列表
        const engineDataList = Array.isArray(result.data) ? result.data : [result.data]
        
        if (engineDataList.length > 0) {
          // 基本信息：将所有发动机数据放入列表
          basicInfoData.value = {
            engineList: engineDataList,
            engineInfo: null  // 不再使用单个engineInfo
          }
          
          // 工况数据：暂时为空，点击按钮后再加载对应发动机的工况数据
          conditionsData.value = []
        } else {
          basicInfoData.value = {}
          conditionsData.value = []
        }
      } else {
        // 其他设备：直接使用返回的数据
        conditionsData.value = result.data
      }
    } else {
      console.warn('获取工况数据返回空数据')
      conditionsData.value = []
      basicInfoData.value = {}
    }
  } catch (error) {
    console.error('获取工况数据失败:', error)
    // 即使获取失败也不报错，因为可能后端还没实现这个接口
    conditionsData.value = []
    basicInfoData.value = {}
  }
}

// 搜索处理
const handleSearch = () => {
  // 直接使用 searchForm.value 进行查询
  fetchConditionsData()
}

// 重置处理
const handleReset = () => {
  // 清空搜索表单
  searchForm.value = {
    brand: '',
    model: ''
  }
  fetchConditionsData()
}

// 查看测试条件
const viewTestCondition = (row) => {
  // 将当前行的testCondition数据设置到弹窗
  currentTestCondition.value = row.testCondition || {}
  showTestConditionDialog.value = true
}

// 查看工况数据
const viewConditionsData = (row) => {
  // 将当前行的performanceCurves数据设置到弹窗
  conditionsData.value = row.performanceCurves || []
  showConditionsDialog.value = true
}

// 根据不同设备类别获取查询接口URL
const getQueryApiUrl = (categoryId) => {
  const apiMap = {
    'engine': '/api/engine/list',  // 发动机使用POST查询接口
    'gearbox': '/api/gearbox/conditions',
    'waste-heat': '/api/waste-heat/conditions',
    'incinerator': '/api/incinerator/conditions',
    'separator': '/api/separator/conditions',
    'ballast': '/api/ballast/conditions',
    'windlass': '/api/windlass/conditions',
    'crane': '/api/crane/conditions',
    'generator': '/api/generator/conditions',
    'air-conditioner': '/api/air-conditioner/conditions',
    'chiller': '/api/chiller/conditions',
    'inert-gas': '/api/inert-gas/conditions',
    'co2-capture': '/api/co2-capture/conditions',
    'propeller': '/api/propeller/conditions',
    'default': '/api/device/conditions'
  }
  
  return apiMap[categoryId] || apiMap['default']
}

// 显示导入数据预览
// 关闭导入弹窗
const closeImportDialog = () => {
  showImportDialog.value = false
}

// 开始评估
const startEvaluation = async (row) => {
  evaluating.value = true
  evaluatingRow.value = row.id
  
  try {
    // 判断是否已经评估过（支持多种类型：boolean、数字、字符串）
    const isEvaluated = row.is_evaluated === 1 || row.is_evaluated === true || 
                        row.isEvaluated === 1 || row.isEvaluated === true ||
                        row.is_evaluated === '1' || row.isEvaluated === '1'
    
    console.log('行数据:', row)
    console.log('is_evaluated 值:', row.is_evaluated, '类型:', typeof row.is_evaluated)
    console.log('是否已评估:', isEvaluated)
    
    if (isEvaluated) {
      // 已评估：调用 GET 接口查看结果
      console.log('调用 GET 接口查看评估结果')
      const response = await fetch(`/api/engine/evaluate/${row.id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const result = await response.json()
      
      if (result.code === 200 && result.data) {
        // 根据接口返回数据构建评估结果
        evaluationResult.value = {
          overallLevel: result.data.efficiencyLevel,
          score: result.data.baseValue,
          details: [
            { 
              name: '能效指数', 
              value: result.data.efficiencyIndex.toFixed(2), 
              level: result.data.efficiencyLevel 
            },
            { 
              name: '能效等级', 
              value: result.data.levelDescription, 
              level: result.data.efficiencyLevel 
            },
            { 
              name: '评估结果', 
              value: result.data.passed ? '通过' : '未通过', 
              level: result.data.passed ? 1 : 3 
            }
          ]
        }
        
        // 打开评估结果弹窗
        showEvaluationResultDialog.value = true
      } else {
        throw new Error(result.message || '获取评估结果失败')
      }
    } else {
      // 未评估：调用 POST 接口进行评估
      const response = await fetch(`/api/engine/evaluate/${row.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      const result = await response.json()
      
      if (result.code === 200 && result.data) {
        // 根据接口返回数据构建评估结果
        evaluationResult.value = {
          overallLevel: result.data.efficiencyLevel,
          score: result.data.baseValue,
          details: [
            { 
              name: '能效指数', 
              value: result.data.efficiencyIndex.toFixed(2), 
              level: result.data.efficiencyLevel 
            },
            { 
              name: '能效等级', 
              value: result.data.levelDescription, 
              level: result.data.efficiencyLevel 
            },
            { 
              name: '评估结果', 
              value: result.data.passed ? '通过' : '未通过', 
              level: result.data.passed ? 1 : 3 
            }
          ]
        }
        
        // 打开评估结果弹窗
        showEvaluationResultDialog.value = true
        
        // 刷新数据列表，更新评估状态（这样下次点击就知道已评估过了）
        await fetchConditionsData()
      } else {
        throw new Error(result.message || '评估失败')
      }
    }
  } catch (error) {
    ElMessage.error('操作失败: ' + error.message)
  } finally {
    evaluating.value = false
    evaluatingRow.value = null
  }
}

// 获取等级类型
</script>

<style scoped>
.assessment-visualization-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 110px);
  padding: 20px;
  background-color: #1e3a5f;
  box-sizing: border-box;
}

/* 全局控制栏 */
.global-control-bar {
  display: flex;
  justify-content: flex-end;
  padding: 0;
  margin-bottom: 20px;
}

/* 内容区域 */
.content-area {
  flex: 1;
  display: flex;
  min-height: 0;
}

/* 左侧可视化面板 */
.visualization-panel {
  /* flex: 1; */ /* 改为固定宽度，由 leftWidth 控制 */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.panel-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.model-display {
  flex: 1;
  overflow: hidden;
}

/* 拖拽分割线 */
.resize-handle {
  width: 5px;
  background: rgba(64, 158, 255, 0.3);
  cursor: col-resize;
  transition: background 0.3s;
  position: relative;
  flex-shrink: 0;
}

.resize-handle:hover,
.resize-handle:active {
  background: rgba(64, 158, 255, 0.6);
}

.resize-handle::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 1px;
  height: 40px;
  background: rgba(255, 255, 255, 0.5);
}

/* 右侧评估面板 */
.assessment-panel {
  /* flex: 1; */ /* 改为固定宽度，由 rightWidth 控制 */
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.assessment-section {
  padding: 8px;
}

/* 数据展示区域 */
.data-display-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px;
  max-height: calc(100vh - 250px); /* 设置最大高度 */
}

.action-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.file-name {
  font-size: 14px;
  color: #b0b0b0;
}

.conditions-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.conditions-section .section-title {
  margin-bottom: 8px;
}

.conditions-table-wrapper {
  position: relative;
  min-height: 200px;
  flex: 1;
  overflow: hidden;
}

.result-section {
  background: transparent;
  border: none;
}

.result-card {
  background: rgba(30, 58, 95, 0.6);
  padding: 12px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.15);
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.result-label {
  font-size: 14px;
  color: #b0b0b0;
}

.result-score {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.score-label {
  font-size: 14px;
  color: #b0b0b0;
}

.score-value {
  font-size: 24px;
  font-weight: 600;
  color: #409eff;
}

.result-details {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.detail-item:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 14px;
  color: #b0b0b0;
}

.detail-value {
  font-size: 14px;
  color: #e0e0e0;
  font-weight: 500;
}

/* 部件详情弹窗 */
.part-detail {
  padding: 10px 0;
}

.positive {
  color: #67c23a;
}

.negative {
  color: #f56c6c;
}

/* 响应式布局 */
@media (max-width: 1200px) {
  .content-area {
    flex-direction: column;
  }
  
  .visualization-panel,
  .assessment-panel {
    min-height: 600px;
  }
}
</style>
