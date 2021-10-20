import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'

import { SceneActionType } from './ScreenActions'
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

export const receptor = (action: SceneActionType): any => {
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
}

export const accessSceneState = () => state

export const useSceneState = () => useState(state) as any as typeof state
