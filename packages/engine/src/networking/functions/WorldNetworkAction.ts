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

export class WorldNetworkAction {
  static createClient = defineAction({
    type: 'network.CREATE_CLIENT',
    name: matches.string,
    index: matches.number,
    $cache: true
  })

  static destroyClient = defineAction({
    type: 'network.DESTROY_CLIENT',
    $to: 'others'
  })

  static setXRMode = defineAction({
    type: 'network.SET_XR_MODE',
    enabled: matches.boolean,
    avatarInputControllerType: matches.string,
    $cache: { removePrevious: true }
  })

  static xrHandsConnected = defineAction({
    type: 'network.XR_HANDS_CONNECTED',
    $cache: true
  })

  static spawnObject = defineAction({
    type: 'network.SPAWN_OBJECT',
    prefab: matches.string,
    networkId: matchesWithDefault(matchesNetworkId, () => Engine.instance.currentWorld.createNetworkId()),
    parameters: matches.any.optional(),
    $cache: true
  })

  static spawnDebugPhysicsObject = defineAction({
    type: 'network.SPAWN_DEBUG_PHYSICS_OBJECT',
    config: matches.any.optional()
  })

  static spawnAvatar = defineAction({
    ...WorldNetworkAction.spawnObject.actionShape,
    prefab: 'avatar',
    parameters: matches.shape({
      position: matchesVector3,
      rotation: matchesQuaternion
    }),
    $cache: true
  })

  static destroyObject = defineAction({
    type: 'network.DESTROY_OBJECT',
    networkId: matchesNetworkId
  })

  static setEquippedObject = defineAction({
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
    type: 'network.AVATAR_ANIMATION',
    newStateName: matches.string,
    params: matchesWeightsParameters,
    $cache: {
      removePrevious: true
    }
  })

  static avatarDetails = defineAction({
    type: 'network.AVATAR_DETAILS',
    avatarDetail: matchesAvatarProps,
    $cache: {
      removePrevious: true
    }
  })

  static teleportObject = defineAction({
    type: 'network.TELEPORT_OBJECT',
    object: matches.shape({
      ownerId: matchesUserId,
      networkId: matchesNetworkId
    }),
    pose: matchPose
  })

  static requestAuthorityOverObject = defineAction({
    type: 'network.REQUEST_AUTHORITY_OVER_OBJECT',
    object: matches.shape({
      ownerId: matchesUserId,
      networkId: matchesNetworkId
    }),
    requester: matches.string
  })

  static transferAuthorityOfObject = defineAction({
    type: 'network.TRANSFER_AUTHORITY_OF_OBJECT',
    object: matches.shape({
      ownerId: matchesUserId,
      networkId: matchesNetworkId
    }),
    newAuthor: matches.string
  })

  static setUserTyping = defineAction({
    type: 'network.USER_IS_TYPING',
    typing: matches.boolean
  })
}
