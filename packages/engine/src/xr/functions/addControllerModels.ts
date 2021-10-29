import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  RingGeometry,
  XRInputSource
} from 'three'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { SkeletonUtils } from '../../avatar/SkeletonUtils'
import { Engine } from '../../ecs/classes/Engine'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { XRInputSourceComponent, XRInputSourceComponentType } from '../../xr/components/XRInputSourceComponent'
import { XRHandMeshModel } from '../classes/XRHandMeshModel'

const remapXRControllers = (xrInputSourceComponent: XRInputSourceComponentType) => {
  // Try to map controllers to correct hand
  // Internally inputSources and controllers are connected using same index
  const session = Engine.xrManager.getSession()

  for (let i = 0; i < 2; i++) {
    const inputSource = session.inputSources[i]
    const controller = Engine.xrManager.getController(i)
    const grip = Engine.xrManager.getControllerGrip(i)
    if (inputSource.handedness === 'left') {
      xrInputSourceComponent.controllerLeft = controller
      xrInputSourceComponent.controllerGripLeft = grip
    } else if (inputSource.handedness === 'right') {
      xrInputSourceComponent.controllerRight = controller
      xrInputSourceComponent.controllerGripRight = grip
    } else {
      console.warn('Could not determine xr input source handedness', i)
    }
  }
}

export const initializeXRInputs = (entity: Entity) => {
  const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)

  remapXRControllers(xrInputSourceComponent)

  const session = Engine.xrManager.getSession()
  const controllers = [xrInputSourceComponent.controllerLeft, xrInputSourceComponent.controllerRight]
  const controllersGrip = [xrInputSourceComponent.controllerGripLeft, xrInputSourceComponent.controllerGripRight]

  controllers.forEach((controller: any, i) => {
    if (controller.userData.initialized) {
      return
    }
    controller.userData.initialized = true

    controller.addEventListener('connected', (ev) => {
      remapXRControllers(xrInputSourceComponent)

      const xrInputSource = ev.data as XRInputSource

      if (xrInputSource.targetRayMode !== 'tracked-pointer' && xrInputSource.targetRayMode !== 'gaze') {
        return
      }

      if (!controller.targetRay) {
        const targetRay = createController(ev.data)
        controller.add(targetRay)
        controller.targetRay = targetRay
      }
    })

    const inputSource = session.inputSources[i]
    const targetRay = createController(inputSource)
    if (targetRay) {
      controller.add(targetRay)
      controller.targetRay = targetRay
    }
  })

  controllersGrip.forEach((controller: any) => {
    if (controller.userData.initialized) {
      return
    }

    controller.userData.initialized = true
    const handedness = controller === xrInputSourceComponent.controllerGripLeft ? 'left' : 'right'
    const winding = handedness == 'left' ? 1 : -1
    //initController(controller, controller === xrInputSourceComponent.controllerGripLeft)
    initializeHandModel(controller, handedness)
    controller.userData.mesh.rotation.x = Math.PI * 0.25
    controller.userData.mesh.rotation.y = Math.PI * 0.5 * winding
    controller.userData.mesh.rotation.z = Math.PI * 0.02 * -winding
  })
}

export const initializeHandModel = (controller: any, handedness: string) => {
  const handMesh = SkeletonUtils.clone(
    AssetLoader.getFromCache(`/default_assets/controllers/hands/${handedness}.glb`)?.scene?.children[0]
  )

  if (!handMesh) {
    console.error(`Could not load ${handedness} hand mesh`)
    return
  }

  if (controller.userData.mesh) {
    controller.remove(controller.userData.mesh)
  }

  controller.userData.mesh = new XRHandMeshModel(controller, handMesh, handedness)
  controller.add(controller.userData.mesh)
  controller.userData.handedness = handedness
}

// pointer taken from https://github.com/mrdoob/three.js/blob/master/examples/webxr_vr_ballshooter.html
const createController = (inputSource) => {
  let geometry, material
  switch (inputSource.targetRayMode) {
    case 'tracked-pointer':
      geometry = new BufferGeometry()
      geometry.setAttribute('position', new Float32BufferAttribute([0, 0, 0, 0, 0, -1], 3))
      geometry.setAttribute('color', new Float32BufferAttribute([0.5, 0.5, 0.5, 0, 0, 0], 3))
      geometry.setAttribute('alpha', new Float32BufferAttribute([1, 0], 1))
      material = new LineBasicMaterial({ vertexColors: true, blending: AdditiveBlending })
      return new Line(geometry, material)

    case 'gaze':
      geometry = new RingGeometry(0.02, 0.04, 32).translate(0, 0, -1)
      material = new MeshBasicMaterial({ opacity: 0.5, transparent: true })
      return new Mesh(geometry, material)
  }
}
