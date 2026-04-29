<template>
  <div class="module">
    <div class="breadcrumb">
      <a href="#" @click.prevent>首页</a> > <a href="#" @click.prevent>能效评估</a> > <span>设备选择</span>
    </div>
    
    <div class="module-header">
      <h2>设备选择</h2>
      <div class="module-actions">
        <button class="btn btn-secondary" @click="backToOverview">返回概览</button>
      </div>
    </div>

    <div class="device-selection">
      <div class="section-header">
        <h3>选择评估设备</h3>
        <p>请从以下15类船用核心设备中选择需要评估的设备类型</p>
      </div>
      
      <div class="device-grid">
        <div 
          v-for="device in devices" 
          :key="device.id"
          class="device-card"
          :class="{ selected: selectedDevices.includes(device.id) }"
          @click="toggleDevice(device.id)"
        >
          <div class="device-icon">{{ device.icon }}</div>
          <div class="device-info">
            <h4>{{ device.name }}</h4>
            <p>{{ device.description }}</p>
            <div class="device-specs">
              <span class="spec-item">标准: {{ device.standard }}</span>
              <span class="spec-item">模型: {{ device.modelCount }}个</span>
            </div>
          </div>
          <div class="device-checkbox">
            <input 
              type="checkbox" 
              :id="'device-' + device.id"
              :checked="selectedDevices.includes(device.id)"
              @change="toggleDevice(device.id)"
            >
            <label :for="'device-' + device.id"></label>
          </div>
        </div>
      </div>

      <div class="selection-summary">
        <div class="summary-info">
          <span>已选择 {{ selectedDevices.length }} 个设备</span>
          <span v-if="selectedDevices.length > 0">
            包含: {{ getSelectedDeviceNames().join(', ') }}
          </span>
        </div>
        <div class="summary-actions">
          <button class="btn btn-secondary" @click="clearSelection">清空选择</button>
          <button class="btn btn-primary" @click="nextStep" :disabled="selectedDevices.length === 0">
            下一步: 数据加载
          </button>
        </div>
      </div>
    </div>

    <div class="device-categories">
      <div class="section-header">
        <h3>设备分类</h3>
      </div>
      <div class="category-tabs">
        <button 
          v-for="category in categories" 
          :key="category.id"
          class="category-tab"
          :class="{ active: activeCategory === category.id }"
          @click="filterByCategory(category.id)"
        >
          {{ category.name }}
        </button>
      </div>
      <div class="category-info" v-if="activeCategoryInfo">
        <h4>{{ activeCategoryInfo.name }}</h4>
        <p>{{ activeCategoryInfo.description }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['navigate'])

const selectedDevices = ref([])
const activeCategory = ref('all')

const devices = ref([
  {
    id: 'main-engine',
    name: '主机系统',
    icon: '🚢',
    description: '船舶主推进动力系统',
    standard: 'ISO 15550:2016',
    modelCount: 8,
    category: 'propulsion'
  },
  {
    id: 'aux-engine',
    name: '辅机系统',
    icon: '⚙️',
    description: '船舶辅助发电系统',
    standard: 'GB/T 38999-2020',
    modelCount: 6,
    category: 'power'
  },
  {
    id: 'boiler',
    name: '锅炉系统',
    icon: '🔥',
    description: '船舶蒸汽发生系统',
    standard: 'TSG G0003-2010',
    modelCount: 4,
    category: 'heating'
  },
  {
    id: 'pump',
    name: '泵组系统',
    icon: '💦',
    description: '船舶流体输送系统',
    standard: 'GB/T 13006-2013',
    modelCount: 12,
    category: 'fluid'
  },
  {
    id: 'cooling',
    name: '冷却系统',
    icon: '❄️',
    description: '船舶设备冷却系统',
    standard: 'IMO EEXI标准',
    modelCount: 5,
    category: 'cooling'
  },
  {
    id: 'air-conditioning',
    name: '空调系统',
    icon: '🌡️',
    description: '船舶环境控制系统',
    standard: 'GB/T 19413-2018',
    modelCount: 3,
    category: 'env'
  },
  {
    id: 'generator',
    name: '发电机组',
    icon: '⚡',
    description: '船舶电力生成系统',
    standard: 'IEC 60034-1',
    modelCount: 7,
    category: 'power'
  },
  {
    id: 'compressor',
    name: '压缩机系统',
    icon: '🔄',
    description: '船舶压缩空气系统',
    standard: 'ISO 1217:2016',
    modelCount: 4,
    category: 'air'
  },
  {
    id: 'propeller',
    name: '螺旋桨系统',
    icon: '🚤',
    description: '船舶推进器系统',
    standard: 'ISO 484-1:2017',
    modelCount: 5,
    category: 'propulsion'
  },
  {
    id: 'rudder',
    name: '舵机系统',
    icon: '🧭',
    description: '船舶 steering系统',
    standard: 'ISO 11613:2016',
    modelCount: 3,
    category: 'control'
  },
  {
    id: 'fuel',
    name: '燃油系统',
    icon: '⛽',
    description: '船舶燃油输送与管理系统',
    standard: 'ISO 8217:2017',
    modelCount: 6,
    category: 'fuel'
  },
  {
    id: 'lubrication',
    name: '润滑系统',
    icon: '⚙️',
    description: '船舶设备润滑系统',
    standard: 'ISO 6743-6:2017',
    modelCount: 4,
    category: 'maintenance'
  },
  {
    id: 'exhaust',
    name: '排气系统',
    icon: '☁️',
    description: '船舶废气处理系统',
    standard: 'IMO Tier III',
    modelCount: 3,
    category: 'emission'
  },
  {
    id: 'freshwater',
    name: '淡水系统',
    icon: '💧',
    description: '船舶淡水生成与管理系统',
    standard: 'ISO 10497:2012',
    modelCount: 2,
    category: 'fluid'
  },
  {
    id: 'sewage',
    name: '污水系统',
    icon: '🚿',
    description: '船舶污水处理系统',
    standard: 'IMO MEPC.227(64)',
    modelCount: 3,
    category: 'environmental'
  }
])

