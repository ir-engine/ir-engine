import { Dispatch } from 'redux'
import { setScopeError } from './actions'

export function dispatchScopeError(dispatch: Dispatch, message: string, statusCode: number, type: string) {
  return dispatch(setScopeError(message, statusCode, type))
}
