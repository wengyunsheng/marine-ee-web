<template>
  <div class="data-display-section">
    <!-- 数据展示区域 -->
    <div class="data-display-wrapper">
      <!-- 发动机基本信息详情 -->
      <div v-if="deviceType === 'engine' && deviceInfo" class="assessment-section">
        <div class="subsection-title">基本信息</div>
        
        <!-- 使用 el-descriptions 展示详细信息 -->
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="品牌">{{ deviceInfo.brand || '-' }}</el-descriptions-item>
          <el-descriptions-item label="型号">{{ deviceInfo.model || '-' }}</el-descriptions-item>
          <el-descriptions-item label="气缸数">{{ deviceInfo.cylinderCount || '-' }}</el-descriptions-item>
          <el-descriptions-item label="缸径(mm)">{{ deviceInfo.cylinderBore || '-' }}</el-descriptions-item>
          <el-descriptions-item label="燃油类型">{{ deviceInfo.fuelType || '-' }}</el-descriptions-item>
          <el-descriptions-item label="燃油类型1">{{ deviceInfo.fuelType1 || '-' }}</el-descriptions-item>
          <el-descriptions-item label="热值(kJ/kg)">{{ deviceInfo.fuelType1CalorificValue || '-' }}</el-descriptions-item>
          <el-descriptions-item label="发动机用途">{{ deviceInfo.engineUsage || '-' }}</el-descriptions-item>
          <el-descriptions-item label="排放标准">{{ deviceInfo.emissionStandard || '-' }}</el-descriptions-item>
          <el-descriptions-item label="额定转速(rpm)">{{ deviceInfo.ratedSpeed || '-' }}</el-descriptions-item>
          <el-descriptions-item label="额定功率(kW)">{{ deviceInfo.ratedPower || '-' }}</el-descriptions-item>
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
      
      <!-- 已支持设备类型的通用无数据提示 -->
      <div v-if="deviceType && deviceInfo === null" class="empty-state">
        请选择设备查看详细信息
      </div>
      
      <!-- 其他设备类型的提示（暂未开发） -->
      <div v-if="deviceType && deviceType !== 'engine' && deviceType !== 'egcs' && deviceType !== 'inert-gas' && deviceType !== 'separator' && deviceType !== 'propeller' && deviceType !== 'chiller' && deviceType !== 'waste-heat' && deviceType !== 'ballast'" class="empty-state">
        该设备类型的数据展示功能暂未开发
      </div>
      
      <!-- EGCS 尾气处理装置信息展示 -->
      <div v-if="deviceType === 'egcs' && deviceInfo" class="assessment-section">
        <div class="subsection-title">基本信息</div>
        
        <!-- 使用 el-descriptions 展示详细信息 -->
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="品牌">{{ deviceInfo.brand || '-' }}</el-descriptions-item>
          <el-descriptions-item label="型号">{{ deviceInfo.model || '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="deviceInfo.deviceId === 46" label="类型">{{ deviceInfo.type || '-' }}</el-descriptions-item>
          <el-descriptions-item label="烟气量 (kg/h)">{{ deviceInfo.smokeFlowRate || '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="deviceInfo.deviceId === 46" label="脱硫效率(%)">{{ deviceInfo.removalEfficiency || '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="deviceInfo.deviceId === 47" label="脱硝效率(%)">{{ deviceInfo.removalEfficiency || '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="deviceInfo.deviceId === 46" label="SO₂去除量 (t/h)">{{ deviceInfo.removalAmount || '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="deviceInfo.deviceId === 47" label="NOx去除量 (kg/h)">{{ deviceInfo.removalAmount || '-' }}</el-descriptions-item>
          <el-descriptions-item label="功率(kW)">{{ deviceInfo.powerRating || '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="deviceInfo.deviceId === 46" label="能耗比 (kWh/t SOx)">{{ deviceInfo.energyConsumptionRatio || '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="deviceInfo.deviceId === 47" label="能耗比 (kWh/kg NOx)">{{ deviceInfo.energyConsumptionRatio || '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="deviceInfo.deviceId === 46" label="适用硫含量 (%)">{{ deviceInfo.sulfurContent || '-' }}</el-descriptions-item>
          <el-descriptions-item label="IMO合规性">{{ deviceInfo.imoCompliance || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      
      <!-- 惰性气体系统信息展示 -->
      <div v-if="deviceType === 'inert-gas' && deviceInfo" class="assessment-section">
        <div class="subsection-title">基本信息</div>
        
        <!-- 使用 el-descriptions 展示详细信息 -->
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="惰气流量(Nm3/h)">{{ deviceInfo.inertGasFlowRate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="燃料消耗 (kg/h)">{{ deviceInfo.fuelConsumption || '-' }}</el-descriptions-item>
          <el-descriptions-item label="风机电能消耗 (kW)">{{ deviceInfo.fanPowerConsumption || '-' }}</el-descriptions-item>
          <el-descriptions-item label="柴油发电机燃油消耗率 (g/kWh)">{{ deviceInfo.dieselGeneratorFuelRate || '-' }}</el-descriptions-item>
          <el-descriptions-item label="冷却海水消耗量 (m³/h)">{{ deviceInfo.coolingSeawaterConsumption || '-' }}</el-descriptions-item>
          <el-descriptions-item label="海水密度 (kg/m³)">{{ deviceInfo.seawaterDensity || '-' }}</el-descriptions-item>
          <el-descriptions-item label="冷却水泵扬程 (m)">{{ deviceInfo.coolingPumpHead || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      
      <!-- 碟式分离机信息展示 -->
      <div v-if="deviceType === 'separator' && deviceInfo" class="assessment-section">
        <div class="subsection-title">基本信息</div>
        
        <!-- 使用 el-descriptions 展示详细信息 -->
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="工作周期内消耗的电能 (kW·h)">{{ deviceInfo.energyConsumption || '-' }}</el-descriptions-item>
          <el-descriptions-item label="工作周期内分离的悬浮液(或乳浊液)体积 (m³)">{{ deviceInfo.separatedVolume || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      
      <!-- 船用推进器信息展示 -->
      <div v-if="deviceType === 'propeller' && deviceInfo" class="assessment-section">
        <div class="subsection-title">基本信息</div>
        
        <!-- 使用 el-descriptions 展示详细信息 -->
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="螺旋桨收到功率 (kW)">{{ deviceInfo.receivedPower || '-' }}</el-descriptions-item>
          <el-descriptions-item label="螺旋桨有效功率 (kW)">{{ deviceInfo.effectivePower || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      
      <!-- 船用冷水机组信息展示 -->
      <div v-if="deviceType === 'chiller' && deviceInfo" class="assessment-section">
        <div class="subsection-title">基本信息</div>
        
        <!-- 使用 el-descriptions 展示详细信息 -->
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="评估类型">{{ deviceInfo.evaluationType || '-' }}</el-descriptions-item>
          <el-descriptions-item label="型式">{{ deviceInfo.model || '-' }}</el-descriptions-item>
          <el-descriptions-item label="名义制冷量(kW)">{{ deviceInfo.nominalCoolingCapacity || '-' }}</el-descriptions-item>
          <el-descriptions-item label="实测制冷量(kW)">{{ deviceInfo.actualCoolingCapacity || '-' }}</el-descriptions-item>
          <el-descriptions-item label="实测输入总功率(kW)">{{ deviceInfo.inputPower || '-' }}</el-descriptions-item>
          <el-descriptions-item label="100%负荷时制冷量(kW)">{{ deviceInfo.load100CoolingCapacity || '-' }}</el-descriptions-item>
          <el-descriptions-item label="100%负荷时输入总功率(kW)">{{ deviceInfo.load100InputPower || '-' }}</el-descriptions-item>
          <el-descriptions-item label="75%负荷时制冷量(kW)">{{ deviceInfo.load75CoolingCapacity || '-' }}</el-descriptions-item>
          <el-descriptions-item label="75%负荷时输入总功率(kW)">{{ deviceInfo.load75InputPower || '-' }}</el-descriptions-item>
          <el-descriptions-item label="50%负荷时制冷量(kW)">{{ deviceInfo.load50CoolingCapacity || '-' }}</el-descriptions-item>
          <el-descriptions-item label="50%负荷时输入总功率(kW)">{{ deviceInfo.load50InputPower || '-' }}</el-descriptions-item>
          <el-descriptions-item label="25%负荷时制冷量(kW)">{{ deviceInfo.load25CoolingCapacity || '-' }}</el-descriptions-item>
          <el-descriptions-item label="25%负荷时输入总功率(kW)">{{ deviceInfo.load25InputPower || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      
      <!-- 船用余热装置信息展示 -->
      <div v-if="deviceType === 'waste-heat' && deviceInfo" class="assessment-section">
        <div class="subsection-title">基本信息</div>
        
        <!-- 使用 el-descriptions 展示详细信息 -->
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item v-if="deviceInfo.deviceId === 23" label="热源温度(℃)">{{ deviceInfo.heatSourceTemp || '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="deviceInfo.deviceId === 24" label="蒸汽压力(barg)">{{ deviceInfo.steamPressure || '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="deviceInfo.deviceId === 24" label="蒸汽类型">{{ deviceInfo.steamType || '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="deviceInfo.deviceId === 23" label="额定输出功率(kW)">{{ deviceInfo.ratedOutputPower || '-' }}</el-descriptions-item>
          <el-descriptions-item label="实测输出功率(kW)">{{ deviceInfo.actualOutputPower || '-' }}</el-descriptions-item>
          <el-descriptions-item label="消耗功率(kW)">{{ deviceInfo.consumptionPower || '-' }}</el-descriptions-item>
          <el-descriptions-item label="吸热量(kW)">{{ deviceInfo.heatAbsorption || '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="deviceInfo.deviceId === 23" label="热源质量流量(kg/s)">{{ deviceInfo.heatSourceMassFlow || '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="deviceInfo.deviceId === 23" label="热源进口温度(℃)">{{ deviceInfo.heatSourceInletTemp || '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="deviceInfo.deviceId === 23" label="热源出口温度(℃)">{{ deviceInfo.heatSourceOutletTemp || '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="deviceInfo.deviceId === 23"  label="比热容(J/(kg·℃))">{{ deviceInfo.specificHeatCapacity || '-' }}</el-descriptions-item>
          <el-descriptions-item v-if="deviceInfo.deviceId === 24" label="焓降(J/kg)">{{ deviceInfo.enthalpyDrop || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
      
      <!-- 船用压载水处理设备信息展示 -->
      <div v-if="deviceType === 'ballast' && deviceInfo" class="assessment-section">
        <div class="subsection-title">基本信息</div>
        
        <!-- 使用 el-descriptions 展示详细信息 -->
        <el-descriptions :column="2" border size="small">
          <el-descriptions-item label="处理方法类型">{{ deviceInfo.methodType || '-' }}</el-descriptions-item>
        </el-descriptions>
        
        <!-- EER1 - 淡水工况 -->
        <div class="subsection">
          <div class="subsection-title">EER1 - 淡水工况</div>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="压载平均电能(kW)">{{ deviceInfo.eer1FreshLoadPowerAvg || '-' }}</el-descriptions-item>
            <el-descriptions-item label="排载平均电能(kW)">{{ deviceInfo.eer1FreshDischargePowerAvg || '-' }}</el-descriptions-item>
            <el-descriptions-item label="压载平均流量(m³/h)">{{ deviceInfo.eer1FreshLoadFlowAvg || '-' }}</el-descriptions-item>
            <el-descriptions-item label="排载平均流量(m³/h)">{{ deviceInfo.eer1FreshDischargeFlowAvg || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>
        
        <!-- EER2 - 半咸水工况 -->
        <div class="subsection">
          <div class="subsection-title">EER2 - 半咸水工况</div>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="压载平均电能(kW)">{{ deviceInfo.eer2BrackishLoadPowerAvg || '-' }}</el-descriptions-item>
            <el-descriptions-item label="排载平均电能(kW)">{{ deviceInfo.eer2BrackishDischargePowerAvg || '-' }}</el-descriptions-item>
            <el-descriptions-item label="压载平均流量(m³/h)">{{ deviceInfo.eer2BrackishLoadFlowAvg || '-' }}</el-descriptions-item>
            <el-descriptions-item label="排载平均流量(m³/h)">{{ deviceInfo.eer2BrackishDischargeFlowAvg || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>
        
        <!-- EER3 - 海水工况 -->
        <div class="subsection">
          <div class="subsection-title">EER3 - 海水工况</div>
          <el-descriptions :column="2" border size="small">
            <el-descriptions-item label="压载平均电能(kW)">{{ deviceInfo.eer3SeawaterLoadPowerAvg || '-' }}</el-descriptions-item>
            <el-descriptions-item label="排载平均电能(kW)">{{ deviceInfo.eer3SeawaterDischargePowerAvg || '-' }}</el-descriptions-item>
            <el-descriptions-item label="压载平均流量(m³/h)">{{ deviceInfo.eer3SeawaterLoadFlowAvg || '-' }}</el-descriptions-item>
            <el-descriptions-item label="排载平均流量(m³/h)">{{ deviceInfo.eer3SeawaterDischargeFlowAvg || '-' }}</el-descriptions-item>
          </el-descriptions>
        </div>
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
          <el-descriptions-item label="能效等级">{{ deviceInfo.efficiencyLevel || '-' }}</el-descriptions-item>
          <el-descriptions-item label="能效指标">{{ deviceInfo.efficiencyIndex || '-' }}</el-descriptions-item>
          <el-descriptions-item label="能效基值">{{ deviceInfo.efficiencyBaseValue || '-' }}</el-descriptions-item>
        </el-descriptions>
      </div>
    </div>
  </div>
</template>

<script setup>

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
