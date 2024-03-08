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

import { isClient } from '@etherealengine/common/src/utils/getEnvironment'
import {
  InputSystemGroup,
  defineQuery,
  defineSystem,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  hasComponent,
  setComponent
} from '@etherealengine/ecs'
import { TransformComponent } from '@etherealengine/spatial'
import { CameraComponent } from '@etherealengine/spatial/src/camera/components/CameraComponent'
import { CameraOrbitComponent } from '@etherealengine/spatial/src/camera/components/CameraOrbitComponent'
import { V_010 } from '@etherealengine/spatial/src/common/constants/MathConstants'
import { InputSourceComponent } from '@etherealengine/spatial/src/input/components/InputSourceComponent'
import { GroupComponent } from '@etherealengine/spatial/src/renderer/components/GroupComponent'
import { Box3, Matrix3, Sphere, Spherical, Vector3 } from 'three'
import obj3dFromUuid from '../../common/functions/obj3dFromUuid'
import { InputComponent } from '../../input/components/InputComponent'
import { InputPointerComponent } from '../../input/components/InputPointerComponent'
import { StandardGamepadAxes } from '../../input/state/ButtonState'

let lastZoom = 0

const ZOOM_SPEED = 0.1
const MAX_FOCUS_DISTANCE = 1000
const PAN_SPEED = 1
const ORBIT_SPEED = 5

const box = new Box3()
const delta = new Vector3()
const normalMatrix = new Matrix3()
const sphere = new Sphere()
const spherical = new Spherical()

// const doZoom = (entity:Entity, zoomDelta:number) => {
//   getMutableComponent(entity, CameraOrbitComponent).zoomDelta.set(zoomDelta)
// }

// const throttleZoom = throttle(doZoom, 30, { leading: true, trailing: false })
// const InputSourceQuery = defineQuery([InputSourceComponent])
const orbitCameraQuery = defineQuery([CameraOrbitComponent])
const execute = () => {
  if (!isClient) return
  /**
   * assign active orbit camera based on which input source registers input
   */
  for (const cameraEid of orbitCameraQuery()) {
    const cameraOrbit = getMutableComponent(cameraEid, CameraOrbitComponent)
    if (cameraOrbit.disabled.value) return // TODO: replace w/ EnabledComponent or DisabledComponent in query

    const inputSourceEids = getComponent(cameraEid, InputComponent).inputSources
    const buttons = InputSourceComponent.getMergedButtons(inputSourceEids)
    const axes = InputSourceComponent.getMergedAxes(inputSourceEids)
    const capturedInputs = InputSourceComponent.captureOnCondition(inputSourceEids, (eid) => {
      const is = getComponent(eid, InputSourceComponent)
      const ip = getOptionalComponent(eid, InputPointerComponent)
      return ip && is.buttons.PrimaryClick?.pressed
    })

    if (!capturedInputs) continue

    // TODO: handle multi-touch pinch/zoom
    const inputPointer = getComponent(capturedInputs[0], InputPointerComponent)

    const selecting = buttons.PrimaryClick?.pressed
    const zoom = axes[StandardGamepadAxes.RightStickY]
    const panning = buttons.AuxiliaryClick?.pressed

    if (buttons.KeyF?.down) {
      cameraOrbit.refocus.set(true)
    }
    if (selecting) {
      cameraOrbit.isOrbiting.set(true)
      const mouseMovement = inputPointer.movement
      if (mouseMovement) {
        cameraOrbit.cursorDeltaX.set(mouseMovement.x)
        cameraOrbit.cursorDeltaY.set(mouseMovement.y)
      }
    } else if (panning) {
      cameraOrbit.isPanning.set(true)
      const mouseMovement = inputPointer.movement
      if (mouseMovement) {
        cameraOrbit.cursorDeltaX.set(mouseMovement.x)
        cameraOrbit.cursorDeltaY.set(mouseMovement.y)
      }
    } else if (zoom) {
      cameraOrbit.zoomDelta.set(zoom[1])
    }

    const editorCameraCenter = cameraOrbit.cameraOrbitCenter.value
    const transform = getComponent(cameraEid, TransformComponent)
    const camera = getComponent(cameraEid, CameraComponent)

    if (cameraOrbit.zoomDelta.value) {
      const distance = transform.position.distanceTo(cameraOrbit.cameraOrbitCenter.value)
      delta.set(0, 0, cameraOrbit.zoomDelta.value * distance * ZOOM_SPEED)
      if (delta.length() < distance) {
        delta.applyMatrix3(normalMatrix.getNormalMatrix(camera.matrixWorld))
        transform.position.add(delta)
      }
      getMutableComponent(cameraEid, CameraOrbitComponent).zoomDelta.set(0)
    }

    if (cameraOrbit.refocus.value) {
      let distance = 0
      if (cameraOrbit.focusedEntities.length === 0) {
        editorCameraCenter.set(0, 0, 0)
        distance = 10
      } else {
        box.makeEmpty()
        for (const object of cameraOrbit.focusedEntities.value) {
          const group =
            typeof object === 'string' ? [obj3dFromUuid(object)] : getOptionalComponent(object, GroupComponent) || []
          for (const obj of group) {
            box.expandByObject(obj)
          }
        }
        if (box.isEmpty()) {
          // Focusing on an Group, AmbientLight, etc
          const object = cameraOrbit.focusedEntities[0].value

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
        .multiplyScalar(Math.min(distance, MAX_FOCUS_DISTANCE) * 2)
      transform.position.copy(editorCameraCenter).add(delta)

      setComponent(cameraEid, CameraOrbitComponent, { focusedEntities: null!, refocus: false })
    }

    if (cameraOrbit.isPanning.value) {
      const distance = transform.position.distanceTo(editorCameraCenter)
      delta
        .set(-cameraOrbit.cursorDeltaX.value, -cameraOrbit.cursorDeltaY.value, 0)
        .multiplyScalar(Math.max(distance, 1) * PAN_SPEED)
        .applyMatrix3(normalMatrix.getNormalMatrix(camera.matrix))
      transform.position.add(delta)
      editorCameraCenter.add(delta)

      getMutableComponent(cameraEid, CameraOrbitComponent).isPanning.set(false)
    }

    if (cameraOrbit.isOrbiting.value) {
      delta.copy(transform.position).sub(editorCameraCenter)

      spherical.setFromVector3(delta)
      spherical.theta -= cameraOrbit.cursorDeltaX.value * ORBIT_SPEED
      spherical.phi += cameraOrbit.cursorDeltaY.value * ORBIT_SPEED
      spherical.makeSafe()
      delta.setFromSpherical(spherical)

      transform.position.copy(editorCameraCenter).add(delta)
      transform.matrix.lookAt(transform.position, editorCameraCenter, V_010)
      transform.rotation.setFromRotationMatrix(transform.matrix)

      getMutableComponent(cameraEid, CameraOrbitComponent).isOrbiting.set(false)
    }
  }
}

export const CameraOrbitSystem = defineSystem({
  uuid: 'ee.engine.CameraOrbitSystem',
  insert: { with: InputSystemGroup },
  execute
})
