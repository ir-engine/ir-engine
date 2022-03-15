import { createState, useState } from '@speigg/hookstate'

import { SceneData } from '@xrengine/common/src/interfaces/SceneInterface'

import { client } from '../../feathers'
import { store, useDispatch } from '../../store'

const state = createState({
  currentScene: null as SceneData | null
})

store.receptors.push((action: SceneActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'SCENE_CHANGED':
        return s.merge({ currentScene: action.sceneData })
    }
  }, action.type)
})

export const accessSceneState = () => state

export const useSceneState = () => useState(state) as any as typeof state

export const SceneService = {
  fetchCurrentScene: async (projectName: string, sceneName: string) => {
    const sceneData = await client.service('scene').get({ projectName, sceneName, metadataOnly: null }, {})
    const dispatch = useDispatch()
    dispatch(SceneAction.currentSceneChanged(sceneData.data))
  }
}

export const SceneAction = {
  currentSceneChanged: (sceneData: SceneData | null) => {
    return {
      type: 'SCENE_CHANGED' as const,
      sceneData
    }
  }
}

export type SceneActionType = ReturnType<typeof SceneAction[keyof typeof SceneAction]>
