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

import { Vector3 } from 'three'

import { getState } from '@etherealengine/hyperflux'
import { Physics } from '../../physics/classes/Physics'
import { AvatarCollisionMask, CollisionGroups } from '../../physics/enums/CollisionGroups'
import { getInteractionGroups } from '../../physics/functions/getInteractionGroups'
import { PhysicsState } from '../../physics/state/PhysicsState'
import { RaycastHit, SceneQueryType } from '../../physics/types/PhysicsTypes'

const raycastComponentData = {
  type: SceneQueryType.Closest,
  origin: new Vector3(),
  direction: new Vector3(0, -1, 0),
  maxDistance: 2,
  groups: 0
}

/**
 * Checks if given position is a valid position to move avatar too.
 * @param position
 * @param onlyAllowPositionOnGround, if set will only consider the given position as valid if it falls on the ground
 * @returns {
 * positionValid, the given position is a valid position
 * raycastHit, the raycastHit result of the physics raycast
 * }
 */
export default function checkPositionIsValid(
  position: Vector3,
  onlyAllowPositionOnGround = true,
  raycastDirection = new Vector3(0, -1, 0)
) {
  const collisionLayer = onlyAllowPositionOnGround ? CollisionGroups.Ground : AvatarCollisionMask
  const interactionGroups = getInteractionGroups(CollisionGroups.Avatars, collisionLayer)

  raycastComponentData.direction.copy(raycastDirection)
  raycastComponentData.origin.copy(position)
  raycastComponentData.groups = interactionGroups
  const hits = Physics.castRay(getState(PhysicsState).physicsWorld, raycastComponentData)

  let positionValid = false
  let raycastHit = null as RaycastHit | null
  if (hits.length > 0) {
    raycastHit = hits[0] as RaycastHit
    if (onlyAllowPositionOnGround) {
      positionValid = true
    } else {
      if (raycastHit.normal.y > 0.9) positionValid = true
    }
  }

  return {
    positionValid: positionValid,
    raycastHit: raycastHit
  }
}
