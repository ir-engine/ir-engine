import Immutable from 'immutable'
import {
  AppLoadedAction
} from './actions'

import {
  SET_APP_LOADED
} from '../actions'

type AppState = {
  loaded: boolean
}

export const initialState: AppState = {
  loaded: false
}

const immutableState = Immutable.fromJS(initialState)

const appReducer = (state = immutableState, action: AppLoadedAction): AppState => {
  switch (action.type) {
    case SET_APP_LOADED:
      return state
        .set('loaded', action.loaded)
    default:
      break
  }

  return state
}

export default appReducer
