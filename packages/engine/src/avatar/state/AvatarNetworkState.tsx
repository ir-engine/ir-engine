import React, { useEffect } from 'react'
import matches from 'ts-matches'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { defineAction, defineState, getMutableState, none, useHookstate, useState } from '@etherealengine/hyperflux'

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
    type: 'EE.Avatar.SET_ANIMATION_STATE',
    entityUUID: matchesEntityUUID,
    animationState: matchesAvatarState,
    $cache: {
      removePrevious: true
    },
    $topic: NetworkTopics.world
  })

  static setAvatarID = defineAction({
    type: 'EE.Avatar.SET_RESOURCE',
    entityUUID: matchesEntityUUID,
    avatarID: matches.string,
    $cache: {
      removePrevious: true
    },
    $topic: NetworkTopics.world
  })
}

export const AvatarState = defineState({
  name: 'EE.AvatarState',

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
      }
    ]
  ]
})

const AvatarReactor = React.memo(({ entityUUID }: { entityUUID: EntityUUID }) => {
  const state = useHookstate(getMutableState(AvatarState)[entityUUID])

  console.log(state.value)

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
