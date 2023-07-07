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
import matches from 'ts-matches'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { defineAction, defineState, getMutableState, none, useHookstate, useState } from '@etherealengine/hyperflux'

import { isClient } from '../../common/functions/getEnvironment'
import { matchesEntityUUID } from '../../common/functions/MatchesUtils'
import { Engine } from '../../ecs/classes/Engine'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { NetworkTopics } from '../../networking/classes/Network'
import { NetworkObjectComponent } from '../../networking/components/NetworkObjectComponent'
import { WorldNetworkAction } from '../../networking/functions/WorldNetworkAction'
import { WorldState } from '../../networking/interfaces/WorldState'
import { UUIDComponent } from '../../scene/components/UUIDComponent'
import { changeAvatarAnimationState } from '../animation/AvatarAnimationGraph'
import { AvatarStates, matchesAvatarState } from '../animation/Util'
import { loadAvatarForUser } from '../functions/avatarFunctions'
import { spawnAvatarReceptor } from '../functions/spawnAvatarReceptor'

export class AvatarNetworkAction {
  static spawn = defineAction({
    ...WorldNetworkAction.spawnObject.actionShape,
    prefab: 'avatar'
  })

  static setAnimationState = defineAction({
    type: 'ee.engine.avatar.SET_ANIMATION_STATE',
    entityUUID: matchesEntityUUID,
    animationState: matchesAvatarState,
    $cache: {
      removePrevious: true
    },
    $topic: NetworkTopics.world
  })

  static setAvatarID = defineAction({
    type: 'ee.engine.avatar.SET_AVATAR_ID',
    entityUUID: matchesEntityUUID,
    avatarID: matches.string,
    $cache: {
      removePrevious: true
    },
    $topic: NetworkTopics.world
  })
}

export const AvatarState = defineState({
  name: 'ee.engine.avatar.AvatarState',

  initial: {} as Record<
    EntityUUID,
    {
      animationState: keyof typeof AvatarStates
      avatarID?: string
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
      AvatarNetworkAction.setAvatarID,
      (state, action: typeof AvatarNetworkAction.setAvatarID.matches._TYPE) => {
        state[action.entityUUID].merge({ avatarID: action.avatarID })
      }
    ],

    [
      WorldNetworkAction.destroyObject,
      (state, action: typeof WorldNetworkAction.destroyObject.matches._TYPE) => {
        state[action.entityUUID].set(none)
        /** @todo - This is a hack until all actions use event sourcing */

        const cachedActionsToRemove = Engine.instance.store.actions.cached.filter(
          (a) =>
            (AvatarNetworkAction.setAvatarID.matches.test(a) ||
              AvatarNetworkAction.setAnimationState.matches.test(a)) &&
            a.entityUUID === action.entityUUID
        )

        if (cachedActionsToRemove) {
          cachedActionsToRemove.forEach((a) =>
            Engine.instance.store.actions.cached.splice(Engine.instance.store.actions.cached.indexOf(a), 1)
          )
        }
      }
    ]
  ]
})

const AvatarReactor = React.memo(({ entityUUID }: { entityUUID: EntityUUID }) => {
  const state = useHookstate(getMutableState(AvatarState)[entityUUID])

  useEffect(() => {
    spawnAvatarReceptor(entityUUID)
  }, [])

  useEffect(() => {
    const avatarEntity = UUIDComponent.entitiesByUUID[entityUUID]

    const networkObject = getComponent(avatarEntity, NetworkObjectComponent)
    if (!networkObject) {
      return console.warn(`Avatar Entity for user id ${entityUUID} does not exist! You should probably reconnect...`)
    }

    changeAvatarAnimationState(avatarEntity, state.animationState.value)
  }, [state.animationState, entityUUID])

  useEffect(() => {
    if (!state.avatarID.value) return

    Engine.instance.api
      .service('avatar')
      .get(state.avatarID.value)
      .then((avatarDetails) => {
        if (!avatarDetails.modelResource?.url) return

        if (avatarDetails.id !== state.avatarID.value) return

        // backwards compat
        getMutableState(WorldState).userAvatarDetails[entityUUID].set(avatarDetails)

        if (!isClient) return

        const entity = UUIDComponent.entitiesByUUID[entityUUID]
        loadAvatarForUser(entity, avatarDetails.modelResource?.url)
      })
  }, [state.avatarID, entityUUID])

  return null
})

export const AvatarStateReactor = () => {
  const avatarState = useState(getMutableState(AvatarState))
  return (
    <>
      {avatarState.keys.map((entityUUID: EntityUUID) => {
        return <AvatarReactor key={entityUUID} entityUUID={entityUUID} />
      })}
    </>
  )
}
