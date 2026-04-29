<template>
  <div class="three-d-wrapper">
    <div class="three-d-header">
      <div class="header-controls">
        <button class="btn-icon" @click="zoomIn" title="放大">
          <span>🔍</span>
        </button>
        <button class="btn-icon" @click="rotateModel" title="旋转">
          <span>🔄</span>
        </button>
        <button class="btn-icon" @click="toggleLabels" title="显示/隐藏标签">
          <span>🏷️</span>
        </button>
        <button class="btn-icon" @click="captureScreen" title="截图">
          <span>📷</span>
        </button>
        <button class="btn-icon" @click="toggleFullscreen" title="全屏">
          <span>⛶</span>
        </button>
      </div>
    </div>
    <div class="three-d-container" ref="threeContainer">
      <div class="three-d-background"></div>
      <div class="three-d-model" ref="modelContainer"></div>
      <div class="glow-effect"></div>
      <div class="holographic-overlay">
        <div class="holographic-grid"></div>
        <div 
          v-for="(label, index) in modelLabels" 
          :key="index"
          class="holographic-info"
          :style="label.position"
          :class="{ active: selectedId === label.deviceId }"
          @click="$emit('select', label.deviceId)"
        >
          <div class="holographic-label">{{ label.title }}</div>
          <div class="holographic-value">{{ label.value }}</div>
          <div v-if="label.subValue" class="holographic-sub">{{ label.subValue }}</div>
          <div class="holographic-bar">
            <div 
              class="holographic-fill" 
              :class="getBarClass(label.status)"
              :style="{ width: label.percentage + '%' }"
            ></div>
          </div>
        </div>
      </div>
      <div class="interaction-hint">
        <div class="hint-animation"></div>
        可拖拽旋转 / 滚轮缩放
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

defineProps({
  modelLabels: {
    type: Array,
    required: true
  },
  selectedId: {
    type: String,
    default: ''
  }
})

defineEmits(['select'])

const threeContainer = ref(null)
const modelContainer = ref(null)

let scene = null
let camera = null
let renderer = null
let controls = null
let animationId = null

const getBarClass = (status) => {
  switch (status) {
    case 'pass': return 'excellent'
    case 'warning': return 'warning'
    case 'fail': return 'error'
    default: return 'warning'
  }
}

const zoomIn = () => {
  if (controls) {
    controls.zoomIn()
  }
}

const rotateModel = () => {
  console.log('旋转模型')
}

const toggleLabels = () => {
  console.log('显示/隐藏标签')
}

const captureScreen = () => {
  console.log('截图')
}

const toggleFullscreen = () => {
  const container = threeContainer.value
  if (!container) return
  if (!document.fullscreenElement) {
    container.requestFullscreen().catch(err => {
      console.error(`Error attempting to enable fullscreen: ${err.message}`)
    })
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }
}

const initThreeScene = () => {
  if (!threeContainer.value || !modelContainer.value) return

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x0f172a)

  camera = new THREE.PerspectiveCamera(75, threeContainer.value.clientWidth / threeContainer.value.clientHeight, 0.1, 1000)
  camera.position.z = 5

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(threeContainer.value.clientWidth, threeContainer.value.clientHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  modelContainer.value.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.enableRotate = true
  controls.enableZoom = true
  controls.enablePan = true

  const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
  directionalLight.position.set(5, 10, 7.5)
  scene.add(directionalLight)

  createShipEngineModel()

  const gridHelper = new THREE.GridHelper(20, 20, 0x334155, 0x1e293b)
  scene.add(gridHelper)

  animate()

  window.addEventListener('resize', onWindowResize)
  document.addEventListener('fullscreenchange', onFullscreenChange)
}

const createShipEngineModel = () => {
  if (!scene) return

  const mainGeometry = new THREE.BoxGeometry(3, 1, 1.5)
  const mainMaterial = new THREE.MeshStandardMaterial({ color: 0x3498db, metalness: 0.8, roughness: 0.2 })
  const mainMesh = new THREE.Mesh(mainGeometry, mainMaterial)
  scene.add(mainMesh)

  const frontGeometry = new THREE.CylinderGeometry(0.5, 0.7, 0.8, 32)
  const frontMaterial = new THREE.MeshStandardMaterial({ color: 0x2980b9, metalness: 0.8, roughness: 0.2 })
  const frontMesh = new THREE.Mesh(frontGeometry, frontMaterial)
  frontMesh.position.x = 2
  frontMesh.rotation.z = Math.PI / 2
  scene.add(frontMesh)

  const backGeometry = new THREE.CylinderGeometry(0.4, 0.6, 0.6, 32)
  const backMaterial = new THREE.MeshStandardMaterial({ color: 0x2980b9, metalness: 0.8, roughness: 0.2 })
  const backMesh = new THREE.Mesh(backGeometry, backMaterial)
  backMesh.position.x = -1.5
  backMesh.rotation.z = Math.PI / 2
  scene.add(backMesh)

  const pipeGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1.5, 32)
  const pipeMaterial = new THREE.MeshStandardMaterial({ color: 0xe74c3c, metalness: 0.8, roughness: 0.3 })
  const pipeMesh = new THREE.Mesh(pipeGeometry, pipeMaterial)
  pipeMesh.position.set(0, 0.6, 0)
  pipeMesh.rotation.x = Math.PI / 2
  scene.add(pipeMesh)

  const baseGeometry = new THREE.BoxGeometry(4, 0.2, 2)
  const baseMaterial = new THREE.MeshStandardMaterial({ color: 0x7f8c8d, metalness: 0.5, roughness: 0.5 })
  const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial)
  baseMesh.position.y = -0.6
  scene.add(baseMesh)

  const glowGeometry = new THREE.BoxGeometry(3.2, 1.2, 1.7)
  const glowMaterial = new THREE.MeshBasicMaterial({ color: 0x3498db, transparent: true, opacity: 0.3 })
  const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial)
  scene.add(glowMesh)
}

