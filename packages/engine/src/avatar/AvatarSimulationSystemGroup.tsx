import React, { useEffect } from 'react'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { none, receiveActions, useState } from '@etherealengine/hyperflux'
import { defineAction, defineState } from '@etherealengine/hyperflux'

import { isClient } from '../common/functions/getEnvironment'
import { matches, matchesEntityUUID } from '../common/functions/MatchesUtils'
import { defineSystem } from '../ecs/functions/SystemFunctions'
import { NetworkTopics } from '../networking/classes/Network'
import { WorldNetworkAction } from '../networking/functions/WorldNetworkAction'
import { WorldState } from '../networking/interfaces/WorldState'
import { UUIDComponent } from '../scene/components/UUIDComponent'
import { AvatarStates, matchesAvatarState, matchesWeightsParameters } from './animation/Util'
import { AvatarAutopilotSystem } from './AvatarAutopilotSystem'
import { AvatarMovementSystem } from './AvatarMovementSystem'
import { loadAvatarForUser } from './functions/avatarFunctions'

export class NetworkAvatarAction {
  static spawn = defineAction({
    ...WorldNetworkAction.spawnObject.actionShape,
    prefab: 'avatar'
  })

  static setAnimationState = defineAction({
    type: 'EE.Avatar.SET_ANIMATION_STATE',
    entityUUID: matchesEntityUUID,
    animationState: matchesAvatarState,
    $cache: {
      removePrevious: true
    },
    $topic: NetworkTopics.world
  })

  static setResource = defineAction({
    type: 'EE.Avatar.SET_RESOURCE',
    entityUUID: matchesEntityUUID,
    resourceUUID: matches.string,
    $cache: {
      removePrevious: true
    },
    $topic: NetworkTopics.world
  })
}

const AvatarState = defineState({
  name: 'EE.AvatarState',

  initial: {} as Record<
    EntityUUID,
    {
      resourceUUID?: string
      animationState?: keyof typeof AvatarStates
    }
  >,

  receptors: [
    [
      NetworkAvatarAction.spawn,
      (state, action: typeof NetworkAvatarAction.spawn.matches._TYPE) => {
        state[action.entityUUID].merge({ animationState: AvatarStates.LOCOMOTION })
      }
    ],

    [
      NetworkAvatarAction.setAnimationState,
      (state, action: typeof NetworkAvatarAction.setAnimationState.matches._TYPE) => {
        state[action.entityUUID].merge({ animationState: action.animationState })
      }
    ],

    [
      NetworkAvatarAction.setResource,
      (state, action: typeof NetworkAvatarAction.setResource.matches._TYPE) => {
        state[action.entityUUID].merge({ resourceUUID: action.resourceUUID })
      }
    ],

    [
      WorldNetworkAction.destroyObject,
      (state, action: typeof WorldNetworkAction.destroyObject.matches._TYPE) => {
        state[action.entityUUID].set(none)
      }
    ]
  ]
})

// export function avatarDetailsReceptor() {
//   const userAvatarDetails = getMutableState(WorldState).userAvatarDetails
//   userAvatarDetails[action.uuid].set(action.avatarDetail)
//   if (isClient && action.avatarDetail.avatarURL) {
//     const entity = UUIDComponent.entitiesByUUID[action.uuid]
//     loadAvatarForUser(entity, action.avatarDetail.avatarURL)
//   }
// }

const AvatarReactor = React.memo(({ entityUUID }: { entityUUID: EntityUUID }) => {
  return null
})

export const AvatarSimulationSystemGroup = defineSystem({
  uuid: 'EE.Avatar.SimulationSystemGroup',

  subSystems: [AvatarMovementSystem, AvatarAutopilotSystem],

  execute: () => {
    receiveActions(AvatarState)
  },

  reactor: () => {
    const avatarState = useState(AvatarState)
    return avatarState.keys.map((entityUUID) => {
      return <AvatarReactor key={entityUUID} entityUUID={entityUUID} />
    })
  }
})
