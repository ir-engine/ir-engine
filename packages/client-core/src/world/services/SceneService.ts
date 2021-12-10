import { store, useDispatch } from '../../store'
import { client } from '../../feathers'
import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { SceneDetailInterface } from '@xrengine/common/src/interfaces/SceneInterface'

const state = createState({
  currentScene: null! as SceneDetailInterface
})

store.receptors.push((action: SceneActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'LOCATION_SCENE_LOADED':
        return s.merge({ currentScene: action.sceneData })
    }
  }, action.type)
})

export const accessSceneState = () => state

export const useSceneState = () => useState(state) as any as typeof state

export const SceneService = {
  getSceneData: async (projectName: string, sceneName: string) => {
    const sceneData = await client.service('scene').get({ projectName, sceneName })
    const dispatch = useDispatch()
    dispatch(SceneAction.sceneLoaded(sceneData.data))
  }
}

export const SceneAction = {
  sceneLoaded: (sceneData: SceneDetailInterface) => {
    return {
      type: 'LOCATION_SCENE_LOADED' as const,
      sceneData
    }
  }
}

export type SceneActionType = ReturnType<typeof SceneAction[keyof typeof SceneAction]>
