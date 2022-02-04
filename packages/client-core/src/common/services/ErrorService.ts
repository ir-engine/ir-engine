import { createState, useState } from '@speigg/hookstate'
import { store } from '../../store'

//State
const state = createState({
  readError: {
    scopeErrorMessage: '',
    statusCode: 0
  },
  writeError: {
    scopeErrorMessage: '',
    statusCode: 0
  }
})

store.receptors.push((action: ErrorActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'SET_SCOPE_READ_ERROR':
        return s.merge({ readError: { scopeErrorMessage: action.message, statusCode: action.statusCode } })
      case 'SET_SCOPE_WRITE_ERROR':
        return s.merge({ writeError: { scopeErrorMessage: action.message, statusCode: action.statusCode } })
    }
  }, action.type)
})

export const errorState = () => state

export const useErrorState = () => useState(state) as any as typeof state

//Action
export const ErrorAction = {
  setReadScopeError: (message: string, statusCode: number) => {
    return { type: 'SET_SCOPE_READ_ERROR' as const, message, statusCode }
  },
  setWriteScopeError: (message: string, statusCode: number) => {
    return { type: 'SET_SCOPE_WRITE_ERROR' as const, message, statusCode }
  }
}
export type ErrorActionType = ReturnType<typeof ErrorAction[keyof typeof ErrorAction]>
