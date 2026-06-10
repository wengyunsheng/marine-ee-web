<template>
  <div class="three-d-wrapper">
    <div class="three-d-header">
      <el-space :size="12" class="header-controls">
        <el-tooltip content="放大" placement="top">
          <div class="control-btn" @click="zoomIn">
            <el-icon><ZoomIn /></el-icon>
          </div>
        </el-tooltip>
        <el-tooltip content="缩小" placement="top">
          <div class="control-btn" @click="zoomOut">
            <el-icon><ZoomOut /></el-icon>
          </div>
        </el-tooltip>
        <el-tooltip content="旋转" placement="top">
          <div class="control-btn" @click="rotateModel">
            <el-icon><RefreshRight /></el-icon>
          </div>
        </el-tooltip>
        <el-tooltip content="显示/隐藏标签" placement="top">
          <div class="control-btn" @click="toggleLabels">
            <el-icon><PriceTag /></el-icon>
          </div>
        </el-tooltip>
        <el-tooltip content="截图" placement="top">
          <div class="control-btn" @click="captureScreen">
            <el-icon><Camera /></el-icon>
          </div>
        </el-tooltip>
      </el-space>
    </div>
    
    <div class="three-d-container" ref="threeContainer">
      <div class="three-d-background"></div>
      <div class="three-d-model" ref="modelContainer"></div>
      <div class="glow-effect"></div>
      
      <!-- 工况数据悬浮面板 -->
      <div v-if="conditionsData && conditionsData.speed" class="hud-panel">
        <div class="hud-header">
          <div class="hud-title">实时工况</div>
          <el-select 
            v-model="currentConditionIndex" 
            size="small"
            class="condition-selector"
            @change="handleConditionChange"
          >
            <el-option
              v-for="(item, index) in allConditions"
              :key="index"
              :label="`${(item.loadFactor * 100).toFixed(0)}%负荷`"
              :value="index"
            />
          </el-select>
        </div>
        <div class="hud-content">
          <div class="hud-item">
            <span class="hud-label">负荷</span>
            <span class="hud-value">{{ (conditionsData.loadFactor * 100).toFixed(0) }}%</span>
          </div>
          <div class="hud-item">
            <span class="hud-label">功率</span>
            <span class="hud-value">{{ conditionsData.power }} kW</span>
          </div>
          <div class="hud-item">
            <span class="hud-label">转速</span>
            <span class="hud-value">{{ conditionsData.speed.toFixed(1) }} rpm</span>
          </div>
          <div class="hud-item">
            <span class="hud-label">燃油消耗率</span>
            <span class="hud-value">{{ conditionsData.bsfc }} g/kWh</span>
          </div>
        </div>
      </div>
      
      <div class="holographic-overlay">
        <div class="holographic-grid"></div>
        <div 
          v-for="(part, index) in modelParts" 
          :key="index"
          class="holographic-info"
          :style="part.position"
          :class="{ active: selectedPart === part.id }"
          @click="handlePartClick(part.id)"
        >
          <div class="holographic-label">{{ part.name }}</div>
          <div class="holographic-value">
            <span class="value-text">{{ part.calculatedValue }}</span>
            <el-tag :type="getLevelTagType(part.efficiencyLevel)" size="small" class="level-tag">
              {{ part.efficiencyLevel }}级
            </el-tag>
          </div>
          <div class="holographic-bar">
            <div 
              class="holographic-fill" 
              :class="getBarClass(part.efficiencyLevel)"
              :style="{ width: part.efficiencyScore + '%' }"
            ></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader'
