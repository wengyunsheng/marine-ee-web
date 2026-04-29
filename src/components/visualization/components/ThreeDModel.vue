<template>
  <div class="three-d-wrapper">
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

const emit = defineEmits(['select'])

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

let resizeTimeout = null
let isFullscreenTransition = false

const captureScreen = () => {
  console.log('截图')
}

const toggleFullscreen = () => {
  const container = threeContainer.value
  if (!container) return
  isFullscreenTransition = true
  if (!document.fullscreenElement) {
    container.requestFullscreen().then(() => {
      setTimeout(() => {
        onWindowResize()
        isFullscreenTransition = false
      }, 300)
    }).catch(err => {
      console.error(`Error attempting to enable fullscreen: ${err.message}`)
      isFullscreenTransition = false
    })
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen().then(() => {
        setTimeout(() => {
          onWindowResize()
          window.dispatchEvent(new Event('resize'))
          isFullscreenTransition = false
        }, 300)
      }).catch(err => {
        console.error(`Error exiting fullscreen: ${err.message}`)
        isFullscreenTransition = false
      })
    }
  }
}

const initThreeScene = () => {
  if (!threeContainer.value || !modelContainer.value) return

  const debouncedResize = () => {
    if (isFullscreenTransition) return
    if (resizeTimeout) clearTimeout(resizeTimeout)
    resizeTimeout = setTimeout(() => {
      onWindowResize()
    }, 100)
  }

  const resizeObserver = new ResizeObserver(debouncedResize)
  resizeObserver.observe(threeContainer.value)

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x1e3a5f)

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

  const ambientLight = new THREE.AmbientLight(0x666666, 0.8)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0)
  directionalLight.position.set(5, 10, 7.5)
  directionalLight.castShadow = true
  scene.add(directionalLight)

  const fillLight = new THREE.DirectionalLight(0x4fc3f7, 0.4)
  fillLight.position.set(-5, 5, -5)
  scene.add(fillLight)

  const rimLight = new THREE.DirectionalLight(0x90caf9, 0.3)
  rimLight.position.set(0, -5, 10)
  scene.add(rimLight)

  createShipEngineModel()

  const gridHelper = new THREE.GridHelper(20, 20, 0x4a90d9, 0x2d5a8a)
  scene.add(gridHelper)

  animate()

  window.addEventListener('resize', onWindowResize)
}

