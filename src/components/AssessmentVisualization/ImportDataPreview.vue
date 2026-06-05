<template>
  <el-dialog
    v-model="visible"
    :title="`导入数据预览 - ${fileName || ''}`"
    width="80%"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="import-data-preview" v-loading="loading">
      <!-- 数据统计信息 -->
      <div class="data-summary" v-if="!loading && parsedData.length > 0">
        <el-alert
          :title="`共 ${parsedData.length} 条数据, ${Object.keys(parsedData[0] || {}).length} 个字段`"
          type="info"
          :closable="false"
          show-icon
        />
      </div>

      <!-- 数据表格 -->
      <div class="data-table-wrapper" v-if="!loading && parsedData.length > 0">
        <el-table
          :data="parsedData"
          style="width: 100%"
          border
          stripe
          max-height="500"
        >
          <el-table-column type="index" label="序号" width="60" align="center" />
          
          <el-table-column
            v-for="col in columns"
            :key="col"
            :prop="col"
            :label="col"
            min-width="120"
            align="center"
            show-overflow-tooltip
          />
        </el-table>
      </div>

      <!-- 无数据提示 -->
      <el-empty
        v-if="!loading && parsedData.length === 0"
        description="暂无数据"
      />
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  fileData: {
    type: Object,
    default: null
  },
  fileName: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue', 'close'])

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const loading = ref(false)
const parsedData = ref([])
const columns = ref([])

// 监听弹窗打开,解析数据
const handleOpen = async () => {
  if (!props.fileData) {
    ElMessage.warning('没有可预览的数据')
    return
  }

  loading.value = true
  try {
    // 解析文件数据
    await parseFileData(props.fileData)
  } catch (error) {
    ElMessage.error('数据解析失败: ' + error.message)
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 解析文件数据
const parseFileData = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      try {
        const content = e.target.result
        
        // 根据文件类型解析
        if (file.name.endsWith('.csv')) {
          parseCSV(content)
        } else if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
          parseExcel(content)
        } else {
          reject(new Error('不支持的文件格式'))
        }
        
        resolve()
      } catch (error) {
        reject(error)
      }
    }
    
    reader.onerror = () => {
      reject(new Error('文件读取失败'))
    }
    
    reader.readAsText(file)
  })
}

// 解析CSV文件
const parseCSV = (content) => {
  const lines = content.split('\n').filter(line => line.trim())
  
  if (lines.length === 0) {
    parsedData.value = []
    columns.value = []
    return
  }

  // 第一行作为表头
  const headers = lines[0].split(',').map(h => h.trim())
  columns.value = headers

  // 解析数据行
  parsedData.value = lines.slice(1).map((line, index) => {
    const values = line.split(',').map(v => v.trim())
    const row = {}
    headers.forEach((header, i) => {
      row[header] = values[i] || ''
    })
    return row
  })
}

// 解析Excel文件(简化版,实际项目建议使用 SheetJS 等库)
const parseExcel = (content) => {
  // TODO: 实际项目中需要使用 xlsx 或 sheetjs 库来解析 Excel
  // 这里提供一个简单的占位实现
  ElMessage.warning('Excel文件解析功能待实现,请使用CSV格式')
  parsedData.value = []
  columns.value = []
}

const handleClose = () => {
  visible.value = false
  parsedData.value = []
  columns.value = []
  emit('close')
}

// 暴露方法供父组件调用
defineExpose({
  handleOpen
})
</script>

<style scoped>
.import-data-preview {
  min-height: 200px;
}

.data-summary {
  margin-bottom: 16px;
}

.data-table-wrapper {
  overflow-x: auto;
}

:deep(.el-table) {
  font-size: 13px;
}

:deep(.el-table th) {
  font-weight: 600;
}
</style>