import { ZoomIn, ZoomOut, RefreshRight, PriceTag, Camera } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const props = defineProps({
  modelParts: {
    type: Array,
    required: true
  },
  conditionsData: {
    type: Object,
    default: null
  },
  allConditions: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['part-click'])

const threeContainer = ref(null)
const modelContainer = ref(null)
const selectedPart = ref('')

let scene = null
let camera = null
let renderer = null
let controls = null
let animationId = null

// 动画相关变量

// 外部模型加载相关
const loadedModel = ref(null)  // 存储加载的外部模型

// 工况切换相关
const currentConditionIndex = ref(0)
const allConditions = ref([])  // 存储所有工况数据

// 处理工况切换
const handleConditionChange = (index) => {
  currentConditionIndex.value = index
}

// 监听 allConditions 变化，更新下拉选项
watch(() => props.allConditions, (newVal) => {
  if (newVal && newVal.length > 0) {
    allConditions.value = newVal
  }
}, { immediate: true })

// 加载外部3D模型文件
const loadExternalModel = async (url) => {
  if (!scene || !url) return
  
  // 清除之前加载的模型
  if (loadedModel.value) {
    scene.remove(loadedModel.value)
    loadedModel.value = null
  }
  
  let modelUrl = url
  
  // 处理服务器文件路径
  // 如果是相对路径（以 / 开头），直接使用
  // 如果是绝对URL（http:// 或 https://），直接使用
  // 如果是Windows本地路径（包含 \ 或以 D: C: 开头），需要转换
  if (url.includes('\\') || url.startsWith('D:') || url.startsWith('C:')) {
    // Windows路径格式: D:\\uploads\\3d-models\\2026\\06\\10\\engine.STL
    const normalizedPath = url.replace(/\\/g, '/')
    const pathParts = normalizedPath.split('/')
    const fileName = pathParts[pathParts.length - 1]
    
    if (normalizedPath.includes('/uploads/')) {
      const uploadIndex = normalizedPath.indexOf('/uploads/')
      const relativePath = normalizedPath.substring(uploadIndex + 1)
      modelUrl = `/api/${relativePath}`
    } else {
      modelUrl = `/models/${fileName}`
    }
  } else if (url.startsWith('/')) {
    // 相对路径，直接使用（例如: /uploads/2026/06/10/engine.STL）
    modelUrl = url
  }
  
  const fileExtension = modelUrl.split('.').pop().toLowerCase()
  
  try {
    switch (fileExtension) {
      case 'glb':
      case 'gltf':
        await loadGLTF(modelUrl)
        break
      case 'obj':
        await loadOBJ(modelUrl)
        break
      case 'fbx':
        await loadFBX(modelUrl)
        break
      case 'stl':
        await loadSTL(modelUrl)
        break
      default:
        ElMessage.warning(`不支持的文件格式: .${fileExtension}`)
        return
    }
    
    // 只在真正成功时显示成功消息
    ElMessage.success('3D模型加载成功')
  } catch (error) {
    ElMessage.error('加载3D模型失败: ' + error.message)
  }
}

// 加载GLTF/GLB格式
const loadGLTF = (url) => {
  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader()
    loader.load(
      url,
      (gltf) => {
        loadedModel.value = gltf.scene
        scene.add(gltf.scene)
        
        // 自动调整相机位置以适应模型
        try {
          fitCameraToObject(camera, gltf.scene, controls)
        } catch (e) {
          // 忽略相机调整错误，不影响模型显示
        }
        resolve(gltf)
      },
      undefined,
      (error) => reject(error)
    )
  })
}

// 加载OBJ格式（需要同时加载MTL材质文件）
const loadOBJ = async (url) => {
  return new Promise((resolve, reject) => {
    const mtlUrl = url.replace('.obj', '.mtl')
    const mtlLoader = new MTLLoader()
    
    mtlLoader.load(
      mtlUrl,
      (materials) => {
        materials.preload()
        const objLoader = new OBJLoader()
        objLoader.setMaterials(materials)
        
        objLoader.load(
          url,
          (object) => {
            loadedModel.value = object
            scene.add(object)
            try {
              fitCameraToObject(camera, object, controls)
            } catch (e) {
              // 忽略相机调整错误，不影响模型显示
            }
            resolve(object)
          },
          undefined,
          (error) => reject(error)
        )
      },
      undefined,
      (error) => {
        // 如果没有MTL文件，直接加载OBJ
        const objLoader = new OBJLoader()
        objLoader.load(
          url,
          (object) => {
            loadedModel.value = object
            scene.add(object)
            try {
              fitCameraToObject(camera, object, controls)
            } catch (e) {
              // 忽略相机调整错误，不影响模型显示
            }
            resolve(object)
          },
          undefined,
          (error) => reject(error)
        )
      }
    )
  })
}

// 加载FBX格式
const loadFBX = (url) => {
  return new Promise((resolve, reject) => {
    const loader = new FBXLoader()
    loader.load(
      url,
      (object) => {
        loadedModel.value = object
        scene.add(object)
        try {
          fitCameraToObject(camera, object, controls)
        } catch (e) {
          // 忽略相机调整错误，不影响模型显示
        }
        resolve(object)
      },
      undefined,
      (error) => reject(error)
    )
  })
}

