import { defineAction } from '@xrengine/hyperflux'

import { matchesWeightsParameters } from '../../avatar/animation/Util'
import { ParityValue } from '../../common/enums/ParityValue'
import {
  matches,
  matchesNetworkId,
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
  static avatarIKTargets = defineAction({
    type: 'xre.world.SET_XR_MODE',
    head: matches.boolean,
    leftHand: matches.boolean,
    rightHand: matches.boolean,
    $cache: { removePrevious: true },
    $topic: NetworkTopics.world
  })

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
    networkId: matchesWithDefault(matchesNetworkId, () => Engine.instance.currentWorld.createNetworkId()),
    objectUuid: matches.string,
    $cache: true,
    $topic: NetworkTopics.world
  })

  static spawnObject = defineAction({
    type: 'xre.world.SPAWN_OBJECT',
    prefab: matches.string,
    networkId: matchesWithDefault(matchesNetworkId, () => Engine.instance.currentWorld.createNetworkId()),
    position: matchesVector3.optional(),
    rotation: matchesQuaternion.optional(),
    $cache: true,
    $topic: NetworkTopics.world
  })

  static spawnAvatar = defineAction({
    ...WorldNetworkAction.spawnObject.actionShape,
    prefab: 'avatar',
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
    parity: matches.some(...Object.values(ParityValue).map((v) => matches.literal(v))),
    $topic: NetworkTopics.world
  })

  static setEquippedObject = defineAction({
    type: 'xre.world.SET_EQUIPPED_OBJECT',
    object: matches.shape({
      ownerId: matchesUserId,
      networkId: matchesNetworkId
    }),
    equip: matches.boolean,
    attachmentPoint: matches.number,
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
    newAuthority: matchesUserId,
    $topic: NetworkTopics.world
  })

  static transferAuthorityOfObject = defineAction({
    type: 'xre.world.TRANSFER_AUTHORITY_OF_OBJECT',
    ownerId: matchesUserId,
    networkId: matchesNetworkId,
    newAuthority: matchesUserId,
    $topic: NetworkTopics.world
  })

  static setUserTyping = defineAction({
    type: 'xre.world.USER_IS_TYPING',
    typing: matches.boolean,
    $topic: NetworkTopics.world
  })
}
