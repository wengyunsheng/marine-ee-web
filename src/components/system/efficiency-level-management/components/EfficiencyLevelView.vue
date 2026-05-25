<template>
  <div class="modal-overlay" @click="$emit('close')">
    <div class="modal-content" @click.stop>
      <div class="modal-header">
        <h3>查看能效基值详情</h3>
        <button class="modal-close" @click="$emit('close')">×</button>
      </div>
      <div class="modal-body">
        <div class="info-section">
          <div class="info-item">
            <label>设备类型名称：</label>
            <span>{{ baseValue.engineType }}</span>
          </div>
          <div class="info-item">
            <label>类别：</label>
            <span class="device-category" :class="baseValue.category">{{ getCategoryName(baseValue.category) }}</span>
          </div>
          <div class="info-item">
            <label>排放等级：</label>
            <span>{{ baseValue.emissionLevel || '-' }}</span>
          </div>
          <div class="info-item">
            <label>功率区间：</label>
            <span>{{ baseValue.powerRange ? baseValue.powerRange + ' kW' : '-' }}</span>
          </div>
          <div class="info-item">
            <label>能效等级：</label>
            <span>{{ baseValue.efficiencyLevel }}</span>
          </div>
          <div class="info-item">
            <label>能效基值：</label>
            <span>{{ baseValue.baseValue }}{{ baseValue.unit || '%' }}</span>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" @click="$emit('close')">关闭</button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  baseValue: {
    type: Object,
    required: true
  }
})

defineEmits(['close'])

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
  'air-conditioner': '船用空调机组',
  chiller: '船用冷水机组',
  'inert-gas': '船用惰性气体系统',
  'co2-capture': '船用二氧化碳捕集设备',
  propeller: '船用推进器'
}

const getCategoryName = (category) => {
  return categoryMap[category] || category
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
  max-width: 400px;
  overflow: hidden;
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
}

.info-section {
  margin-bottom: 24px;
}

.info-item {
  display: flex;
  margin-bottom: 16px;
}

.info-item label {
  font-weight: 600;
  color: #333;
  min-width: 120px;
}

.info-item span {
  color: #666;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
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

.btn-primary {
  background-color: #2563eb;
  color: white;
}

.btn-primary:hover {
  background-color: #1d4ed8;
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

.info-item span.device-category {
  color: #666;
}

.device-category.engine { background-color: #dbeafe; color: #1e40af; }
.device-category.gearbox { background-color: #dcfce7; color: #166534; }
.device-category.waste-heat { background-color: #ffedd5; color: #c2410c; }
.device-category.incinerator { background-color: #fee2e2; color: #991b1b; }
.device-category.separator { background-color: #f3e8ff; color: #6b21a8; }
.device-category.ballast { background-color: #cffafe; color: #0e7490; }
.device-category.windlass { background-color: #fce7f3; color: #be185d; }
.device-category.crane { background-color: #e0e7ff; color: #3730a3; }
.device-category.generator { background-color: #fef3c7; color: #b45309; }
.device-category.air-conditioner { background-color: #dbeafe; color: #1e40af; }
.device-category.chiller { background-color: #e0e7ff; color: #3730a3; }
.device-category.inert-gas { background-color: #ede9fe; color: #5b21b6; }
.device-category.co2-capture { background-color: #dcfce7; color: #166534; }
.device-category.propeller { background-color: #ffedd5; color: #c2410c; }
</style>
