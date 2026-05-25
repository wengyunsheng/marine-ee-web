<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>查看设备参数 - {{ deviceType }}</h3>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <div class="view-section">
          <div class="view-item">
            <label>设备类型名称</label>
            <span>{{ deviceType }}</span>
          </div>
          <div class="view-item">
            <label>类别</label>
            <span class="device-category" :class="category">{{ category }}</span>
          </div>
          <div class="view-item">
            <label>参数数量</label>
            <span>{{ params.length }} 个参数</span>
          </div>
          <div class="view-item">
            <label>描述</label>
            <span>{{ description }}</span>
          </div>
        </div>
        
        <div class="params-section">
          <h4>参数列表</h4>
          
          <!-- 基本参数分组 -->
          <div class="param-group">
            <div class="group-header" @click="toggleGroup('basic')">
              <span class="group-icon">{{ expandedGroups.basic ? '▼' : '▶' }}</span>
              <span class="group-title">基本参数</span>
              <span class="group-count">{{ basicParams.length }} 项</span>
            </div>
            <div v-show="expandedGroups.basic" class="group-content">
              <table class="param-table">
                <thead>
                  <tr>
                    <th>参数名称</th>
                    <th>单位</th>
                    <th>默认值</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="param in basicParams" :key="param.id">
                    <td>{{ param.name }}</td>
                    <td>{{ param.unit }}</td>
                    <td>{{ param.defaultValue }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 工况消耗参数分组 -->
          <div class="param-group">
            <div class="group-header" @click="toggleGroup('workingCondition')">
              <span class="group-icon">{{ expandedGroups.workingCondition ? '▼' : '▶' }}</span>
              <span class="group-title">工况消耗参数</span>
              <span class="group-count">{{ workingConditionParams.length }} 项</span>
            </div>
            <div v-show="expandedGroups.workingCondition" class="group-content">
              <table class="param-table">
                <thead>
                  <tr>
                    <th>参数名称</th>
                    <th>单位</th>
                    <th>默认值</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="param in workingConditionParams" :key="param.id">
                    <td>{{ param.name }}</td>
                    <td>{{ param.unit }}</td>
                    <td>{{ param.defaultValue }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 其他参数分组 -->
          <div v-if="otherParams.length > 0" class="param-group">
            <div class="group-header" @click="toggleGroup('other')">
              <span class="group-icon">{{ expandedGroups.other ? '▼' : '▶' }}</span>
              <span class="group-title">其他参数</span>
              <span class="group-count">{{ otherParams.length }} 项</span>
            </div>
            <div v-show="expandedGroups.other" class="group-content">
              <table class="param-table">
                <thead>
                  <tr>
                    <th>参数名称</th>
                    <th>单位</th>
                    <th>默认值</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="param in otherParams" :key="param.id">
                    <td>{{ param.name }}</td>
                    <td>{{ param.unit }}</td>
                    <td>{{ param.defaultValue }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('close')">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Param {
  id: number
  name: string
  unit: string
  defaultValue: number
  minValue?: number
  maxValue?: number
}

interface Props {
  category: string
  deviceType: string
  description: string
  params: Param[]
}

const props = defineProps<Props>()
defineEmits(['close'])

const expandedGroups = ref({
  basic: true,
  workingCondition: true,
  other: true
})

const basicParamKeywords = ['额定转速', '额定功率', '主燃料低热值', '引燃燃料低热值', '引燃油低热值']

const basicParams = computed(() => {
  return props.params.filter(p => 
    basicParamKeywords.some(keyword => p.name.includes(keyword))
  )
})

const workingConditionParams = computed(() => {
  return props.params.filter(p => 
    p.name.includes('工况') || p.name.includes('%')
  )
})

const otherParams = computed(() => {
  const basicIds = new Set(basicParams.value.map(p => p.id))
  const workingConditionIds = new Set(workingConditionParams.value.map(p => p.id))
  return props.params.filter(p => 
    !basicIds.has(p.id) && !workingConditionIds.has(p.id)
  )
})

const toggleGroup = (groupName: 'basic' | 'workingCondition' | 'other') => {
  expandedGroups.value[groupName] = !expandedGroups.value[groupName]
}
</script>

<style scoped>
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
  max-width: 700px;
  max-height: 80vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
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
  padding: 20px;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #e2e8f0;
  background-color: #f8fafc;
}

.view-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e2e8f0;
}

.view-item {
  display: flex;
  margin-bottom: 12px;
}

.view-item:last-child {
  margin-bottom: 0;
}

.view-item label {
  width: 120px;
  font-weight: 500;
  color: #64748b;
  font-size: 14px;
}

.view-item span {
  flex: 1;
  font-size: 14px;
  color: #333;
}

.view-item span.device-category {
  flex: none;
}

.params-section {
  margin-top: 20px;
}

.params-section h4 {
  margin: 0 0 16px 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.param-group {
  margin-bottom: 12px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.group-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background-color: #f8fafc;
  cursor: pointer;
  transition: background-color 0.3s;
}

.group-header:hover {
  background-color: #f1f5f9;
}

.group-icon {
  font-size: 12px;
  color: #64748b;
  width: 16px;
}

.group-title {
  flex: 1;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
}

.group-count {
  font-size: 12px;
  color: #64748b;
  background-color: #e2e8f0;
  padding: 2px 8px;
  border-radius: 10px;
}

.group-content {
  padding: 0;
}

.param-table {
  width: 100%;
  border-collapse: collapse;
}

.param-table th {
  background-color: #fff;
  padding: 10px 16px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  border-bottom: 1px solid #e2e8f0;
}

.param-table td {
  padding: 10px 16px;
  font-size: 14px;
  color: #333;
  border-bottom: 1px solid #f1f5f9;
}

.param-table tr:hover {
  background-color: #f8fafc;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary {
  background-color: #e2e8f0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #cbd5e1;
}

@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    margin: 20px;
  }

  .modal-footer {
    flex-direction: column;
  }

  .modal-footer button {
    width: 100%;
  }
}

.device-category {
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
  white-space: nowrap;
  display: inline-block;
  width: fit-content;
}

.device-category.船用发动机 {
  background-color: #e3f2fd;
  color: #1976d2;
}

.device-category.船用齿轮箱 {
  background-color: #e8f5e8;
  color: #2e7d32;
}

.device-category.船用余热回收发电装置 {
  background-color: #fff3e0;
  color: #ef6c00;
}

.device-category.船用焚烧炉 {
  background-color: #ffebee;
  color: #c62828;
}

.device-category.船用碟式分离机 {
  background-color: #f3e5f5;
  color: #7b1fa2;
}

.device-category.船用压载水处理设备 {
  background-color: #e0f7fa;
  color: #00838f;
}

.device-category.船用锚绞机 {
  background-color: #fce4ec;
  color: #880e4f;
}

.device-category.船用吊机 {
  background-color: #e3f2fd;
  color: #0d47a1;
}

.device-category.船用发电机 {
  background-color: #fff8e1;
  color: #f57c00;
}

.device-category.船用空调机组 {
  background-color: #e1f5fe;
  color: #0288d1;
}

.device-category.船用冷水机组 {
  background-color: #e3f2fd;
  color: #1565c0;
}

.device-category.船用惰性气体系统 {
  background-color: #f3e5f5;
  color: #6a1b9a;
}

.device-category.船用二氧化碳捕集设备 {
  background-color: #c8e6c9;
  color: #2e7d32;
}

.device-category.船用推进器 {
  background-color: #fff3e0;
  color: #e65100;
}
</style>