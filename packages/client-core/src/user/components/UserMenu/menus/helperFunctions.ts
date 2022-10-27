import i18next from 'i18next'
import {
  AnimationMixer,
  Box3,
  DirectionalLight,
  HemisphereLight,
  Object3D,
  PerspectiveCamera,
  Scene,
  sRGBEncoding,
  Vector3,
  WebGLRenderer
} from 'three'
import { generateUUID } from 'three/src/math/MathUtils'

import { MAX_ALLOWED_TRIANGLES } from '@xrengine/common/src/constants/AvatarConstants'
import { BoneStructure } from '@xrengine/engine/src/avatar/AvatarBoneMatching'
import { AnimationComponent } from '@xrengine/engine/src/avatar/components/AnimationComponent'
import { AvatarAnimationComponent } from '@xrengine/engine/src/avatar/components/AvatarAnimationComponent'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { addComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { initSystems } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import { SystemUpdateType } from '@xrengine/engine/src/ecs/functions/SystemUpdateType'
import { VelocityComponent } from '@xrengine/engine/src/physics/components/VelocityComponent'

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
  let maxBB = new Vector3(2, 3, 2)

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

export const addAnimationLogic = (
  entity: Entity,
  world: World,
  panelRef: React.MutableRefObject<HTMLDivElement | undefined>
) => {
  addComponent(entity, AnimationComponent, {
    // empty object3d as the mixer gets replaced when model is loaded
    mixer: new AnimationMixer(new Object3D()),
    animations: [],
    animationSpeed: 1
  })
  addComponent(entity, AvatarAnimationComponent, {
    animationGraph: {
      states: {},
      transitionRules: {},
      currentState: null!,
      stateChanged: null!
    },
    rootYRatio: 1,
    locomotion: new Vector3()
  })
  addComponent(entity, VelocityComponent, { linear: new Vector3(), angular: new Vector3() })

  async function AvatarSelectRenderSystem(world: World) {
    return {
      execute: () => {
        // only render if this menu is open
        if (!!panelRef.current) {
          renderer.render(scene, camera)
        }
      },
      cleanup: async () => {}
    }
  }

  initSystems(world, [
    {
      uuid: generateUUID(),
      type: SystemUpdateType.POST_RENDER,
      systemLoader: () => Promise.resolve({ default: AvatarSelectRenderSystem })
    }
  ])
}

export const initialize3D = (containerId = 'stage', domEltId = 'avatarCanvas') => {
  const container = document.getElementById(containerId)!
  const bounds = container.getBoundingClientRect()
  camera = new PerspectiveCamera(60, bounds.width / bounds.height, 0.25, 20)
  camera.position.set(0, 1.5, 0.6)

  scene = new Scene()

  const backLight = new DirectionalLight(0xfafaff, 0.5)
  backLight.position.set(1, 3, -1)
  backLight.target.position.set(0, 1.5, 0)
  const frontLight = new DirectionalLight(0xfafaff, 0.4)
  frontLight.position.set(-1, 3, 1)
  frontLight.target.position.set(0, 1.5, 0)
  const hemi = new HemisphereLight(0xffffff, 0xffffff, 1)
  scene.add(backLight)
  scene.add(backLight.target)
  scene.add(frontLight)
  scene.add(frontLight.target)
  scene.add(hemi)
  renderer = new WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(bounds.width, bounds.height)
  renderer.outputEncoding = sRGBEncoding
  renderer.domElement.id = domEltId
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
