import { SceneData } from '@xrengine/common/src/interfaces/SceneData'

export const SceneAction = {
  scenesFetched: (sceneData: SceneData[]) => {
    return {
      type: 'ADMIN_SCENES_RETRIEVED' as const,
      sceneData: sceneData
    }
  },
  sceneCreated: () => {
    return {
      type: 'ADMIN_SCENE_CREATED' as const
    }
  }
}

export type SceneActionType = ReturnType<typeof SceneAction[keyof typeof SceneAction]>
