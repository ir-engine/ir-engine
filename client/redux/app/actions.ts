import {
  SET_APP_LOADED,
  SET_APP_LOADING_PERCENT,
  SET_VIEWPORT_SIZE,
  SET_IN_VR_MODE
} from '../actions'

type Action = {
  type: string,
  [key:string]: any,
}
export interface AppLoadedAction extends Action {
  loaded: boolean
  [payload: string]: any
}

export interface SetViewportAction extends Action {
  viewportSize: {
    width: number,
    height: number
  }
}
export interface AppLoadPercentAction extends Action {
  loadPercent: number
}
// used for displaying loading screen

export const setAppLoaded = (loaded: boolean):AppLoadedAction => ({ type: SET_APP_LOADED, loaded })

export const setAppLoadPercent = (loadPercent: number):AppLoadPercentAction => ({ type: SET_APP_LOADING_PERCENT, loadPercent })

// used for getting window.innerWidth and height.

export const setViewportSize = (width: number, height: number) => ({
  type: SET_VIEWPORT_SIZE,
  width,
  height
})

export const setAppInVrMode = (inVrMode: boolean) => ({
  type: SET_IN_VR_MODE,
  inVrMode
})
