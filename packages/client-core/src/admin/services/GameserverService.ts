import { useDispatch } from '../../store'
import { client } from '../../feathers'
import { createState, useState } from '@speigg/hookstate'
import { store } from '../../store'

//State
const state = createState({
  fetched: false,
  spawning: false,
  lastFetched: Date.now()
})

store.receptors.push((action: GameserverActionType): void => {
  state.batch((s) => {
    switch (action.type) {
      case 'GAMESERVER_PATCH':
        return s.merge({
          spawning: true
        })
      case 'GAMESERVER_PATCHED':
        return s.merge({
          spawning: false
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
      await client.service('gameserver-provision').patch({ locationId })
      dispatch(GameserverAction.patchedGameserver())
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
  patchedGameserver: () => {
    return {
      type: 'GAMESERVER_PATCHED' as const
    }
  }
}

export type GameserverActionType = ReturnType<typeof GameserverAction[keyof typeof GameserverAction]>
