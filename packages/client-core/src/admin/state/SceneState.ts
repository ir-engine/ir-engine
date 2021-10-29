import { createState, useState } from '@hookstate/core'
import { SceneActionType } from './SceneActions'
import { SceneData } from '@xrengine/common/src/interfaces/SceneData'
import { store } from '../../store'

export const SCENE_PAGE_LIMIT = 100

const state = createState({
  scenes: [] as Array<SceneData>
})

store.receptors.push((action: SceneActionType): any => {
  let result: any
  state.batch((s) => {
    switch (action.type) {
      case 'ADMIN_SCENES_RETRIEVED':
        result = action.sceneData
        return s.merge({
          scenes: result
        })
    }
  }, action.type)
})

export const accessSceneState = () => state

export const useSceneState = () => useState(state) as any as typeof state
