import {
  SET_APP_LOADED,
  SET_APP_LOADING_PERCENT
} from '../actions'

type Action = {
  type: string,
  [key:string]: any,
}
export interface AppLoadedAction extends Action {
  loaded: boolean
}
export interface AppLoadPercentAction extends Action {
  loadPercent: number
}
// used for displaying loading screen

export const setAppLoaded = (loaded: boolean):AppLoadedAction => ({ type: SET_APP_LOADED, loaded })

export const setAppLoadingPercent = (loadPercent: number):AppLoadPercentAction => ({ type: SET_APP_LOADING_PERCENT, loadPercent })