const createShipEngineModel = () => {
  if (!scene) return

  const darkGray = new THREE.MeshStandardMaterial({ color: 0x4a5568, metalness: 0.7, roughness: 0.3 })
  const lightGray = new THREE.MeshStandardMaterial({ color: 0xa0aec0, metalness: 0.6, roughness: 0.4 })
  const steelBlue = new THREE.MeshStandardMaterial({ color: 0x63b3ed, metalness: 0.8, roughness: 0.2 })
  const copper = new THREE.MeshStandardMaterial({ color: 0xed8936, metalness: 0.9, roughness: 0.3 })
  const black = new THREE.MeshStandardMaterial({ color: 0x2d3748, metalness: 0.5, roughness: 0.5 })
  const red = new THREE.MeshStandardMaterial({ color: 0xf56565, metalness: 0.7, roughness: 0.3 })
  const golden = new THREE.MeshStandardMaterial({ color: 0xf6ad55, metalness: 0.9, roughness: 0.2 })

  const basePlate = new THREE.Mesh(new THREE.BoxGeometry(6, 0.3, 3), lightGray)
  basePlate.position.y = -1.8
  basePlate.receiveShadow = true
  scene.add(basePlate)

  const frameLeft = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3, 2.8), darkGray)
  frameLeft.position.set(-2.4, -0.35, 0)
  frameLeft.castShadow = true
  scene.add(frameLeft)

  const frameRight = new THREE.Mesh(new THREE.BoxGeometry(0.2, 3, 2.8), darkGray)
  frameRight.position.set(2.4, -0.35, 0)
  frameRight.castShadow = true
  scene.add(frameRight)

  const cylinderCount = 6
  const cylinderSpacing = 0.8
  const startX = -((cylinderCount - 1) * cylinderSpacing) / 2

  for (let i = 0; i < cylinderCount; i++) {
    const cylinderX = startX + i * cylinderSpacing
    
    const cylinderBlock = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1.2, 1.8), steelBlue)
    cylinderBlock.position.set(cylinderX, 0.5, 0)
    cylinderBlock.castShadow = true
    scene.add(cylinderBlock)

    const cylinderHead = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.32, 0.3, 32), darkGray)
    cylinderHead.position.set(cylinderX, 1.2, 0)
    cylinderHead.castShadow = true
    scene.add(cylinderHead)

    const exhaustPort = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.12, 0.25, 16), copper)
    exhaustPort.position.set(cylinderX, 1.4, 0)
    exhaustPort.castShadow = true
    scene.add(exhaustPort)

    const coolingFin = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 1.6), lightGray)
    coolingFin.position.set(cylinderX, 0.9, 0)
    scene.add(coolingFin)
  }

  const crankcase = new THREE.Mesh(new THREE.BoxGeometry(5.2, 1, 2.2), darkGray)
  crankcase.position.set(0, -0.8, 0)
  crankcase.castShadow = true
  scene.add(crankcase)

  const crankshaftCover = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.3, 32), lightGray)
  crankshaftCover.position.set(2.7, -0.8, 0)
  crankshaftCover.rotation.z = Math.PI / 2
  crankshaftCover.castShadow = true
  scene.add(crankshaftCover)

  const turboHousing = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 0.6, 32), darkGray)
  turboHousing.position.set(0, 1.8, 1.2)
  turboHousing.castShadow = true
  scene.add(turboHousing)

  const turboFan = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.1, 32), copper)
  turboFan.position.set(0, 1.8, 1.6)
  turboFan.castShadow = true
  scene.add(turboFan)

  const exhaustManifold = new THREE.Mesh(new THREE.BoxGeometry(5, 0.25, 0.3), copper)
  exhaustManifold.position.set(0, 1.55, 1)
  exhaustManifold.castShadow = true
  scene.add(exhaustManifold)

  const intakePipe = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 1.5, 16), lightGray)
  intakePipe.position.set(0, 1, 1.3)
  intakePipe.rotation.x = Math.PI / 2
  scene.add(intakePipe)

  const fuelInjection = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.05, 0.4, 16), black)
  fuelInjection.position.set(startX + 2 * cylinderSpacing, 1.35, -0.6)
  scene.add(fuelInjection)

  const oilPan = new THREE.Mesh(new THREE.BoxGeometry(5, 0.4, 2), darkGray)
  oilPan.position.set(0, -1.5, 0)
  oilPan.receiveShadow = true
  scene.add(oilPan)

  const mountingBracket = new THREE.Mesh(new THREE.BoxGeometry(6.2, 0.15, 3.2), black)
  mountingBracket.position.set(0, -1.95, 0)
  mountingBracket.receiveShadow = true
  scene.add(mountingBracket)

  const glowGeometry = new THREE.BoxGeometry(5.5, 3.5, 2.5)
  const glowMaterial = new THREE.MeshBasicMaterial({ color: 0x2c3e50, transparent: true, opacity: 0.2 })
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
  const rect = threeContainer.value.getBoundingClientRect()
  if (rect.width > 0 && rect.height > 0) {
    camera.aspect = rect.width / rect.height
    camera.updateProjectionMatrix()
    renderer.setSize(rect.width, rect.height)
  }
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
  if (resizeTimeout) clearTimeout(resizeTimeout)
}

onMounted(() => {
  initThreeScene()
})

onUnmounted(() => {
  cleanThreeScene()
})

defineExpose({
  zoomIn,
  rotateModel,
  toggleLabels,
  captureScreen,
  toggleFullscreen
})
</script>

<style scoped>
.three-d-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  min-height: 450px;
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
  background-color: #1e3a5f;
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
  pointer-events: none;
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

</style>
