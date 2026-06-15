<template>
  <div class="assessment-visualization-container">
    <!-- 顶部全局控制栏 -->
    <div class="global-control-bar">
      <el-tree-select 
        v-model="selectedDeviceId" 
        :data="categoryList"
        :props="{ 
          label: 'name', 
          value: 'id', 
          children: 'children',
          disabled: (data) => data.children && data.children.length > 0
        }"
        placeholder="全部设备"
        clearable
        check-strictly
        :render-after-expand="false"
        popper-class="device-tree-select-popper"
        @change="handleCategoryChange"
        class="device-tree-select"
        style="width: 240px;"
      />
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
              :conditions-data="currentCondition"
              :all-conditions="conditionsData"
              @condition-change="handleConditionChange"
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
              <el-select 
                v-model="selectedEngineId" 
                placeholder="请选择发动机"
                clearable
                filterable
                style="width: 300px; margin-right: 8px;"
                @change="handleDeviceSelectChange"
              >
                <el-option
                  v-for="engine in engineOptions"
                  :key="engine.id"
                  :label="engine.displayName"
                  :value="engine.id"
                />
              </el-select>
              <el-button @click="handleOpenImportDialog">
                导入数据
              </el-button>
            </div>
            
            <!-- 数据展示区 -->
            <DataDisplaySection
              :device-type="selectedDevice?.parentCode || selectedDevice?.code"
              :device-info="basicInfoData.deviceInfo"
              :performance-curves="conditionsData"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 导入数据弹窗 -->
    <FileUploadDialog
      v-model="showImportDialog"
      @file-change="handleFileChange"
      @close="closeImportDialog"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import ThreeDModel from './components/ThreeDModel.vue'
import FileUploadDialog from './components/FileUploadDialog.vue'
import DataDisplaySection from './components/DataDisplaySection.vue'

// 可视化相关
const threeDModelRef = ref(null)

// 直接加载外部3D模型（通过modelFileUrl）
const loadExternalModel = async (modelFileUrl) => {
  if (!threeDModelRef.value || !modelFileUrl) return
  
  // 调用ThreeDModel组件的loadExternalModel方法加载静态资源模型（URL以/开头）
  threeDModelRef.value.loadExternalModel(modelFileUrl)
}

// 评估相关
const selectedDeviceId = ref(null)  // 选中的设备ID
const selectedDevice = computed(() => {  // 根据ID从categoryList中查找完整设备对象
  if (!selectedDeviceId.value || !categoryList.value.length) return null
  
  // 递归查找设备对象
  const findDevice = (nodes, id) => {
    for (const node of nodes) {
      if (node.id === id) return node
      if (node.children && node.children.length > 0) {
        const found = findDevice(node.children, id)
        if (found) return found
      }
    }
    return null
  }
  
  return findDevice(categoryList.value, selectedDeviceId.value)
})
const showImportDialog = ref(false)
const conditionsData = ref([])  // 工况数据数组
const currentCondition = ref(null)  // 当前显示的工况数据
const basicInfoData = ref({})  // 基本信息数据

// 发动机下拉选项
const selectedEngineId = ref(null)
const engineOptions = ref([])

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
    const response = await fetch('/api/devices/tree', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({}) // 空对象，获取所有设备树
    })
    const result = await response.json()
    if (result.code === 200) {
      categoryList.value = result.data || []
      
      // 页面加载时默认选中第一个类别
      if (categoryList.value.length > 0 && !selectedDeviceId.value) {
        const firstCategory = categoryList.value[0]
        
        // 判断是否有子设备：如果有子设备且子设备数量>0，选择第一个子设备；否则选择自己
        if (firstCategory.children && firstCategory.children.length > 0) {
          selectedDeviceId.value = firstCategory.children[0].id
        } else {
          selectedDeviceId.value = firstCategory.id
        }
        
        // 使用 nextTick 确保 DOM 更新后再触发查询
        nextTick(() => {
          handleCategoryChange(selectedDeviceId.value)
        })
      }
    } else {
      ElMessage.error(result.message || '获取类别列表失败')
    }
  } catch (error) {
    ElMessage.error('获取类别列表失败')
  }
}

