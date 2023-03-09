import { Box3, Matrix3, Sphere, Spherical, Vector3 } from 'three'

import { CameraComponent } from '@etherealengine/engine/src/camera/components/CameraComponent'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import {
  defineQuery,
  getComponent,
  getOptionalComponent,
  hasComponent,
  removeQuery
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { GroupComponent } from '@etherealengine/engine/src/scene/components/GroupComponent'
import obj3dFromUuid from '@etherealengine/engine/src/scene/util/obj3dFromUuid'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'

import { EditorCameraComponent } from '../classes/EditorCameraComponent'

const ZOOM_SPEED = 0.1
const MAX_FOCUS_DISTANCE = 1000
const PAN_SPEED = 1
const ORBIT_SPEED = 5

export default async function EditorCameraSystem() {
  const box = new Box3()
  const delta = new Vector3()
  const normalMatrix = new Matrix3()
  const sphere = new Sphere()
  const spherical = new Spherical()

  const cameraQuery = defineQuery([EditorCameraComponent, CameraComponent])

  const execute = () => {
    if (Engine.instance.localClientEntity) return
    for (const entity of cameraQuery()) {
      const cameraComponent = getComponent(entity, EditorCameraComponent)
      const transform = getComponent(entity, TransformComponent)
      const camera = getComponent(entity, CameraComponent)

      if (cameraComponent.zoomDelta) {
        const distance = transform.position.distanceTo(cameraComponent.center)
        delta.set(0, 0, cameraComponent.zoomDelta * distance * ZOOM_SPEED)
        if (delta.length() < distance) {
          delta.applyMatrix3(normalMatrix.getNormalMatrix(camera.matrixWorld))
          transform.position.add(delta)
        }
        cameraComponent.zoomDelta = 0
      }

      if (cameraComponent.refocus) {
        let distance = 0
        if (cameraComponent.focusedObjects.length === 0) {
          cameraComponent.center.set(0, 0, 0)
          distance = 10
        } else {
          box.makeEmpty()
          for (const object of cameraComponent.focusedObjects) {
            const group =
              typeof object === 'string' ? [obj3dFromUuid(object)] : getOptionalComponent(object, GroupComponent) || []
            for (const obj of group) {
              box.expandByObject(obj)
            }
          }
          if (box.isEmpty()) {
            // Focusing on an Group, AmbientLight, etc
            const object = cameraComponent.focusedObjects[0]

            if (typeof object === 'string') {
              cameraComponent.center.setFromMatrixPosition(obj3dFromUuid(object).matrixWorld)
            } else if (hasComponent(object, TransformComponent)) {
              const position = getComponent(object, TransformComponent).position
              cameraComponent.center.copy(position)
            }
            distance = 0.1
          } else {
            box.getCenter(cameraComponent.center)
            distance = box.getBoundingSphere(sphere).radius
          }
        }

        delta
          .set(0, 0, 1)
          .applyQuaternion(transform.rotation)
          .multiplyScalar(Math.min(distance, MAX_FOCUS_DISTANCE) * 4)
        transform.position.copy(cameraComponent.center).add(delta)

        cameraComponent.focusedObjects = null!
        cameraComponent.refocus = false
      }

      if (cameraComponent.isPanning) {
        const distance = transform.position.distanceTo(cameraComponent.center)
        delta
          .set(-cameraComponent.cursorDeltaX, -cameraComponent.cursorDeltaY, 0)
          .multiplyScalar(Math.max(distance, 1) * PAN_SPEED)
          .applyMatrix3(normalMatrix.getNormalMatrix(camera.matrix))
        transform.position.add(delta)
        cameraComponent.center.add(delta)

        cameraComponent.isPanning = false
      }

      if (cameraComponent.isOrbiting) {
        delta.copy(transform.position).sub(cameraComponent.center)
        spherical.setFromVector3(delta)
        spherical.theta -= cameraComponent.cursorDeltaX * ORBIT_SPEED
        spherical.phi += cameraComponent.cursorDeltaY * ORBIT_SPEED
        spherical.makeSafe()
        delta.setFromSpherical(spherical)

        transform.position.copy(cameraComponent.center).add(delta)
        camera.lookAt(cameraComponent.center)

        cameraComponent.isOrbiting = false
      }
      transform.position.copy(camera.position)
      transform.rotation.copy(camera.quaternion)
      Engine.instance.dirtyTransforms[entity] = true
    }
  }

  const cleanup = async () => {
    removeQuery(cameraQuery)
  }

  return { execute, cleanup }
}
