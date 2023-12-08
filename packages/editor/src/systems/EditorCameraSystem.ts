/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { Box3, Matrix3, Sphere, Spherical, Vector3 } from 'three'

import { CameraComponent } from '@etherealengine/engine/src/camera/components/CameraComponent'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import {
  getComponent,
  getOptionalComponent,
  hasComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { GroupComponent } from '@etherealengine/engine/src/scene/components/GroupComponent'
import obj3dFromUuid from '@etherealengine/engine/src/scene/util/obj3dFromUuid'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { getMutableState, getState } from '@etherealengine/hyperflux'

import { PresentationSystemGroup } from '@etherealengine/engine/src/ecs/functions/SystemGroups'
import { editorCameraCenter, EditorCameraState } from '../classes/EditorCameraState'

const ZOOM_SPEED = 0.1
const MAX_FOCUS_DISTANCE = 1000
const PAN_SPEED = 1
const ORBIT_SPEED = 5

const box = new Box3()
const delta = new Vector3()
const normalMatrix = new Matrix3()
const sphere = new Sphere()
const spherical = new Spherical()

const execute = () => {
  if (Engine.instance.localClientEntity) return
  const editorCamera = getState(EditorCameraState)
  const entity = Engine.instance.cameraEntity
  const transform = getComponent(entity, TransformComponent)
  const camera = getComponent(entity, CameraComponent)

  if (editorCamera.zoomDelta) {
    const distance = transform.position.distanceTo(editorCameraCenter)
    delta.set(0, 0, editorCamera.zoomDelta * distance * ZOOM_SPEED)
    if (delta.length() < distance) {
      delta.applyMatrix3(normalMatrix.getNormalMatrix(camera.matrixWorld))
      transform.position.add(delta)
    }
    getMutableState(EditorCameraState).zoomDelta.set(0)
  }

  if (editorCamera.refocus) {
    let distance = 0
    if (editorCamera.focusedObjects.length === 0) {
      editorCameraCenter.set(0, 0, 0)
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
          editorCameraCenter.setFromMatrixPosition(obj3dFromUuid(object).matrixWorld)
        } else if (hasComponent(object, TransformComponent)) {
          const position = getComponent(object, TransformComponent).position
          editorCameraCenter.copy(position)
        }
        distance = 0.1
      } else {
        box.getCenter(editorCameraCenter)
        distance = box.getBoundingSphere(sphere).radius
      }
    }

    delta
      .set(0, 0, 1)
      .applyQuaternion(transform.rotation)
      .multiplyScalar(Math.min(distance, MAX_FOCUS_DISTANCE) * 4)
    transform.position.copy(editorCameraCenter).add(delta)

    const editorCameraState = getMutableState(EditorCameraState)
    editorCameraState.focusedObjects.set(null!)
    editorCameraState.refocus.set(false)
  }

  if (editorCamera.isPanning) {
    const distance = transform.position.distanceTo(editorCameraCenter)
    delta
      .set(-editorCamera.cursorDeltaX, -editorCamera.cursorDeltaY, 0)
      .multiplyScalar(Math.max(distance, 1) * PAN_SPEED)
      .applyMatrix3(normalMatrix.getNormalMatrix(camera.matrix))
    transform.position.add(delta)
    editorCameraCenter.add(delta)

    getMutableState(EditorCameraState).isPanning.set(false)
  }

  if (editorCamera.isOrbiting) {
    delta.copy(transform.position).sub(editorCameraCenter)

    spherical.setFromVector3(delta)
    spherical.theta -= editorCamera.cursorDeltaX * ORBIT_SPEED
    spherical.phi += editorCamera.cursorDeltaY * ORBIT_SPEED
    spherical.makeSafe()
    delta.setFromSpherical(spherical)

    camera.position.copy(editorCameraCenter).add(delta)
    camera.updateMatrix()
    camera.lookAt(editorCameraCenter)
    transform.position.copy(camera.position)
    transform.rotation.copy(camera.quaternion)

    getMutableState(EditorCameraState).isOrbiting.set(false)
  }
}

export const EditorCameraSystem = defineSystem({
  uuid: 'ee.editor.EditorCameraSystem',
  insert: { before: PresentationSystemGroup },
  execute
})
