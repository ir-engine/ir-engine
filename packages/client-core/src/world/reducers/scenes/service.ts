import { Dispatch } from 'redux'
import {
  scenesFetchedSuccess,
  // scenesFetchedError,
  PublicScene
} from './actions'
import { Config } from '../../../helper'

export function fetchPublicScenes() {
  return (dispatch: Dispatch): any => {
    const scenes = Config.publicRuntimeConfig.xr.vrRoomGrid.scenes as PublicScene[]
    return dispatch(scenesFetchedSuccess(scenes))
  }
}
