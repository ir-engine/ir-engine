import { useState } from '@hookstate/core'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { defineAction, defineState, getMutableState } from '@etherealengine/hyperflux'

export const EditorState = defineState({
  name: 'EditorState',
  initial: () => ({
    projectName: null as string | null,
    sceneName: null as string | null,
    sceneModified: false,
    projectLoaded: false,
    rendererInitialized: false,
    showObject3DInHierarchy: false,
    lockPropertiesPanel: '' as EntityUUID,
    advancedMode: false
  })
})

export const EditorServiceReceptor = (action) => {
  const s = getMutableState(EditorState)
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
/**@deprecated use getMutableState directly instead */
export const accessEditorState = () => getMutableState(EditorState)
/**@deprecated use useHookstate(getMutableState(...) directly instead */
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

  static lockPropertiesPanel = defineAction({
    type: 'xre.editor.Editor.LOCK_PROPERTIES_PANEL' as const,
    lockPropertiesPanel: matches.string as Validator<unknown, EntityUUID>
  })
}
