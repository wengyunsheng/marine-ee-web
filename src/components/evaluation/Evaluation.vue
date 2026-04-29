<template>
  <div class="energy-evaluation-container">
    <div class="page-header">
      <h3>能效评估</h3>
    </div>

    <!-- 评估概览组件 -->
    <EvaluationOverview />

    <div class="process-guide">
      <div class="section-header">
        <h3>能效评估流程指南</h3>
      </div>
      <div class="process-steps">
        <div class="process-step">
          <div class="step-number">1</div>
          <div class="step-content">
            <h4>选择设备</h4>
            <p>选择待评估的设备类型，支持15类船用核心设备。</p>
          </div>
        </div>
        <div class="process-step">
          <div class="step-number">2</div>
          <div class="step-content">
            <h4>配置参数</h4>
            <p>设置评估标准和参数，配置设备品牌、型号、技术参数等。</p>
          </div>
        </div>
        <div class="process-step">
          <div class="step-number">3</div>
          <div class="step-content">
            <h4>加载数据</h4>
            <p>上传或选择评估数据，支持多种数据来源。</p>
          </div>
        </div>
        <div class="process-step">
          <div class="step-number">4</div>
          <div class="step-content">
            <h4>执行评估与分析</h4>
            <p>系统自动调用15类专业能效计算模型，深度分析能效数据，生成多维度对比报告。</p>
          </div>
        </div>
      </div>
      <div class="process-action">
        <button class="btn btn-primary" @click="startEval">开始评估</button>
      </div>
    </div>

    <!-- 评估任务列表组件 -->
    <EvaluationTaskList ref="taskListRef" />
  </div>

  <!-- 能效评估向导模态框 -->
  <div v-if="showWizard" class="modal-overlay" @click="closeWizard">
    <div class="modal-content wizard-modal" @click.stop>
      <EvalWizard @close="closeWizard" @complete="completeEval" />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import EvalWizard from './EvalWizard.vue'
import EvaluationOverview from './EvaluationOverview.vue'
import EvaluationTaskList from './EvaluationTaskList.vue'

const emit = defineEmits(['navigate'])

// 模态框状态
const showWizard = ref(false)

// 引用任务列表组件
const taskListRef = ref(null)

const startEval = () => {
  showWizard.value = true
  document.body.style.overflow = 'hidden' // 禁用背景页面滚动
}

const closeWizard = () => {
  showWizard.value = false
  document.body.style.overflow = 'auto' // 恢复背景页面滚动
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
  height: calc(100vh - 120px);
  overflow-y: auto;
  display: block;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
}

.page-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

/* 评估流程指南样式 */
.process-guide {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
  border: 1px solid #e2e8f0;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.process-steps {
  display: flex;
  justify-content: space-between;
  align-items: stretch;
  gap: 16px;
  position: relative;
  margin-top: 20px;
}

.process-step {
  flex: 1;
  position: relative;
  display: flex;
  flex-direction: column;
  padding: 16px;
  background-color: #f8fafc;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid #e2e8f0;
}

.process-step:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transform: translateY(-2px);
}

.step-number {
  position: absolute;
  left: 16px;
  top: -12px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: #2563eb;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
  z-index: 2;
}

.step-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
}

.step-content h4 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.step-content p {
  flex: 1;
  margin-bottom: 0;
  font-size: 14px;
  line-height: 1.4;
  color: #666;
}

.process-action {
  text-align: center;
  margin-top: 24px;
}

.process-action .btn {
  height: 40px;
  padding: 0 32px;
  font-size: 16px;
  font-weight: 600;
}

/* 按钮样式 */
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

/* 模态框样式 */
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
  max-width: 1200px;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 响应式模态框 */
@media (max-width: 768px) {
  .modal-content {
    width: 95%;
    max-height: 95vh;
  }
  
  .process-steps {
    flex-direction: column;
    gap: 20px;
  }
  
  .process-step {
    padding: 20px;
  }
  
  .step-number {
    left: 20px;
  }
  
  .energy-evaluation-container {
    height: calc(100vh - 100px);
  }
}

.wizard-modal {
  width: 95%;
  max-width: 1000px;
  max-height: 95vh;
}
</style>