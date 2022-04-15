import {
  defineAction,
  matches,
  matchesNetworkId,
  matchesQuaternion,
  matchesUserId,
  matchesVector3,
  matchesWithDefault
} from '@xrengine/hyperflux'

import { matchesWeightsParameters } from '../../avatar/animation/Util'
import { Engine } from '../../ecs/classes/Engine'
import { matchPose } from '../../transform/TransformInterfaces'
import { matchesAvatarProps } from '../interfaces/WorldState'

export class NetworkWorldAction {
  static createClient = defineAction({
    type: 'network.CREATE_CLIENT',
    name: matches.string,
    index: matches.number
  })

  static destroyClient = defineAction({
    type: 'network.DESTROY_CLIENT'
  })

  static timeSync = defineAction({
    type: 'network.TIME_SYNC',
    elapsedTime: matchesWithDefault(matches.number, () => Engine.currentWorld.elapsedTime),
    clockTime: matchesWithDefault(matches.number, () => Date.now()),
    $time: -1,
    $to: 'others'
  })

  static setXRMode = defineAction({
    type: 'network.SET_XR_MODE',
    enabled: matches.boolean,
    $cache: { removePrevious: true }
  })

  static xrHandsConnected = defineAction({
    type: 'network.XR_HANDS_CONNECTED',
    $cache: true
  })

  static spawnObject = defineAction({
    type: 'network.SPAWN_OBJECT',
    prefab: matches.string,
    networkId: matchesWithDefault(matchesNetworkId, () => Engine.currentWorld.createNetworkId()),
    parameters: matches.any.optional(),
    $cache: true
  })

  static spawnDebugPhysicsObject = defineAction({
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
    requester: matchesUserId
  })

  static transferAuthorityOfObject = defineAction({
    type: 'network.TRANSFER_AUTHORITY_OF_OBJECT',
    object: matches.shape({
      ownerId: matchesUserId,
      networkId: matchesNetworkId
    }),
    newAuthor: matchesUserId
  })
}
