import { createState, useState } from '@speigg/hookstate'

import { store } from '@xrengine/client-core/src/store'

type ErrorServiceStateType = {
  error: string
}

const state = createState<ErrorServiceStateType>({
  error: ''
})

store.receptors.push((action: ErrorActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'ERROR_THROWN':
        return s.merge({ error: action.error })
    }
  }, action.type)
})

export const accessErrorState = () => state

export const useErrorState = () => useState(state) as any as typeof state

//Service
export const ErrorService = {}

//Action
export const ErrorAction = {
  throwError: (error: string) => {
    return {
      type: 'ERROR_THROWN' as const,
      error
    }
  }
}

export type ErrorActionType = ReturnType<typeof ErrorAction[keyof typeof ErrorAction]>
