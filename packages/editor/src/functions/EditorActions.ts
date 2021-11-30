import { defineActionCreator } from '@xrengine/engine/src/networking/interfaces/Action'
import { match } from 'assert'
import matches from 'ts-matches'
//dispatchLocal(EditorActions.settingsChanged.action({}) as any)
//dispatchLocal(EditorActions.selectionChanged.action({}) as any)

export class EditorActions {
  static beforeSelectionChanged = {
    action: defineActionCreator(
      {
        type: 'editor.beforeSelectionChanged'
      },
      { allowDispatchFromAny: true }
    ),
    callbackFunctions: new Set()
  }
  static selectionChanged = {
    action: defineActionCreator(
      {
        type: 'editor.selectionChanged'
      },
      { allowDispatchFromAny: true }
    ),
    callbackFunctions: new Set()
  }
  static sceneGraphChanged = {
    action: defineActionCreator(
      {
        type: 'editor.sceneGraphChanged'
      },
      { allowDispatchFromAny: true }
    ),
    callbackFunctions: new Set()
  }

  static objectsChanged = {
    action: defineActionCreator(
      {
        type: 'editor.objectsChanged'
      },
      { allowDispatchFromAny: true }
    ),
    callbackFunctions: new Set()
  }

  static saveProject = {
    action: defineActionCreator(
      {
        type: 'editor.saveProject'
      },
      { allowDispatchFromAny: true }
    ),
    callbackFunctions: new Set()
  }

  static projectLoaded = {
    action: defineActionCreator(
      {
        type: 'editor.projectLoaded'
      },
      { allowDispatchFromAny: true }
    ),
    callbackFunctions: new Set()
  }

  static rendererInitialized = {
    action: defineActionCreator(
      {
        type: 'editor.rendererInitialized'
      },
      { allowDispatchFromAny: true }
    ),
    callbackFunctions: new Set()
  }

  static flyModeChanged = {
    action: defineActionCreator(
      {
        type: 'editor.flyModeChanged'
      },
      { allowDispatchFromAny: true }
    ),
    callbackFunctions: new Set()
  }
  static transformModeChanged = {
    action: defineActionCreator(
      {
        type: 'editor.transformModeChanged'
      },
      { allowDispatchFromAny: true }
    ),
    callbackFunctions: new Set()
  }
  static transformPivotChanged = {
    action: defineActionCreator(
      {
        type: 'editor.transformPivotChanged'
      },
      { allowDispatchFromAny: true }
    ),
    callbackFunctions: new Set()
  }

  static snapSettingsChanged = {
    action: defineActionCreator(
      {
        type: 'editor.snapSettingsChanged'
      },
      { allowDispatchFromAny: true }
    ),
    callbackFunctions: new Set()
  }
  static fileUploaded = {
    action: defineActionCreator(
      {
        type: 'editor.fileUploaded'
      },
      { allowDispatchFromAny: true }
    ),
    callbackFunctions: new Set()
  }
  static error = {
    action: defineActionCreator(
      {
        type: 'editor.error'
      },
      { allowDispatchFromAny: true }
    ),
    callbackFunctions: new Set()
  }
}
