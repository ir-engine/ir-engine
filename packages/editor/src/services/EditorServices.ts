import { createState, useState } from '@speigg/hookstate'

import { store } from '@xrengine/client-core/src/store'

type EditorServiceStateType = {
  projectName: string | null
  sceneName: string | null
  sceneModified: boolean
}

const state = createState<EditorServiceStateType>({
  projectName: null,
  sceneName: null,
  sceneModified: false
})

store.receptors.push((action: EditorActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'EDITOR_SCENE_CHANGED':
        return s.merge({ sceneName: action.sceneName, sceneModified: false })
      case 'EDITOR_PROJECT_CHANGED':
        return s.merge({ projectName: action.projectName, sceneName: null, sceneModified: false })
      case 'EDITOR_SCENE_MODIFIED':
        return s.merge({ sceneModified: action.modified })
    }
  }, action.type)
})

export const accessEditorState = () => state

export const useEditorState = () => useState(state) as any as typeof state

//Service
export const EditorService = {}

//Action
export const EditorAction = {
  projectChanged: (projectName: string | null) => {
    return {
      type: 'EDITOR_PROJECT_CHANGED' as const,
      projectName
    }
  },
  sceneChanged: (sceneName: string | null) => {
    return {
      type: 'EDITOR_SCENE_CHANGED' as const,
      sceneName
    }
  },
  sceneModified: (modified: boolean) => {
    return {
      type: 'EDITOR_SCENE_MODIFIED' as const,
      modified
    }
  }
}

export type EditorActionType = ReturnType<typeof EditorAction[keyof typeof EditorAction]>
