import { Dispatch } from 'react'
import { Scene } from '@xrengine/common/src/interfaces/Scene'
import { Config } from '../../helper'
import { client } from '../../feathers'

import { SceneAction, SceneActionType } from './SceneAction'

export const SceneService = {
  fetchPublicScenes: () => {
    return (dispatch: Dispatch<SceneActionType>): any => {
      const scenes = Config.publicRuntimeConfig.xr.vrRoomGrid.scenes as Scene[]
      return dispatch(SceneAction.scenesFetchedSuccess(scenes))
    }
  },
  createPublishProject: (data) => {
    return (dispatch: Dispatch<SceneActionType>): any => {
      try {
        const result = client.service('publish-project').create(data)
        console.log(result)
      } catch (error) {
        console.error(error)
      }
    }
  }
}
