import Immutable from 'immutable'
import {
  AppLoadedAction,
  SetViewportAction
} from './actions'

import {
  SET_APP_LOADED,
  SET_VIEWPORT_SIZE
} from '../actions'

type AppState = {
  loaded: boolean,
  viewport: {
    width: number,
    height: number
  }
}

export const initialState: AppState = {
  loaded: false,
  viewport: {
    width: 1400,
    height: 900
  }
}

const immutableState = Immutable.fromJS(initialState)

const appReducer = (state = immutableState, action: AppLoadedAction | SetViewportAction): AppState => {
  switch (action.type) {
    case SET_APP_LOADED:
      return state
        .set('loaded', action.loaded)
    case SET_VIEWPORT_SIZE:
      return state
        .set('viewport', { width: action.width, height: action.height })
    default:
      break
  }

  return state
}

export default appReducer
