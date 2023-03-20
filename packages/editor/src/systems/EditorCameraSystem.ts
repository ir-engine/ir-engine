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
import { getMutableState, getState } from '@etherealengine/hyperflux'

import { EditorCameraState } from '../classes/EditorCameraState'

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

  const execute = () => {
    if (Engine.instance.localClientEntity) return
    const editorCameraState = getMutableState(EditorCameraState)
    const editorCamera = editorCameraState.value
    const entity = Engine.instance.cameraEntity
    const transform = getComponent(entity, TransformComponent)
    const camera = getComponent(entity, CameraComponent)

    if (editorCamera.zoomDelta) {
      const distance = transform.position.distanceTo(editorCamera.center)
      delta.set(0, 0, editorCamera.zoomDelta * distance * ZOOM_SPEED)
      if (delta.length() < distance) {
        delta.applyMatrix3(normalMatrix.getNormalMatrix(camera.matrixWorld))
        transform.position.add(delta)
      }
      editorCameraState.zoomDelta.set(0)
    }

    if (editorCamera.refocus) {
      let distance = 0
      if (editorCamera.focusedObjects.length === 0) {
        editorCamera.center.set(0, 0, 0)
        distance = 10
      } else {
        box.makeEmpty()
        for (const object of editorCamera.focusedObjects) {
          const group =
            typeof object === 'string' ? [obj3dFromUuid(object)] : getOptionalComponent(object, GroupComponent) || []
          for (const obj of group) {
            box.expandByObject(obj)
          }
        }
        if (box.isEmpty()) {
          // Focusing on an Group, AmbientLight, etc
          const object = editorCamera.focusedObjects[0]

          if (typeof object === 'string') {
            editorCamera.center.setFromMatrixPosition(obj3dFromUuid(object).matrixWorld)
          } else if (hasComponent(object, TransformComponent)) {
            const position = getComponent(object, TransformComponent).position
            editorCamera.center.copy(position)
          }
          distance = 0.1
        } else {
          box.getCenter(editorCamera.center)
          distance = box.getBoundingSphere(sphere).radius
        }
      }

      delta
        .set(0, 0, 1)
        .applyQuaternion(transform.rotation)
        .multiplyScalar(Math.min(distance, MAX_FOCUS_DISTANCE) * 4)
      transform.position.copy(editorCamera.center).add(delta)

      editorCameraState.focusedObjects.set(null!)
      editorCameraState.refocus.set(false)
    }

    if (editorCamera.isPanning) {
      const distance = transform.position.distanceTo(editorCamera.center)
      delta
        .set(-editorCamera.cursorDeltaX, -editorCamera.cursorDeltaY, 0)
        .multiplyScalar(Math.max(distance, 1) * PAN_SPEED)
        .applyMatrix3(normalMatrix.getNormalMatrix(camera.matrix))
      transform.position.add(delta)
      editorCamera.center.add(delta)

      editorCameraState.isPanning.set(false)
    }

    if (editorCamera.isOrbiting) {
      delta.copy(transform.position).sub(editorCamera.center)
      spherical.setFromVector3(delta)
      spherical.theta -= editorCamera.cursorDeltaX * ORBIT_SPEED
      spherical.phi += editorCamera.cursorDeltaY * ORBIT_SPEED
      spherical.makeSafe()
      delta.setFromSpherical(spherical)

      camera.position.copy(editorCamera.center).add(delta)
      camera.updateMatrix()
      camera.lookAt(editorCamera.center)
      transform.position.copy(camera.position)
      transform.rotation.copy(camera.quaternion)

      editorCameraState.isOrbiting.set(false)
    }
  }

  const cleanup = async () => {}

  return { execute, cleanup }
}
