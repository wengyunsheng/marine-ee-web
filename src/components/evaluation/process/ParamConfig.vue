<template>
  <div class="param-config-container">
    <el-breadcrumb separator=">" class="breadcrumb">
      <el-breadcrumb-item><a href="#" @click.prevent>首页</a></el-breadcrumb-item>
      <el-breadcrumb-item><a href="#" @click.prevent>能效评估</a></el-breadcrumb-item>
      <el-breadcrumb-item>参数配置</el-breadcrumb-item>
    </el-breadcrumb>
    
    <div class="module-header">
      <h2>参数配置</h2>
      <div class="module-actions">
        <el-button @click="backToDataLoad">返回数据加载</el-button>
        <el-button @click="loadConfig">加载配置</el-button>
        <el-button @click="saveConfig">保存配置</el-button>
      </div>
    </div>

    <div class="param-config-section">
      <div class="section-header">
        <h3>设备参数配置</h3>
        <p>请设置设备的基本参数和运行工况</p>
      </div>
      
      <el-tabs v-model="activeDevice" class="config-tabs">
        <el-tab-pane 
          v-for="device in selectedDevices" 
          :key="device.id"
          :label="device.name"
          :name="device.id"
        />
      </el-tabs>

      <div v-for="device in selectedDevices" :key="device.id">
        <div class="device-params" v-if="activeDevice === device.id">
        <el-form label-width="100px">
          <div class="params-grid">
            <div class="param-group">
              <h4>基本信息</h4>
              <el-row :gutter="20">
                <el-col :xs="24" :sm="12" :md="6">
                  <el-form-item label="设备品牌">
                    <el-input v-model="deviceParams[device.id].brand" placeholder="输入设备品牌" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12" :md="6">
                  <el-form-item label="设备型号">
                    <el-input v-model="deviceParams[device.id].model" placeholder="输入设备型号" />
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12" :md="6">
                  <el-form-item label="额定功率">
                    <el-input-number v-model="deviceParams[device.id].ratedPower" :min="0" style="width: 100%">
                      <template #append>kW</template>
                    </el-input-number>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12" :md="6">
                  <el-form-item label="使用年限">
                    <el-input-number v-model="deviceParams[device.id].serviceLife" :min="0" style="width: 100%">
                      <template #append>年</template>
                    </el-input-number>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <div class="param-group">
              <h4>运行参数</h4>
              <el-row :gutter="20">
                <el-col :xs="24" :sm="12" :md="6">
                  <el-form-item label="运行负荷">
                    <el-input-number v-model="deviceParams[device.id].load" :min="0" :max="100" style="width: 100%">
                      <template #append>%</template>
                    </el-input-number>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12" :md="6">
                  <el-form-item label="运行温度">
                    <el-input-number v-model="deviceParams[device.id].temperature" style="width: 100%">
                      <template #append>°C</template>
                    </el-input-number>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12" :md="6">
                  <el-form-item label="运行压力">
                    <el-input-number v-model="deviceParams[device.id].pressure" :min="0" style="width: 100%">
                      <template #append>MPa</template>
                    </el-input-number>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12" :md="6">
                  <el-form-item label="运行转速">
                    <el-input-number v-model="deviceParams[device.id].speed" :min="0" style="width: 100%">
                      <template #append>r/min</template>
                    </el-input-number>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>

            <div class="param-group">
              <h4>评估标准</h4>
              <el-row :gutter="20">
                <el-col :xs="24" :sm="12" :md="6">
                  <el-form-item label="适用标准">
                    <el-select v-model="deviceParams[device.id].standard" style="width: 100%">
                      <el-option value="ISO 15550:2016" label="ISO 15550:2016" />
                      <el-option value="GB/T 38999-2020" label="GB/T 38999-2020" />
                      <el-option value="TSG G0003-2010" label="TSG G0003-2010" />
                      <el-option value="GB/T 13006-2013" label="GB/T 13006-2013" />
                      <el-option value="IMO EEXI标准" label="IMO EEXI标准" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12" :md="6">
                  <el-form-item label="评估模型">
                    <el-select v-model="deviceParams[device.id].evalModel" style="width: 100%">
                      <el-option value="标准模型" label="标准模型" />
                      <el-option value="自定义模型" label="自定义模型" />
                      <el-option value="行业模型" label="行业模型" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12" :md="6">
                  <el-form-item label="评估周期">
                    <el-select v-model="deviceParams[device.id].evalPeriod" style="width: 100%">
                      <el-option value="1天" label="1天" />
                      <el-option value="1周" label="1周" />
                      <el-option value="1月" label="1月" />
                      <el-option value="3月" label="3月" />
                      <el-option value="1年" label="1年" />
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :xs="24" :sm="12" :md="6">
                  <el-form-item label="数据采样率">
                    <el-select v-model="deviceParams[device.id].sampleRate" style="width: 100%">
                      <el-option value="1秒" label="1秒" />
                      <el-option value="5秒" label="5秒" />
                      <el-option value="10秒" label="10秒" />
                      <el-option value="30秒" label="30秒" />
                      <el-option value="1分钟" label="1分钟" />
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </div>
        </el-form>
        </div>
      </div>



      <div class="threshold-settings">
        <div class="section-header">
          <h3>能效等级阈值</h3>
          <p>设置各能效等级的得分阈值</p>
        </div>
        <el-row :gutter="16" class="threshold-grid">
          <el-col :xs="24" :sm="12" :md="4">
            <div class="threshold-item">
              <label>A级 (优秀)</label>
              <el-input-number v-model.number="thresholds.a" :min="0" :max="100" style="width: 100%" />
              <span>及以上</span>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="4">
            <div class="threshold-item">
              <label>B级 (良好)</label>
              <el-input-number v-model.number="thresholds.b" :min="0" :max="100" style="width: 100%" />
              <span>及以上</span>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="4">
            <div class="threshold-item">
              <label>C级 (一般)</label>
              <el-input-number v-model.number="thresholds.c" :min="0" :max="100" style="width: 100%" />
              <span>及以上</span>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="4">
            <div class="threshold-item">
              <label>D级 (较差)</label>
              <el-input-number v-model.number="thresholds.d" :min="0" :max="100" style="width: 100%" />
              <span>及以上</span>
            </div>
          </el-col>
          <el-col :xs="24" :sm="12" :md="4">
            <div class="threshold-item">
              <label>E级 (差)</label>
              <span>低于</span>
              <el-input-number v-model.number="thresholds.e" :min="0" :max="100" style="width: 100%" />
            </div>
          </el-col>
        </el-row>
      </div>

      <div class="config-presets">
        <div class="section-header">
          <h3>配置预设</h3>
          <p>选择预定义的配置方案</p>
        </div>
        <el-row :gutter="16" class="preset-grid">
          <el-col :xs="24" :sm="12" :md="6" v-for="preset in presets" :key="preset.id">
            <el-card shadow="hover" class="preset-card" @click="applyPreset(preset.id)">
              <div class="preset-icon">{{ preset.icon }}</div>
              <h4>{{ preset.name }}</h4>
              <p>{{ preset.description }}</p>
              <el-button type="primary" size="small">应用</el-button>
            </el-card>
          </el-col>
        </el-row>
      </div>

      <div class="action-buttons">
        <el-button @click="resetConfig">重置配置</el-button>
        <el-button type="primary" @click="nextStep" :disabled="!canProceed">
          下一步: 执行评估
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const emit = defineEmits(['navigate'])

