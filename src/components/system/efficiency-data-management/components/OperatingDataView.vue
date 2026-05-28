<template>
  <el-dialog v-model="visible" title="工况数据" width="900px" @close="$emit('close')">
    <div v-if="data" class="operating-data-content">
      <!-- 工况参数 -->
      <el-table :data="operatingParams" border stripe style="width: 100%;">
        <el-table-column prop="name" label="参数名称" min-width="200" />
        <el-table-column prop="value" label="运行值" min-width="150">
          <template #default="scope">
            {{ scope.row.value }}
          </template>
        </el-table-column>
        <el-table-column prop="unit" label="单位" width="120" />
        <el-table-column label="参考范围" min-width="180">
          <template #default="scope">
            <span v-if="scope.row.minValue != null && scope.row.maxValue != null">
              {{ scope.row.minValue }} ~ {{ scope.row.maxValue }}
            </span>
            <span v-else>-</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <template #footer>
      <el-button type="primary" @click="$emit('close')">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: {
    type: Object,
    default: null
  },
  models: {
    type: Array,
    default: () => []
  }
})

defineEmits(['close'])

const visible = computed(() => !!props.data)

const modelDeviceType = computed(() => {
  if (!props.data?.modelId) return ''
  const model = props.models.find(m => m.id === props.data.modelId)
  return model ? model.deviceType : ''
})

