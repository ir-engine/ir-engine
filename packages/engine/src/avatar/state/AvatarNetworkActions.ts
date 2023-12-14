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

import { defineAction } from '@etherealengine/hyperflux'
import matches from 'ts-matches'
import { matchesEntityUUID } from '../../common/functions/MatchesUtils'
import { NetworkTopics } from '../../networking/classes/Network'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { AvatarID } from '../../schemas/user/avatar.schema'
import { matchesIkTarget } from '../animation/Util'

export class AvatarNetworkAction {
  static spawn = defineAction(
    WorldNetworkAction.spawnObject.extend({
      type: 'ee.engine.avatar.SPAWN',
      avatarID: matches.string.optional()
    })
  )

  static setAnimationState = defineAction({
    type: 'ee.engine.avatar.SET_ANIMATION_STATE',
    entityUUID: matchesEntityUUID,
    clipName: matches.string.optional(),
    filePath: matches.string,
    loop: matches.boolean.optional(),
    needsSkip: matches.boolean.optional(),
    layer: matches.number.optional(),
    $topic: NetworkTopics.world
  })

  static setAvatarID = defineAction({
    type: 'ee.engine.avatar.SET_AVATAR_ID',
    entityUUID: matchesEntityUUID,
    avatarID: matches.string as any as AvatarID,
    $cache: {
      removePrevious: true
    },
    $topic: NetworkTopics.world
  })

  static spawnIKTarget = defineAction(
    WorldNetworkAction.spawnObject.extend({
      type: 'ee.engine.avatar.SPAWN_IK_TARGET',
      name: matchesIkTarget,
      blendWeight: matches.number
    })
  )
}