// 加载STL格式
const loadSTL = (url) => {
  return new Promise((resolve, reject) => {
    const loader = new STLLoader()
    
    loader.load(
      url,
      (geometry) => {
        const material = new THREE.MeshStandardMaterial({ 
          color: 0x63b3ed,
          metalness: 0.7,
          roughness: 0.3
        })
        const mesh = new THREE.Mesh(geometry, material)
        loadedModel.value = mesh
        scene.add(mesh)
        
        // 安全地调整相机位置
        try {
          fitCameraToObject(camera, mesh, controls)
        } catch (e) {
          // 忽略相机调整错误，不影响模型显示
        }
        
        resolve(mesh)
      },
      (progress) => {
        // 加载进度（静默处理）
      },
      (error) => {
        reject(error)
      }
    )
  })
}

// 自动调整相机位置以适应模型大小
const fitCameraToObject = (camera, object, controls) => {
  const box = new THREE.Box3().setFromObject(object)
  const size = box.getSize(new THREE.Vector3())
  const center = box.getCenter(new THREE.Vector3())
  
  const maxDim = Math.max(size.x, size.y, size.z)
  const fov = camera.fov * (Math.PI / 180)
  let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2))
  cameraZ *= 2.5  // 留出一些边距
  
  camera.position.set(center.x, center.y + cameraZ * 0.5, center.z + cameraZ)
  camera.lookAt(center)
  
  if (controls) {
    controls.target.copy(center)
    controls.update()
  }
}

const getLevelTagType = (level) => {
  if (level === '1') return 'success'
  if (level === '2') return ''
  return 'danger'
}

const getBarClass = (level) => {
  if (level === '1') return 'excellent'
  if (level === '2') return 'warning'
  return 'error'
}

const handlePartClick = (partId) => {
  selectedPart.value = partId
  emit('part-click', partId)
}

const zoomIn = () => {
  if (camera && controls) {
    const currentDistance = camera.position.distanceTo(controls.target)
    const zoomFactor = 0.8
    const direction = new THREE.Vector3().subVectors(camera.position, controls.target).normalize()
    camera.position.copy(controls.target).add(direction.multiplyScalar(currentDistance * zoomFactor))
    controls.update()
  }
}

const zoomOut = () => {
  if (camera && controls) {
    const currentDistance = camera.position.distanceTo(controls.target)
    const zoomFactor = 1.2
    const direction = new THREE.Vector3().subVectors(camera.position, controls.target).normalize()
    camera.position.copy(controls.target).add(direction.multiplyScalar(currentDistance * zoomFactor))
    controls.update()
  }
}

const rotateModel = () => {
  if (controls && camera && scene) {
    const duration = 2000
    const start = Date.now()
    const startAngle = camera.position.x
    const targetAngle = startAngle + Math.PI * 2
    
    const animate = () => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const easeProgress = progress * (2 - progress)
      
      camera.position.x = startAngle + (targetAngle - startAngle) * easeProgress
      controls.update()
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    animate()
  }
}

const labelsVisible = ref(true)

const toggleLabels = () => {
  labelsVisible.value = !labelsVisible.value
  const overlays = document.querySelectorAll('.holographic-info')
  overlays.forEach(overlay => {
    overlay.style.opacity = labelsVisible.value ? '1' : '0'
    overlay.style.pointerEvents = labelsVisible.value ? 'auto' : 'none'
  })
}

let resizeTimeout = null

