import { useState } from '@hookstate/core'

import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, getState } from '@xrengine/hyperflux'

export enum TaskStatus {
  NOT_STARTED = 0,
  IN_PROGRESS = 1,
  COMPLETED = 2
}

export const EditorState = defineState({
  name: 'EditorState',
  initial: () => ({
    projectName: null as string | null,
    sceneName: null as string | null,
    sceneModified: false,
    preprojectLoadTaskStatus: TaskStatus.NOT_STARTED,
    projectLoaded: false,
    rendererInitialized: false,
    showObject3DInHierarchy: false,
    lockPropertiesPanel: '',
    advancedMode: false
  })
})

export const EditorServiceReceptor = (action) => {
  const s = getState(EditorState)
  matches(action)
    .when(EditorAction.sceneChanged.matches, (action) => {
      return s.merge({ sceneName: action.sceneName, sceneModified: false })
    })
    .when(EditorAction.projectChanged.matches, (action) => {
      return s.merge({ projectName: action.projectName, sceneName: null, sceneModified: false })
    })
    .when(EditorAction.sceneModified.matches, (action) => {
      return s.merge({ sceneModified: action.modified })
    })
    .when(EditorAction.updatePreprojectLoadTask.matches, (action) => {
      return s.merge({ preprojectLoadTaskStatus: action.taskStatus })
    })
    .when(EditorAction.projectLoaded.matches, (action) => {
      return s.merge({ projectLoaded: action.loaded })
    })
    .when(EditorAction.rendererInitialized.matches, (action) => {
      return s.merge({ rendererInitialized: action.initialized })
    })
    .when(EditorAction.showObject3DInHierarchy.matches, (action) => {
      return s.merge({ showObject3DInHierarchy: action.showObject3DInHierarchy })
    })
    .when(EditorAction.lockPropertiesPanel.matches, (action) =>
      s.merge({ lockPropertiesPanel: action.lockPropertiesPanel })
    )
    .when(EditorAction.setAdvancedMode.matches, (action) => {
      return s.merge({ advancedMode: action.advanced })
    })
}

export const accessEditorState = () => getState(EditorState)

export const useEditorState = () => useState(accessEditorState())

//Service
export const EditorService = {}

//Action
export class EditorAction {
  static projectChanged = defineAction({
    type: 'xre.editor.Editor.EDITOR_PROJECT_CHANGED' as const,
    projectName: matches.any as Validator<unknown, string | null>
  })

  static sceneChanged = defineAction({
    type: 'xre.editor.Editor.EDITOR_SCENE_CHANGED' as const,
    sceneName: matches.any as Validator<unknown, string | null>
  })

  static sceneModified = defineAction({
    type: 'xre.editor.Editor.EDITOR_SCENE_MODIFIED' as const,
    modified: matches.boolean
  })

  static projectLoaded = defineAction({
    type: 'xre.editor.Editor.EDITOR_PROJECT_LOADED' as const,
    loaded: matches.boolean
  })

  static rendererInitialized = defineAction({
    type: 'xre.editor.Editor.EDITOR_RENDERER_INITIALIZED' as const,
    initialized: matches.boolean
  })

  static showObject3DInHierarchy = defineAction({
    type: 'xre.editor.Editor.SHOW_OBJECT3D_IN_HIERARCHY' as const,
    showObject3DInHierarchy: matches.boolean
  })

  static setAdvancedMode = defineAction({
    type: 'xre.editor.Editor.SET_ADVANCED_MODE' as const,
    advanced: matches.boolean
  })

  static updatePreprojectLoadTask = defineAction({
    type: 'xre.editor.Editor.UPDATE_PREPROJECT_TASK_STATUS' as const,
    taskStatus: matches.any as Validator<unknown, TaskStatus>
  })

  static lockPropertiesPanel = defineAction({
    type: 'xre.editor.Editor.LOCK_PROPERTIES_PANEL' as const,
    lockPropertiesPanel: matches.string
  })
}
