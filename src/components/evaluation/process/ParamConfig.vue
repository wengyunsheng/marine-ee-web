<template>
  <div class="module">
    <div class="breadcrumb">
      <a href="#" @click.prevent>首页</a> > <a href="#" @click.prevent>能效评估</a> > <span>参数配置</span>
    </div>
    
    <div class="module-header">
      <h2>参数配置</h2>
      <div class="module-actions">
        <button class="btn btn-secondary" @click="backToDataLoad">返回数据加载</button>
        <button class="btn btn-secondary" @click="loadConfig">加载配置</button>
        <button class="btn btn-secondary" @click="saveConfig">保存配置</button>
      </div>
    </div>

    <div class="param-config-section">
      <div class="section-header">
        <h3>设备参数配置</h3>
        <p>请设置设备的基本参数和运行工况</p>
      </div>
      
      <div class="config-tabs">
        <button 
          v-for="device in selectedDevices" 
          :key="device.id"
          class="config-tab"
          :class="{ active: activeDevice === device.id }"
          @click="activeDevice = device.id"
        >
          {{ device.name }}
        </button>
      </div>

      <div v-for="device in selectedDevices" :key="device.id">
        <div class="device-params" v-if="activeDevice === device.id">
        <div class="params-grid">
          <div class="param-group">
            <h4>基本信息</h4>
            <div class="form-row">
              <div class="form-group">
                <label>设备品牌</label>
                <input type="text" v-model="deviceParams[device.id].brand" placeholder="输入设备品牌">
              </div>
              <div class="form-group">
                <label>设备型号</label>
                <input type="text" v-model="deviceParams[device.id].model" placeholder="输入设备型号">
              </div>
              <div class="form-group">
                <label>额定功率</label>
                <input type="number" v-model="deviceParams[device.id].ratedPower" placeholder="输入额定功率 (kW)">
              </div>
              <div class="form-group">
                <label>使用年限</label>
                <input type="number" v-model="deviceParams[device.id].serviceLife" placeholder="输入使用年限 (年)">
              </div>
            </div>
          </div>

          <div class="param-group">
            <h4>运行参数</h4>
            <div class="form-row">
              <div class="form-group">
                <label>运行负荷</label>
                <input type="number" v-model="deviceParams[device.id].load" placeholder="输入运行负荷 (%)">
              </div>
              <div class="form-group">
                <label>运行温度</label>
                <input type="number" v-model="deviceParams[device.id].temperature" placeholder="输入运行温度 (°C)">
              </div>
              <div class="form-group">
                <label>运行压力</label>
                <input type="number" v-model="deviceParams[device.id].pressure" placeholder="输入运行压力 (MPa)">
              </div>
              <div class="form-group">
                <label>运行转速</label>
                <input type="number" v-model="deviceParams[device.id].speed" placeholder="输入运行转速 (r/min)">
              </div>
            </div>
          </div>

          <div class="param-group">
            <h4>评估标准</h4>
            <div class="form-row">
              <div class="form-group">
                <label>适用标准</label>
                <select v-model="deviceParams[device.id].standard">
                  <option value="ISO 15550:2016">ISO 15550:2016</option>
                  <option value="GB/T 38999-2020">GB/T 38999-2020</option>
                  <option value="TSG G0003-2010">TSG G0003-2010</option>
                  <option value="GB/T 13006-2013">GB/T 13006-2013</option>
                  <option value="IMO EEXI标准">IMO EEXI标准</option>
                </select>
              </div>
              <div class="form-group">
                <label>评估模型</label>
                <select v-model="deviceParams[device.id].evalModel">
                  <option value="标准模型">标准模型</option>
                  <option value="自定义模型">自定义模型</option>
                  <option value="行业模型">行业模型</option>
                </select>
              </div>
              <div class="form-group">
                <label>评估周期</label>
                <select v-model="deviceParams[device.id].evalPeriod">
                  <option value="1天">1天</option>
                  <option value="1周">1周</option>
                  <option value="1月">1月</option>
                  <option value="3月">3月</option>
                  <option value="1年">1年</option>
                </select>
              </div>
              <div class="form-group">
                <label>数据采样率</label>
                <select v-model="deviceParams[device.id].sampleRate">
                  <option value="1秒">1秒</option>
                  <option value="5秒">5秒</option>
                  <option value="10秒">10秒</option>
                  <option value="30秒">30秒</option>
                  <option value="1分钟">1分钟</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>



      <div class="threshold-settings">
        <div class="section-header">
          <h3>能效等级阈值</h3>
          <p>设置各能效等级的得分阈值</p>
        </div>
        <div class="threshold-grid">
          <div class="threshold-item">
            <label>A级 (优秀)</label>
            <input type="number" v-model.number="thresholds.a" placeholder="输入阈值">
            <span>及以上</span>
          </div>
          <div class="threshold-item">
            <label>B级 (良好)</label>
            <input type="number" v-model.number="thresholds.b" placeholder="输入阈值">
            <span>及以上</span>
          </div>
          <div class="threshold-item">
            <label>C级 (一般)</label>
            <input type="number" v-model.number="thresholds.c" placeholder="输入阈值">
            <span>及以上</span>
          </div>
          <div class="threshold-item">
            <label>D级 (较差)</label>
            <input type="number" v-model.number="thresholds.d" placeholder="输入阈值">
            <span>及以上</span>
          </div>
          <div class="threshold-item">
            <label>E级 (差)</label>
            <span>低于</span>
            <input type="number" v-model.number="thresholds.e" placeholder="输入阈值">
          </div>
        </div>
      </div>

      <div class="config-presets">
        <div class="section-header">
          <h3>配置预设</h3>
          <p>选择预定义的配置方案</p>
        </div>
        <div class="preset-grid">
          <div 
            v-for="preset in presets" 
            :key="preset.id"
            class="preset-card"
            @click="applyPreset(preset.id)"
          >
            <div class="preset-icon">{{ preset.icon }}</div>
            <h4>{{ preset.name }}</h4>
            <p>{{ preset.description }}</p>
            <button class="btn btn-sm btn-primary">应用</button>
          </div>
        </div>
      </div>

      <div class="action-buttons">
        <button class="btn btn-secondary" @click="resetConfig">重置配置</button>
        <button class="btn btn-primary" @click="nextStep" :disabled="!canProceed">
          下一步: 执行评估
        </button>
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
.param-config-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.config-tabs {
  display: flex;
  gap: 12px;
  margin: 24px 0;
  border-bottom: 1px solid #e0e0e0;
}