// 类别变化处理
const handleCategoryChange = async (deviceObj) => {
  // 如果传入的是数字ID，需要查找对应的设备对象
  let actualDevice = deviceObj
  if (typeof deviceObj === 'number') {
    actualDevice = findDeviceById(categoryList.value, deviceObj)
  }
  
  if (!actualDevice) {
    // 清空选择时，重置所有状态
    modelParts.value = []
    conditionsColumns.value = []
    conditionsData.value = []
    basicInfoData.value = {}
    currentCondition.value = null
    engineOptions.value = []
    selectedEngineId.value = null
    // 清除3D模型
    if (threeDModelRef.value) {
      threeDModelRef.value.clearModel()
    }
    return
  }
  
  // 查找有3D模型的设备（优先当前设备，如果没有则查找父设备）
  let deviceWithModel = actualDevice
  
  // 如果当前设备没有 modelFileUrl，尝试查找父设备
  if (!actualDevice.modelFileUrl && actualDevice.parentCode) {
    const parentDevice = findDeviceByCode(categoryList.value, actualDevice.parentCode)
    if (parentDevice && parentDevice.modelFileUrl) {
      deviceWithModel = parentDevice
    }
  }
  
  // 检查是否有3D模型
  const hasModelFile = deviceWithModel.modelFileUrl
  
  if (!hasModelFile) {
    // 如果没有3D模型，清除已加载的模型
    if (threeDModelRef.value) {
      threeDModelRef.value.clearModel()
    }
  } else {
    // 如果有模型文件，加载它
    loadExternalModel(deviceWithModel.modelFileUrl)
  }
  
  // 重新获取设备数据列表（使用新选择设备的 parentCode）
  await fetchDeviceOptions()
}

// 根据 id 递归查找设备对象
const findDeviceById = (nodes, id) => {
  for (const node of nodes) {
    if (node.id === id) return node
    if (node.children && node.children.length > 0) {
      const found = findDeviceById(node.children, id)
      if (found) return found
    }
  }
  return null
}

// 根据 code 递归查找设备对象（用于查找父设备）
const findDeviceByCode = (nodes, code) => {
  for (const node of nodes) {
    if (node.code === code) return node
    if (node.children && node.children.length > 0) {
      const found = findDeviceByCode(node.children, code)
      if (found) return found
    }
  }
  return null
}

