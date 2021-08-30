import { SET_SCOPE_READ_ERROR, SET_SCOPE_WRITE_ERROR } from '../actions'

export interface ErrorAction {
  type: string
  message: string
  statusCode: number
}

export function setScopeError(message: string, statusCode: number, type: string): ErrorAction {
  if (type === 'read') {
    return { type: SET_SCOPE_READ_ERROR, message, statusCode }
  } else {
    return { type: SET_SCOPE_READ_ERROR, message, statusCode }
  }
}
