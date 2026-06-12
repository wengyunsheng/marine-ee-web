<template>
  <div class="data-display-section">
    <!-- 数据展示区域 -->
    <div class="data-display-wrapper">
      <!-- 发动机基本信息详情 -->
      <div v-if="deviceType === 'engine' && engineInfo" class="assessment-section">
        <div class="subsection-title">基本信息</div>
        
        <!-- 使用 el-descriptions 展示详细信息 -->
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="品牌">{{ engineInfo.brand }}</el-descriptions-item>
          <el-descriptions-item label="型号">{{ engineInfo.model }}</el-descriptions-item>
          <el-descriptions-item label="气缸数">{{ engineInfo.cylinderCount }}</el-descriptions-item>
          <el-descriptions-item label="缸径(mm)">{{ engineInfo.cylinderBore }}</el-descriptions-item>
          <el-descriptions-item label="燃油类型">{{ engineInfo.fuelType }}</el-descriptions-item>
          <el-descriptions-item label="燃油类型1">{{ engineInfo.fuelType1 }}</el-descriptions-item>
          <el-descriptions-item label="热值(kJ/kg)">{{ engineInfo.fuelType1CalorificValue }}</el-descriptions-item>
          <el-descriptions-item label="发动机用途">{{ engineInfo.engineUsage }}</el-descriptions-item>
          <el-descriptions-item label="排放标准">{{ engineInfo.emissionStandard }}</el-descriptions-item>
          <el-descriptions-item label="额定转速(rpm)">{{ engineInfo.ratedSpeed }}</el-descriptions-item>
          <el-descriptions-item label="额定功率(kW)">{{ engineInfo.ratedPower }}</el-descriptions-item>
        </el-descriptions>

        <!-- 测试条件展示 -->
        <div v-if="engineInfo.testCondition" class="subsection">
          <div class="subsection-title">测试条件</div>
          <el-descriptions :column="3" border size="small">
            <el-descriptions-item label="环境温度(℃)">{{ engineInfo.testCondition.ambientTemp || '-' }}</el-descriptions-item>
            <el-descriptions-item label="环境湿度(%)">{{ engineInfo.testCondition.ambientHumidity || '-' }}</el-descriptions-item>
            <el-descriptions-item label="环境压力(kPa)">{{ engineInfo.testCondition.ambientPressure || '-' }}</el-descriptions-item>
            <el-descriptions-item label="排气温度(℃)">{{ engineInfo.testCondition.exhaustTemp || '-' }}</el-descriptions-item>
            <el-descriptions-item label="冷却水进口温度(℃)">{{ engineInfo.testCondition.coolantInlet || '-' }}</el-descriptions-item>
            <el-descriptions-item label="冷却水出口温度(℃)">{{ engineInfo.testCondition.coolantOutlet || '-' }}</el-descriptions-item>
            <el-descriptions-item label="润滑油温度(℃)">{{ engineInfo.testCondition.lubeOilTemp || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 工况数据展示 -->
        <div v-if="performanceCurves && performanceCurves.length > 0" class="subsection">
          <div class="subsection-title">工况数据</div>
          <el-table :data="performanceCurves" border size="small" max-height="300">
            <el-table-column type="index" label="序号" width="60" align="center" />
            <el-table-column prop="loadFactor" label="负荷因子" width="100" align="center">
              <template #default="{ row }">
                {{ (row.loadFactor * 100).toFixed(0) }}%
              </template>
            </el-table-column>
            <el-table-column prop="power" label="功率(kW)" width="110" align="center" />
            <el-table-column prop="speed" label="转速(rpm)" width="110" align="center" />
            <el-table-column prop="bsfc" label="燃油消耗率(g/kWh)" width="150" align="center" />
            <el-table-column prop="bspc" label="燃气消耗率(g/kWh)" width="160" align="center" />
            <el-table-column prop="bsgc" label="燃气消耗率(g/kWh)" width="160" align="center" />
            <el-table-column prop="bsec" label="能量消耗率(kJ/kWh)" width="140" align="center" />
          </el-table>
        </div>

        <!-- 评估结果展示 -->
        <div class="subsection">
          <div class="subsection-title">评估结果</div>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="评估结果">
              <el-tag v-if="engineInfo.passed !== undefined" :type="engineInfo.passed ? 'success' : 'danger'" size="small">
                {{ engineInfo.passed ? '通过' : '未通过' }}
              </el-tag>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="能效等级">
              <el-tag v-if="engineInfo.efficiencyLevel" :type="getLevelTagType(engineInfo.efficiencyLevel)" size="small">
                {{ engineInfo.efficiencyLevel }}级
              </el-tag>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="能效指标">{{ engineInfo.efficiencyIndex !== undefined ? engineInfo.efficiencyIndex.toFixed(2) + '%' : '-' }}</el-descriptions-item>
            <el-descriptions-item label="能效基值">{{ engineInfo.efficiencyBaseValue !== undefined ? engineInfo.efficiencyBaseValue + '%' : '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>
      </div>
      
      <!-- 无数据提示 -->
      <div v-if="deviceType === 'engine' && !engineInfo" class="empty-state">
        请选择发动机查看详细信息
      </div>
      
      <!-- 其他设备类型的提示（暂未开发） -->
      <div v-if="deviceType && deviceType !== 'engine'" class="empty-state">
        该设备类型的数据展示功能暂未开发
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  // 设备类型（parentCode 或 code）
  deviceType: {
    type: String,
    default: ''
  },
  // 发动机详细信息（单条）
  engineInfo: {
    type: Object,
    default: null
  },
  // 工况数据列表
  performanceCurves: {
    type: Array,
    default: () => []
  }
})

// 获取能效等级标签类型
const getLevelTagType = (level) => {
  if (!level) return 'info'
  if (level === 1) return 'success'
  if (level === 2) return 'warning'
  return 'danger'
}
</script>

<style scoped>
.data-display-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  height: 100%;
  min-height: 0; /* 允许 flex 子元素收缩 */
}

/* 数据展示包装器 */
.data-display-wrapper {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  min-height: 0; /* 允许滚动 */
}

/* 通用空状态样式 */
.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: rgba(148, 163, 184, 0.7);
  font-size: 14px;
}

/* 子区域样式 */
.subsection {
  margin-top: 16px;
}

.subsection-title {
  font-size: 14px;
  font-weight: 600;
  color: #409eff;
  margin-bottom: 8px;
  padding-left: 8px;
  border-left: 3px solid #409eff;
}
</style>
