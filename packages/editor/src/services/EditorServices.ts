import { createState, useState } from '@speigg/hookstate'

import { store } from '@xrengine/client-core/src/store'

export enum TaskStatus {
  NOT_STARTED = 0,
  IN_PROGRESS = 1,
  COMPLETED = 2
}

type EditorServiceStateType = {
  projectName: string | null
  sceneName: string | null
  sceneModified: boolean
  preprojectLoadTaskStatus: TaskStatus
  projectLoaded: boolean
  rendererInitialized: boolean
}

const state = createState<EditorServiceStateType>({
  projectName: null,
  sceneName: null,
  sceneModified: false,
  preprojectLoadTaskStatus: TaskStatus.NOT_STARTED,
  projectLoaded: false,
  rendererInitialized: false
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
      case 'UPDATE_PREPROJECT_TASK_STATUS':
        return s.merge({ preprojectLoadTaskStatus: action.taskStatus })
      case 'EDITOR_PROJECT_LOADED':
        return s.merge({ projectLoaded: action.loaded })
      case 'EDITOR_RENDERER_INITIALIZED':
        return s.merge({ rendererInitialized: action.initialized })
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
  },
  projectLoaded: (loaded: boolean) => {
    return {
      type: 'EDITOR_PROJECT_LOADED' as const,
      loaded
    }
  },
  rendererInitialized: (initialized: boolean) => {
    return {
      type: 'EDITOR_RENDERER_INITIALIZED' as const,
      initialized
    }
  },
  updatePreprojectLoadTask: (taskStatus: TaskStatus) => {
    return {
      type: 'UPDATE_PREPROJECT_TASK_STATUS' as const,
      taskStatus
    }
  }
}

export type EditorActionType = ReturnType<typeof EditorAction[keyof typeof EditorAction]>
