import { getEntityNodeArrayFromEntities } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { TransformMode } from '@etherealengine/engine/src/scene/constants/transformConstants'
import { getState } from '@etherealengine/hyperflux'

import { EditorHelperState } from '../services/EditorHelperState'
import { SelectionState } from '../services/SelectionServices'
import { EditorControlFunctions } from './EditorControlFunctions'
import { setTransformMode } from './transformFunctions'

export const cancelGrabOrPlacement = () => {
  const editorHelperState = getState(EditorHelperState)
  if (editorHelperState.transformMode === TransformMode.Grab) {
    setTransformMode(editorHelperState.transformModeOnCancel)
    // if (EditorHistory.grabCheckPoint) revertHistory(EditorHistory.grabCheckPoint)
  } else if (editorHelperState.transformMode === TransformMode.Placement) {
    setTransformMode(editorHelperState.transformModeOnCancel)
    EditorControlFunctions.removeObject(getEntityNodeArrayFromEntities(getState(SelectionState).selectedEntities))
  }
}
