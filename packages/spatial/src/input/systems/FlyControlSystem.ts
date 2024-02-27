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

import { Quaternion, Vector3 } from 'three'

import { getComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { Engine } from '@etherealengine/ecs/src/Engine'
import { defineQuery } from '@etherealengine/ecs/src/QueryFunctions'

import { InputSystemGroup } from '@etherealengine/ecs'
import { ECSState } from '@etherealengine/ecs/src/ECSState'
import { defineSystem } from '@etherealengine/ecs/src/SystemFunctions'
import { getState } from '@etherealengine/hyperflux'
import { InputPointerComponent } from '@etherealengine/spatial/src/input/components/InputPointerComponent'
import { FlyControlComponent } from '../../camera/components/FlyControlComponent'
import { V_010 } from '../../common/constants/MathConstants'
import { TransformComponent } from '../../transform/components/TransformComponent'
import { InputSourceComponent } from '../components/InputSourceComponent'

const EPSILON = 10e-5
const flyControlQuery = defineQuery([FlyControlComponent])
const direction = new Vector3()
const tempVec3 = new Vector3()
const quat = new Quaternion()
const candidateWorldQuat = new Quaternion()
const pointers = defineQuery([InputPointerComponent])

const execute = () => {
  const inputPointerEntity = pointers()[0]
  if (!inputPointerEntity) {
    return
  }

  const inputSource = getComponent(inputPointerEntity, InputSourceComponent)
  const inputPointer = getComponent(inputPointerEntity, InputPointerComponent)

  if (!inputSource.buttons.SecondaryClick?.pressed && !inputSource.buttons.PrimaryClick?.pressed) return

  for (const entity of flyControlQuery()) {
    const flyControlComponent = getComponent(entity, FlyControlComponent)
    const transform = getComponent(Engine.instance.cameraEntity, TransformComponent)

    const inputState = inputSource.buttons

    const mouseMovement = inputPointer.movement

    // rotate about the camera's local x axis
    candidateWorldQuat.multiplyQuaternions(
      quat.setFromAxisAngle(
        tempVec3.set(1, 0, 0).applyQuaternion(transform.rotation),
        mouseMovement.y * flyControlComponent.lookSensitivity
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
      quat.setFromAxisAngle(V_010, -mouseMovement.x * flyControlComponent.lookSensitivity),
      transform.rotation
    )

    transform.rotation.copy(candidateWorldQuat)

    const lateralMovement = (inputState.KeyD?.pressed ? 1 : 0) + (inputState.KeyA?.pressed ? -1 : 0)
    const forwardMovement = (inputState.KeyS?.pressed ? 1 : 0) + (inputState.KeyW?.pressed ? -1 : 0)
    const upwardMovement = (inputState.KeyE?.pressed ? 1 : 0) + (inputState.KeyQ?.pressed ? -1 : 0)

    // translate
    direction.set(lateralMovement, 0, forwardMovement)
    direction.applyQuaternion(transform.rotation)
    const boostSpeed = inputState.ShiftLeft?.pressed ? flyControlComponent.boostSpeed : 1
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
