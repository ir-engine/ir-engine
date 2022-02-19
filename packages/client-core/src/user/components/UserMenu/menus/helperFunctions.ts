import { MAX_ALLOWED_TRIANGLES } from '@xrengine/common/src/constants/AvatarConstants'
import i18next from 'i18next'
import { getOrbitControls } from '@xrengine/engine/src/input/functions/loadOrbitControl'
import { addComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { AnimationComponent } from '@xrengine/engine/src/avatar/components/AnimationComponent'
import { LoopAnimationComponent } from '@xrengine/engine/src/avatar/components/LoopAnimationComponent'
import { initSystems } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import {
  Box3,
  Vector3,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  DirectionalLight,
  HemisphereLight,
  sRGBEncoding,
  AnimationMixer,
  Object3D
} from 'three'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
const t = i18next.t
interface SceneProps {
  scene: Scene
  camera: PerspectiveCamera
  renderer: WebGLRenderer
}

let scene: Scene = null!
let renderer: WebGLRenderer = null!
let camera: PerspectiveCamera = null!
export const validate = (obj) => {
  const objBoundingBox = new Box3().setFromObject(obj)
  let maxBB = new Vector3(2, 2, 2)

  let bone = false
  let skinnedMesh = false
  obj.traverse((o) => {
    if (o.type.toLowerCase() === 'bone') bone = true
    if (o.type.toLowerCase() === 'skinnedmesh') skinnedMesh = true
  })

  const size = new Vector3().subVectors(maxBB, objBoundingBox.getSize(new Vector3()))
  if (size.x <= 0 || size.y <= 0 || size.z <= 0) return t('user:avatar.outOfBound')

  if (!bone || !skinnedMesh) return t('user:avatar.noBone')

  renderer.render(scene, camera)
  if (renderer.info.render.triangles > MAX_ALLOWED_TRIANGLES)
    return t('user:avatar.selectValidFile', { allowedTriangles: MAX_ALLOWED_TRIANGLES })

  if (renderer.info.render.triangles <= 0) return t('user:avatar.emptyObj')

  return ''
}

export const addAnimationLogic = (entity: Entity, world: World, setEntity: any, panelRef: any) => {
  addComponent(entity, AnimationComponent, {
    // empty object3d as the mixer gets replaced when model is loaded
    mixer: new AnimationMixer(new Object3D()),
    animations: [],
    animationSpeed: 1
  })
  addComponent(entity, LoopAnimationComponent, {
    activeClipIndex: 0,
    hasAvatarAnimations: true,
    action: null!
  })

  setEntity(entity)

  async function AvatarSelectRenderSystem(world: World) {
    return () => {
      // only render if this menu is open
      if (!!panelRef.current) {
        renderer.render(scene, camera)
      }
    }
  }

  initSystems(world, [
    {
      type: SystemUpdateType.POST_RENDER,
      systemModulePromise: Promise.resolve({ default: AvatarSelectRenderSystem })
    }
  ])
}

export const initialize3D = () => {
  const container = document.getElementById('stage')!
  const bounds = container.getBoundingClientRect()
  camera = new PerspectiveCamera(45, bounds.width / bounds.height, 0.25, 20)
  camera.position.set(0, 1.25, 1.25)

  scene = new Scene()

  const backLight = new DirectionalLight(0xfafaff, 1)
  backLight.position.set(1, 3, -1)
  backLight.target.position.set(0, 1.5, 0)
  const frontLight = new DirectionalLight(0xfafaff, 0.7)
  frontLight.position.set(-1, 3, 1)
  frontLight.target.position.set(0, 1.5, 0)
  const hemi = new HemisphereLight(0xeeeeff, 0xebbf2c, 1)
  scene.add(backLight)
  scene.add(backLight.target)
  scene.add(frontLight)
  scene.add(frontLight.target)
  scene.add(hemi)
  renderer = new WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(bounds.width, bounds.height)
  renderer.outputEncoding = sRGBEncoding
  renderer.domElement.id = 'avatarCanvas'
  container.appendChild(renderer.domElement)

  return {
    scene,
    camera,
    renderer
  }
}

export const onWindowResize = (props: SceneProps) => {
  const container = document.getElementById('stage')
  const bounds = container?.getBoundingClientRect()!
  props.camera.aspect = bounds.width / bounds.height
  props.camera.updateProjectionMatrix()

  props.renderer.setSize(bounds.width, bounds.height)

  renderScene(props)
}

export const renderScene = (props: SceneProps) => {
  props.renderer.render(props.scene, props.camera)
}