const activeDevice = ref('main-engine')
const selectedDevices = ref([
  { id: 'main-engine', name: '主机系统' },
  { id: 'aux-engine', name: '辅机系统' },
  { id: 'boiler', name: '锅炉系统' }
])

const deviceParams = ref({
  'main-engine': {
    brand: 'MAN B&W',
    model: '6S70MC',
    ratedPower: 12000,
    serviceLife: 8,
    load: 85,
    temperature: 85,
    pressure: 3.5,
    speed: 100,
    standard: 'ISO 15550:2016',
    evalModel: '标准模型',
    evalPeriod: '1月',
    sampleRate: '10秒'
  },
  'aux-engine': {
    brand: 'Cummins',
    model: 'QSK60',
    ratedPower: 2000,
    serviceLife: 5,
    load: 65,
    temperature: 75,
    pressure: 2.8,
    speed: 1500,
    standard: 'GB/T 38999-2020',
    evalModel: '标准模型',
    evalPeriod: '1月',
    sampleRate: '10秒'
  },
  'boiler': {
    brand: 'Alfa Laval',
    model: 'Aalborg',
    ratedPower: 5000,
    serviceLife: 10,
    load: 70,
    temperature: 180,
    pressure: 1.0,
    speed: 0,
    standard: 'TSG G0003-2010',
    evalModel: '标准模型',
    evalPeriod: '1月',
    sampleRate: '10秒'
  }
})



