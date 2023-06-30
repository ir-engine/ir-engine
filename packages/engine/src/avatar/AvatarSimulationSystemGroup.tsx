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

export class AvatarNetworkAction {
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
      AvatarNetworkAction.spawn,
      (state, action: typeof AvatarNetworkAction.spawn.matches._TYPE) => {
        state[action.entityUUID].merge({ animationState: AvatarStates.LOCOMOTION })
      }
    ],

    [
      AvatarNetworkAction.setAnimationState,
      (state, action: typeof AvatarNetworkAction.setAnimationState.matches._TYPE) => {
        state[action.entityUUID].merge({ animationState: action.animationState })
      }
    ],

    [
      AvatarNetworkAction.setResource,
      (state, action: typeof AvatarNetworkAction.setResource.matches._TYPE) => {
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
