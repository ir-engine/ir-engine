import matches from 'ts-matches'
import {
  defineActionCreator,
  matchesNetworkId,
  matchesQuaternion,
  matchesUserId,
  matchesVector3,
  matchesWithInitializer
} from '../interfaces/Action'
import { matchPose } from '../../transform/TransformInterfaces'
import { matchesAvatarProps } from '../interfaces/WorldState'
import { matchesWeightsParameters } from '../../avatar/animations/Util'
import { useWorld } from '../../ecs/functions/SystemHooks'

export class NetworkWorldAction {
  static createClient = defineActionCreator({
    type: 'network.CREATE_CLIENT',
    userId: matchesUserId,
    name: matches.string
  })

  static destroyClient = defineActionCreator({
    type: 'network.DESTROY_CLIENT',
    userId: matchesUserId
  })

  static setXRMode = defineActionCreator({
    type: 'network.SET_XR_MODE',
    enabled: matches.boolean
  })

  static xrHandsConnected = defineActionCreator({
    type: 'network.XR_HANDS_CONNECTED'
  })

  static spawnObject = defineActionCreator({
    type: 'network.SPAWN_OBJECT',
    prefab: matches.string,
    networkId: matchesWithInitializer(matchesNetworkId, () => useWorld().createNetworkId()),
    parameters: matches.any.optional()
  })

  static spawnAvatar = defineActionCreator({
    ...NetworkWorldAction.spawnObject.actionShape,
    prefab: 'avatar',
    parameters: matches.shape({
      position: matchesVector3,
      rotation: matchesQuaternion
    })
  })

  static destroyObject = defineActionCreator({
    type: 'network.DESTROY_OBJECT',
    networkId: matchesNetworkId
  })

  static setEquippedObject = defineActionCreator({
    type: 'network.SET_EQUIPPED_OBJECT',
    object: matches.shape({
      ownerId: matchesUserId,
      networkId: matchesNetworkId
    }),
    equip: matches.boolean,
    attachmentPoint: matches.number
  })

  static avatarAnimation = defineActionCreator({
    type: 'network.AVATAR_ANIMATION',
    newStateName: matches.string,
    params: matchesWeightsParameters
  })

  static avatarDetails = defineActionCreator({
    type: 'network.AVATAR_DETAILS',
    avatarDetail: matchesAvatarProps
  })

  static teleportObject = defineActionCreator({
    type: 'network.TELEPORT_OBJECT',
    object: matches.shape({
      ownerId: matchesUserId,
      networkId: matchesNetworkId
    }),
    pose: matchPose
  })
}
