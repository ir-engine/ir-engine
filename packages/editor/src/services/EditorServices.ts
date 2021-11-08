import { store, useDispatch } from '@xrengine/client-core/src/store'
import { createState, Downgraded, useState } from '@hookstate/core'
import {
  accessStoredLocalState,
  StoredLocalAction,
  StoredLocalActionType
} from '@xrengine/client-core/src/util/StoredLocalState'

const state = createState({
  storage: {
    projectName: null as string,
    sceneName: null as string
  },
  canvas: null as HTMLCanvasElement
})

const restoreLocalData = (s) => {
  const stored = accessStoredLocalState().attach(Downgraded).editorData.value
  console.log(stored)
  return s.store.merge(stored)
}

store.receptors.push((action: EditorActionType | StoredLocalActionType): any => {
  const dispatch = useDispatch()
  state.batch((s) => {
    switch (action.type) {
      case 'RESTORE':
        return restoreLocalData(s)
      case 'SCENE_LOADED':
        // dispatch(StoredLocalAction.storedLocal({ editorData: { sceneName: action.sceneName } }))
        return s.storage.merge({ sceneName: action.sceneName })
      case 'PROJECT_LOADED':
        dispatch(StoredLocalAction.storedLocal({ editorData: { projectName: action.projectName } }))
        return s.storage.merge({ projectName: action.projectName })
      case 'SET_CANVAS':
        return s.merge({ canvas: action.canvas })
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
  },
  setCanvas: (canvas: HTMLCanvasElement) => {
    return {
      type: 'SET_CANVAS' as const,
      canvas
    }
  }
}

export type EditorActionType = ReturnType<typeof EditorAction[keyof typeof EditorAction]>

// restore manually since the editor is lazy loaded and the restore event is missed
restoreLocalData(state)