const categories = ref([
  { id: 'all', name: '全部', description: '所有船用核心设备' },
  { id: 'propulsion', name: '推进系统', description: '船舶推进相关设备' },
  { id: 'power', name: '电力系统', description: '船舶电力生成与分配设备' },
  { id: 'heating', name: '热力系统', description: '船舶热力相关设备' },
  { id: 'fluid', name: '流体系统', description: '船舶流体输送与处理设备' },
  { id: 'cooling', name: '冷却系统', description: '船舶设备冷却相关设备' },
  { id: 'env', name: '环境系统', description: '船舶环境控制设备' },
  { id: 'air', name: '空气系统', description: '船舶压缩空气设备' },
  { id: 'control', name: '控制系统', description: '船舶控制相关设备' },
  { id: 'fuel', name: '燃油系统', description: '船舶燃油管理设备' },
  { id: 'maintenance', name: '维护系统', description: '船舶设备维护相关设备' },
  { id: 'emission', name: '排放系统', description: '船舶废气处理设备' },
  { id: 'environmental', name: '环保系统', description: '船舶环保相关设备' }
])

const filteredDevices = computed(() => {
  if (activeCategory.value === 'all') {
    return devices.value
  }
  return devices.value.filter(device => device.category === activeCategory.value)
})

const activeCategoryInfo = computed(() => {
  return categories.value.find(cat => cat.id === activeCategory.value)
})

const toggleDevice = (deviceId) => {
  const index = selectedDevices.value.indexOf(deviceId)
  if (index > -1) {
    selectedDevices.value.splice(index, 1)
  } else {
    selectedDevices.value.push(deviceId)
  }
}

const getSelectedDeviceNames = () => {
  return selectedDevices.value.map(id => {
    const device = devices.value.find(d => d.id === id)
    return device ? device.name : ''
  })
}

const clearSelection = () => {
  selectedDevices.value = []
}

const nextStep = () => {
  // 跳转到数据加载页面
  emit('navigate', 'data-load')
}

const backToOverview = () => {
  // 返回评估概览页面
  emit('navigate', 'eval-overview')
}

const filterByCategory = (categoryId) => {
  activeCategory.value = categoryId
}
</script>

<style scoped>
.device-selection {
  background: white;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.device-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
  margin: 24px 0;
}

.device-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  display: flex;
  flex-direction: column;
}

.device-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  border-color: #2563eb;
}

.device-card.selected {
  border-color: #2563eb;
  background-color: #eff6ff;
}

.device-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.device-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
}

.device-info p {
  margin: 0 0 12px 0;
  color: #666;
  font-size: 14px;
}

.device-specs {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
  margin-top: auto;
}

.device-checkbox {
  position: absolute;
  top: 16px;
  right: 16px;
}

.device-checkbox input {
  width: 18px;
  height: 18px;
}

.selection-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid #e0e0e0;
}

.summary-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.summary-actions {
  display: flex;
  gap: 12px;
}

.device-categories {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.category-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 20px 0;
}

.category-tab {
  padding: 8px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.category-tab:hover {
  border-color: #2563eb;
  color: #2563eb;
}

.category-tab.active {
  background-color: #2563eb;
  color: white;
  border-color: #2563eb;
}

.category-info {
  margin-top: 16px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.category-info h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
}

.category-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .device-grid {
    grid-template-columns: 1fr;
  }
  
  .selection-summary {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .summary-actions {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .category-tabs {
    justify-content: center;
  }
  
  .module-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .module-actions {
    width: 100%;
    flex-wrap: wrap;
  }
}
</style>