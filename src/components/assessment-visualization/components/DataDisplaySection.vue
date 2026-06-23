<template>
  <div class="data-display-section">
    <!-- 数据展示区域 -->
    <div class="data-display-wrapper">
      <!-- 发动机基本信息详情 -->
      <div v-if="deviceType === 'engine' && deviceInfo" class="assessment-section">
        <div class="subsection-title">基本信息</div>
        
        <!-- 使用 el-descriptions 展示详细信息 -->
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="品牌">{{ deviceInfo.brand }}</el-descriptions-item>
          <el-descriptions-item label="型号">{{ deviceInfo.model }}</el-descriptions-item>
          <el-descriptions-item label="气缸数">{{ deviceInfo.cylinderCount }}</el-descriptions-item>
          <el-descriptions-item label="缸径(mm)">{{ deviceInfo.cylinderBore }}</el-descriptions-item>
          <el-descriptions-item label="燃油类型">{{ deviceInfo.fuelType }}</el-descriptions-item>
          <el-descriptions-item label="燃油类型1">{{ deviceInfo.fuelType1 }}</el-descriptions-item>
          <el-descriptions-item label="热值(kJ/kg)">{{ deviceInfo.fuelType1CalorificValue }}</el-descriptions-item>
          <el-descriptions-item label="发动机用途">{{ deviceInfo.engineUsage }}</el-descriptions-item>
          <el-descriptions-item label="排放标准">{{ deviceInfo.emissionStandard }}</el-descriptions-item>
          <el-descriptions-item label="额定转速(rpm)">{{ deviceInfo.ratedSpeed }}</el-descriptions-item>
          <el-descriptions-item label="额定功率(kW)">{{ deviceInfo.ratedPower }}</el-descriptions-item>
        </el-descriptions>

        <!-- 测试条件展示 -->
        <div v-if="deviceInfo.testCondition" class="subsection">
          <div class="subsection-title">测试条件</div>
          <el-descriptions :column="3" border size="small">
            <el-descriptions-item label="环境温度(℃)">{{ deviceInfo.testCondition.ambientTemp || '-' }}</el-descriptions-item>
            <el-descriptions-item label="环境湿度(%)">{{ deviceInfo.testCondition.ambientHumidity || '-' }}</el-descriptions-item>
            <el-descriptions-item label="环境压力(kPa)">{{ deviceInfo.testCondition.ambientPressure || '-' }}</el-descriptions-item>
            <el-descriptions-item label="排气温度(℃)">{{ deviceInfo.testCondition.exhaustTemp || '-' }}</el-descriptions-item>
            <el-descriptions-item label="冷却水进口温度(℃)">{{ deviceInfo.testCondition.coolantInlet || '-' }}</el-descriptions-item>
            <el-descriptions-item label="冷却水出口温度(℃)">{{ deviceInfo.testCondition.coolantOutlet || '-' }}</el-descriptions-item>
            <el-descriptions-item label="润滑油温度(℃)">{{ deviceInfo.testCondition.lubeOilTemp || '-' }}</el-descriptions-item>
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
      </div>
      
      <!-- 无数据提示 -->
      <div v-if="deviceType === 'engine' && !deviceInfo" class="empty-state">
        请选择发动机查看详细信息
      </div>
      
      <!-- 其他设备类型的提示（暂未开发） -->
      <div v-if="deviceType && deviceType !== 'engine' && deviceType !== 'egcs' && deviceType !== 'inert-gas'" class="empty-state">
        该设备类型的数据展示功能暂未开发
      </div>
      
      <!-- EGCS 尾气处理装置信息展示 -->
      <div v-if="deviceType === 'egcs' && deviceInfo" class="assessment-section">
        <div class="subsection-title">基本信息</div>
        
        <!-- 使用 el-descriptions 展示详细信息 -->
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="品牌">{{ deviceInfo.brand || '-' }}</el-descriptions-item>
          <el-descriptions-item label="型号">{{ deviceInfo.model || '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="showDesulfurization" label="类型">{{ deviceInfo.type || '-' }}</el-descriptions-item>
          <el-descriptions-item label="烟气量 (kg/h)">{{ deviceInfo.smokeFlowRate || '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="showDesulfurization" label="脱硫效率(%)">{{ deviceInfo.removalEfficiency !== undefined ? deviceInfo.removalEfficiency.toFixed(2) + '%' : '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="showDenitrification" label="脱硝效率(%)">{{ deviceInfo.removalEfficiency !== undefined ? deviceInfo.removalEfficiency.toFixed(2) + '%' : '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="showDesulfurization" label="SO₂去除量 (t/h)">{{ deviceInfo.removalAmount !== undefined ? deviceInfo.removalAmount.toFixed(2) : '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="showDenitrification" label="NOx去除量 (kg/h)">{{ deviceInfo.removalAmount !== undefined ? deviceInfo.removalAmount.toFixed(2) : '-' }}</el-descriptions-item>
          <el-descriptions-item label="功率(kW)">{{ deviceInfo.powerRating || '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="showDesulfurization" label="能耗比 (kWh/t SOx)">{{ deviceInfo.energyConsumptionRatio !== undefined ? deviceInfo.energyConsumptionRatio.toFixed(2) : '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="showDenitrification" label="能耗比 (kWh/kg NOx)">{{ deviceInfo.energyConsumptionRatio !== undefined ? deviceInfo.energyConsumptionRatio.toFixed(2) : '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="showDesulfurization" label="适用硫含量 (%)">{{ deviceInfo.sulfurContent || '-' }}</el-descriptions-item>
          <el-descriptions-item label="IMO合规性">{{ deviceInfo.imoCompliance || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      
      <!-- EGCS 无数据提示 -->
      <div v-if="deviceType === 'egcs' && !deviceInfo" class="empty-state">
        请选择EGCS设备查看详细信息
      </div>
      
      <!-- 惰性气体系统信息展示 -->
      <div v-if="deviceType === 'inert-gas' && deviceInfo" class="assessment-section">
        <div class="subsection-title">基本信息</div>
        
        <!-- 使用 el-descriptions 展示详细信息 -->
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="惰气流量(Nm3/h)">{{ deviceInfo.inertGasFlowRate !== undefined ? deviceInfo.inertGasFlowRate.toFixed(2) : '-' }}</el-descriptions-item>
          <el-descriptions-item label="燃料消耗 (kg/h)">{{ deviceInfo.fuelConsumption !== undefined ? deviceInfo.fuelConsumption.toFixed(2) : '-' }}</el-descriptions-item>
          <el-descriptions-item label="风机电能消耗 (kW)">{{ deviceInfo.fanPowerConsumption !== undefined ? deviceInfo.fanPowerConsumption.toFixed(2) : '-' }}</el-descriptions-item>
          <el-descriptions-item label="柴油发电机燃油消耗率 (g/kWh)">{{ deviceInfo.dieselGeneratorFuelRate !== undefined ? deviceInfo.dieselGeneratorFuelRate.toFixed(2) : '-' }}</el-descriptions-item>
          <el-descriptions-item label="冷却海水消耗量 (m³/h)">{{ deviceInfo.coolingSeawaterConsumption !== undefined ? deviceInfo.coolingSeawaterConsumption.toFixed(2) : '-' }}</el-descriptions-item>
          <el-descriptions-item label="海水密度 (kg/m³)">{{ deviceInfo.seawaterDensity !== undefined ? deviceInfo.seawaterDensity.toFixed(2) : '-' }}</el-descriptions-item>
          <el-descriptions-item label="冷却水泵扬程 (m)">{{ deviceInfo.coolingPumpHead !== undefined ? deviceInfo.coolingPumpHead.toFixed(2) : '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      
      <!-- 惰性气体系统无数据提示 -->
      <div v-if="deviceType === 'inert-gas' && !deviceInfo" class="empty-state">
        请选择惰性气体系统设备查看详细信息
      </div>
      
      <!-- 公共评估结果展示（所有设备类型通用） -->
      <div v-if="deviceInfo && deviceType !== ''" class="assessment-section">
        <div class="subsection-title">评估结果</div>
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="评估结果" v-if="deviceInfo.passed !== undefined">
            <el-tag :type="deviceInfo.passed ? 'success' : 'danger'" size="small">
              {{ deviceInfo.passed ? '通过' : '未通过' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="能效等级">
            {{ deviceInfo.efficiencyLevel !== undefined ? deviceInfo.efficiencyLevel + '级' : '-' }}
          </el-descriptions-item>
          <el-descriptions-item label="能效指标">{{ deviceInfo.efficiencyIndex !== undefined ? deviceInfo.efficiencyIndex.toFixed(2) + '%' : '-' }}</el-descriptions-item>
          <el-descriptions-item label="能效基值">{{ deviceInfo.efficiencyBaseValue !== undefined ? deviceInfo.efficiencyBaseValue.toFixed(2) : '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'

const props = defineProps({
  // 设备类型（parentCode 或 code）
  deviceType: {
    type: String,
    default: ''
  },
  // 设备详细信息（单条）
  deviceInfo: {
    type: Object,
    default: null
  },
  // 工况数据列表
  performanceCurves: {
    type: Array,
    default: () => []
  },
  // 设备编码（用于判断展示脱硫还是脱硝字段）
  deviceCode: {
    type: String,
    default: ''
  }
})

// 获取能效等级标签类型
const getLevelTagType = (level) => {
  if (!level) return 'info'
  if (level === 1) return 'success'
  if (level === 2) return 'warning'
  return 'danger'
}

// 判断是否显示脱硫数据（根据设备编码）
const showDesulfurization = computed(() => {
  // egcs-01 是脱硫设备
  return props.deviceCode === 'egcs-01'
})

// 判断是否显示脱硝数据（根据设备编码）
const showDenitrification = computed(() => {
  // egcs-02 是脱硝设备
  return props.deviceCode === 'egcs-02'
})

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

/* 修改 el-descriptions 的 label 字体样式，与表格表头保持一致 */
:deep(.el-descriptions__label) {
  color: #e0e0e0 !important;
  font-weight: 600 !important;
}
</style>
