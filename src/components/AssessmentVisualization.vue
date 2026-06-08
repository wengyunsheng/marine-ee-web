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
      <div class="visualization-panel">
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

      <!-- 右侧:能效评估 -->
      <div class="assessment-panel">
        <div class="panel-content">
          <!-- 顶部操作区 -->
          <div class="assessment-section">
            <div class="action-bar">
              <el-button @click="showImportDialog = true">
                导入数据
              </el-button>
              <el-button v-if="importedFileName" @click="showImportDataPreview">
                查看数据
              </el-button>
              <span v-if="importedFileName" class="file-name">{{ importedFileName }}</span>
            </div>
          </div>

          <!-- 工况数据展示区域 -->
          <div class="assessment-section conditions-section">
            <div class="section-title">
              工况数据
            </div>
            
            <!-- 表格区域（始终显示） -->
            <div class="conditions-table-wrapper">
              <el-table
                :data="conditionsData"
                style="width: 100%"
                border
                stripe
                max-height="400"
              >
                <el-table-column type="index" label="序号" width="60" align="center" />
                <el-table-column
                  v-for="col in conditionsColumns"
                  :key="col.prop"
                  :prop="col.prop"
                  :label="col.label"
                  :min-width="col.minWidth || 120"
                  align="center"
                  show-overflow-tooltip
                />
              </el-table>
            </div>
          </div>

          <!-- 评估按钮 -->
          <div class="assessment-section">
            <el-button 
              :loading="evaluating"
              @click="startEvaluation"
            >
              {{ evaluating ? '评估中...' : '能效评估' }}
            </el-button>
          </div>

          <!-- 评估结果 -->
          <div v-if="evaluationResult" class="assessment-section result-section">
            <div class="section-title">评估结果</div>
            <div class="result-card">
              <div class="result-header">
                <span class="result-label">综合能效等级:</span>
                <el-tag :type="getLevelType(evaluationResult.overallLevel)" size="large">
                  {{ evaluationResult.overallLevel }}级
                </el-tag>
              </div>
              <div class="result-score">
                <span class="score-label">能效评分:</span>
                <span class="score-value">{{ evaluationResult.score }}</span>
              </div>
              <el-divider />
              <div class="result-details">
                <div class="detail-item" v-for="(item, index) in evaluationResult.details" :key="index">
                  <span class="detail-label">{{ item.name }}:</span>
                  <span class="detail-value">{{ item.value }}</span>
                  <el-tag :type="getLevelType(item.level)" size="small">{{ item.level }}级</el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

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
    <el-dialog
      v-model="showImportDialog"
      title="导入数据"
      width="600px"
      :close-on-click-modal="false"
      @close="closeImportDialog"
    >
      <el-upload
        class="upload-data-file"
        drag
        :auto-upload="false"
        :on-change="handleFileChange"
        accept=".csv,.xlsx,.xls"
        :limit="1"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽文件到此处或<em>点击上传</em>
        </div>
        <template #tip>
          <div class="el-upload__tip">
            支持格式: CSV, XLSX, XLS，文件大小不超过10MB
          </div>
        </template>
      </el-upload>
    </el-dialog>

    <!-- 导入数据预览弹窗 -->
    <ImportDataPreview
      v-model="showImportDataDialog"
      :file-data="uploadedFile"
      :file-name="importedFileName"
      @close="handleImportDataClose"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Upload, View, UploadFilled } from '@element-plus/icons-vue'
import ThreeDModel from './visualization/components/ThreeDModel.vue'
import ImportDataPreview from './AssessmentVisualization/ImportDataPreview.vue'

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
const uploadedFile = ref(null)
const evaluating = ref(false)
const evaluationResult = ref(null)
const showImportDialog = ref(false)
const showImportDataDialog = ref(false)
const conditionsData = ref([])
const conditionsColumns = ref([])

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
    return
  }
  
  // 根据设备类别加载对应的工况表头
  loadConditionsColumns(categoryId)
}

// 根据设备类别加载工况表头
const loadConditionsColumns = (categoryId) => {
  // 不同设备类型的工况字段配置
  const columnConfig = {
    'engine': [  // 船用发动机
      { prop: 'load', label: '负荷(%)', minWidth: 100 },
      { prop: 'speed', label: '转速(rpm)', minWidth: 120 },
      { prop: 'torque', label: '扭矩(Nm)', minWidth: 120 },
      { prop: 'power', label: '功率(kW)', minWidth: 120 },
      { prop: 'fuelConsumption', label: '燃油消耗率(g/kWh)', minWidth: 160 },
      { prop: 'exhaustTemp', label: '排气温度(℃)', minWidth: 140 },
      { prop: 'coolantTemp', label: '冷却液温度(℃)', minWidth: 150 }
    ],
    'gearbox': [  // 齿轮箱
      { prop: 'inputSpeed', label: '输入转速(rpm)', minWidth: 140 },
      { prop: 'outputSpeed', label: '输出转速(rpm)', minWidth: 140 },
      { prop: 'inputTorque', label: '输入扭矩(Nm)', minWidth: 140 },
      { prop: 'outputTorque', label: '输出扭矩(Nm)', minWidth: 140 },
      { prop: 'oilTemp', label: '油温(℃)', minWidth: 120 },
      { prop: 'efficiency', label: '传动效率(%)', minWidth: 140 }
    ],
    'generator': [  // 发电机
      { prop: 'voltage', label: '电压(V)', minWidth: 100 },
      { prop: 'current', label: '电流(A)', minWidth: 100 },
      { prop: 'frequency', label: '频率(Hz)', minWidth: 100 },
      { prop: 'power', label: '功率(kW)', minWidth: 120 },
      { prop: 'powerFactor', label: '功率因数', minWidth: 120 },
      { prop: 'temperature', label: '绕组温度(℃)', minWidth: 140 }
    ],
    'boiler': [  // 焚烧炉/锅炉
      { prop: 'steamPressure', label: '蒸汽压力(MPa)', minWidth: 140 },
      { prop: 'steamTemp', label: '蒸汽温度(℃)', minWidth: 140 },
      { prop: 'fuelRate', label: '燃料消耗率(kg/h)', minWidth: 160 },
      { prop: 'combustionTemp', label: '燃烧温度(℃)', minWidth: 140 },
      { prop: 'efficiency', label: '热效率(%)', minWidth: 120 }
    ],
    'default': [  // 默认配置
      { prop: 'parameter1', label: '参数1', minWidth: 120 },
      { prop: 'parameter2', label: '参数2', minWidth: 120 },
      { prop: 'parameter3', label: '参数3', minWidth: 120 }
    ]
  }
  
  // 根据类别加载对应的表头，如果没有配置则使用默认
  conditionsColumns.value = columnConfig[categoryId] || columnConfig['default']
  
  // 清空之前的数据
  conditionsData.value = []
}

