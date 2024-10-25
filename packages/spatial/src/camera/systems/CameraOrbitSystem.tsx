/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { Not } from 'bitecs'
import { Box3, Matrix3, Sphere, Spherical, Vector3 } from 'three'

import {
  defineQuery,
  defineSystem,
  Engine,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  InputSystemGroup,
  setComponent,
  UndefinedEntity
} from '@ir-engine/ecs'
import { getState, isClient } from '@ir-engine/hyperflux'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { CameraOrbitComponent } from '@ir-engine/spatial/src/camera/components/CameraOrbitComponent'
import { Vector3_Up } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { GroupComponent } from '@ir-engine/spatial/src/renderer/components/GroupComponent'
import { EngineState } from '../../EngineState'
import { InputComponent } from '../../input/components/InputComponent'
import { InputPointerComponent } from '../../input/components/InputPointerComponent'
import { MouseScroll } from '../../input/state/ButtonState'
import { InputState } from '../../input/state/InputState'
import { RendererComponent } from '../../renderer/WebGLRendererSystem'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { FlyControlComponent } from '../components/FlyControlComponent'
const ZOOM_SPEED = 0.1
const MAX_FOCUS_DISTANCE = 1000
const PAN_SPEED = 1
const ORBIT_SPEED = 5

const box = new Box3()
const delta = new Vector3()
const normalMatrix = new Matrix3()
const sphere = new Sphere()
const spherical = new Spherical()

// const throttleZoom = throttle(doZoom, 30, { leading: true, trailing: false })
const orbitCameraQuery = defineQuery([
  RendererComponent,
  CameraOrbitComponent,
  InputComponent,
  Not(FlyControlComponent)
])

const execute = () => {
  if (!isClient) return

  // TODO: handle multi-touch pinch/zoom

  /**
   * assign active orbit camera based on which input source registers input
   */
  for (const cameraEid of orbitCameraQuery()) {
    if (getState(InputState).capturingCameraOrbitEnabled) {
      const inputPointerEntity = InputPointerComponent.getPointersForCamera(cameraEid)[0]

      const cameraOrbit = getMutableComponent(cameraEid, CameraOrbitComponent)

      if (!inputPointerEntity && !cameraOrbit.refocus.value) continue

      // TODO: replace w/ EnabledComponent or DisabledComponent in query
      if (
        cameraOrbit.disabled.value ||
        getState(InputState).capturingEntity !== UndefinedEntity ||
        (cameraEid == Engine.instance.viewerEntity && !getState(EngineState).isEditing)
      )
        continue

      const buttons = InputComponent.getMergedButtons(cameraEid)
      const axes = InputComponent.getMergedAxes(cameraEid)

      if (buttons.PrimaryClick?.pressed && buttons.PrimaryClick?.dragging) {
        InputState.setCapturingEntity(cameraEid)
        cameraOrbit.isOrbiting.set(true)
      }

      const selecting = buttons.PrimaryClick?.pressed
      const zoom = axes[MouseScroll.VerticalScroll]
      const panning = buttons.AuxiliaryClick?.pressed

      const transform = getComponent(cameraEid, TransformComponent)
      const editorCameraCenter = cameraOrbit.cameraOrbitCenter.value
      const distance = transform.position.distanceTo(editorCameraCenter)
      const camera = getComponent(cameraEid, CameraComponent)

      if (buttons.KeyF?.down || distance < cameraOrbit.minimumZoom.value) {
        cameraOrbit.refocus.set(true)
      }
      if (inputPointerEntity) {
        const inputPointer = getComponent(inputPointerEntity, InputPointerComponent)
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
        }
      }

      if (zoom) {
        delta.set(0, 0, zoom * distance * ZOOM_SPEED)
        if (delta.length() < distance) {
          delta.applyMatrix3(normalMatrix.getNormalMatrix(camera.matrixWorld))
          transform.position.add(delta)
        }
      }

      if (cameraOrbit.refocus.value) {
        let distance = cameraOrbit.minimumZoom.value
        if (cameraOrbit.focusedEntities.length === 0) {
          editorCameraCenter.set(0, 0, 0)
          distance = 10
        } else {
          box.makeEmpty()
          for (const object of cameraOrbit.focusedEntities.value) {
            const group = getOptionalComponent(object, GroupComponent)
            if (group)
              for (const obj of group) {
                box.expandByObject(obj)
              }
          }
          if (box.isEmpty()) {
            const entity = cameraOrbit.focusedEntities[0].value
            const position = getComponent(entity, TransformComponent).position
            editorCameraCenter.copy(position)
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
        transform.matrix.lookAt(transform.position, editorCameraCenter, Vector3_Up)
        transform.rotation.setFromRotationMatrix(transform.matrix)

        getMutableComponent(cameraEid, CameraOrbitComponent).isOrbiting.set(false)
      }
    }
  }
}

export const CameraOrbitSystem = defineSystem({
  uuid: 'ee.engine.CameraOrbitSystem',
  insert: { after: InputSystemGroup },
  execute
})
