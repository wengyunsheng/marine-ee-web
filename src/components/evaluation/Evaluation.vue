<template>
  <div class="energy-evaluation-container">
    <!-- 评估概览组件 -->
    <EvaluationOverview @start="startEval" />

    <!-- 评估任务列表组件 -->
    <EvaluationTaskList ref="taskListRef" />
  </div>

  <!-- 能效评估向导对话框 -->
  <EvalWizard 
    v-if="showWizard" 
    :global-state="globalState"
    @close="closeWizard" 
    @complete="completeEval"
    @switch-to-system="handleSwitchToSystem"
  />
</template>

<script setup>
import { ref } from 'vue'
import EvalWizard from './EvalWizard.vue'
import EvaluationOverview from './EvaluationOverview.vue'
import EvaluationTaskList from './EvaluationTaskList.vue'

const props = defineProps({
  globalState: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['navigate', 'evalComplete', 'switchToSystem'])

// 对话框状态
const showWizard = ref(false)

// 引用任务列表组件
const taskListRef = ref(null)

const startEval = () => {
  showWizard.value = true
}

const closeWizard = () => {
  showWizard.value = false
}

// 完成评估，添加任务到列表并同步到历史数据
const completeEval = (evalData) => {
  if (taskListRef.value) {
    taskListRef.value.addTask(evalData)
  }
  
  // 同步到历史数据（通过事件通知父组件）
  emit('evalComplete', {
    evalDate: new Date().toISOString().split('T')[0],
    deviceType: evalData.deviceClass,
    deviceName: evalData.deviceName,
    score: evalData.score,
    level: evalData.level,
    levelClass: evalData.levelClass.replace('level-', '')
  })
  
  closeWizard()
}

// 切换到系统管理
const handleSwitchToSystem = () => {
  emit('switchToSystem')
}
</script>

<style scoped>
.energy-evaluation-container {
  padding: 20px;
  height: 100%;
  min-height: calc(100vh - 120px);
  overflow-y: auto;
}

/* 响应式 */
@media (max-width: 768px) {
  .energy-evaluation-container {
    height: calc(100vh - 100px);
  }
}
</style>