import { TransformMode } from '@xrengine/engine/src/scene/constants/transformConstants'

import { EditorHistory, executeCommandWithHistoryOnSelection, revertHistory } from '../classes/History'
import EditorCommands from '../constants/EditorCommands'
import { accessEditorHelperState } from '../services/EditorHelperState'
import { setTransformMode } from './transformFunctions'

export const cancelGrabOrPlacement = () => {
  const editorHelperState = accessEditorHelperState()

  if (editorHelperState.transformMode.value === TransformMode.Grab) {
    setTransformMode(editorHelperState.transformModeOnCancel.value)
    if (EditorHistory.grabCheckPoint) revertHistory(EditorHistory.grabCheckPoint)
  } else if (editorHelperState.transformMode.value === TransformMode.Placement) {
    setTransformMode(editorHelperState.transformModeOnCancel.value)
    executeCommandWithHistoryOnSelection({ type: EditorCommands.REMOVE_OBJECTS })
  }
}