// 组件挂载时获取类别列表
onMounted(() => {
  fetchCategoryOptions()
})

// 部件点击处理
const handlePartClick = (part) => {
  currentPartData.value = part
  showPartDialog.value = true
}

// 文件上传处理
const handleFileChange = (file) => {
  uploadedFile.value = file.raw
  importedFileName.value = file.name
  showImportDialog.value = false
  
  // 解析并显示工况数据
  parseConditionsData(file.raw)
  
  ElMessage.success(`文件已导入: ${file.name}`)
}

// 解析工况数据
const parseConditionsData = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const content = e.target.result
        
        if (file.name.endsWith('.csv')) {
          const lines = content.split('\n').filter(line => line.trim())
          
          if (lines.length > 0) {
            // 第一行作为表头
            const headers = lines[0].split(',').map(h => h.trim())
            conditionsColumns.value = headers.map(h => ({
              prop: h,
              label: h,
              minWidth: 120
            }))
            
            // 解析数据行
            conditionsData.value = lines.slice(1).map(line => {
              const values = line.split(',').map(v => v.trim())
              const row = {}
              headers.forEach((header, i) => {
                row[header] = values[i] || ''
              })
              return row
            })
          }
        }
        
        resolve()
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => reject(new Error('文件读取失败'))
    reader.readAsText(file)
  })
}

// 显示导入数据预览
const showImportDataPreview = () => {
  if (!uploadedFile.value) {
    ElMessage.warning('请先导入数据文件')
    return
  }
  showImportDataDialog.value = true
}

// 关闭导入数据预览
const handleImportDataClose = () => {
  showImportDataDialog.value = false
}

// 关闭导入弹窗
const closeImportDialog = () => {
  showImportDialog.value = false
}

// 开始评估
const startEvaluation = async () => {
  if (!uploadedFile.value) {
    ElMessage.warning('请先导入数据文件')
    return
  }
  
  evaluating.value = true
  
  try {
    // 模拟评估过程
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // 模拟评估结果
    evaluationResult.value = {
      overallLevel: 2,
      score: 87.5,
      details: [
        { name: '燃油消耗率', value: '195 g/kWh', level: 2 },
        { name: '热效率', value: '45.2%', level: 2 },
        { name: '排放指数', value: '0.85', level: 1 },
        { name: '运行稳定性', value: '92.5%', level: 1 }
      ]
    }
    
    ElMessage.success('能效评估完成')
  } catch (error) {
    ElMessage.error('评估失败: ' + error.message)
  } finally {
    evaluating.value = false
  }
}

// 获取等级类型
const getLevelType = (level) => {
  const levelMap = {
    1: 'success',
    2: '',
    3: 'warning',
    4: 'danger',
    5: 'danger'
  }
  return levelMap[level] || 'info'
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
  flex: 1;
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

/* 右侧评估面板 */
.assessment-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 4px;
}

.assessment-section {
  padding: 8px;
}

.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #e0e0e0;
  margin-bottom: 8px;
  padding-left: 8px;
  border-left: 3px solid #409eff;
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

.section-title {
  margin-top: 16px;
  margin-bottom: 8px;
}

.positive {
  color: #67c23a;
}

.negative {
  color: #f56c6c;
}

/* 导入文件上传组件样式 */
.upload-data-file {
  width: 100%;
}

.upload-data-file :deep(.el-upload-dragger) {
  background-color: rgba(255, 255, 255, 0.05) !important;
  border-color: rgba(255, 255, 255, 0.2) !important;
  border-radius: 4px;
  padding: 40px 20px;
}

.upload-data-file :deep(.el-upload-dragger:hover) {
  border-color: rgba(255, 255, 255, 0.3) !important;
}

.upload-data-file :deep(.el-icon--upload) {
  font-size: 67px;
  color: #409eff;
  margin-bottom: 16px;
}

.upload-data-file :deep(.el-upload__text) {
  color: #e0e0e0;
  font-size: 14px;
}

.upload-data-file :deep(.el-upload__text em) {
  color: #409eff;
  font-style: normal;
}

.upload-data-file :deep(.el-upload__tip) {
  color: #b0b0b0;
  font-size: 12px;
  margin-top: 8px;
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