// 组件挂载时获取类别列表和设备选项
onMounted(() => {
  fetchCategoryOptions()
  // 注意：不在这里调用 fetchDeviceOptions()，因为需要等用户选择设备后再调用
  
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

// 获取设备数据选项列表
const fetchDeviceOptions = async () => {
  // 如果没有选择设备，返回
  if (!selectedDevice.value) {
    engineOptions.value = []
    return
  }
  
  try {
    // 使用通用接口，参数为右上角设备的 parentCode
    const parentCode = selectedDevice.value.parentCode || selectedDevice.value.code
    const response = await fetch(`/api/base/all?parentCode=${parentCode}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const result = await response.json()
    if (result.code === 200) {
      engineOptions.value = result.data || []
      
      // 如果有数据，默认选择第一个
      if (engineOptions.value.length > 0) {
        selectedEngineId.value = engineOptions.value[0].id
        // 触发加载第一个设备的详情
        await handleDeviceSelectChange(selectedEngineId.value)
      }
    } else {
      ElMessage.error(result.message || '获取设备列表失败')
    }
  } catch (error) {
    ElMessage.error('获取设备列表失败')
  }
}

// 设备选择变化处理
const handleDeviceSelectChange = async (deviceId) => {
  if (!deviceId) {
    // 清空选择时，重置设备列表
    basicInfoData.value = {
      deviceList: [],
      deviceInfo: null
    }
    conditionsData.value = []
    currentCondition.value = null
    return
  }
  
  try {
    // 根据设备类型确定详情接口和参数名
    const parentCode = selectedDevice.value?.parentCode || ''
    const apiUrl = `/api/${parentCode}/detail?id=${deviceId}`
    
    // 设备名称映射
    const deviceNameMap = {
      'engine': '发动机',
      'egcs': '尾气处理装置',
      'inert-gas': '惰性气体系统',
      'co2-capture': '二氧化碳捕集设备',
      'propeller': '推进器'
    }
    const deviceName = deviceNameMap[parentCode] || '设备'
    
    // 调用详情接口
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const result = await response.json()
    
    if (result.code === 200 && result.data) {
      // 将单条数据包装成数组显示
      basicInfoData.value = {
        deviceList: [result.data],
        deviceInfo: result.data
      }
      
      // 加载工况数据（如果有）
      if (result.data.performanceCurves) {
        conditionsData.value = result.data.performanceCurves
        // 设置默认显示第一个工况数据
        if (conditionsData.value.length > 0) {
          currentCondition.value = conditionsData.value[0]
        } else {
          currentCondition.value = null
        }
      } else {
        conditionsData.value = []
        currentCondition.value = null
      }
      
      ElMessage.success(`已加载${deviceName}信息`)
    } else {
      ElMessage.error(result.message || `获取${deviceName}详情失败`)
      basicInfoData.value = {
        deviceList: [],
        deviceInfo: null
      }
    }
  } catch (error) {
    ElMessage.error(`获取${deviceName}详情失败`)
    basicInfoData.value = {
      deviceList: [],
      deviceInfo: null
    }
  }
}

// 工况切换处理
const handleConditionChange = (condition) => {
  currentCondition.value = condition
}

// 部件点击处理
const handlePartClick = (part) => {
  currentPartData.value = part
  showPartDialog.value = true
}

// 打开导入数据弹窗
const handleOpenImportDialog = () => {
  // 检查是否选择了设备
  if (!selectedDevice.value) {
    ElMessage.warning('请先选择设备')
    return
  }
  
  showImportDialog.value = true
}

// 文件上传处理
const handleFileChange = async (file) => {
  // 检查是否选择了设备
  if (!selectedDevice.value) {
    ElMessage.warning('请先选择设备')
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
    
    // 根据设备类型调用不同的导入接口
    const importApiUrl = getImportApiUrl(selectedDevice.value)
    
    const response = await fetch(importApiUrl, {
      method: 'POST',
      body: formData
    })
    
    const result = await response.json()
    
    // 关闭加载提示
    loadingMsg.close()
    
    if (result.code === 200) {
      showImportDialog.value = false
      
      ElMessage.success(result.message || '导入成功')
      
      // 注意：不再自动获取工况数据，需要通过下拉框选择发动机后手动触发
    } else {
      ElMessage.error(result.message || '导入失败')
    }
  } catch (error) {
    ElMessage.error('导入失败：' + error.message)
  }
}

// 根据设备类型获取导入接口URL
const getImportApiUrl = (deviceObj) => {
  if (!deviceObj || !deviceObj.parentCode) return ''
  
  const { parentCode, id } = deviceObj
  
  // 构建导入接口URL：/api/{parentCode}/import?deviceId={id}
  let apiUrl = `/api/${parentCode}/import`
  
  // 如果需要传递 deviceId 参数
  if (id) {
    apiUrl += `?deviceId=${id}`
  }
  
  return apiUrl
}



// 关闭导入弹窗
const closeImportDialog = () => {
  showImportDialog.value = false
}
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
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.assessment-panel .panel-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.assessment-section {
  padding: 8px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

/* 数据展示区域 */
.data-display-wrapper {
  flex: 1;
  overflow-y: auto;
  padding: 0 8px;
  max-height: calc(100vh - 250px);
}

.action-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
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
