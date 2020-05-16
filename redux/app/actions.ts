import {
  SET_APP_LOADED,
  SET_VIEWPORT_SIZE
} from '../actions'

type Action = {
  type: string,
  [payload: string]: any
}

export interface AppLoadedAction extends Action {
  loaded: boolean,
}

export interface SetViewportAction extends Action {
  viewportSize: {
    width: number,
    height: number
  }
}
// used for displaying loading screen

export const setAppLoaded = (loaded: boolean): AppLoadedAction => ({ type: SET_APP_LOADED, loaded })

// used for getting window.innerWidth and height.

export const setViewportSize = (width: number, height: number) => ({
  type: SET_VIEWPORT_SIZE,
  width,
  height
})
