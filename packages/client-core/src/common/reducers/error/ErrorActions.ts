import { SET_SCOPE_READ_ERROR, SET_SCOPE_WRITE_ERROR } from '../actions'

export const ErrorAction = {
  setReadScopeError: (message: string, statusCode: number) => {
    return { type: SET_SCOPE_READ_ERROR, message, statusCode }
  },
  setWriteScopeError: (message: string, statusCode: number) => {
    return { type: SET_SCOPE_WRITE_ERROR, message, statusCode }
  }
}
export type ErrorActionType = ReturnType<typeof ErrorAction[keyof typeof ErrorAction]>
