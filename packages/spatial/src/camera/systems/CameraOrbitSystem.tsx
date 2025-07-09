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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { Matrix3, Spherical, Vector3 } from 'three'

import {
  defineSystem,
  EngineState,
  getComponent,
  getMutableComponent,
  getOptionalComponent,
  InputSystemGroup,
  query
} from '@ir-engine/ecs'
import { getState, isClient } from '@ir-engine/hyperflux'
import { CameraComponent } from '@ir-engine/spatial/src/camera/components/CameraComponent'
import { CameraOrbitComponent } from '@ir-engine/spatial/src/camera/components/CameraOrbitComponent'
import { Vector3_Up } from '@ir-engine/spatial/src/common/constants/MathConstants'
import { InputComponent } from '../../input/components/InputComponent'
import { InputPointerComponent } from '../../input/components/InputPointerComponent'
import { MouseScroll } from '../../input/state/ButtonState'
import { RendererComponent } from '../../renderer/components/RendererComponent'
import { TransformComponent } from '../../transform/components/TransformComponent'

const delta = new Vector3()
const normalMatrix = new Matrix3()
const spherical = new Spherical()

// const throttleZoom = throttle(doZoom, 30, { leading: true, trailing: false })
const orbitCameraQueryTerms = [RendererComponent, CameraOrbitComponent, InputComponent]

const execute = () => {
  if (!isClient) return

  if (!getState(EngineState).isEditing) return

  for (const cameraEid of query(orbitCameraQueryTerms)) {
    const cameraOrbit = getMutableComponent(cameraEid, CameraOrbitComponent)

    const buttons = InputComponent.getButtons(cameraEid)
    const axes = InputComponent.getAxes(cameraEid)

    const orbiting = buttons.PrimaryClick
    const panning = buttons.AuxiliaryClick

    // TODO: handle multi-touch pinch/zoom
    const zoom = axes[MouseScroll.VerticalScroll]

    const transform = getComponent(cameraEid, TransformComponent)
    const editorCameraCenter = cameraOrbit.cameraOrbitCenter.value
    const distance = transform.position.distanceTo(editorCameraCenter)
    const camera = getComponent(cameraEid, CameraComponent)
    // distance <= cameraOrbit.maximumZoomDistance.value && distance >= cameraOrbit.minimumZoomDistance.value
    if (zoom) {
      delta.set(0, 0, zoom * distance * cameraOrbit.zoomSpeed.value)
      if (delta.length() < distance) {
        delta.applyMatrix3(normalMatrix.getNormalMatrix(camera.matrixWorld))

        const newPosition = transform.position.clone().add(delta)
        const newDistance = newPosition.distanceTo(editorCameraCenter)

        if (
          newDistance >= cameraOrbit.minimumZoomDistance.value &&
          newDistance <= cameraOrbit.maximumZoomDistance.value
        ) {
          transform.position.copy(newPosition)
        }
      }
    }

    if (panning?.pressed) {
      const inputPointer = getOptionalComponent(panning.inputSourceEntity, InputPointerComponent)
      const movement = inputPointer?.movement
      if (movement) {
        const distance = transform.position.distanceTo(editorCameraCenter)
        delta
          .set(-movement.x, -movement.y, 0)
          .multiplyScalar(Math.max(distance, 1) * cameraOrbit.panSpeed.value)
          .applyMatrix3(normalMatrix.getNormalMatrix(camera.matrix))
        transform.position.add(delta)
        editorCameraCenter.add(delta)
      }
    }

    if (orbiting?.dragging && !orbiting.up) {
      const inputPointer = getOptionalComponent(orbiting.inputSourceEntity, InputPointerComponent)
      const movement = inputPointer?.movement
      if (movement) {
        delta.copy(transform.position).sub(editorCameraCenter)
        spherical.setFromVector3(delta)
        spherical.theta -= movement.x * cameraOrbit.orbitSpeed.value
        spherical.phi += movement.y * cameraOrbit.orbitSpeed.value
        spherical.makeSafe()
        delta.setFromSpherical(spherical)
        transform.position.copy(editorCameraCenter).add(delta)
        transform.matrix.lookAt(transform.position, editorCameraCenter, Vector3_Up)
        transform.rotation.setFromRotationMatrix(transform.matrix)
      }
    }
  }
}

export const CameraOrbitSystem = defineSystem({
  uuid: 'ee.engine.CameraOrbitSystem',
  insert: { after: InputSystemGroup },
  execute
})
