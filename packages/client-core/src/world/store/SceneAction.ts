import { Scene } from '@xrengine/common/src/interfaces/Scene'

export const SceneAction = {
  scenesFetchedSuccess: (scenes: Scene[]) => {
    return {
      type: 'SCENES_FETCHED_SUCCESS' as const,
      scenes
    }
  },
  scenesFetchedError: (err: string) => {
    return {
      type: 'SCENES_FETCHED_ERROR' as const,
      message: err
    }
  },
  collectionsFetched: (collections: any[]) => {
    return {
      type: 'SCENES_RETRIEVED' as const,
      collections: collections
    }
  },
  setCurrentScene: (scene: Scene) => {
    return {
      type: 'SET_CURRENT_SCENE' as const,
      scene: scene
    }
  }
}

export type SceneActionType = ReturnType<typeof SceneAction[keyof typeof SceneAction]>
