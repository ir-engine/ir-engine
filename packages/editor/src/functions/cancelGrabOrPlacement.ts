import { TransformMode } from '@xrengine/engine/src/scene/constants/transformConstants'

import { EditorHistory, executeCommandWithHistoryOnSelection, revertHistory } from '../classes/History'
import EditorCommands from '../constants/EditorCommands'
import { accessModeState } from '../services/ModeServices'
import { setTransformMode } from './transformFunctions'

export const cancelGrabOrPlacement = () => {
  const modeState = accessModeState()

  if (modeState.transformMode.value === TransformMode.Grab) {
    setTransformMode(modeState.transformModeOnCancel.value)
    if (EditorHistory.grabCheckPoint) revertHistory(EditorHistory.grabCheckPoint)
  } else if (modeState.transformMode.value === TransformMode.Placement) {
    setTransformMode(modeState.transformModeOnCancel.value)
    executeCommandWithHistoryOnSelection(EditorCommands.REMOVE_OBJECTS, {
      deselectObject: true
    })
  }
}
