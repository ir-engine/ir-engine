import { store, useDispatch } from '../../store'
import { client } from '../../feathers'
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'

//State
export interface PublicScenesState {
  scenes: PublicScene[]
  currentScene: PublicScene
  error: string
}

export interface PublicScene {
  url: string
  name: string
  thumbnailUrl?: string
}

const state = createState({
  scenes: [] as PublicScene[],
  currentScene: null! as PublicScene,
  error: ''
})

store.receptors.push((action: SceneActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'SCENES_FETCHED_SUCCESS':
        return s.merge({ scenes: action.scenes })
      case 'SCENES_FETCHED_ERROR':
        return s.merge({ error: action.message })
      case 'SET_CURRENT_SCENE':
        return s.merge({ currentScene: action.scene })
    }
  }, action.type)
})

export const accessSceneState = () => state

export const useSceneState = () => useState(state) as any as typeof state

//Service
export const ScenesService = {
  createPublishProject: async (data) => {
    const dispatch = useDispatch()
    {
      try {
        const result = client.service('publish-scene').create(data)
        console.log(result)
      } catch (error) {
        console.error(error)
      }
    }
  }
}

//Action
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
