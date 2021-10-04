import { createState, useState, none, Downgraded } from '@hookstate/core'
import { PublicScenesState, SceneActionType } from './ScreenActions'

const state = createState({
  scenes: [],
  currentScene: null,
  error: ''
})

export const sceneReducer = (_, action: SceneActionType) => {
  Promise.resolve().then(() => screenReceptor(action))
  return state.attach(Downgraded).value
}

const screenReceptor = (action: SceneActionType): any => {
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
export const useSceneState = () => useState(state)
