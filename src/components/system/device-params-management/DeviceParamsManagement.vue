<template>
  <div class="device-params-container">
    <!-- Tab 切换 -->
    <el-tabs v-model="activeTab" class="device-params-tabs">
      <!-- 参数模板 Tab -->
      <el-tab-pane label="参数模板" name="template">
        <div class="device-params-controls">
          <div class="control-group">
            <el-button type="primary" @click="addParamTemplate">
              <el-icon><Plus /></el-icon>
              新增设备参数
            </el-button>
          </div>

          <div class="search-filter">
            <el-input 
              v-model="searchQuery" 
              placeholder="搜索设备类型名称" 
              clearable
              style="width: 200px;"
              @keyup.enter="filterTemplates"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-select v-model="categoryFilter" placeholder="全部类别" clearable style="width: 150px;" @change="filterTemplates">
              <el-option label="全部类别" value="" />
              <el-option label="船用发动机" value="engine" />
              <el-option label="船用齿轮箱" value="gearbox" />
              <el-option label="船用余热回收发电装置" value="waste-heat" />
              <el-option label="船用焚烧炉" value="incinerator" />
              <el-option label="船用碟式分离机" value="separator" />
              <el-option label="船用压载水处理设备" value="ballast" />
              <el-option label="船用锚绞机" value="windlass" />
              <el-option label="船用吊机" value="crane" />
              <el-option label="船用发电机" value="generator" />
              <el-option label="船用组合式空调机组" value="air-conditioner" />
              <el-option label="船用冷水机组" value="chiller" />
              <el-option label="船用惰性气体系统" value="inert-gas" />
              <el-option label="船用二氧化碳捕集设备" value="co2-capture" />
              <el-option label="船用推进器" value="propeller" />
            </el-select>
            <el-select v-model="deviceTypeFilter" placeholder="全部设备类型" clearable style="width: 250px;" @change="filterTemplates">
              <el-option label="全部设备类型" value="" />
              <el-option v-for="opt in filteredDeviceTypeOptions" :key="opt" :label="opt" :value="opt" />
            </el-select>
            <el-button @click="resetFilters">重置筛选</el-button>
          </div>
        </div>

        <div class="template-list-section">
          <h3>设备参数列表</h3>
          <el-table :data="paginatedTemplates" style="width: 100%" border stripe>
            <el-table-column prop="deviceType" label="设备类型名称" min-width="250" />
            <el-table-column label="类别" min-width="180">
              <template #default="scope">
                <span class="device-category" :class="scope.row.category">
                  {{ getCategoryName(scope.row.category) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column label="参数数量" width="120">
              <template #default="scope">
                {{ scope.row.params.length }} 个参数
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述" min-width="300" show-overflow-tooltip />
            <el-table-column label="操作" width="400" fixed="right">
              <template #default="scope">
                <el-button type="primary" size="small" @click="openViewModal(scope.row)">查看</el-button>
                <el-button type="warning" size="small" @click="editTemplate(scope.row)">编辑</el-button>
                <el-button type="success" size="small" @click="openDefaultValueModal(scope.row)">默认值配置</el-button>
                <el-button type="danger" size="small" @click="deleteTemplate(scope.row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
          
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="pageSizes"
              :total="filteredTemplates.length"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="resetPage"
            />
          </div>
        </div>
      </el-tab-pane>

      <!-- 加权参数 Tab（仅当选择船用发动机时显示） -->
      <el-tab-pane label="加权参数" name="weight" v-if="categoryFilter === 'engine'">
        <WeightParamsManagement />
      </el-tab-pane>
    </el-tabs>

    <!-- 查看设备参数弹窗 -->
    <DeviceParamsView
      v-if="showViewModal"
      :category="viewTemplate?.category"
      :device-type="viewTemplate?.deviceType"
      :description="viewTemplate?.description"
      :params="viewTemplate?.params"
      @close="closeViewModal"
    />

    <!-- 默认值配置弹窗 -->
    <DefaultValueConfig
      v-if="showDefaultValueModal"
      :device-type="selectedTemplate?.deviceType"
      :params="selectedTemplate?.params"
      @close="closeDefaultValueModal"
      @save="handleSaveDefaultValues"
    />

    <!-- 设备参数表单弹窗 -->
    <DeviceParamsForm
      v-if="showFormModal"
      :is-edit="isEditMode"
      :form-data="formData"
      @save="saveParamTemplate"
      @close="closeFormModal"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Search } from '@element-plus/icons-vue'
import DeviceParamsForm from './components/DeviceParamsForm.vue'
import DefaultValueConfig from './components/DefaultValueConfig.vue'
import DeviceParamsView from './components/DeviceParamsView.vue'
import WeightParamsManagement from './weight-params/WeightParamsManagement.vue'

const activeTab = ref('template')

const categoryMap = {
  engine: '船用发动机',
  gearbox: '船用齿轮箱',
  'waste-heat': '船用余热回收发电装置',
  incinerator: '船用焚烧炉',
  separator: '船用碟式分离机',
  ballast: '船用压载水处理设备',
  windlass: '船用锚绞机',
  crane: '船用吊机',
  generator: '船用发电机',
  'air-conditioner': '船用组合式空调机组',
  chiller: '船用冷水机组',
  'inert-gas': '船用惰性气体系统',
  'co2-capture': '船用二氧化碳捕集设备',
  propeller: '船用推进器'
}

// 设备类型→类别映射
const deviceTypeToCategoryMap = {
  '船用柴油发动机（低速机）': 'engine',
  '船用柴油发动机（中速机）': 'engine',
  '船用LNG/柴油双燃料发动机（低速机）': 'engine',
  '船用LNG/柴油双燃料发动机（中速机）': 'engine',
  '船用甲醇/柴油双燃料发动机（低速机）': 'engine',
  '船用甲醇/柴油双燃料发动机（中速机）': 'engine',
  '单台齿轮箱': 'gearbox',
  '两台齿轮箱': 'gearbox',
  '船用有机朗肯循环发电装置': 'waste-heat',
  '船用蒸汽透平发电装置': 'waste-heat',
  '单功能焚烧炉（固体废弃物）': 'incinerator',
  '单功能焚烧炉（污油泥）': 'incinerator',
  '双功能焚烧炉': 'incinerator',
  '多功能焚烧炉': 'incinerator',
  '船用碟式分离机': 'separator',
  '船用压载水处理设备': 'ballast',
  '船用起锚机': 'windlass',
  '船用系泊绞车': 'windlass',
  '船用吊机': 'crane',
  '船用低压交流三相同步发电机': 'generator',
  '船用中压交流三相同步发电机': 'generator',
  '船用组合式空调机组': 'air-conditioner',
  '船用冷水机组': 'chiller',
  '船用惰性气体系统': 'inert-gas',
  '船用二氧化碳捕集设备': 'co2-capture',
  '船用推进器': 'propeller'
}

const getCategoryName = (category) => {
  return categoryMap[category] || category
}

// 搜索和过滤相关
const searchQuery = ref('')
const categoryFilter = ref('')
const deviceTypeFilter = ref('')

// 所有设备类型列表
const allDeviceTypes = Object.keys(deviceTypeToCategoryMap)

// 根据类别过滤设备类型选项
const filteredDeviceTypeOptions = computed(() => {
  if (!categoryFilter.value) {
    return allDeviceTypes
  }
  return allDeviceTypes.filter(dt => deviceTypeToCategoryMap[dt] === categoryFilter.value)
})

// 类别变化时清空设备类型筛选
watch(categoryFilter, (newVal, oldVal) => {
  if (oldVal !== undefined && newVal !== oldVal) {
    deviceTypeFilter.value = ''
  }
})

const paramTemplates = ref([
  {
    id: 1,
    deviceType: '船用柴油发动机（低速机）',
    category: 'engine',
    description: '船用柴油发动机（低速机）设备参数',
    params: [
      { id: 1, name: '额定功率', unit: 'kW', defaultValue: 15000, minValue: 0, maxValue: 30000 },
      { id: 2, name: '额定转速', unit: 'r/min', defaultValue: 100, minValue: 50, maxValue: 150 },
      { id: 3, name: '主燃料低热值', unit: 'kJ/kg', defaultValue: 42700, minValue: 40000, maxValue: 45000 },
      { id: 4, name: '25%工况下燃油消耗率', unit: 'g/kWh', defaultValue: 180, minValue: 150, maxValue: 250 },
      { id: 5, name: '50%工况下燃油消耗率', unit: 'g/kWh', defaultValue: 170, minValue: 140, maxValue: 230 },
      { id: 6, name: '75%工况下燃油消耗率', unit: 'g/kWh', defaultValue: 165, minValue: 130, maxValue: 220 },
      { id: 7, name: '100%工况下燃油消耗率', unit: 'g/kWh', defaultValue: 175, minValue: 140, maxValue: 240 }
    ]
  },
  {
    id: 2,
    deviceType: '船用柴油发动机（中速机）',
    category: 'engine',
    description: '船用柴油发动机（中速机）设备参数',
    params: [
      { id: 8, name: '额定功率', unit: 'kW', defaultValue: 2000, minValue: 500, maxValue: 5000 },
      { id: 9, name: '额定转速', unit: 'r/min', defaultValue: 1500, minValue: 1000, maxValue: 2000 },
      { id: 10, name: '主燃料低热值', unit: 'kJ/kg', defaultValue: 42700, minValue: 40000, maxValue: 45000 },
      { id: 11, name: '25%工况下燃油消耗率', unit: 'g/kWh', defaultValue: 200, minValue: 160, maxValue: 280 },
      { id: 12, name: '50%工况下燃油消耗率', unit: 'g/kWh', defaultValue: 190, minValue: 150, maxValue: 260 },
      { id: 13, name: '75%工况下燃油消耗率', unit: 'g/kWh', defaultValue: 185, minValue: 140, maxValue: 250 },
      { id: 14, name: '100%工况下燃油消耗率', unit: 'g/kWh', defaultValue: 195, minValue: 150, maxValue: 270 }
    ]
  },
  {
    id: 3,
    deviceType: '船用LNG/柴油双燃料发动机（低速机）',
    category: 'engine',
    description: '船用LNG/柴油双燃料发动机（低速机）设备参数',
    params: [
      { id: 15, name: '额定功率', unit: 'kW', defaultValue: 15000, minValue: 0, maxValue: 30000 },
      { id: 16, name: '额定转速', unit: 'r/min', defaultValue: 100, minValue: 50, maxValue: 150 },
      { id: 17, name: '主燃料低热值', unit: 'kJ/kg', defaultValue: 50000, minValue: 48000, maxValue: 52000 },
      { id: 18, name: '引燃油低热值', unit: 'kJ/kg', defaultValue: 42700, minValue: 40000, maxValue: 45000 },
      { id: 19, name: '25%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 150, minValue: 120, maxValue: 200 },
      { id: 20, name: '25%工况下引燃油消耗率', unit: 'g/kWh', defaultValue: 10, minValue: 5, maxValue: 20 },
      { id: 21, name: '50%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 140, minValue: 110, maxValue: 190 },
      { id: 22, name: '50%工况下引燃油消耗率', unit: 'g/kWh', defaultValue: 8, minValue: 4, maxValue: 15 },
      { id: 23, name: '75%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 135, minValue: 105, maxValue: 185 },
      { id: 24, name: '75%工况下引燃油消耗率', unit: 'g/kWh', defaultValue: 7, minValue: 3, maxValue: 12 },
      { id: 25, name: '100%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 145, minValue: 115, maxValue: 195 },
      { id: 26, name: '100%工况下引燃油消耗率', unit: 'g/kWh', defaultValue: 9, minValue: 4, maxValue: 16 }
    ]
  },
  {
    id: 4,
    deviceType: '船用LNG/柴油双燃料发动机（中速机）',
    category: 'engine',
    description: '船用LNG/柴油双燃料发动机（中速机）设备参数',
    params: [
      { id: 27, name: '额定功率', unit: 'kW', defaultValue: 2000, minValue: 500, maxValue: 5000 },
      { id: 28, name: '额定转速', unit: 'r/min', defaultValue: 1500, minValue: 1000, maxValue: 2000 },
      { id: 29, name: '主燃料低热值', unit: 'kJ/kg', defaultValue: 50000, minValue: 48000, maxValue: 52000 },
      { id: 30, name: '引燃油低热值', unit: 'kJ/kg', defaultValue: 42700, minValue: 40000, maxValue: 45000 },
      { id: 31, name: '25%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 170, minValue: 130, maxValue: 220 },
      { id: 32, name: '25%工况下引燃油消耗率', unit: 'g/kWh', defaultValue: 12, minValue: 6, maxValue: 24 },
      { id: 33, name: '50%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 160, minValue: 120, maxValue: 210 },
      { id: 34, name: '50%工况下引燃油消耗率', unit: 'g/kWh', defaultValue: 10, minValue: 5, maxValue: 20 },
      { id: 35, name: '75%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 155, minValue: 115, maxValue: 205 },
      { id: 36, name: '75%工况下引燃油消耗率', unit: 'g/kWh', defaultValue: 9, minValue: 4, maxValue: 18 },
      { id: 37, name: '100%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 165, minValue: 125, maxValue: 215 },
      { id: 38, name: '100%工况下引燃油消耗率', unit: 'g/kWh', defaultValue: 11, minValue: 5, maxValue: 22 }
    ]
  },
  {
    id: 5,
    deviceType: '船用甲醇/柴油双燃料发动机（低速机）',
    category: 'engine',
    description: '船用甲醇/柴油双燃料发动机（低速机）设备参数',
    params: [
      { id: 39, name: '额定功率', unit: 'kW', defaultValue: 15000, minValue: 0, maxValue: 30000 },
      { id: 40, name: '额定转速', unit: 'r/min', defaultValue: 100, minValue: 50, maxValue: 150 },
      { id: 41, name: '主燃料低热值', unit: 'kJ/kg', defaultValue: 19900, minValue: 19000, maxValue: 21000 },
      { id: 42, name: '引燃油低热值', unit: 'kJ/kg', defaultValue: 42700, minValue: 40000, maxValue: 45000 },
      { id: 43, name: '25%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 350, minValue: 300, maxValue: 400 },
      { id: 44, name: '25%工况下引燃油消耗率', unit: 'g/kWh', defaultValue: 15, minValue: 8, maxValue: 25 },
      { id: 45, name: '50%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 330, minValue: 280, maxValue: 380 },
      { id: 46, name: '50%工况下引燃油消耗率', unit: 'g/kWh', defaultValue: 12, minValue: 6, maxValue: 20 },
      { id: 47, name: '75%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 320, minValue: 270, maxValue: 370 },
      { id: 48, name: '75%工况下引燃油消耗率', unit: 'g/kWh', defaultValue: 10, minValue: 5, maxValue: 18 },
      { id: 49, name: '100%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 340, minValue: 290, maxValue: 390 },
      { id: 50, name: '100%工况下引燃油消耗率', unit: 'g/kWh', defaultValue: 13, minValue: 7, maxValue: 22 }
    ]
  },
  {
    id: 6,
    deviceType: '船用甲醇/柴油双燃料发动机（中速机）',
    category: 'engine',
    description: '船用甲醇/柴油双燃料发动机（中速机）设备参数',
    params: [
      { id: 51, name: '额定功率', unit: 'kW', defaultValue: 2000, minValue: 500, maxValue: 5000 },
      { id: 52, name: '额定转速', unit: 'r/min', defaultValue: 1500, minValue: 1000, maxValue: 2000 },
      { id: 53, name: '主燃料低热值', unit: 'kJ/kg', defaultValue: 19900, minValue: 19000, maxValue: 21000 },
      { id: 54, name: '引燃油低热值', unit: 'kJ/kg', defaultValue: 42700, minValue: 40000, maxValue: 45000 },
      { id: 55, name: '25%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 380, minValue: 330, maxValue: 430 },
      { id: 56, name: '25%工况下引燃油消耗率', unit: 'g/kWh', defaultValue: 18, minValue: 9, maxValue: 30 },
      { id: 57, name: '50%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 360, minValue: 310, maxValue: 410 },
      { id: 58, name: '50%工况下引燃油消耗率', unit: 'g/kWh', defaultValue: 15, minValue: 7, maxValue: 25 },
      { id: 59, name: '75%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 350, minValue: 300, maxValue: 400 },
      { id: 60, name: '75%工况下引燃油消耗率', unit: 'g/kWh', defaultValue: 13, minValue: 6, maxValue: 22 },
      { id: 61, name: '100%工况下燃气消耗率', unit: 'g/kWh', defaultValue: 370, minValue: 320, maxValue: 420 },
      { id: 62, name: '100%工况下引燃油消耗率', unit: 'g/kWh', defaultValue: 16, minValue: 8, maxValue: 28 }
    ]
  },
  {
    id: 7,
    deviceType: '单台齿轮箱',
    category: 'gearbox',
    description: '单台齿轮箱设备参数',
    params: [
      { id: 63, name: '输入扭矩', unit: 'Nm', defaultValue: 50000, minValue: 10000, maxValue: 200000 },
      { id: 64, name: '输入转速', unit: 'r/min', defaultValue: 1000, minValue: 500, maxValue: 3000 },
      { id: 65, name: '输入功率', unit: 'kW', defaultValue: 5000, minValue: 100, maxValue: 50000 },
      { id: 66, name: '输出扭矩', unit: 'Nm', defaultValue: 48000, minValue: 9000, maxValue: 190000 },
      { id: 67, name: '输出转速', unit: 'r/min', defaultValue: 950, minValue: 400, maxValue: 2800 },
      { id: 159, name: '输出功率', unit: 'kW', defaultValue: 4800, minValue: 90, maxValue: 48000 }
    ]
  },
  {
    id: 8,
    deviceType: '两台齿轮箱',
    category: 'gearbox',
    description: '两台齿轮箱设备参数',
    params: [
      { id: 68, name: '输入扭矩', unit: 'Nm', defaultValue: 50000, minValue: 10000, maxValue: 200000 },
      { id: 69, name: '输出扭矩', unit: 'Nm', defaultValue: 48000, minValue: 9000, maxValue: 190000 }
    ]
  },
  {
    id: 9,
    deviceType: '船用有机朗肯循环发电装置',
    category: 'waste-heat',
    description: '船用有机朗肯循环发电装置设备参数',
    params: [
      { id: 70, name: '实测输出功率', unit: 'kW', defaultValue: 200, minValue: 50, maxValue: 500 },
      { id: 71, name: '实测消耗功率', unit: 'kW', defaultValue: 20, minValue: 5, maxValue: 100 },
      { id: 72, name: '热源质量流量', unit: 'kg/s', defaultValue: 5, minValue: 1, maxValue: 20 },
      { id: 73, name: '热源进口温度', unit: '℃', defaultValue: 120, minValue: 80, maxValue: 200 },
      { id: 74, name: '热源出口温度', unit: '℃', defaultValue: 60, minValue: 30, maxValue: 100 },
      { id: 75, name: '热源介质比热容', unit: 'J/(kg·℃)', defaultValue: 4200, minValue: 3000, maxValue: 5000 }
    ]
  },
  {
    id: 10,
    deviceType: '船用蒸汽透平发电装置',
    category: 'waste-heat',
    description: '船用蒸汽透平发电装置设备参数',
    params: [
      { id: 76, name: '实测输出功率', unit: 'kW', defaultValue: 300, minValue: 50, maxValue: 1000 },
      { id: 77, name: '实测消耗功率', unit: 'kW', defaultValue: 30, minValue: 5, maxValue: 100 },
      { id: 160, name: '热源质量流量', unit: 'kg/s', defaultValue: 5, minValue: 1, maxValue: 20 },
      { id: 78, name: '等熵焓降', unit: 'J/kg', defaultValue: 500000, minValue: 200000, maxValue: 1000000 }
    ]
  },
  {
    id: 11,
    deviceType: '单功能焚烧炉（固体废弃物）',
    category: 'incinerator',
    description: '单功能焚烧炉（固体废弃物）设备参数',
    params: [
      { id: 79, name: '固体废弃物进料量', unit: 'kg/h', defaultValue: 100, minValue: 10, maxValue: 500 },
      { id: 80, name: '固体废弃物低位发热值', unit: 'kJ/kg', defaultValue: 15000, minValue: 10000, maxValue: 25000 },
      { id: 81, name: '助燃燃料消耗量', unit: 'kg/h', defaultValue: 50, minValue: 10, maxValue: 200 },
      { id: 82, name: '助燃燃料低位发热值', unit: 'kJ/kg', defaultValue: 42700, minValue: 40000, maxValue: 45000 },
      { id: 83, name: '用电设备功率消耗', unit: 'kW', defaultValue: 30, minValue: 5, maxValue: 100 },
      { id: 84, name: '设备运行时间', unit: 'h', defaultValue: 24, minValue: 1, maxValue: 24 }
    ]
  },
  {
    id: 12,
    deviceType: '单功能焚烧炉（污油泥）',
    category: 'incinerator',
    description: '单功能焚烧炉（污油泥）设备参数',
    params: [
      { id: 85, name: '污油泥(含水率20%)进料量', unit: 'kg/h', defaultValue: 100, minValue: 10, maxValue: 500 },
      { id: 86, name: '污油泥(含水率20%)低位发热值', unit: 'kJ/kg', defaultValue: 15000, minValue: 10000, maxValue: 25000 },
      { id: 87, name: '助燃燃料消耗量', unit: 'kg/h', defaultValue: 50, minValue: 10, maxValue: 200 },
      { id: 88, name: '助燃燃料低位发热值', unit: 'kJ/kg', defaultValue: 42700, minValue: 40000, maxValue: 45000 },
      { id: 89, name: '用电设备功率消耗', unit: 'kW', defaultValue: 30, minValue: 5, maxValue: 100 },
      { id: 90, name: '设备运行时间', unit: 'h', defaultValue: 24, minValue: 1, maxValue: 24 }
    ]
  },
  {
    id: 13,
    deviceType: '双功能焚烧炉',
    category: 'incinerator',
    description: '双功能焚烧炉设备参数',
    params: [
      { id: 91, name: '固体废弃物进料量', unit: 'kg/h', defaultValue: 100, minValue: 10, maxValue: 500 },
      { id: 92, name: '固体废弃物低位发热值', unit: 'kJ/kg', defaultValue: 15000, minValue: 10000, maxValue: 25000 },
      { id: 93, name: '污油泥(含水率20%)进料量', unit: 'kg/h', defaultValue: 80, minValue: 10, maxValue: 400 },
      { id: 94, name: '污油泥(含水率20%)低位发热值', unit: 'kJ/kg', defaultValue: 15000, minValue: 10000, maxValue: 25000 },
      { id: 95, name: '助燃燃料消耗量', unit: 'kg/h', defaultValue: 50, minValue: 10, maxValue: 200 },
      { id: 96, name: '助燃燃料低位发热值', unit: 'kJ/kg', defaultValue: 42700, minValue: 40000, maxValue: 45000 },
      { id: 97, name: '用电设备功率消耗', unit: 'kW', defaultValue: 30, minValue: 5, maxValue: 100 },
      { id: 98, name: '设备运行时间', unit: 'h', defaultValue: 24, minValue: 1, maxValue: 24 }
    ]
  },
  {
    id: 14,
    deviceType: '多功能焚烧炉',
    category: 'incinerator',
    description: '多功能焚烧炉设备参数',
    params: [
      { id: 99, name: '固体废弃物进料量', unit: 'kg/h', defaultValue: 100, minValue: 10, maxValue: 500 },
      { id: 100, name: '固体废弃物低位发热值', unit: 'kJ/kg', defaultValue: 15000, minValue: 10000, maxValue: 25000 },
      { id: 101, name: '污油泥(含水率20%)进料量', unit: 'kg/h', defaultValue: 80, minValue: 10, maxValue: 400 },
      { id: 102, name: '污油泥(含水率20%)低位发热值', unit: 'kJ/kg', defaultValue: 15000, minValue: 10000, maxValue: 25000 },
      { id: 103, name: '受污染水进料量', unit: 'kg/h', defaultValue: 50, minValue: 5, maxValue: 300 },
      { id: 104, name: '受污染水低位发热值', unit: 'kJ/kg', defaultValue: 5000, minValue: 2000, maxValue: 10000 },
      { id: 105, name: '助燃燃料消耗量', unit: 'kg/h', defaultValue: 50, minValue: 10, maxValue: 200 },
      { id: 106, name: '助燃燃料低位发热值', unit: 'kJ/kg', defaultValue: 42700, minValue: 40000, maxValue: 45000 },
      { id: 107, name: '用电设备功率消耗', unit: 'kW', defaultValue: 30, minValue: 5, maxValue: 100 },
      { id: 108, name: '设备运行时间', unit: 'h', defaultValue: 24, minValue: 1, maxValue: 24 }
    ]
  },
  {
    id: 15,
    deviceType: '船用碟式分离机',
    category: 'separator',
    description: '船用碟式分离机设备参数',
    params: [
      { id: 109, name: '工作周期内消耗电能', unit: 'kW·h', defaultValue: 5, minValue: 1, maxValue: 20 },
      { id: 110, name: '工作周期内分离悬浮液体积', unit: 'm³', defaultValue: 5, minValue: 1, maxValue: 20 }
    ]
  },
  {
    id: 16,
    deviceType: '船用压载水处理设备',
    category: 'ballast',
    description: '船用压载水处理设备设备参数',
    params: [
      { id: 111, name: '压载平均电能', unit: 'kW', defaultValue: 50, minValue: 10, maxValue: 200 },
      { id: 112, name: '排载平均电能', unit: 'kW', defaultValue: 40, minValue: 10, maxValue: 200 },
      { id: 113, name: '压载平均流量', unit: 'm³/h', defaultValue: 200, minValue: 50, maxValue: 500 },
      { id: 114, name: '排载平均流量', unit: 'm³/h', defaultValue: 200, minValue: 50, maxValue: 500 }
    ]
  },
  {
    id: 17,
    deviceType: '船用起锚机',
    category: 'windlass',
    description: '船用起锚机设备参数',
    params: [
      { id: 115, name: '电机电压', unit: 'V', defaultValue: 400, minValue: 220, maxValue: 690 },
      { id: 116, name: '电机电流', unit: 'A', defaultValue: 100, minValue: 20, maxValue: 500 },
      { id: 117, name: '锚链轮载荷', unit: 'N', defaultValue: 50000, minValue: 10000, maxValue: 200000 },
      { id: 118, name: '锚链轮速度', unit: 'm/min', defaultValue: 9, minValue: 3, maxValue: 15 }
    ]
  },
  {
    id: 18,
    deviceType: '船用系泊绞车',
    category: 'windlass',
    description: '船用系泊绞车设备参数',
    params: [
      { id: 119, name: '电机电压', unit: 'V', defaultValue: 400, minValue: 220, maxValue: 690 },
      { id: 120, name: '电机电流', unit: 'A', defaultValue: 80, minValue: 20, maxValue: 400 },
      { id: 121, name: '系缆滚筒载荷', unit: 'N', defaultValue: 40000, minValue: 10000, maxValue: 150000 },
      { id: 122, name: '系缆滚筒速度', unit: 'm/min', defaultValue: 12, minValue: 5, maxValue: 20 }
    ]
  },
  {
    id: 19,
    deviceType: '船用吊机',
    category: 'crane',
    description: '船用吊机设备参数',
    params: [
      { id: 123, name: '供给功率', unit: 'kW', defaultValue: 100, minValue: 20, maxValue: 500 },
      { id: 124, name: '有效功率', unit: 'kW', defaultValue: 80, minValue: 15, maxValue: 400 },
      { id: 125, name: '工作半径', unit: 'm', defaultValue: 15, minValue: 5, maxValue: 40 },
      { id: 126, name: '额定载荷', unit: 't', defaultValue: 10, minValue: 1, maxValue: 50 }
    ]
  },
  {
    id: 20,
    deviceType: '船用低压交流三相同步发电机',
    category: 'generator',
    description: '船用低压交流三相同步发电机设备参数',
    params: [
      { id: 127, name: '输出线电压', unit: 'V', defaultValue: 400, minValue: 380, maxValue: 690 },
      { id: 128, name: '输出线电流', unit: 'A', defaultValue: 500, minValue: 50, maxValue: 5000 },
      { id: 129, name: '相位差', unit: '°', defaultValue: 36.87, minValue: 0, maxValue: 90 },
      { id: 130, name: '输入轴扭矩', unit: 'Nm', defaultValue: 5000, minValue: 500, maxValue: 50000 },
      { id: 131, name: '转子机械角速度', unit: 'rad/s', defaultValue: 157, minValue: 100, maxValue: 200 }
    ]
  },
  {
    id: 21,
    deviceType: '船用中压交流三相同步发电机',
    category: 'generator',
    description: '船用中压交流三相同步发电机设备参数',
    params: [
      { id: 132, name: '输出线电压', unit: 'V', defaultValue: 6600, minValue: 3300, maxValue: 13800 },
      { id: 133, name: '输出线电流', unit: 'A', defaultValue: 800, minValue: 100, maxValue: 8000 },
      { id: 134, name: '相位差', unit: '°', defaultValue: 36.87, minValue: 0, maxValue: 90 },
      { id: 135, name: '输入轴扭矩', unit: 'Nm', defaultValue: 30000, minValue: 5000, maxValue: 200000 },
      { id: 136, name: '转子机械角速度', unit: 'rad/s', defaultValue: 157, minValue: 100, maxValue: 200 }
    ]
  },
  {
    id: 22,
    deviceType: '船用组合式空调机组',
    category: 'air-conditioner',
    description: '船用组合式空调机组设备参数',
    params: [
      { id: 137, name: '实测风量', unit: 'm³/h', defaultValue: 10000, minValue: 2000, maxValue: 200000 },
      { id: 138, name: '实测输入功率', unit: 'W', defaultValue: 5000, minValue: 1000, maxValue: 50000 },
      { id: 139, name: '外静压', unit: 'Pa', defaultValue: 500, minValue: 250, maxValue: 3000 },
      { id: 140, name: '传动方式', unit: '', defaultValue: null, minValue: null, maxValue: null }
    ]
  },
  {
    id: 23,
    deviceType: '船用冷水机组',
    category: 'chiller',
    description: '船用冷水机组设备参数',
    params: [
      { id: 141, name: '实测制冷量', unit: 'kW', defaultValue: 500, minValue: 100, maxValue: 3000 },
      { id: 142, name: '实测输入总功率', unit: 'kW', defaultValue: 100, minValue: 20, maxValue: 600 },
      { id: 143, name: '100%负荷性能系数COP', unit: 'kW/kW', defaultValue: 5.5, minValue: 3, maxValue: 8 },
      { id: 144, name: '75%负荷性能系数COP', unit: 'kW/kW', defaultValue: 6.0, minValue: 3, maxValue: 9 },
      { id: 145, name: '50%负荷性能系数COP', unit: 'kW/kW', defaultValue: 6.5, minValue: 3, maxValue: 10 },
      { id: 146, name: '25%负荷性能系数COP', unit: 'kW/kW', defaultValue: 5.0, minValue: 2, maxValue: 8 }
    ]
  },
  {
    id: 24,
    deviceType: '船用惰性气体系统',
    category: 'inert-gas',
    description: '船用惰性气体系统设备参数',
    params: [
      { id: 147, name: '风机功率', unit: 'kW', defaultValue: 50, minValue: 10, maxValue: 200 },
      { id: 148, name: '冷却水泵流量', unit: 'm³/h', defaultValue: 30, minValue: 5, maxValue: 100 },
      { id: 149, name: '冷却水泵扬程', unit: 'm', defaultValue: 20, minValue: 5, maxValue: 50 },
      { id: 150, name: '燃料消耗量', unit: 'kg/h', defaultValue: 100, minValue: 20, maxValue: 500 },
      { id: 151, name: '惰气流量', unit: 'Nm³/h', defaultValue: 2000, minValue: 500, maxValue: 10000 },
      { id: 152, name: '海水密度', unit: 'kg/m³', defaultValue: 1025, minValue: 1000, maxValue: 1050 },
      { id: 153, name: '柴油发电机燃油消耗率', unit: 'g/kWh', defaultValue: 200, minValue: 170, maxValue: 250 }
    ]
  },
  {
    id: 25,
    deviceType: '船用二氧化碳捕集设备',
    category: 'co2-capture',
    description: '船用二氧化碳捕集设备设备参数',
    params: [
      { id: 154, name: '系统消耗总电功率', unit: 'kW', defaultValue: 200, minValue: 50, maxValue: 1000 },
      { id: 155, name: '系统消耗热功率', unit: 'kW', defaultValue: 300, minValue: 50, maxValue: 1500 },
      { id: 156, name: 'CO₂产品质量流量', unit: 't/h', defaultValue: 1, minValue: 0.1, maxValue: 10 }
    ]
  },
  {
    id: 26,
    deviceType: '船用推进器',
    category: 'propeller',
    description: '船用推进器设备参数',
    params: [
      { id: 157, name: '螺旋桨收到功率', unit: 'kW', defaultValue: 10000, minValue: 1000, maxValue: 50000 },
      { id: 158, name: '螺旋桨有效功率', unit: 'kW', defaultValue: 7000, minValue: 500, maxValue: 40000 }
    ]
  }
])

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const pageSizes = ref([10, 20, 50, 100, 200, 500])

const filteredTemplates = computed(() => {
  let result = paramTemplates.value
  if (searchQuery.value) {
    result = result.filter(template =>
      template.deviceType.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }
  if (categoryFilter.value) {
    result = result.filter(template => template.category === categoryFilter.value)
  }
  if (deviceTypeFilter.value) {
    result = result.filter(template => template.deviceType === deviceTypeFilter.value)
  }
  return result
})

const paginatedTemplates = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredTemplates.value.slice(start, end)
})

const resetPage = () => {
  currentPage.value = 1
}

const filterTemplates = () => {
  // 选择设备类型时，自动关联类别
  if (deviceTypeFilter.value && !categoryFilter.value) {
    categoryFilter.value = deviceTypeToCategoryMap[deviceTypeFilter.value] || ''
  }
  resetPage()
  console.log('过滤设备参数', {
    searchQuery: searchQuery.value,
    categoryFilter: categoryFilter.value,
    deviceTypeFilter: deviceTypeFilter.value
  })
}

const resetFilters = () => {
  searchQuery.value = ''
  categoryFilter.value = ''
  deviceTypeFilter.value = ''
  resetPage()
  console.log('重置筛选条件')
}

const deviceTypes = ref([
  { id: 'diesel-low', name: '船用柴油发动机（低速机）' },
  { id: 'diesel-medium', name: '船用柴油发动机（中速机）' },
  { id: 'lng-diesel-low', name: '船用LNG/柴油双燃料发动机（低速机）' },
  { id: 'lng-diesel-medium', name: '船用LNG/柴油双燃料发动机（中速机）' },
  { id: 'methanol-diesel-low', name: '船用甲醇/柴油双燃料发动机（低速机）' },
  { id: 'methanol-diesel-medium', name: '船用甲醇/柴油双燃料发动机（中速机）' },
  { id: 'gearbox-single', name: '单台齿轮箱' },
  { id: 'gearbox-double', name: '两台齿轮箱' },
  { id: 'waste-heat-orc', name: '船用有机朗肯循环发电装置' },
  { id: 'waste-heat-steam', name: '船用蒸汽透平发电装置' },
  { id: 'incinerator-solid', name: '单功能焚烧炉（固体废弃物）' },
  { id: 'incinerator-sludge', name: '单功能焚烧炉（污油泥）' },
  { id: 'incinerator-dual', name: '双功能焚烧炉' },
  { id: 'incinerator-multi', name: '多功能焚烧炉' },
  { id: 'separator', name: '船用碟式分离机' },
  { id: 'ballast', name: '船用压载水处理设备' },
  { id: 'windlass-anchor', name: '船用起锚机' },
  { id: 'windlass-mooring', name: '船用系泊绞车' },
  { id: 'crane', name: '船用吊机' },
  { id: 'generator-low', name: '船用低压交流三相同步发电机' },
  { id: 'generator-medium', name: '船用中压交流三相同步发电机' },
  { id: 'air-conditioner', name: '船用组合式空调机组' },
  { id: 'chiller', name: '船用冷水机组' },
  { id: 'inert-gas', name: '船用惰性气体系统' },
  { id: 'co2-capture', name: '船用二氧化碳捕集设备' },
  { id: 'propeller', name: '船用推进器' }
])

const activeDeviceType = ref('diesel-low')
const showDefaultValueModal = ref(false)
const selectedTemplate = ref(null)
const showFormModal = ref(false)
const isEditMode = ref(false)
const formData = ref({
  id: null,
  deviceType: '',
  description: '',
  params: []
})

// 查看弹窗相关
const showViewModal = ref(false)
const viewTemplate = ref(null)

const refreshData = () => {
  console.log('刷新设备参数数据')
}

const addParamTemplate = () => {
  isEditMode.value = false
  formData.value = {
    id: null,
    deviceType: '',
    description: '',
    params: []
  }
  showFormModal.value = true
}

const editTemplate = (template) => {
  isEditMode.value = true
  formData.value = { ...template }
  showFormModal.value = true
}

const deleteTemplate = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个设备参数吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    paramTemplates.value = paramTemplates.value.filter(template => template.id !== id)
    ElMessage.success('删除成功')
  } catch {
    // 用户取消删除
  }
}

const openViewModal = (template) => {
  viewTemplate.value = template
  showViewModal.value = true
}

const closeViewModal = () => {
  showViewModal.value = false
  viewTemplate.value = null
}

const openDefaultValueModal = (template) => {
  selectedTemplate.value = template
  showDefaultValueModal.value = true
}

const closeDefaultValueModal = () => {
  showDefaultValueModal.value = false
  selectedTemplate.value = null
}

const handleSaveDefaultValues = (params) => {
  if (selectedTemplate.value) {
    selectedTemplate.value.params = params
  }
  console.log('保存默认值:', params)
  ElMessage.success('默认值保存成功')
  closeDefaultValueModal()
}

const saveParamTemplate = (data) => {
  if (isEditMode.value) {
    const index = paramTemplates.value.findIndex(t => t.id === data.id)
    if (index !== -1) {
      paramTemplates.value[index] = { ...data }
    }
  } else {
    const newId = Math.max(...paramTemplates.value.map(t => t.id)) + 1
    paramTemplates.value.push({
      ...data,
      id: newId
    })
  }
  showFormModal.value = false
  ElMessage.success('设备参数保存成功')
}

const closeFormModal = () => {
  showFormModal.value = false
  formData.value = {
    id: null,
    deviceType: '',
    description: '',
    params: []
  }
}

const getDeviceParams = (deviceType) => {
  const deviceTypeMap = {
    'diesel-low': '船用柴油发动机（低速机）',
    'diesel-medium': '船用柴油发动机（中速机）',
    'lng-diesel-low': '船用LNG/柴油双燃料发动机（低速机）',
    'lng-diesel-medium': '船用LNG/柴油双燃料发动机（中速机）',
    'methanol-diesel-low': '船用甲醇/柴油双燃料发动机（低速机）',
    'methanol-diesel-medium': '船用甲醇/柴油双燃料发动机（中速机）'
  }
  const deviceTypeName = deviceTypeMap[deviceType]
  const template = paramTemplates.value.find(t => t.deviceType === deviceTypeName)
  return template ? template.params : []
}
</script>

<style scoped>
.device-params-container { 
  padding: 20px; 
  height: 100%; 
  min-height: calc(100vh - 120px); 
  box-sizing: border-box; 
  display: flex;
  flex-direction: column;
}

/* Tab 样式 */
.device-params-tabs {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* Tab 内容区 */
:deep(.el-tabs__content) {
  flex: 1;
  overflow: hidden;
}

:deep(.el-tab-pane) {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 参数模板 Tab 内容区域 */
.device-params-controls {
  margin-top: 0;
}

.device-params-controls { 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 24px; 
  flex-wrap: wrap; 
  gap: 16px; 
}

.control-group { 
  display: flex; 
  gap: 12px; 
  flex-wrap: wrap; 
}

.search-filter { 
  display: flex; 
  gap: 16px; 
  align-items: center; 
  flex-wrap: wrap; 
}

.template-list-section { 
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  margin-bottom: 0;
}

.template-list-section h3 { 
  margin: 0 0 16px 0; 
  font-size: 18px; 
  font-weight: 600; 
  color: #333; 
  flex-shrink: 0;
}

.template-list-section .el-table {
  flex: 1;
  overflow: auto;
  min-height: 0;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  padding: 16px 0 0 0;
  flex-shrink: 0;
}

.device-category {
  font-size: 14px;
  padding: 4px 8px;
  border-radius: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.device-category.engine { background-color: #e3f2fd; color: #1976d2; }
.device-category.gearbox { background-color: #e8f5e8; color: #2e7d32; }
.device-category.waste-heat { background-color: #fff3e0; color: #ef6c00; }
.device-category.incinerator { background-color: #ffebee; color: #c62828; }
.device-category.separator { background-color: #f3e5f5; color: #7b1fa2; }
.device-category.ballast { background-color: #e0f7fa; color: #00838f; }
.device-category.windlass { background-color: #fce4ec; color: #880e4f; }
.device-category.crane { background-color: #e3f2fd; color: #0d47a1; }
.device-category.generator { background-color: #fff8e1; color: #f57c00; }
.device-category.air-conditioner { background-color: #e1f5fe; color: #0288d1; }
.device-category.chiller { background-color: #e3f2fd; color: #1565c0; }
.device-category.inert-gas { background-color: #f3e5f5; color: #6a1b9a; }
.device-category.co2-capture { background-color: #c8e6c9; color: #2e7d32; }
.device-category.propeller { background-color: #fff3e0; color: #e65100; }
</style>