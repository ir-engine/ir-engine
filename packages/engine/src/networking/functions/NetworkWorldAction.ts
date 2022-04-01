import { defineAction, matches } from '@xrengine/hyperflux'

import { matchesWeightsParameters } from '../../avatar/animation/Util'
import { useWorld } from '../../ecs/functions/SystemHooks'
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

  static setXRMode = defineAction({
    type: 'network.SET_XR_MODE',
    enabled: matches.boolean
  })

  static xrHandsConnected = defineAction({
    type: 'network.XR_HANDS_CONNECTED'
  })

  static spawnObject = defineAction(
    {
      type: 'network.SPAWN_OBJECT',
      prefab: matches.string,
      networkId: matches.withDefault(matches.networkId, () => useWorld().createNetworkId()),
      ownerIndex: matches.number,
      parameters: matches.any.optional()
    },
    (action) => {
      action.$cache = true
    }
  )

  static spawnDebugPhysicsObject = defineAction(
    {
      type: 'network.SPAWN_DEBUG_PHYSICS_OBJECT',
      config: matches.any.optional()
    },
    (action) => {
      action.$cache = true
    }
  )

  static spawnAvatar = defineAction(
    {
      ...NetworkWorldAction.spawnObject.actionShape,
      prefab: 'avatar',
      parameters: matches.shape({
        position: matches.vector3,
        rotation: matches.quaternion
      })
    },
    (action) => {
      action.$cache = true
    }
  )

  static destroyObject = defineAction({
    type: 'network.DESTROY_OBJECT',
    networkId: matches.networkId
  })

  static setEquippedObject = defineAction({
    type: 'network.SET_EQUIPPED_OBJECT',
    object: matches.shape({
      ownerId: matches.userId,
      networkId: matches.networkId
    }),
    equip: matches.boolean,
    attachmentPoint: matches.number
  })

  static avatarAnimation = defineAction({
    type: 'network.AVATAR_ANIMATION',
    newStateName: matches.string,
    params: matchesWeightsParameters
  })

  static avatarDetails = defineAction(
    {
      type: 'network.AVATAR_DETAILS',
      avatarDetail: matchesAvatarProps
    },
    (action) => {
      action.$cache = { removePrevious: true }
    }
  )

  static teleportObject = defineAction({
    type: 'network.TELEPORT_OBJECT',
    object: matches.shape({
      ownerId: matches.userId,
      networkId: matches.networkId
    }),
    pose: matchPose
  })

  static requestAuthorityOverObject = defineAction({
    type: 'network.REQUEST_AUTHORITY_OVER_OBJECT',
    object: matches.shape({
      ownerId: matches.userId,
      networkId: matches.networkId
    }),
    requester: matches.userId
  })

  static transferAuthorityOfObject = defineAction({
    type: 'network.TRANSFER_AUTHORITY_OF_OBJECT',
    object: matches.shape({
      ownerId: matches.userId,
      networkId: matches.networkId
    }),
    newAuthor: matches.userId
  })
}
