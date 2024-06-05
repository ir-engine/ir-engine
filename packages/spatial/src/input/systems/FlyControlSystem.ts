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

import { MathUtils, Quaternion, Vector3 } from 'three'

import {
  defineQuery,
  defineSystem,
  ECSState,
  Entity,
  getComponent,
  getOptionalComponent,
  hasComponent,
  InputSystemGroup,
  removeComponent,
  setComponent
} from '@etherealengine/ecs'
import { getState } from '@etherealengine/hyperflux'

import { CameraComponent } from '../../camera/components/CameraComponent'
import { CameraOrbitComponent } from '../../camera/components/CameraOrbitComponent'
import { FlyControlComponent } from '../../camera/components/FlyControlComponent'
import { Vector3_Up, Vector3_Zero } from '../../common/constants/MathConstants'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { InputComponent } from '../components/InputComponent'
import { InputPointerComponent } from '../components/InputPointerComponent'
import { InputSourceComponent } from '../components/InputSourceComponent'

const EPSILON = 10e-5
const movement = new Vector3()
const direction = new Vector3()
const tempVec3 = new Vector3()
const quat = new Quaternion()
const candidateWorldQuat = new Quaternion()

const center = new Vector3()
const directionToCenter = new Vector3()

const onSecondaryClick = (viewerEntity: Entity) => {
  setComponent(viewerEntity, FlyControlComponent, {
    boostSpeed: 4,
    moveSpeed: 4,
    lookSensitivity: 5,
    maxXRotation: MathUtils.degToRad(80)
  })
}

const onSecondaryReleased = (viewerEntity: Entity) => {
  const transform = getComponent(viewerEntity, TransformComponent)
  const editorCameraCenter = getComponent(viewerEntity, CameraOrbitComponent).cameraOrbitCenter
  center.subVectors(transform.position, editorCameraCenter)
  const centerLength = center.length()
  editorCameraCenter.copy(transform.position)
  editorCameraCenter.add(directionToCenter.set(0, 0, -centerLength).applyQuaternion(transform.rotation))
  removeComponent(viewerEntity, FlyControlComponent)
}

const flyControlQuery = defineQuery([FlyControlComponent, TransformComponent, InputComponent])
const cameraQuery = defineQuery([CameraComponent])
const inputSourceQuery = defineQuery([InputSourceComponent])

const execute = () => {
  const inputSourceEntities = inputSourceQuery()
  const buttons = InputComponent.getMergedButtonsForInputSources(inputSourceEntities)

  /** Since we have nothing that specifies whether we should use orbit/fly controls or not, just tie it to the camera orbit component for the studio */
  for (const entity of cameraQuery()) {
    const inputPointerEntity = InputPointerComponent.getPointerForCanvas(entity)
    if (!inputPointerEntity) continue
    if (hasComponent(entity, CameraOrbitComponent)) {
      if (buttons.SecondaryClick?.down) onSecondaryClick(entity)
      if (buttons.SecondaryClick?.up) onSecondaryReleased(entity)
    }
  }

  for (const entity of flyControlQuery()) {
    const flyControlComponent = getComponent(entity, FlyControlComponent)
    const transform = getComponent(entity, TransformComponent)
    const input = getComponent(entity, InputComponent)

    movement.copy(Vector3_Zero)
    for (const inputSourceEntity of inputSourceEntities) {
      const inputSource = getComponent(inputSourceEntity, InputSourceComponent)
      const pointer = getOptionalComponent(inputSourceEntity, InputPointerComponent)
      if (pointer && inputSource.buttons.SecondaryClick?.pressed) {
        movement.x += pointer.movement.x
        movement.y += pointer.movement.y
      }
    }

    const hasMovement = movement.lengthSq() > EPSILON

    // rotate about the camera's local x axis
    candidateWorldQuat.multiplyQuaternions(
      quat.setFromAxisAngle(
        tempVec3.set(1, 0, 0).applyQuaternion(transform.rotation),
        movement.y * flyControlComponent.lookSensitivity
      ),
      transform.rotation
    )

    // check change of local "forward" and "up" to disallow flipping
    const camUpY = tempVec3.set(0, 1, 0).applyQuaternion(transform.rotation).y
    const newCamUpY = tempVec3.set(0, 1, 0).applyQuaternion(candidateWorldQuat).y
    const newCamForwardY = tempVec3.set(0, 0, -1).applyQuaternion(candidateWorldQuat).y
    const extrema = Math.sin(flyControlComponent.maxXRotation)
    const allowRotationInX =
      newCamUpY > 0 && ((newCamForwardY < extrema && newCamForwardY > -extrema) || newCamUpY > camUpY)

    if (allowRotationInX) {
      transform.rotation.copy(candidateWorldQuat)
    }

    // rotate about the world y axis
    candidateWorldQuat.multiplyQuaternions(
      quat.setFromAxisAngle(Vector3_Up, -movement.x * flyControlComponent.lookSensitivity),
      transform.rotation
    )

    transform.rotation.copy(candidateWorldQuat)

    const lateralMovement = (buttons.KeyD?.pressed ? 1 : 0) + (buttons.KeyA?.pressed ? -1 : 0)
    const forwardMovement = (buttons.KeyS?.pressed ? 1 : 0) + (buttons.KeyW?.pressed ? -1 : 0)
    const upwardMovement = (buttons.KeyE?.pressed ? 1 : 0) + (buttons.KeyQ?.pressed ? -1 : 0)

    // translate
    direction.set(lateralMovement, 0, forwardMovement)
    direction.applyQuaternion(transform.rotation)
    const boostSpeed = buttons.ShiftLeft?.pressed ? flyControlComponent.boostSpeed : 1
    const deltaSeconds = getState(ECSState).deltaSeconds
    const speed = deltaSeconds * flyControlComponent.moveSpeed * boostSpeed

    if (direction.lengthSq() > EPSILON) transform.position.add(direction.multiplyScalar(speed))

    transform.position.y += upwardMovement * deltaSeconds * flyControlComponent.moveSpeed * boostSpeed
  }
}

export const FlyControlSystem = defineSystem({
  uuid: 'ee.engine.FlyControlSystem',
  insert: { with: InputSystemGroup },
  execute
})