const animate = () => {
  animationId = requestAnimationFrame(animate)
  if (controls) {
    controls.update()
  }
  if (renderer && scene && camera) {
    renderer.render(scene, camera)
  }
}

const onWindowResize = () => {
  if (!camera || !renderer || !threeContainer.value) return
  camera.aspect = threeContainer.value.clientWidth / threeContainer.value.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(threeContainer.value.clientWidth, threeContainer.value.clientHeight)
}

const onFullscreenChange = () => {
  onWindowResize()
}

const cleanThreeScene = () => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  if (renderer && renderer.domElement) {
    if (modelContainer.value) {
      modelContainer.value.removeChild(renderer.domElement)
    }
    renderer.dispose()
  }
  if (controls) {
    controls.dispose()
  }
  if (scene) {
    scene.traverse((object) => {
      if (object.geometry) object.geometry.dispose()
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose())
        } else {
          object.material.dispose()
        }
      }
    })
  }
  window.removeEventListener('resize', onWindowResize)
  document.removeEventListener('fullscreenchange', onFullscreenChange)
}

onMounted(() => {
  initThreeScene()
})

onUnmounted(() => {
  cleanThreeScene()
})
</script>

<style scoped>
.three-d-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.three-d-header {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(59, 130, 246, 0.2);
  background: rgba(59, 130, 246, 0.05);
}

.header-controls {
  display: flex;
  gap: 8px;
}

.btn-icon {
  padding: 6px;
  border-radius: 6px;
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border: none;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.btn-icon:hover {
  background-color: rgba(59, 130, 246, 0.2);
}

.three-d-container {
  flex: 1;
  position: relative;
  border-radius: 0;
  background-color: #0f172a;
  cursor: grab;
  overflow: hidden;
}

.three-d-container:active {
  cursor: grabbing;
}

.three-d-background {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(59, 130, 246, 0.1), rgba(15, 23, 42, 0.8));
  z-index: 1;
}

.three-d-model {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 2;
}

.glow-effect {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at center, rgba(59, 130, 246, 0.2), transparent 70%);
  z-index: 3;
  animation: glowPulse 3s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

.holographic-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 4;
  pointer-events: none;
}

.holographic-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridMove 20s linear infinite;
}

@keyframes gridMove {
  0% { background-position: 0 0; }
  100% { background-position: 50px 50px; }
}

.holographic-info {
  position: absolute;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(59, 130, 246, 0.5);
  border-radius: 8px;
  padding: 12px;
  backdrop-filter: blur(10px);
  animation: holographicFlicker 2s ease-in-out infinite;
  min-width: 150px;
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.3s ease;
}

.holographic-info:hover,
.holographic-info.active {
  border-color: #3b82f6;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.4);
  transform: scale(1.05);
}

@keyframes holographicFlicker {
  0%, 100% { opacity: 0.8; }
  50% { opacity: 1; }
}

.holographic-label {
  font-size: 12px;
  font-weight: 600;
  color: #3b82f6;
  margin-bottom: 4px;
}

.holographic-value {
  font-size: 14px;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
}

.holographic-sub {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 8px;
}

.holographic-bar {
  width: 100%;
  height: 4px;
  background-color: rgba(51, 65, 85, 0.5);
  border-radius: 2px;
  overflow: hidden;
}

.holographic-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 1s ease;
}

.holographic-fill.excellent {
  background: linear-gradient(90deg, #4ade80, #22c55e);
}

.holographic-fill.warning {
  background: linear-gradient(90deg, #f59e0b, #d97706);
}

.holographic-fill.error {
  background: linear-gradient(90deg, #ef4444, #dc2626);
}

.interaction-hint {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(59, 130, 246, 0.5);
  border-radius: 20px;
  padding: 10px 20px;
  color: white;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 5;
}

.hint-animation {
  width: 8px;
  height: 8px;
  background-color: #3b82f6;
  border-radius: 50%;
  animation: hintBounce 2s infinite ease-in-out;
}

@keyframes hintBounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}
</style>
