<template>
  <div class="energy-evaluation-container">
    <!-- 评估概览组件 -->
    <EvaluationOverview />

    <!-- 评估流程指南 -->
    <el-card class="process-guide">
      <template #header>
        <h3>能效评估流程指南</h3>
      </template>
      <el-steps :active="0" finish-status="success" align-center>
        <el-step title="选择设备" description="选择待评估的设备类型，支持15类船用核心设备。" />
        <el-step title="配置参数" description="设置评估标准和参数，配置设备品牌、型号、技术参数等。" />
        <el-step title="加载数据" description="上传或选择评估数据，支持多种数据来源。" />
        <el-step title="执行评估与分析" description="系统自动调用15类专业能效计算模型，深度分析能效数据，生成多维度对比报告。" />
      </el-steps>
      <div class="process-action">
        <el-button type="primary" size="large" @click="startEval">开始评估</el-button>
      </div>
    </el-card>

    <!-- 评估任务列表组件 -->
    <EvaluationTaskList ref="taskListRef" />
  </div>

  <!-- 能效评估向导对话框 -->
  <EvalWizard v-if="showWizard" @close="closeWizard" @complete="completeEval" />
</template>

<script setup>
import { ref } from 'vue'
import EvalWizard from './EvalWizard.vue'
import EvaluationOverview from './EvaluationOverview.vue'
import EvaluationTaskList from './EvaluationTaskList.vue'

const emit = defineEmits(['navigate', 'evalComplete'])

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
</script>

<style scoped>
.energy-evaluation-container {
  padding: 20px;
  height: 100%;
  min-height: calc(100vh - 120px);
  overflow-y: auto;
}

.process-guide {
  margin-bottom: 24px;
}

.process-guide :deep(.el-card__header) {
  padding: 16px 20px;
}

.process-guide h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.process-action {
  text-align: center;
  margin-top: 24px;
}

/* 响应式 */
@media (max-width: 768px) {
  .energy-evaluation-container {
    height: calc(100vh - 100px);
  }
}
</style>