const captureScreen = () => {
  if (renderer) {
    renderer.render(scene, camera)
    const dataURL = renderer.domElement.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = '3d-model-screenshot.png'
    link.href = dataURL
    link.click()
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


const initThreeScene = () => {
  if (!threeContainer.value || !modelContainer.value) return

  const debouncedResize = () => {
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
  camera.position.set(0, 2, 8)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(threeContainer.value.clientWidth, threeContainer.value.clientHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  modelContainer.value.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.05
  controls.enableRotate = true
  controls.enableZoom = true
  controls.enablePan = true
  controls.target.set(0, 0, 0)

  const ambientLight = new THREE.AmbientLight(0x666666, 0.8)
  scene.add(ambientLight)

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2)
  directionalLight.position.set(5, 10, 7.5)
  directionalLight.castShadow = true
  directionalLight.shadow.mapSize.width = 2048
  directionalLight.shadow.mapSize.height = 2048
  scene.add(directionalLight)

  const fillLight = new THREE.DirectionalLight(0x4fc3f7, 0.5)
  fillLight.position.set(-5, 5, -5)
  scene.add(fillLight)

  const rimLight = new THREE.DirectionalLight(0x90caf9, 0.4)
  rimLight.position.set(0, -5, 10)
  scene.add(rimLight)

  const gridHelper = new THREE.GridHelper(20, 20, 0x4a90d9, 0x2d5a8a)
  scene.add(gridHelper)

  animate()

  window.addEventListener('resize', onWindowResize)
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
    // 清理外部加载的模型
    if (loadedModel.value) {
      scene.remove(loadedModel.value)
      loadedModel.value.traverse((object) => {
        if (object.geometry) object.geometry.dispose()
        if (object.material) {
          if (Array.isArray(object.material)) {
            object.material.forEach(material => material.dispose())
          } else {
            object.material.dispose()
          }
        }
      })
      loadedModel.value = null
    }
    
    // 清理硬编码模型的几何体和材质
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
  zoomOut,
  rotateModel,
  toggleLabels,
  captureScreen,
  loadExternalModel
})
</script>

<style scoped>
.three-d-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
}

.three-d-header {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 8px;
  background: transparent;
  position: absolute;
  top: 0;
  right: 0;
  z-index: 100;
}

.header-controls {
  display: flex;
  gap: 12px;
}

.control-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.control-btn:hover {
  background: rgba(59, 130, 246, 0.3);
  border-color: rgba(59, 130, 246, 0.5);
  box-shadow: 0 0 15px rgba(59, 130, 246, 0.3);
  transform: translateY(-2px);
}

.control-btn:active {
  transform: translateY(0);
}

.control-btn .el-icon {
  font-size: 16px;
  color: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;
}

.control-btn:hover .el-icon {
  color: #fff;
  text-shadow: 0 0 10px rgba(59, 130, 246, 0.8);
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
  background: rgba(15, 23, 42, 0.95);
  border: 2px solid rgba(59, 130, 246, 0.6);
  border-radius: 12px;
  padding: 16px;
  backdrop-filter: blur(10px);
  animation: holographicFlicker 2s ease-in-out infinite;
  min-width: 180px;
  pointer-events: auto;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.holographic-info:hover,
.holographic-info.active {
  border-color: #3b82f6;
  box-shadow: 0 0 25px rgba(59, 130, 246, 0.6);
  transform: scale(1.08);
  z-index: 10;
}

@keyframes holographicFlicker {
  0%, 100% { opacity: 0.9; }
  50% { opacity: 1; }
}

.holographic-label {
  font-size: 13px;
  font-weight: 600;
  color: #60a5fa;
  margin-bottom: 8px;
}

.holographic-value {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.value-text {
  font-size: 16px;
  font-weight: 700;
  color: white;
}

.level-tag {
  margin-left: 8px;
}

.holographic-bar {
  width: 100%;
  height: 6px;
  background-color: rgba(51, 65, 85, 0.5);
  border-radius: 3px;
  overflow: hidden;
}

.holographic-fill {
  height: 100%;
  border-radius: 3px;
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

/* HUD悬浮面板样式 */
.hud-panel {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(15, 23, 42, 0.9);
  border: 2px solid rgba(59, 130, 246, 0.6);
  border-radius: 12px;
  padding: 20px;
  backdrop-filter: blur(10px);
  min-width: 220px;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5), 0 0 30px rgba(59, 130, 246, 0.3);
  animation: hudFadeIn 0.5s ease-out;
}

@keyframes hudFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hud-title {
  font-size: 16px;
  font-weight: 700;
  color: #60a5fa;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 2px solid rgba(59, 130, 246, 0.3);
  padding-bottom: 8px;
}

.hud-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 2px solid rgba(59, 130, 246, 0.3);
}

.condition-selector {
  width: 120px;
}

.condition-selector :deep(.el-input__inner) {
  background-color: rgba(30, 58, 95, 0.8);
  border-color: rgba(59, 130, 246, 0.5);
  color: #fff;
  height: 28px;
  line-height: 28px;
}

.condition-selector :deep(.el-input__inner:hover) {
  border-color: #3b82f6;
  background-color: rgba(30, 58, 95, 0.9);
}

.condition-selector :deep(.el-select-dropdown) {
  background-color: rgba(30, 58, 95, 0.95);
  border-color: rgba(59, 130, 246, 0.5);
}

.condition-selector :deep(.el-select-dropdown__item) {
  color: #fff;
}

.condition-selector :deep(.el-select-dropdown__item.hover),
.condition-selector :deep(.el-select-dropdown__item:hover) {
  background-color: rgba(59, 130, 246, 0.3);
}

.hud-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hud-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.hud-item:last-child {
  border-bottom: none;
}

.hud-label {
  font-size: 13px;
  color: #94a3b8;
  font-weight: 500;
}

.hud-value {
  font-size: 15px;
  color: #fff;
  font-weight: 700;
  font-family: 'Courier New', monospace;
  text-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
}
</style>
