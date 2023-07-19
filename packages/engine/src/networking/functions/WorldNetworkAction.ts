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

import {
  matches,
  matchesEntityUUID,
  matchesNetworkId,
  matchesPeerID,
  matchesQuaternion,
  matchesUserId,
  matchesVector3,
  matchesWithDefault
} from '../../common/functions/MatchesUtils'
import { Engine } from '../../ecs/classes/Engine'
import { NetworkTopics } from '../classes/Network'

export class WorldNetworkAction {
  static spawnObject = defineAction({
    type: 'ee.engine.world.SPAWN_OBJECT',
    prefab: matches.string,
    entityUUID: matchesEntityUUID,
    networkId: matchesWithDefault(matchesNetworkId, () => Engine.instance.createNetworkId()),
    position: matchesVector3.optional(),
    rotation: matchesQuaternion.optional(),
    $cache: true,
    $topic: NetworkTopics.world
  })

  static spawnCamera = defineAction({
    ...WorldNetworkAction.spawnObject.actionShape,
    prefab: 'camera',
    $topic: NetworkTopics.world
  })

  static destroyObject = defineAction({
    type: 'ee.engine.world.DESTROY_OBJECT',
    entityUUID: matchesEntityUUID,
    $cache: true,
    $topic: NetworkTopics.world
  })

  static requestAuthorityOverObject = defineAction({
    type: 'ee.engine.world.REQUEST_AUTHORITY_OVER_OBJECT',
    ownerId: matchesUserId,
    networkId: matchesNetworkId,
    newAuthority: matchesPeerID,
    $topic: NetworkTopics.world
  })

  static transferAuthorityOfObject = defineAction({
    type: 'ee.engine.world.TRANSFER_AUTHORITY_OF_OBJECT',
    ownerId: matchesUserId,
    networkId: matchesNetworkId,
    newAuthority: matchesPeerID,
    $topic: NetworkTopics.world
  })
}
