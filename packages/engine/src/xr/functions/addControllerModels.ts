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
  Vector3,
  XRInputSource
} from 'three'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { XRInputSourceComponent } from '../../avatar/components/XRInputSourceComponent'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { XRHandMeshModel } from '../classes/XRHandMeshModel'

export const addDefaultControllerModels = (entity: Entity) => {
  const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)
  const controllers = [xrInputSourceComponent.controllerLeft, xrInputSourceComponent.controllerRight]

  controllers.forEach((controller: any) => {
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
        controller.userData.xrInputSource = xrInputSource

        // Swap controllers if neccessary
        if (
          (controller === xrInputSourceComponent.controllerLeft && xrInputSource.handedness === 'right') ||
          (controller === xrInputSourceComponent.controllerRight && xrInputSource.handedness === 'left')
        ) {
          const tempController = xrInputSourceComponent.controllerLeft
          xrInputSourceComponent.controllerLeft = xrInputSourceComponent.controllerRight
          xrInputSourceComponent.controllerRight = tempController
        }
      }
    })

    controller.addEventListener('disconnected', (ev) => {
      if (controller?.targetRay) {
        controller.targetRay.visible = false
      }
    })
  })

  const controller3DModel = AssetLoader.getFromCache('/models/webxr/controllers/valve_controller_knu_1_0_right.glb')
    .scene.children[2]

  const controllersGrip = [xrInputSourceComponent.controllerGripLeft, xrInputSourceComponent.controllerGripRight]

  controllersGrip.forEach((controller: any) => {
    controller.addEventListener('connected', (ev) => {
      const xrInputSource = ev.data as XRInputSource

      if (xrInputSource.targetRayMode !== 'tracked-pointer' || !xrInputSource.gamepad) {
        return
      }

      if (!controller.userData.xrInputSource) {
        const controllerMesh = controller3DModel.clone()

        if (xrInputSource.handedness === 'left') {
          controllerMesh.scale.multiply(new Vector3(-1, 1, 1))
        }

        controllerMesh.position.z = -0.12
        controllerMesh.material = new MeshPhongMaterial()
        controller.add(controllerMesh)
        controller.userData.xrInputSource = xrInputSource

        // Swap controllers if neccessary
        if (
          (controller === xrInputSourceComponent.controllerGripLeft && xrInputSource.handedness === 'right') ||
          (controller === xrInputSourceComponent.controllerGripRight && xrInputSource.handedness === 'left')
        ) {
          const tempController = xrInputSourceComponent.controllerGripLeft
          xrInputSourceComponent.controllerGripLeft = xrInputSourceComponent.controllerGripRight
          xrInputSourceComponent.controllerGripRight = tempController
        }
      }
    })
  })
}

export const addDefaultHandModel = (entity: Entity) => {
  const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)

  xrInputSourceComponent.hands.forEach((controller: any) => {
    controller.addEventListener('connected', (ev) => {
      const xrInputSource = ev.data

      if (!xrInputSource.hand || controller.userData.mesh) {
        return
      }

      const handMesh = AssetLoader.getFromCache(`/models/webxr/controllers/hands/${xrInputSource.handedness}.glb`).scene
        .children[0]
      controller.userData.mesh = new XRHandMeshModel(controller, handMesh, xrInputSource)
      controller.add(controller.userData.mesh)
    })
  })
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
