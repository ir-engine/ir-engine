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

import { Matrix4, Quaternion, Vector3 } from 'three'
import { Entity } from '../../ecs/classes/Entity'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { TransformComponent } from '../../transform/components/TransformComponent'

export const getArmIKHint = (
  entity: Entity,
  handPosition: Vector3,
  handRotation: Quaternion,
  shoulderWorldPosition: Vector3,
  side: 'left' | 'right',
  hint: Vector3
) => {
  const transform = getComponent(entity, TransformComponent)
  // make a line pointing in the oppopsite direction the fingers are pointing
  // traverse the line back by the length of the forearm

  const avatarInverseMatrix = mat4.copy(transform.matrixWorld).invert()
  handLocalPosition.copy(handPosition).applyMatrix4(avatarInverseMatrix)

  const handLocalQuat = _quat.copy(transform.rotation).invert().multiply(handRotation)
  hint
    .set(side === 'left' ? 0.25 : -0.25, -0.25, 0)
    .applyQuaternion(handLocalQuat)
    .add(handLocalPosition)

  // ensure hint stays out of body
  const shoulderLocalPosition = _vector3.copy(shoulderWorldPosition).applyMatrix4(avatarInverseMatrix)
  hint.x =
    side === 'left'
      ? Math.max(hint.x, shoulderLocalPosition.x + 0.05)
      : Math.min(hint.x, shoulderLocalPosition.x - 0.05)
  hint.applyMatrix4(transform.matrixWorld)
}

const mat4 = new Matrix4()
const _quat = new Quaternion()
const _vector3 = new Vector3()
const handLocalPosition = new Vector3()
