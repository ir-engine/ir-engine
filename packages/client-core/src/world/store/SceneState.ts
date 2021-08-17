import { createState, useState, none, Downgraded } from '@hookstate/core'
import { Scene } from '@xrengine/common/src/interfaces/Scene'
import { SceneActionType } from './SceneAction'

const state = createState({
  scenes: [] as Array<Scene>,
  currentScene: {} as Scene,
  error: ''
})

export const SceneReducer = (_, action: SceneActionType) => {
  Promise.resolve().then(() => SceneReceptor(action))
  return state.attach(Downgraded).value
}

export const SceneReceptor = (action: SceneActionType): void => {
  state.batch((s) => {
    switch (action.type) {
      case 'SCENES_FETCHED_SUCCESS':
        return s.merge({ scenes: action.scenes })
      case 'SCENES_FETCHED_ERROR':
        return s.merge({ error: action.message })
      case 'SET_CURRENT_SCENE':
        return state.merge({ currentScene: action.scene })
    }
  }, action.type)
}

export const accessSceneState = () => state
export const useSceneState = () => useState(state)
