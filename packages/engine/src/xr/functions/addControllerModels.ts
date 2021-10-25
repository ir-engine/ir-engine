import {
  AdditiveBlending,
  BufferGeometry,
  Float32BufferAttribute,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  MeshPhongMaterial,
  RingGeometry,
  XRInputSource
} from 'three'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { XRInputSourceComponent } from '../../avatar/components/XRInputSourceComponent'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { XRHandMeshModel } from '../classes/XRHandMeshModel'

const initController = (controller: any, left: boolean) => {
  if(controller.userData.mesh){
    return
  }

  const controller3DModel = AssetLoader.getFromCache('/models/webxr/controllers/valve_controller_knu_1_0_right.glb')
    .scene.children[2]

  const controllerMesh = controller3DModel.clone()

  controllerMesh.position.z = -0.12
  controllerMesh.material = new MeshPhongMaterial()
  controller.add(controllerMesh)
  controller.userData.mesh = controllerMesh
  if (left) {
    controller.userData.mesh.scale.set(-1, 1, 1)
  }
}

export const addDefaultControllerModels = (entity: Entity) => {
  const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
  const controllers = [xrInputSourceComponent.controllerLeft, xrInputSourceComponent.controllerRight]

  controllers.forEach((controller: any) => {
    if(controller.userData.eventListnerAdded){
      return
    }

    controller.userData.eventListnerAdded = true

    controller.addEventListener('connected', (ev) => {
      const xrInputSource = ev.data as XRInputSource

      if (xrInputSource.targetRayMode !== 'tracked-pointer' && xrInputSource.targetRayMode !== 'gaze') {
        return
      }

      if (controller.targetRay) {
        controller.targetRay.visible = true
      } else {
        const targetRay = createController(ev.data)
        controller.add(targetRay)
        controller.targetRay = targetRay
      }

      controller.userData.xrInputSource = xrInputSource
    })

    controller.addEventListener('disconnected', (ev) => {
      if (controller?.targetRay) {
        controller.targetRay.visible = false
      }
    })
  })

  const controllersGrip = [xrInputSourceComponent.controllerGripLeft, xrInputSourceComponent.controllerGripRight]

  controllersGrip.forEach((controller: any) => {
    if(controller.userData.eventListnerAdded){
      return
    }

    controller.userData.eventListnerAdded = true

    // TODO: For some reason this event only fires when picking up the controller again on Oculus Quest 2
    controller.addEventListener('connected', (ev) => {
      const xrInputSource = ev.data as XRInputSource

      if (xrInputSource.targetRayMode !== 'tracked-pointer' || !xrInputSource.gamepad) {
        return
      }

      if (controller.userData.mesh) {
        if (xrInputSource.handedness === 'left') {
          controller.userData.mesh.scale.set(-1, 1, 1)
        } else {
          controller.userData.mesh.scale.setScalar(1)
        }
      }

      controller.userData.xrInputSource = xrInputSource
    })
    
    // TODO: Should call this function inside above event to get correct mapping
    initController(controller, controller === xrInputSourceComponent.controllerGripLeft)
  })
}

export const initializeHandModel = (controller: any, handedness: string) => {
  const handMesh = AssetLoader.getFromCache(`/models/webxr/controllers/hands/${handedness}.glb`)?.scene?.children[0]

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
const createController = (data) => {
  let geometry, material
  switch (data.targetRayMode) {
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
