import Immutable from 'immutable'
import { SET_SCOPE_READ_ERROR, SET_SCOPE_WRITE_ERROR } from '../actions'
import { ErrorAction } from './actions'

const initialScopeErrorState = {
  readError: {
    scopeErrorMessage: '',
    statusCode: ''
  },
  writeError: {
    scopeErrorMessage: '',
    statusCode: ''
  }
}

const immutableState = Immutable.fromJS(initialScopeErrorState) as any

const scopeErrorReducer = (state = immutableState, action: ErrorAction): any => {
  let message, statusCode, updateMap
  switch (action.type) {
    case SET_SCOPE_READ_ERROR:
      message = action.message
      statusCode = action.statusCode
      updateMap = new Map(state.get('readError'))
      updateMap.set('scopeErrorMessage', message)
      updateMap.set('statusCode', statusCode)
      return state.set('readError', updateMap)

    case SET_SCOPE_WRITE_ERROR:
      message = action.message
      statusCode = action.statusCode
      updateMap = new Map(state.get('writeError'))
      updateMap.set('scopeErrorMessage', message)
      updateMap.set('statusCode', statusCode)
      return state.set('writeError', updateMap)
  }

  return state
}

export default scopeErrorReducer
