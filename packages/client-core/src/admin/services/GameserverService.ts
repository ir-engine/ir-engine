import { createState, useState } from '@speigg/hookstate'

import { GameServerPatch } from '@xrengine/common/src/interfaces/Instance'

import { client } from '../../feathers'
import { useDispatch } from '../../store'
import { store } from '../../store'

//State
const state = createState({
  patch: undefined as undefined | GameServerPatch,
  fetched: false,
  lastFetched: Date.now()
})

store.receptors.push((action: GameserverActionType): void => {
  state.batch((s) => {
    switch (action.type) {
      case 'GAMESERVER_PATCH':
        return s.merge({
          patch: undefined,
          fetched: false
        })
      case 'GAMESERVER_PATCHED':
        return s.merge({
          patch: action.patch,
          fetched: true,
          lastFetched: Date.now()
        })
    }
  }, action.type)
})

export const accessGameserverState = () => state

export const useGameserverState = () => useState(state) as any as typeof state

//Service
export const GameserverService = {
  patchGameserver: async (locationId) => {
    const dispatch = useDispatch()
    try {
      dispatch(GameserverAction.patchGameserver())
      const patch = await client.service('gameserver-provision').patch({ locationId })
      dispatch(GameserverAction.patchedGameserver(patch))
    } catch (error) {
      console.error(error)
    }
  }
}

//Action
export const GameserverAction = {
  patchGameserver: () => {
    return {
      type: 'GAMESERVER_PATCH' as const
    }
  },
  patchedGameserver: (patch: GameServerPatch) => {
    return {
      type: 'GAMESERVER_PATCHED' as const,
      patch
    }
  }
}

export type GameserverActionType = ReturnType<typeof GameserverAction[keyof typeof GameserverAction]>
