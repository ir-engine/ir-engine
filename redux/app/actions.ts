import {
  SET_APP_LOADED
} from '../actions'

export type AppLoadedAction = {
  type: string,
  loaded: boolean
}
// used for displaying loading screen

export const setAppLoaded = (loaded: boolean):AppLoadedAction => ({ type: SET_APP_LOADED, loaded })
