import { createState, useState } from '@hookstate/core'

import { SceneDetailInterface } from '@xrengine/common/src/interfaces/SceneInterface'

import { client } from '../../feathers'
import { store, useDispatch } from '../../store'

//State
export const SCENE_PAGE_LIMIT = 100

const state = createState({
  scenes: [] as Array<SceneDetailInterface>,
  skip: 0,
  limit: SCENE_PAGE_LIMIT,
  total: 0,
  retrieving: false,
  fetched: false,
  updateNeeded: true,
  lastFetched: Date.now()
})

store.receptors.push((action: SceneActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'ADMIN_SCENES_RETRIEVED':
        return s.merge({
          scenes: action.sceneData,
          retrieving: false,
          fetched: true,
          updateNeeded: false,
          lastFetched: Date.now()
        })
    }
  }, action.type)
})

export const accessSceneState = () => state

export const useSceneState = () => useState(state) as any as typeof state

export const SceneService = {
  fetchAdminScenes: async (incDec?: 'increment' | 'decrement' | 'all') => {
    const dispatch = useDispatch()
    const scenes = await client.service('scene').find()
    dispatch(SceneAction.scenesFetched(scenes.data))
  },

  deleteScene: async (sceneId: string) => {}
}

//Action
export const SceneAction = {
  scenesFetched: (sceneData: SceneDetailInterface[]) => {
    return {
      type: 'ADMIN_SCENES_RETRIEVED' as const,
      sceneData
    }
  },
  sceneCreated: () => {
    return {
      type: 'ADMIN_SCENE_CREATED' as const
    }
  }
}

export type SceneActionType = ReturnType<typeof SceneAction[keyof typeof SceneAction]>
