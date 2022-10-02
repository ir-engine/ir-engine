import { Box3, Matrix3, Sphere, Spherical, Vector3 } from 'three'

import { CameraComponent } from '@xrengine/engine/src/camera/components/CameraComponent'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import {
  defineQuery,
  getComponent,
  hasComponent,
  removeQuery
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { GroupComponent } from '@xrengine/engine/src/scene/components/GroupComponent'
import obj3dFromUuid from '@xrengine/engine/src/scene/util/obj3dFromUuid'
import {
  LocalTransformComponent,
  TransformComponent
} from '@xrengine/engine/src/transform/components/TransformComponent'

import { EditorCameraComponent } from '../classes/EditorCameraComponent'

const ZOOM_SPEED = 0.1
const MAX_FOCUS_DISTANCE = 1000
const PAN_SPEED = 1
const ORBIT_SPEED = 5

export default async function EditorCameraSystem(world: World) {
  const box = new Box3()
  const delta = new Vector3()
  const normalMatrix = new Matrix3()
  const sphere = new Sphere()
  const spherical = new Spherical()

  const cameraQuery = defineQuery([EditorCameraComponent, CameraComponent])

  const execute = () => {
    for (const entity of cameraQuery()) {
      const cameraComponent = getComponent(entity, EditorCameraComponent)
      const transform = getComponent(entity, TransformComponent)
      const localTransform = getComponent(entity, LocalTransformComponent)
      const camera = getComponent(entity, CameraComponent).camera

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
              typeof object === 'string' ? [obj3dFromUuid(object)] : getComponent(object.entity, GroupComponent) || []
            for (const obj of group) {
              box.expandByObject(obj)
            }
          }
          if (box.isEmpty()) {
            // Focusing on an Group, AmbientLight, etc
            const object = cameraComponent.focusedObjects[0]

            const obj3d =
              typeof object === 'string' ? obj3dFromUuid(object) : getComponent(object.entity, GroupComponent)?.[0]

            if (typeof object === 'string') {
              cameraComponent.center.setFromMatrixPosition(obj3d.matrixWorld)
            } else if (hasComponent(object.entity, TransformComponent)) {
              const position = getComponent(object.entity, TransformComponent).position
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
          .set(cameraComponent.cursorDeltaX, -cameraComponent.cursorDeltaY, 0)
          .multiplyScalar(Math.max(distance, 1) * PAN_SPEED)
          .applyMatrix3(normalMatrix.getNormalMatrix(camera.matrix))
        transform.position.add(delta)
        cameraComponent.center.add(delta)

        cameraComponent.isPanning = false
      }

      if (cameraComponent.isOrbiting) {
        delta.copy(transform.position).sub(cameraComponent.center)
        spherical.setFromVector3(delta)
        spherical.theta += cameraComponent.cursorDeltaX * ORBIT_SPEED
        spherical.phi += cameraComponent.cursorDeltaY * ORBIT_SPEED
        spherical.makeSafe()
        delta.setFromSpherical(spherical)

        transform.position.copy(cameraComponent.center).add(delta)
        camera.lookAt(cameraComponent.center)

        cameraComponent.isOrbiting = false
      }
      localTransform.position.copy(camera.position)
      localTransform.rotation.copy(camera.quaternion)
      world.dirtyTransforms.add(entity)
    }
  }

  const cleanup = async () => {
    removeQuery(world, cameraQuery)
  }

  return { execute, cleanup }
}
