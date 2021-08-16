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
  Vector3
} from 'three'
import { AssetLoader } from '../../assets/classes/AssetLoader'
import { getLoader } from '../../assets/functions/LoadGLTF'
import { XRInputSourceComponent } from '../../avatar/components/XRInputSourceComponent'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/EntityFunctions'

export const addControllerModels = async (entity: Entity) => {
  const xrInputSourceComponent = getComponent(entity, XRInputSourceComponent)

  // Add our controller models & pointer lines
  ;[xrInputSourceComponent.controllerLeft, xrInputSourceComponent.controllerRight].forEach((controller: any) => {
    /*
        controller.addEventListener('select', (ev) => {})
        controller.addEventListener('selectstart', (ev) => {})
        controller.addEventListener('selectend', (ev) => {})
        controller.addEventListener('squeeze', (ev) => {})
        controller.addEventListener('squeezestart', (ev) => {})
        controller.addEventListener('squeezeend', (ev) => {})
    */
    controller.addEventListener('connected', (ev) => {
      if (controller.targetRay) {
        controller.targetRay.visible = true
      } else {
        const targetRay = createController(ev.data)
        controller.add(targetRay)
        controller.targetRay = targetRay
      }
    })

    controller.addEventListener('disconnected', (ev) => {
      controller.targetRay.visible = false
    })
  })

  const model = await AssetLoader.loadAsync({ url: '/models/webxr/controllers/valve_controller_knu_1_0_right.glb' })

  const controller3DModel = model.children[2] as any

  const controllerMeshRight = controller3DModel.clone()
  const controllerMeshLeft = controller3DModel.clone()

  controllerMeshLeft.scale.multiply(new Vector3(-1, 1, 1))

  controllerMeshRight.material = new MeshPhongMaterial()
  controllerMeshLeft.material = new MeshPhongMaterial()

  controllerMeshRight.position.z = -0.12
  controllerMeshLeft.position.z = -0.12

  xrInputSourceComponent.controllerGripRight.add(controllerMeshRight)
  xrInputSourceComponent.controllerGripLeft.add(controllerMeshLeft)
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
