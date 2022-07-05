import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  Mesh,
  MeshBasicMaterial,
  RingGeometry,
  SphereGeometry
} from 'three'

import { AssetLoader } from '../../assets/classes/AssetLoader'
import { SkeletonUtils } from '../../avatar/SkeletonUtils'
import { accessAvatarInputSettingsState } from '../../avatar/state/AvatarInputSettingsState'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { AvatarControllerType } from '../../input/enums/InputEnums'
import { isEntityLocalClient } from '../../networking/functions/isEntityLocalClient'
import { EngineRenderer } from '../../renderer/WebGLRendererSystem'
import { ControllerGroup, XRInputSourceComponent } from '../../xr/components/XRInputSourceComponent'
import { XRHandMeshModel } from '../classes/XRHandMeshModel'
import { initializeXRControllerAnimations } from './controllerAnimation'

const createUICursor = () => {
  const geometry = new SphereGeometry(0.01, 16, 16)
  const material = new MeshBasicMaterial({ color: 0xffffff })
  return new Mesh(geometry, material)
}

const setupController = (inputSource: XRInputSource, controller: ControllerGroup) => {
  const avatarInputState = accessAvatarInputSettingsState()
  if (inputSource) {
    // const canUseController =
    //   inputSource.hand === null && avatarInputState.controlType.value === AvatarControllerType.OculusQuest
    // const canUseHands = inputSource.hand !== null && avatarInputState.controlType.value === AvatarControllerType.XRHands
    // if (canUseController || canUseHands) {
    const targetRay = createController(inputSource)
    if (targetRay) {
      controller.add(targetRay)
      controller.targetRay = targetRay
    }
    // }
  }

  if (!controller.cursor) {
    controller.cursor = createUICursor()
    controller.add(controller.cursor)
    controller.cursor.visible = false
  }
}

export const initializeXRInputs = (entity: Entity) => {
  const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)

  const controllers = [xrInputSourceComponent.controllerLeft, xrInputSourceComponent.controllerRight]
  const controllersGrip = [xrInputSourceComponent.controllerGripLeft, xrInputSourceComponent.controllerGripRight]

  if (isEntityLocalClient(entity)) {
    controllers.forEach((controller: ControllerGroup, i) => {
      if (controller.userData.initialized) {
        return
      }
      controller.userData.initialized = true

      controller.parent!.addEventListener('connected', (ev) => {
        const xrInputSource = ev.data as XRInputSource

        if (xrInputSource.targetRayMode !== 'tracked-pointer' && xrInputSource.targetRayMode !== 'gaze') {
          return
        }

        if (!controller.targetRay) {
          setupController(xrInputSource, controller)
        }
      })

      const session = EngineRenderer.instance.xrManager.getSession()

      if (session) {
        const inputSource = session.inputSources[i]
        setupController(inputSource, controller)
      }
    })
  }

  controllersGrip.forEach((controller: any) => {
    if (controller.userData.initialized) {
      return
    }

    controller.userData.initialized = true

    const handedness = controller === xrInputSourceComponent.controllerGripLeft ? 'left' : 'right'
    initializeHandModel(entity, controller, handedness, true)
    initializeXRControllerAnimations(controller)
  })
}

export const initializeHandModel = (entity: Entity, controller: any, handedness: string, isGrip: boolean = false) => {
  const avatarInputState = accessAvatarInputSettingsState()

  let avatarInputControllerType = avatarInputState.controlType.value

  // if is grip and not 'controller' type enabled
  if (isGrip && avatarInputControllerType !== AvatarControllerType.OculusQuest) return

  // if is hands and 'none' type enabled (instead we use IK to move hands in avatar model)
  if (!isGrip && avatarInputControllerType === AvatarControllerType.None) return

  /**
   * TODO: both model types we have are hands, we also want to have an oculus quest controller model
   *    (as well as other hardware models) and appropriately set based on the controller type selected
   */

  const fileName = isGrip ? `${handedness}_controller.glb` : `${handedness}.glb`
  const gltf = AssetLoader.getFromCache(`/default_assets/controllers/hands/${fileName}`)
  let handMesh = gltf?.scene?.children[0]

  if (!handMesh) {
    console.error(`Could not load ${fileName} mesh`)
    return
  }

  handMesh = SkeletonUtils.clone(handMesh)

  if (controller.userData.mesh) {
    controller.remove(controller.userData.mesh)
  }

  controller.userData.mesh = isGrip ? handMesh : new XRHandMeshModel(entity, controller, handMesh, handedness)
  controller.add(controller.userData.mesh)
  controller.userData.handedness = handedness

  if (gltf?.animations?.length) {
    controller.userData.animations = gltf.animations
  }

  if (isGrip) {
    const winding = handedness == 'left' ? 1 : -1
    controller.userData.mesh.rotation.x = Math.PI * 0.25
    controller.userData.mesh.rotation.y = Math.PI * 0.5 * winding
    controller.userData.mesh.rotation.z = Math.PI * 0.02 * -winding
  }
}

export const cleanXRInputs = (entity) => {
  const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
  const controllersGrip = [xrInputSourceComponent.controllerGripLeft, xrInputSourceComponent.controllerGripRight]

  controllersGrip.forEach((controller) => {
    if (controller.userData.mesh) {
      controller.remove(controller.userData.mesh)
      controller.userData.mesh = null
      controller.userData.initialized = false
    }
  })
}

// pointer taken from https://github.com/mrdoob/three.js/blob/master/examples/webxr_vr_ballshooter.html
const createController = (inputSource: XRInputSource) => {
  let geometry, material
  switch (inputSource.targetRayMode) {
    case 'tracked-pointer':
      geometry = new BoxGeometry(0.005, 0.005, 0.25)
      const positions = geometry.attributes.position
      const count = positions.count
      geometry.setAttribute('color', new BufferAttribute(new Float32Array(count * 3), 3))
      const colors = geometry.attributes.color

      for (let i = 0; i < count; i++) {
        if (positions.getZ(i) < 0) colors.setXYZ(i, 0, 0, 0)
        else colors.setXYZ(i, 0.5, 0.5, 0.5)
      }

      material = new MeshBasicMaterial({ color: 0xffffff, vertexColors: true, blending: AdditiveBlending })
      const mesh = new Mesh(geometry, material)
      mesh.position.z = -0.125
      return mesh

    case 'gaze':
      geometry = new RingGeometry(0.02, 0.04, 32).translate(0, 0, -1)
      material = new MeshBasicMaterial({ opacity: 0.5, transparent: true })
      return new Mesh(geometry, material)
  }
}