const thresholds = ref({
  a: 90,
  b: 80,
  c: 70,
  d: 60,
  e: 60
})

const presets = ref([
  {
    id: 1,
    name: '标准配置',
    icon: '⚙️',
    description: '适用于大多数设备的标准评估配置'
  },
  {
    id: 2,
    name: '节能优化',
    icon: '💡',
    description: '注重节能效果的评估配置'
  },
  {
    id: 3,
    name: '排放控制',
    icon: '🌱',
    description: '注重排放指标的评估配置'
  },
  {
    id: 4,
    name: '成本效益',
    icon: '💰',
    description: '注重成本效益的评估配置'
  }
])

const applyPreset = (presetId) => {
  // 模拟应用预设
  alert(`应用预设: ${presets.value.find(p => p.id === presetId)?.name}`)
}

const saveConfig = () => {
  // 模拟保存配置
  alert('配置已保存')
}

const loadConfig = () => {
  // 模拟加载配置
  alert('加载配置')
}

const resetConfig = () => {
  // 重置配置到默认值
  thresholds.value = {
    a: 90,
    b: 80,
    c: 70,
    d: 60,
    e: 60
  }
  alert('配置已重置')
}

const canProceed = computed(() => {
  return true
})

const nextStep = () => {
  // 跳转到执行评估页面
  emit('navigate', 'eval-result')
}

const backToDataLoad = () => {
  // 返回数据加载页面
  emit('navigate', 'data-load')
}
</script>

<style scoped>
.param-config-container {
  padding: 20px;
}

.breadcrumb {
  margin-bottom: 16px;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.module-header h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1e293b;
}

.module-actions {
  display: flex;
  gap: 12px;
}

.param-config-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.section-header {
  margin-bottom: 24px;
}

.section-header h3 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.section-header p {
  margin: 0;
  color: #64748b;
  font-size: 14px;
}

.config-tabs {
  margin: 24px 0;
}

.device-params {
  margin-bottom: 32px;
}

.params-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.param-group {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.param-group h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.threshold-settings {
  margin-bottom: 32px;
}

.threshold-grid {
  margin-top: 24px;
}

.threshold-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.threshold-item label {
  font-size: 14px;
  font-weight: 500;
  min-width: 80px;
}

.threshold-item span {
  font-size: 14px;
  color: #666;
  min-width: 40px;
}

.config-presets {
  margin-bottom: 32px;
}

.preset-grid {
  margin-top: 24px;
}

.preset-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 100%;
}

.preset-card:hover {
  transform: translateY(-2px);
}

.preset-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.preset-card h4 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
}

.preset-card p {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.4;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }
  
  .action-buttons :deep(.el-button) {
    width: 100%;
  }
  
  .threshold-item {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
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