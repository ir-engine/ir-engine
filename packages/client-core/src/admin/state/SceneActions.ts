import { SceneDataResult } from '@xrengine/common/src/interfaces/SceneDataResult'
export const SceneAction = {
  collectionsFetched: (sceneDataResult: SceneDataResult) => {
    return {
      type: 'ADMIN_SCENES_RETRIEVED',
      sceneDataResult: sceneDataResult
    }
  }
}

export type SceneActionType = ReturnType<typeof SceneAction[keyof typeof SceneAction]>
