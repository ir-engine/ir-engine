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

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { defineAction, defineState } from '@etherealengine/hyperflux'
import matches from 'ts-matches'
import { ikTargets } from '../avatar/animation/Util'
import { AvatarIKTargetComponent } from '../avatar/components/AvatarIKComponents'
import { setComponent } from '../ecs/functions/ComponentFunctions'
import { NetworkState } from '../networking/NetworkState'
import { NetworkTopics } from '../networking/classes/Network'
import { UUIDComponent } from '../scene/components/UUIDComponent'

export class MotionCaptureAction {
  static trackingScopeChanged = defineAction({
    type: 'ee.mocap.trackLowerBody' as const,
    trackingLowerBody: matches.boolean,
    $topic: NetworkTopics.world
  })
}

export const MotionCaptureState = defineState({
  name: 'MotionCaptureState',
  initial: {},
  receptors: [
    [
      //make this mutate data of the ik targets
      MotionCaptureAction.trackingScopeChanged,
      (state, action: typeof MotionCaptureAction.trackingScopeChanged.matches._TYPE) => {
        const userID = Object.values(NetworkState.mediaNetwork.peers).find((peer) => peer.peerID === action.$peer)
          ?.userId!
        const leftFootUUID = (userID + ikTargets.leftFoot) as EntityUUID
        const rightFootUUID = (userID + ikTargets.rightFoot) as EntityUUID
        const leftFootEntity = UUIDComponent.entitiesByUUID[leftFootUUID]
        const rightFootEntity = UUIDComponent.entitiesByUUID[rightFootUUID]
        setComponent(leftFootEntity, AvatarIKTargetComponent, { blendWeight: 1 })
        setComponent(rightFootEntity, AvatarIKTargetComponent, { blendWeight: 1 })
      }
    ]
  ]
})
