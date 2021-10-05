import { PublicScene } from './SceneState'

export const SceneAction = {
  scenesFetchedSuccess: (scenes: PublicScene[]) => {
    return {
      type: 'SCENES_FETCHED_SUCCESS' as const,
      scenes: scenes
    }
  },
  scenesFetchedError: (err: string) => {
    return {
      type: 'SCENES_FETCHED_ERROR' as const,
      message: err
    }
  },
  setCurrentScene: (scene: PublicScene) => {
    return {
      type: 'SET_CURRENT_SCENE' as const,
      scene: scene
    }
  }
}

export type SceneActionType = ReturnType<typeof SceneAction[keyof typeof SceneAction]>
