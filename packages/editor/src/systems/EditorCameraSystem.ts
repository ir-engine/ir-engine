import { System } from '@xrengine/engine/src/ecs/classes/System'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import { defineQuery, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'
import { Vector3, Matrix3, Box3, Sphere, Spherical } from 'three'
import { EditorCameraComponent } from '../classes/EditorCameraComponent'

const ZOOM_SPEED = 0.1
const MAX_FOCUS_DISTANCE = 1000
const PAN_SPEED = 1
const ORBIT_SPEED = 5

/**
 * @author Gheric Speiginer <github.com/speigg>
 */
export default async function GizmoSystem(world: World): Promise<System> {
  const box = new Box3()
  const delta = new Vector3()
  const normalMatrix = new Matrix3()
  const sphere = new Sphere()
  const spherical = new Spherical()

  return () => {
    const cameraQuery = defineQuery([EditorCameraComponent])

    for (const entity of cameraQuery()) {
      const cameraComponent = getComponent(entity, EditorCameraComponent)

      if (!cameraComponent.dirty) return

      const camera = getComponent(entity, Object3DComponent)?.value
      if (cameraComponent.zoomDelta) {
        const distance = camera.position.distanceTo(cameraComponent.center!)
        delta.set(0, 0, cameraComponent.zoomDelta * distance * ZOOM_SPEED)

        if (delta.length() > distance) return

        delta.applyMatrix3(normalMatrix.getNormalMatrix(camera.matrix))
        camera.position.add(delta)

        cameraComponent.zoomDelta = 0
      }

      if (cameraComponent.focusedObjects) {
        let distance = 0
        if (cameraComponent.focusedObjects.length === 0) {
          cameraComponent.center.set(0, 0, 0)
          distance = 10
        } else {
          box.makeEmpty()
          for (const object of cameraComponent.focusedObjects) box.expandByObject(object)

          if (box.isEmpty()) {
            // Focusing on an Group, AmbientLight, etc
            cameraComponent.center.setFromMatrixPosition(cameraComponent.focusedObjects[0].matrixWorld)
            distance = 0.1
          } else {
            box.getCenter(cameraComponent.center)
            distance = box.getBoundingSphere(sphere).radius
          }
        }

        delta
          .set(0, 0, 1)
          .applyQuaternion(camera.quaternion)
          .multiplyScalar(Math.min(distance, MAX_FOCUS_DISTANCE) * 4)
        camera.position.copy(cameraComponent.center).add(delta)

        cameraComponent.focusedObjects = null!
      }

      if (cameraComponent.isPanning) {
        const distance = camera.position.distanceTo(cameraComponent.center)
        delta
          .set(cameraComponent.cursorDeltaX, -cameraComponent.cursorDeltaY, 0)
          .multiplyScalar(distance * PAN_SPEED)
          .applyMatrix3(normalMatrix.getNormalMatrix(camera.matrix))
        camera.position.add(delta)
        cameraComponent.center.add(delta)

        cameraComponent.isPanning = false
      }

      if (cameraComponent.isOrbiting) {
        delta.copy(camera.position).sub(cameraComponent.center)
        spherical.setFromVector3(delta)
        spherical.theta += cameraComponent.cursorDeltaX * ORBIT_SPEED
        spherical.phi += cameraComponent.cursorDeltaY * ORBIT_SPEED
        spherical.makeSafe()
        delta.setFromSpherical(spherical)

        camera.position.copy(cameraComponent.center).add(delta)
        camera.lookAt(cameraComponent.center)

        cameraComponent.isOrbiting = false
      }

      cameraComponent.dirty = false
    }
  }
}
