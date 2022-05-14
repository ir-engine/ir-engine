import { defineAction } from '@xrengine/hyperflux'

import { matchesWeightsParameters } from '../../avatar/animation/Util'
import {
  matches,
  matchesHost,
  matchesNetworkId,
  matchesQuaternion,
  matchesUserId,
  matchesVector3,
  matchesWithDefault
} from '../../common/functions/MatchesUtils'
import { Engine } from '../../ecs/classes/Engine'
import { matchPose } from '../../transform/TransformInterfaces'
import { matchesAvatarProps } from '../interfaces/WorldState'

export class NetworkWorldAction {
  static createClient = defineAction({
    store: 'WORLD',
    type: 'network.CREATE_CLIENT',
    name: matches.string,
    index: matches.number,
    $cache: true
  })

  static destroyClient = defineAction({
    store: 'WORLD',
    type: 'network.DESTROY_CLIENT',
    $to: 'others'
  })

  static setXRMode = defineAction({
    store: 'WORLD',
    type: 'network.SET_XR_MODE',
    enabled: matches.boolean,
    $cache: { removePrevious: true }
  })

  static xrHandsConnected = defineAction({
    store: 'WORLD',
    type: 'network.XR_HANDS_CONNECTED',
    $cache: true
  })

  static spawnObject = defineAction({
    store: 'WORLD',
    type: 'network.SPAWN_OBJECT',
    prefab: matches.string,
    networkId: matchesWithDefault(matchesNetworkId, () => Engine.instance.currentWorld.createNetworkId()),
    parameters: matches.any.optional(),
    $cache: true
  })

  static spawnDebugPhysicsObject = defineAction({
    store: 'WORLD',
    type: 'network.SPAWN_DEBUG_PHYSICS_OBJECT',
    config: matches.any.optional()
  })

  static spawnAvatar = defineAction({
    ...NetworkWorldAction.spawnObject.actionShape,
    prefab: 'avatar',
    parameters: matches.shape({
      position: matchesVector3,
      rotation: matchesQuaternion
    }),
    $cache: true
  })

  static destroyObject = defineAction({
    store: 'WORLD',
    type: 'network.DESTROY_OBJECT',
    networkId: matchesNetworkId
  })

  static setEquippedObject = defineAction({
    store: 'WORLD',
    type: 'network.SET_EQUIPPED_OBJECT',
    object: matches.shape({
      ownerId: matchesUserId,
      networkId: matchesNetworkId
    }),
    equip: matches.boolean,
    attachmentPoint: matches.number,
    $cache: true
  })

  static avatarAnimation = defineAction({
    store: 'WORLD',
    type: 'network.AVATAR_ANIMATION',
    newStateName: matches.string,
    params: matchesWeightsParameters,
    $cache: {
      removePrevious: true
    }
  })

  static avatarDetails = defineAction({
    store: 'WORLD',
    type: 'network.AVATAR_DETAILS',
    avatarDetail: matchesAvatarProps,
    $cache: {
      removePrevious: true
    }
  })

  static teleportObject = defineAction({
    store: 'WORLD',
    type: 'network.TELEPORT_OBJECT',
    object: matches.shape({
      ownerId: matchesUserId,
      networkId: matchesNetworkId
    }),
    pose: matchPose
  })

  static requestAuthorityOverObject = defineAction({
    store: 'WORLD',
    type: 'network.REQUEST_AUTHORITY_OVER_OBJECT',
    object: matches.shape({
      ownerId: matchesUserId,
      networkId: matchesNetworkId
    }),
    requester: matchesUserId
  })

  static transferAuthorityOfObject = defineAction({
    store: 'WORLD',
    type: 'network.TRANSFER_AUTHORITY_OF_OBJECT',
    object: matches.shape({
      ownerId: matchesUserId,
      networkId: matchesNetworkId
    }),
    newAuthor: matchesUserId
  })

  static setUserTyping = defineAction({
    store: 'WORLD',
    type: 'network.USER_IS_TYPING',
    typing: matches.boolean
  })
}