// 设备参数模板（与设备参数管理模块完全一致，覆盖所有26种设备类型）
const paramTemplates = {
  // ===== 船用发动机 =====
  '船用柴油发动机（低速机）': [
    { name: '额定功率', unit: 'kW', defaultValue: 15000, minValue: 0, maxValue: 30000 },
    { name: '额定转速', unit: 'r/min', defaultValue: 100, minValue: 50, maxValue: 150 },
    { name: '主燃料低热值', unit: 'kJ/kg', defaultValue: 42700, minValue: 40000, maxValue: 45000 },
    { name: '25%工况下燃油消耗率', unit: 'g/kWh', defaultValue: 180, minValue: 150, maxValue: 250 },
    { name: '50%工况下燃油消耗率', unit: 'g/kWh', defaultValue: 170, minValue: 140, maxValue: 230 },
    { name: '75%工况下燃油消耗率', unit: 'g/kWh', defaultValue: 165, minValue: 130, maxValue: 220 },
    { name: '100%工况下燃油消耗率', unit: 'g/kWh', defaultValue: 175, minValue: 140, maxValue: 240 }
  ],
  '船用柴油发动机（中速机）': [
    { name: '额定功率', unit: 'kW', defaultValue: 2000, minValue: 500, maxValue: 5000 },
    { name: '额定转速', unit: 'r/min', defaultValue: 1500, minValue: 1000, maxValue: 2000 },
    { name: '主燃料低热值', unit: 'kJ/kg', defaultValue: 42700, minValue: 40000, maxValue: 45000 },
    { name: '25%工况下燃油消耗率', unit: 'g/kWh', defaultValue: 200, minValue: 160, maxValue: 280 },
    { name: '50%工况下燃油消耗率', unit: 'g/kWh', defaultValue: 190, minValue: 150, maxValue: 260 },
    { name: '75%工况下燃油消耗率', unit: 'g/kWh', defaultValue: 185, minValue: 140, maxValue: 250 },
    { name: '100%工况下燃油消耗率', unit: 'g/kWh', defaultValue: 195, minValue: 150, maxValue: 270 }
  ],
  '船用LNG/柴油双燃料发动机（低速机）': [
    { name: '额定功率', unit: 'kW', defaultValue: 15000, minValue: 0, maxValue: 30000 },
    { name: '额定转速', unit: 'r/min', defaultValue: 100, minValue: 50, maxValue: 150 },
    { name: '主燃料低热值', unit: 'kJ/kg', defaultValue: 50000, minValue: 48000, maxValue: 52000 },
    { name: '引燃油低热值', unit: 'kJ/kg', defaultValue: 42700, minValue: 40000, maxValue: 45000 },
    { name: '25%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 150, minValue: 120, maxValue: 200 },
    { name: '25%工况下引燃油消耗率', unit: 'g/kWh', defaultValue: 10, minValue: 5, maxValue: 20 },
    { name: '50%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 140, minValue: 110, maxValue: 190 },
    { name: '50%工况下引燃油消耗率', unit: 'g/kWh', defaultValue: 8, minValue: 4, maxValue: 15 },
    { name: '75%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 135, minValue: 105, maxValue: 185 },
    { name: '75%工况下引燃油消耗率', unit: 'g/kWh', defaultValue: 7, minValue: 3, maxValue: 12 },
    { name: '100%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 145, minValue: 115, maxValue: 195 },
    { name: '100%工况下引燃油消耗率', unit: 'g/kWh', defaultValue: 9, minValue: 4, maxValue: 16 }
  ],
  '船用LNG/柴油双燃料发动机（中速机）': [
    { name: '额定功率', unit: 'kW', defaultValue: 2000, minValue: 500, maxValue: 5000 },
    { name: '额定转速', unit: 'r/min', defaultValue: 1500, minValue: 1000, maxValue: 2000 },
    { name: '主燃料低热值', unit: 'kJ/kg', defaultValue: 50000, minValue: 48000, maxValue: 52000 },
    { name: '引燃油低热值', unit: 'kJ/kg', defaultValue: 42700, minValue: 40000, maxValue: 45000 },
    { name: '25%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 170, minValue: 130, maxValue: 220 },
    { name: '25%工况下引燃油消耗率', unit: 'g/kWh', defaultValue: 12, minValue: 6, maxValue: 24 },
    { name: '50%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 160, minValue: 120, maxValue: 210 },
    { name: '50%工况下引燃油消耗率', unit: 'g/kWh', defaultValue: 10, minValue: 5, maxValue: 20 },
    { name: '75%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 155, minValue: 115, maxValue: 205 },
    { name: '75%工况下引燃油消耗率', unit: 'g/kWh', defaultValue: 9, minValue: 4, maxValue: 18 },
    { name: '100%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 165, minValue: 125, maxValue: 215 },
    { name: '100%工况下引燃油消耗率', unit: 'g/kWh', defaultValue: 11, minValue: 5, maxValue: 22 }
  ],
  '船用甲醇/柴油双燃料发动机（低速机）': [
    { name: '额定功率', unit: 'kW', defaultValue: 15000, minValue: 0, maxValue: 30000 },
    { name: '额定转速', unit: 'r/min', defaultValue: 100, minValue: 50, maxValue: 150 },
    { name: '主燃料低热值', unit: 'kJ/kg', defaultValue: 19900, minValue: 19000, maxValue: 21000 },
    { name: '引燃油低热值', unit: 'kJ/kg', defaultValue: 42700, minValue: 40000, maxValue: 45000 },
    { name: '25%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 350, minValue: 300, maxValue: 400 },
    { name: '25%工况下引燃油消耗率', unit: 'g/kWh', defaultValue: 15, minValue: 8, maxValue: 25 },
    { name: '50%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 330, minValue: 280, maxValue: 380 },
    { name: '50%工况下引燃油消耗率', unit: 'g/kWh', defaultValue: 12, minValue: 6, maxValue: 20 },
    { name: '75%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 320, minValue: 270, maxValue: 370 },
    { name: '75%工况下引燃油消耗率', unit: 'g/kWh', defaultValue: 10, minValue: 5, maxValue: 18 },
    { name: '100%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 340, minValue: 290, maxValue: 390 },
    { name: '100%工况下引燃油消耗率', unit: 'g/kWh', defaultValue: 13, minValue: 7, maxValue: 22 }
  ],
  '船用甲醇/柴油双燃料发动机（中速机）': [
    { name: '额定功率', unit: 'kW', defaultValue: 2000, minValue: 500, maxValue: 5000 },
    { name: '额定转速', unit: 'r/min', defaultValue: 1500, minValue: 1000, maxValue: 2000 },
    { name: '主燃料低热值', unit: 'kJ/kg', defaultValue: 19900, minValue: 19000, maxValue: 21000 },
    { name: '引燃油低热值', unit: 'kJ/kg', defaultValue: 42700, minValue: 40000, maxValue: 45000 },
    { name: '25%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 380, minValue: 330, maxValue: 430 },
    { name: '25%工况下引燃油消耗率', unit: 'g/kWh', defaultValue: 18, minValue: 9, maxValue: 30 },
    { name: '50%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 360, minValue: 310, maxValue: 410 },
    { name: '50%工况下引燃油消耗率', unit: 'g/kWh', defaultValue: 15, minValue: 7, maxValue: 25 },
    { name: '75%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 350, minValue: 300, maxValue: 400 },
    { name: '75%工况下引燃油消耗率', unit: 'g/kWh', defaultValue: 13, minValue: 6, maxValue: 22 },
    { name: '100%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 370, minValue: 320, maxValue: 420 },
    { name: '100%工况下引燃油消耗率', unit: 'g/kWh', defaultValue: 16, minValue: 8, maxValue: 28 }
  ],
  // ===== 船用齿轮箱 =====
  '单台齿轮箱': [
    { name: '输入扭矩', unit: 'Nm', defaultValue: 50000, minValue: 10000, maxValue: 200000 },
    { name: '输入转速', unit: 'r/min', defaultValue: 1000, minValue: 500, maxValue: 3000 },
    { name: '输入功率', unit: 'kW', defaultValue: 5000, minValue: 100, maxValue: 50000 },
    { name: '输出扭矩', unit: 'Nm', defaultValue: 48000, minValue: 9000, maxValue: 190000 },
    { name: '输出转速', unit: 'r/min', defaultValue: 950, minValue: 400, maxValue: 2800 },
    { name: '输出功率', unit: 'kW', defaultValue: 4800, minValue: 90, maxValue: 48000 }
  ],
  '两台齿轮箱': [
    { name: '输入扭矩', unit: 'Nm', defaultValue: 50000, minValue: 10000, maxValue: 200000 },
    { name: '输出扭矩', unit: 'Nm', defaultValue: 48000, minValue: 9000, maxValue: 190000 }
  ],
  // ===== 船用余热回收发电装置 =====
  '船用有机朗肯循环发电装置': [
    { name: '实测输出功率', unit: 'kW', defaultValue: 200, minValue: 50, maxValue: 500 },
    { name: '实测消耗功率', unit: 'kW', defaultValue: 20, minValue: 5, maxValue: 100 },
    { name: '热源质量流量', unit: 'kg/s', defaultValue: 5, minValue: 1, maxValue: 20 },
    { name: '热源进口温度', unit: '℃', defaultValue: 120, minValue: 80, maxValue: 200 },
    { name: '热源出口温度', unit: '℃', defaultValue: 60, minValue: 30, maxValue: 100 },
    { name: '热源介质比热容', unit: 'J/(kg·℃)', defaultValue: 4200, minValue: 3000, maxValue: 5000 }
  ],
  '船用蒸汽透平发电装置': [
    { name: '实测输出功率', unit: 'kW', defaultValue: 300, minValue: 50, maxValue: 1000 },
    { name: '实测消耗功率', unit: 'kW', defaultValue: 30, minValue: 5, maxValue: 100 },
    { name: '热源质量流量', unit: 'kg/s', defaultValue: 5, minValue: 1, maxValue: 20 },
    { name: '等熵焓降', unit: 'J/kg', defaultValue: 500000, minValue: 200000, maxValue: 1000000 }
  ],
  // ===== 船用焚烧炉 =====
  '单功能焚烧炉（固体废弃物）': [
    { name: '固体废弃物进料量', unit: 'kg/h', defaultValue: 100, minValue: 10, maxValue: 500 },
    { name: '固体废弃物低位发热值', unit: 'kJ/kg', defaultValue: 15000, minValue: 10000, maxValue: 25000 },
    { name: '助燃燃料消耗量', unit: 'kg/h', defaultValue: 50, minValue: 10, maxValue: 200 },
    { name: '助燃燃料低位发热值', unit: 'kJ/kg', defaultValue: 42700, minValue: 40000, maxValue: 45000 },
    { name: '用电设备功率消耗', unit: 'kW', defaultValue: 30, minValue: 5, maxValue: 100 },
    { name: '设备运行时间', unit: 'h', defaultValue: 24, minValue: 1, maxValue: 24 }
  ],
  '单功能焚烧炉（污油泥）': [
    { name: '污油泥(含水率20%)进料量', unit: 'kg/h', defaultValue: 100, minValue: 10, maxValue: 500 },
    { name: '污油泥(含水率20%)低位发热值', unit: 'kJ/kg', defaultValue: 15000, minValue: 10000, maxValue: 25000 },
    { name: '助燃燃料消耗量', unit: 'kg/h', defaultValue: 50, minValue: 10, maxValue: 200 },
    { name: '助燃燃料低位发热值', unit: 'kJ/kg', defaultValue: 42700, minValue: 40000, maxValue: 45000 },
    { name: '用电设备功率消耗', unit: 'kW', defaultValue: 30, minValue: 5, maxValue: 100 },
    { name: '设备运行时间', unit: 'h', defaultValue: 24, minValue: 1, maxValue: 24 }
  ],
  '双功能焚烧炉': [
    { name: '固体废弃物进料量', unit: 'kg/h', defaultValue: 100, minValue: 10, maxValue: 500 },
    { name: '固体废弃物低位发热值', unit: 'kJ/kg', defaultValue: 15000, minValue: 10000, maxValue: 25000 },
    { name: '污油泥(含水率20%)进料量', unit: 'kg/h', defaultValue: 80, minValue: 10, maxValue: 400 },
    { name: '污油泥(含水率20%)低位发热值', unit: 'kJ/kg', defaultValue: 15000, minValue: 10000, maxValue: 25000 },
    { name: '助燃燃料消耗量', unit: 'kg/h', defaultValue: 50, minValue: 10, maxValue: 200 },
    { name: '助燃燃料低位发热值', unit: 'kJ/kg', defaultValue: 42700, minValue: 40000, maxValue: 45000 },
    { name: '用电设备功率消耗', unit: 'kW', defaultValue: 30, minValue: 5, maxValue: 100 },
    { name: '设备运行时间', unit: 'h', defaultValue: 24, minValue: 1, maxValue: 24 }
  ],
  '多功能焚烧炉': [
    { name: '固体废弃物进料量', unit: 'kg/h', defaultValue: 100, minValue: 10, maxValue: 500 },
    { name: '固体废弃物低位发热值', unit: 'kJ/kg', defaultValue: 15000, minValue: 10000, maxValue: 25000 },
    { name: '污油泥(含水率20%)进料量', unit: 'kg/h', defaultValue: 80, minValue: 10, maxValue: 400 },
    { name: '污油泥(含水率20%)低位发热值', unit: 'kJ/kg', defaultValue: 15000, minValue: 10000, maxValue: 25000 },
    { name: '受污染水进料量', unit: 'kg/h', defaultValue: 50, minValue: 5, maxValue: 300 },
    { name: '受污染水低位发热值', unit: 'kJ/kg', defaultValue: 5000, minValue: 2000, maxValue: 10000 },
    { name: '助燃燃料消耗量', unit: 'kg/h', defaultValue: 50, minValue: 10, maxValue: 200 },
    { name: '助燃燃料低位发热值', unit: 'kJ/kg', defaultValue: 42700, minValue: 40000, maxValue: 45000 },
    { name: '用电设备功率消耗', unit: 'kW', defaultValue: 30, minValue: 5, maxValue: 100 },
    { name: '设备运行时间', unit: 'h', defaultValue: 24, minValue: 1, maxValue: 24 }
  ],
  // ===== 其他设备 =====
  '船用碟式分离机': [
    { name: '工作周期内消耗电能', unit: 'kW·h', defaultValue: 5, minValue: 1, maxValue: 20 },
    { name: '工作周期内分离悬浮液体积', unit: 'm³', defaultValue: 5, minValue: 1, maxValue: 20 }
  ],
  '船用压载水处理设备': [
    { name: '压载平均电能', unit: 'kW', defaultValue: 50, minValue: 10, maxValue: 200 },
    { name: '排载平均电能', unit: 'kW', defaultValue: 40, minValue: 10, maxValue: 200 },
    { name: '压载平均流量', unit: 'm³/h', defaultValue: 200, minValue: 50, maxValue: 500 },
    { name: '排载平均流量', unit: 'm³/h', defaultValue: 200, minValue: 50, maxValue: 500 }
  ],
  '船用起锚机': [
    { name: '电机电压', unit: 'V', defaultValue: 400, minValue: 220, maxValue: 690 },
    { name: '电机电流', unit: 'A', defaultValue: 100, minValue: 20, maxValue: 500 },
    { name: '锚链轮载荷', unit: 'N', defaultValue: 50000, minValue: 10000, maxValue: 200000 },
    { name: '锚链轮速度', unit: 'm/min', defaultValue: 9, minValue: 3, maxValue: 15 }
  ],
  '船用系泊绞车': [
    { name: '电机电压', unit: 'V', defaultValue: 400, minValue: 220, maxValue: 690 },
    { name: '电机电流', unit: 'A', defaultValue: 80, minValue: 20, maxValue: 400 },
    { name: '系缆滚筒载荷', unit: 'N', defaultValue: 40000, minValue: 10000, maxValue: 150000 },
    { name: '系缆滚筒速度', unit: 'm/min', defaultValue: 12, minValue: 5, maxValue: 20 }
  ],
  '船用吊机': [
    { name: '供给功率', unit: 'kW', defaultValue: 100, minValue: 20, maxValue: 500 },
    { name: '有效功率', unit: 'kW', defaultValue: 80, minValue: 15, maxValue: 400 },
    { name: '工作半径', unit: 'm', defaultValue: 15, minValue: 5, maxValue: 40 },
    { name: '额定载荷', unit: 't', defaultValue: 10, minValue: 1, maxValue: 50 }
  ],
  '船用低压交流三相同步发电机': [
    { name: '输出线电压', unit: 'V', defaultValue: 400, minValue: 380, maxValue: 690 },
    { name: '输出线电流', unit: 'A', defaultValue: 500, minValue: 50, maxValue: 5000 },
    { name: '相位差', unit: '°', defaultValue: 36.87, minValue: 0, maxValue: 90 },
    { name: '输入轴扭矩', unit: 'Nm', defaultValue: 5000, minValue: 500, maxValue: 50000 },
    { name: '转子机械角速度', unit: 'rad/s', defaultValue: 157, minValue: 100, maxValue: 200 }
  ],
  '船用中压交流三相同步发电机': [
    { name: '输出线电压', unit: 'V', defaultValue: 6600, minValue: 3300, maxValue: 13800 },
    { name: '输出线电流', unit: 'A', defaultValue: 800, minValue: 100, maxValue: 8000 },
    { name: '相位差', unit: '°', defaultValue: 36.87, minValue: 0, maxValue: 90 },
    { name: '输入轴扭矩', unit: 'Nm', defaultValue: 30000, minValue: 5000, maxValue: 200000 },
    { name: '转子机械角速度', unit: 'rad/s', defaultValue: 157, minValue: 100, maxValue: 200 }
  ],
  '船用组合式空调机组': [
    { name: '实测风量', unit: 'm³/h', defaultValue: 10000, minValue: 2000, maxValue: 200000 },
    { name: '实测输入功率', unit: 'W', defaultValue: 5000, minValue: 1000, maxValue: 50000 },
    { name: '外静压', unit: 'Pa', defaultValue: 500, minValue: 250, maxValue: 3000 },
    { name: '传动方式', unit: '', defaultValue: null, minValue: null, maxValue: null }
  ],
  '船用冷水机组': [
    { name: '实测制冷量', unit: 'kW', defaultValue: 500, minValue: 100, maxValue: 3000 },
    { name: '实测输入总功率', unit: 'kW', defaultValue: 100, minValue: 20, maxValue: 600 },
    { name: '100%负荷性能系数COP', unit: 'kW/kW', defaultValue: 5.5, minValue: 3, maxValue: 8 },
    { name: '75%负荷性能系数COP', unit: 'kW/kW', defaultValue: 6.0, minValue: 3, maxValue: 9 },
    { name: '50%负荷性能系数COP', unit: 'kW/kW', defaultValue: 6.5, minValue: 3, maxValue: 10 },
    { name: '25%负荷性能系数COP', unit: 'kW/kW', defaultValue: 5.0, minValue: 2, maxValue: 8 }
  ],
  '船用惰性气体系统': [
    { name: '风机功率', unit: 'kW', defaultValue: 50, minValue: 10, maxValue: 200 },
    { name: '冷却水泵流量', unit: 'm³/h', defaultValue: 30, minValue: 5, maxValue: 100 },
    { name: '冷却水泵扬程', unit: 'm', defaultValue: 20, minValue: 5, maxValue: 50 },
    { name: '燃料消耗量', unit: 'kg/h', defaultValue: 100, minValue: 20, maxValue: 500 },
    { name: '惰气流量', unit: 'Nm³/h', defaultValue: 2000, minValue: 500, maxValue: 10000 },
    { name: '海水密度', unit: 'kg/m³', defaultValue: 1025, minValue: 1000, maxValue: 1050 },
    { name: '柴油发电机燃油消耗率', unit: 'g/kWh', defaultValue: 200, minValue: 170, maxValue: 250 }
  ],
  '船用二氧化碳捕集设备': [
    { name: '系统消耗总电功率', unit: 'kW', defaultValue: 200, minValue: 50, maxValue: 1000 },
    { name: '系统消耗热功率', unit: 'kW', defaultValue: 300, minValue: 50, maxValue: 1500 },
    { name: 'CO₂产品质量流量', unit: 't/h', defaultValue: 1, minValue: 0.1, maxValue: 10 }
  ],
  '船用推进器': [
    { name: '螺旋桨收到功率', unit: 'kW', defaultValue: 10000, minValue: 1000, maxValue: 50000 },
    { name: '螺旋桨有效功率', unit: 'kW', defaultValue: 7000, minValue: 500, maxValue: 40000 }
  ]
}

// 根据设备类型动态获取工况参数，使用默认值作为示例运行值
const operatingParams = computed(() => {
  const deviceType = modelDeviceType.value
  const template = paramTemplates[deviceType]
  if (!template) return []
  return template.map(p => ({
    name: p.name,
    value: p.defaultValue ?? '-',
    unit: p.unit,
    minValue: p.minValue,
    maxValue: p.maxValue
  }))
})
</script>

<style scoped>
.operating-data-content {
  padding: 0 4px;
}
</style>
