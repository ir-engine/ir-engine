import {
  AdditiveBlending,
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Float32BufferAttribute,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  RingGeometry,
  SphereGeometry,
  XRInputSource
} from 'three'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { SkeletonUtils } from '../../avatar/SkeletonUtils'
import { isClient } from '../../common/functions/isClient'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { XRInputSourceComponent } from '../../xr/components/XRInputSourceComponent'
import { XRHandMeshModel } from '../classes/XRHandMeshModel'
import { initializeXRControllerAnimations } from './controllerAnimation'
import { mapXRControllers } from './WebXRFunctions'

const createUICursor = () => {
  const geometry = new SphereGeometry(0.01, 16, 16)
  const material = new MeshBasicMaterial({ color: 0xffffff })
  return new Mesh(geometry, material)
}

const setupController = (inputSource, controller) => {
  if (inputSource) {
    const targetRay = createController(inputSource)
    if (targetRay) {
      controller.add(targetRay)
      controller.targetRay = targetRay
    }
  }

  if (!controller.cursor) {
    controller.cursor = createUICursor()
    controller.add(controller.cursor)
    controller.cursor.visible = false
  }
}

export const initializeXRInputs = (entity: Entity) => {
  const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)

  const session = Engine.xrManager.getSession()
  const controllers = [xrInputSourceComponent.controllerLeft, xrInputSourceComponent.controllerRight]
  const controllersGrip = [xrInputSourceComponent.controllerGripLeft, xrInputSourceComponent.controllerGripRight]

  controllers.forEach((controller: any, i) => {
    if (controller.userData.initialized) {
      return
    }
    controller.userData.initialized = true

    controller.parent.addEventListener('connected', (ev) => {
      mapXRControllers(xrInputSourceComponent)

      const xrInputSource = ev.data as XRInputSource

      if (xrInputSource.targetRayMode !== 'tracked-pointer' && xrInputSource.targetRayMode !== 'gaze') {
        return
      }

      if (!controller.targetRay) {
        setupController(ev.data, controller)
      }
    })

    const inputSource = session.inputSources[i]
    setupController(inputSource, controller)
  })

  controllersGrip.forEach((controller: any) => {
    if (controller.userData.initialized) {
      return
    }

    controller.userData.initialized = true

    const handedness = controller === xrInputSourceComponent.controllerGripLeft ? 'left' : 'right'
    const winding = handedness == 'left' ? 1 : -1
    initializeHandModel(controller, handedness, true)
    initializeXRControllerAnimations(controller)
    controller.userData.mesh.rotation.x = Math.PI * 0.25
    controller.userData.mesh.rotation.y = Math.PI * 0.5 * winding
    controller.userData.mesh.rotation.z = Math.PI * 0.02 * -winding
  })
}

export const initializeHandModel = (controller: any, handedness: string, isGrip: boolean = false) => {
  const fileName = isGrip ? `${handedness}_controller.glb` : `${handedness}.glb`
  const gltf = AssetLoader.getFromCache(`/default_assets/controllers/hands/${fileName}`)
  let handMesh = gltf?.scene?.children[0]

  if (!handMesh) {
    if (isClient) console.error(`Could not load ${fileName} mesh`)
    return
  }

  handMesh = SkeletonUtils.clone(handMesh)

  if (controller.userData.mesh) {
    controller.remove(controller.userData.mesh)
  }

  controller.userData.mesh = isGrip ? handMesh : new XRHandMeshModel(controller, handMesh, handedness)
  controller.add(controller.userData.mesh)
  controller.userData.handedness = handedness

  if (gltf?.animations?.length) {
    controller.userData.animations = gltf.animations
  }
}

// pointer taken from https://github.com/mrdoob/three.js/blob/master/examples/webxr_vr_ballshooter.html
const createController = (inputSource) => {
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
