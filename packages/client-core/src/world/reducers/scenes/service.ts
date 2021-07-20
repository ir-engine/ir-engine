import { Dispatch } from 'redux'
import {
  scenesFetchedSuccess,
  // scenesFetchedError,
  PublicScene
} from './actions'
import { Config } from '../../../helper'
import { client } from '../../../feathers'

export function fetchPublicScenes() {
  return (dispatch: Dispatch): any => {
    const scenes = Config.publicRuntimeConfig.xr.vrRoomGrid.scenes as PublicScene[]
    return dispatch(scenesFetchedSuccess(scenes))
  }
}

export const createPublishProject =
  (data) =>
  (dispatch: Dispatch): any => {
    try {
      const result = client.service('publish-project').create(data)
      console.log(result)
    } catch (error) {
      console.error(error)
    }
  }
