import { store, useDispatch } from '../../store'
import { client } from '../../feathers'
import { createState, useState } from '@hookstate/core'

const state = createState({
  isTeleporting: false,
  isInitialised: false,
  loadingProgress: -1
})

store.receptors.push((action: EngineActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'ENGINE_SET_TELEPORTING':
        return s.merge({ isTeleporting: action.teleporting })
      case 'ENGINE_SET_INITIALISED':
        return s.merge({ isInitialised: action.initialised })
      case 'ENGINE_LOADING_PROGRESS':
        return s.merge({ loadingProgress: action.count })
    }
  }, action.type)
})

export const accessEngineState = () => state

export const useEngineState = () => useState(state) as any as typeof state

export const ScenesService = {}

export const EngineAction = {
  setTeleporting: (teleporting: boolean) => {
    return {
      type: 'ENGINE_SET_TELEPORTING' as const,
      teleporting
    }
  },
  setInitialised: (initialised: boolean) => {
    return {
      type: 'ENGINE_SET_INITIALISED' as const,
      initialised
    }
  },
  loadingProgress: (count: number) => {
    return {
      type: 'ENGINE_LOADING_PROGRESS' as const,
      count
    }
  }
}

export type EngineActionType = ReturnType<typeof EngineAction[keyof typeof EngineAction]>
