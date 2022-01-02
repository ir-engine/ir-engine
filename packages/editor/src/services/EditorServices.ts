import { store } from '@xrengine/client-core/src/store'
import { createState, useState } from '@hookstate/core'

const state = createState({
  projectName: null! as string,
  sceneName: null! as string
})

store.receptors.push((action: EditorActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'SCENE_LOADED':
        return s.merge({ sceneName: action.sceneName })
      case 'PROJECT_LOADED':
        return s.merge({ projectName: action.projectName })
    }
  }, action.type)
})

export const accessEditorState = () => state

export const useEditorState = () => useState(state) as any as typeof state

//Service
export const EditorService = {}

//Action
export const EditorAction = {
  sceneLoaded: (sceneName: string) => {
    return {
      type: 'SCENE_LOADED' as const,
      sceneName
    }
  },
  projectLoaded: (projectName: string) => {
    return {
      type: 'PROJECT_LOADED' as const,
      projectName
    }
  }
}

export type EditorActionType = ReturnType<typeof EditorAction[keyof typeof EditorAction]>
