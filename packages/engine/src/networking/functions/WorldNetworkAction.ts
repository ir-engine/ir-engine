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

import { matchesWeightsParameters } from '../../avatar/animation/Util'
import {
  matches,
  matchesEntityUUID,
  matchesNetworkId,
  matchesPeerID,
  matchesQuaternion,
  matchesUserId,
  matchesVector3,
  matchesWithDefault,
  string
} from '../../common/functions/MatchesUtils'
import { Engine } from '../../ecs/classes/Engine'
import { NetworkTopics } from '../classes/Network'
import { matchesAvatarProps } from '../interfaces/WorldState'

export class WorldNetworkAction {
  static xrHandsConnected = defineAction({
    type: 'xre.world.XR_HANDS_CONNECTED',
    $cache: true,
    $topic: NetworkTopics.world
  })

  static spawnDebugPhysicsObject = defineAction({
    type: 'xre.world.SPAWN_DEBUG_PHYSICS_OBJECT',
    config: matches.any.optional(),
    $topic: NetworkTopics.world
  })

  static registerSceneObject = defineAction({
    type: 'xre.world.REGISTER_SCENE_OBJECT',
    networkId: matchesWithDefault(matchesNetworkId, () => Engine.instance.createNetworkId()),
    objectUuid: matchesEntityUUID,
    $cache: true,
    $topic: NetworkTopics.world
  })

  static spawnObject = defineAction({
    type: 'xre.world.SPAWN_OBJECT',
    prefab: matches.string,
    networkId: matchesWithDefault(matchesNetworkId, () => Engine.instance.createNetworkId()),
    position: matchesVector3.optional(),
    rotation: matchesQuaternion.optional(),
    uuid: matchesEntityUUID,
    $cache: true,
    $topic: NetworkTopics.world
  })

  static spawnVehicle = defineAction({
    ...WorldNetworkAction.spawnObject.actionShape,
    prefab: 'vehicle',
    uuid: matchesUserId,
    $topic: NetworkTopics.world
  })

  static spawnAvatar = defineAction({
    ...WorldNetworkAction.spawnObject.actionShape,
    prefab: 'avatar',
    uuid: matchesUserId,
    $topic: NetworkTopics.world
  })

  static spawnCamera = defineAction({
    ...WorldNetworkAction.spawnObject.actionShape,
    prefab: 'camera',
    $topic: NetworkTopics.world
  })

  static destroyObject = defineAction({
    type: 'xre.world.DESTROY_OBJECT',
    networkId: matchesNetworkId,
    $topic: NetworkTopics.world
  })

  static interact = defineAction({
    type: 'xre.world.INTERACT',
    object: { ownerId: matchesUserId, networkId: matchesNetworkId },
    parity: matches.literals('left', 'right', 'none'),
    $topic: NetworkTopics.world
  })

  static setEquippedObject = defineAction({
    type: 'xre.world.SET_EQUIPPED_OBJECT',
    object: matches.shape({
      ownerId: matchesUserId,
      networkId: matchesNetworkId
    }),
    equip: matches.boolean,
    attachmentPoint: matches.literals('left', 'right', 'none').optional(),
    $cache: true,
    $topic: NetworkTopics.world
  })

  static avatarAnimation = defineAction({
    type: 'xre.world.AVATAR_ANIMATION',
    newStateName: matches.string,
    params: matchesWeightsParameters,
    $cache: {
      removePrevious: true
    },
    $topic: NetworkTopics.world
  })

  static avatarDetails = defineAction({
    type: 'xre.world.AVATAR_DETAILS',
    avatarDetail: matchesAvatarProps,
    uuid: matchesUserId,
    $cache: {
      removePrevious: true
    },
    $topic: NetworkTopics.world
  })

  static vehicleDetails = defineAction({
    type: 'xre.world.VEHICLE_DETAILS',
    vehicleDetail: matchesAvatarProps,
    uuid: matchesUserId,
    $cache: {
      removePrevious: true
    },
    $topic: NetworkTopics.world
  })

  static teleportObject = defineAction({
    type: 'xre.world.TELEPORT_OBJECT',
    object: matches.shape({
      ownerId: matchesUserId,
      networkId: matchesNetworkId
    }),
    position: matchesVector3,
    rotation: matchesQuaternion,
    $topic: NetworkTopics.world
  })

  static requestAuthorityOverObject = defineAction({
    type: 'xre.world.REQUEST_AUTHORITY_OVER_OBJECT',
    ownerId: matchesUserId,
    networkId: matchesNetworkId,
    newAuthority: matchesPeerID,
    $topic: NetworkTopics.world
  })

  static transferAuthorityOfObject = defineAction({
    type: 'xre.world.TRANSFER_AUTHORITY_OF_OBJECT',
    ownerId: matchesUserId,
    networkId: matchesNetworkId,
    newAuthority: matchesPeerID,
    $topic: NetworkTopics.world
  })

  static setUserTyping = defineAction({
    type: 'xre.world.USER_IS_TYPING',
    typing: matches.boolean,
    $topic: NetworkTopics.world
  })
}
