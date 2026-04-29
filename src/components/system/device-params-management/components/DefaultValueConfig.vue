<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>默认值配置 - {{ deviceType }}</h3>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <div class="default-values-list">
          <div class="list-header">
            <span>参数列表</span>
            <button class="btn btn-sm btn-primary" @click="addNewParam">+ 新增参数</button>
          </div>
          
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
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="param in basicParams" :key="param.id">
                    <td>
                      <input 
                        type="text" 
                        v-model="param.name"
                        class="param-input"
                      >
                    </td>
                    <td>
                      <input 
                        type="text" 
                        v-model="param.unit"
                        class="param-input"
                      >
                    </td>
                    <td>
                      <input 
                        type="number" 
                        v-model.number="param.defaultValue"
                        class="param-input"
                      >
                    </td>
                    <td>
                      <button class="btn btn-sm btn-danger" @click="removeParam(param.id)">删除</button>
                    </td>
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
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="param in workingConditionParams" :key="param.id">
                    <td>
                      <input 
                        type="text" 
                        v-model="param.name"
                        class="param-input"
                      >
                    </td>
                    <td>
                      <input 
                        type="text" 
                        v-model="param.unit"
                        class="param-input"
                      >
                    </td>
                    <td>
                      <input 
                        type="number" 
                        v-model.number="param.defaultValue"
                        class="param-input"
                      >
                    </td>
                    <td>
                      <button class="btn btn-sm btn-danger" @click="removeParam(param.id)">删除</button>
                    </td>
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
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="param in otherParams" :key="param.id">
                    <td>
                      <input 
                        type="text" 
                        v-model="param.name"
                        class="param-input"
                      >
                    </td>
                    <td>
                      <input 
                        type="text" 
                        v-model="param.unit"
                        class="param-input"
                      >
                    </td>
                    <td>
                      <input 
                        type="number" 
                        v-model.number="param.defaultValue"
                        class="param-input"
                      >
                    </td>
                    <td>
                      <button class="btn btn-sm btn-danger" @click="removeParam(param.id)">删除</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="$emit('close')">关闭</button>
        <button class="btn btn-primary" @click="saveConfig">保存</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

interface Param {
  id: number
  name: string
  unit: string
  defaultValue: number
  minValue?: number
  maxValue?: number
}

interface Props {
  deviceType: string
  params: Param[]
}

const props = defineProps<Props>()
const emit = defineEmits(['close', 'save'])

const localParams = ref<Param[]>([])
const expandedGroups = ref({
  basic: true,
  workingCondition: true,
  other: true
})

watch(() => props.params, (newParams) => {
  localParams.value = JSON.parse(JSON.stringify(newParams))
}, { immediate: true })

const basicParamKeywords = ['额定转速', '额定功率', '主燃料低热值', '引燃燃料低热值', '引燃油低热值']

const basicParams = computed(() => {
  return localParams.value.filter(p => 
    basicParamKeywords.some(keyword => p.name.includes(keyword))
  )
})

const workingConditionParams = computed(() => {
  return localParams.value.filter(p => 
    p.name.includes('工况') || p.name.includes('%')
  )
})

const otherParams = computed(() => {
  const basicIds = new Set(basicParams.value.map(p => p.id))
  const workingConditionIds = new Set(workingConditionParams.value.map(p => p.id))
  return localParams.value.filter(p => 
    !basicIds.has(p.id) && !workingConditionIds.has(p.id)
  )
})

const toggleGroup = (groupName: 'basic' | 'workingCondition' | 'other') => {
  expandedGroups.value[groupName] = !expandedGroups.value[groupName]
}

const addNewParam = () => {
  const newId = localParams.value.length > 0 
    ? Math.max(...localParams.value.map(p => p.id)) + 1 
    : 1
    
  localParams.value.push({
    id: newId,
    name: '新参数',
    unit: '',
    defaultValue: 0,
    minValue: 0,
    maxValue: 100
  })
}

const removeParam = (paramId: number) => {
  if (localParams.value.length <= 1) {
    alert('至少需要保留一个参数')
    return
  }
  
  localParams.value = localParams.value.filter(p => p.id !== paramId)
}

const saveConfig = () => {
  emit('save', [...localParams.value])
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

.default-values-list {
  margin-top: 8px;
}

.list-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-size: 14px;
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

.param-input {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  box-sizing: border-box;
}

.param-input:focus {
  outline: none;
  border-color: #2563eb;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
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

.btn-primary {
  background-color: #2563eb;
  color: white;
}

.btn-primary:hover {
  background-color: #1d4ed8;
}

.btn-secondary {
  background-color: #e2e8f0;
  color: #333;
}

.btn-secondary:hover {
  background-color: #cbd5e1;
}

.btn-sm {
  padding: 6px 12px;
  font-size: 14px;
}

.btn-danger {
  background-color: #ef4444;
  color: white;
}

.btn-danger:hover {
  background-color: #dc2626;
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
</style>