.config-tab {
  padding: 12px 24px;
  background: white;
  border: 1px solid #e0e0e0;
  border-bottom: none;
  border-radius: 8px 8px 0 0;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
  font-weight: 500;
}

.config-tab:hover {
  background-color: #f8f9fa;
}

.config-tab.active {
  background-color: #3498db;
  color: white;
  border-color: #3498db;
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

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #666;
}

.form-group input,
.form-group select {
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3498db;
}

.evaluation-params {
  margin-bottom: 32px;
}

.weight-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 24px;
}

.weight-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.weight-info {
  width: 150px;
  display: flex;
  justify-content: space-between;
}

.weight-info label {
  font-size: 14px;
  font-weight: 500;
}

.weight-value {
  font-size: 14px;
  color: #666;
  min-width: 40px;
  text-align: right;
}

.weight-slider {
  flex: 1;
}

.weight-slider input {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #e0e0e0;
  outline: none;
  -webkit-appearance: none;
}

.weight-slider input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3498db;
  cursor: pointer;
}

.weight-slider input::-moz-range-thumb {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #3498db;
  cursor: pointer;
  border: none;
}

.weight-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #e0e0e0;
  margin-top: 16px;
}

.weight-error {
  color: #e74c3c;
  font-size: 14px;
}

.threshold-settings {
  margin-bottom: 32px;
}

.threshold-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
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

.threshold-item input {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  text-align: center;
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
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 24px;
}

.preset-card {
  padding: 20px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.preset-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  border-color: #3498db;
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
  .config-tabs {
    flex-wrap: wrap;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .weight-item {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .weight-info {
    width: 100%;
    justify-content: space-between;
  }
  
  .threshold-grid {
    grid-template-columns: 1fr;
  }
  
  .threshold-item {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .preset-grid {
    grid-template-columns: 1fr;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }
  
  .action-buttons .btn {
    width: 100%;
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