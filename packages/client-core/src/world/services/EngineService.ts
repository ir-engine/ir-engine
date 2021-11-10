import { store, useDispatch } from '../../store'
import { client } from '../../feathers'
import { createState, useState } from '@hookstate/core'

const state = createState({
  isTeleporting: false
})

store.receptors.push((action: EngineActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'ENGINE_SET_TELEPORTING':
        return s.merge({ isTeleporting: action.teleporting })
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
  }
}

export type EngineActionType = ReturnType<typeof EngineAction[keyof typeof EngineAction]>
