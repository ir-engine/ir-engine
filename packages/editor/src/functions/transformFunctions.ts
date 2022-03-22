import { useDispatch } from '@xrengine/client-core/src/store'
import { hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { traverseEntityNode } from '@xrengine/engine/src/ecs/functions/EntityTreeFunctions'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import {
  SnapMode,
  TransformMode,
  TransformModeType,
  TransformPivot,
  TransformPivotType,
  TransformSpace
} from '@xrengine/engine/src/scene/constants/transformConstants'
import { DisableTransformTagComponent } from '@xrengine/engine/src/transform/components/DisableTransformTagComponent'

import { EditorHistory, executeCommand, executeCommandWithHistoryOnSelection, revertHistory } from '../classes/History'
import EditorCommands from '../constants/EditorCommands'
import { accessModeState, ModeAction } from '../services/ModeServices'
import { accessSelectionState } from '../services/SelectionServices'
import { SceneState } from './sceneRenderFunctions'

export const setTransformMode = (mode: TransformModeType): void => {
  if (mode === TransformMode.Placement || mode === TransformMode.Grab) {
    let stop = false
    const selectedEntities = accessSelectionState().selectedEntities.value
    const tree = useWorld().entityTree

    // Dont allow grabbing / placing objects with transform disabled.
    for (const entity of selectedEntities) {
      const node = tree.entityNodeMap.get(entity)

      if (node) {
        traverseEntityNode(node, (node) => {
          if (hasComponent(node.entity, DisableTransformTagComponent)) stop = true
        })
      }

      if (stop) return
    }
  }

  if (mode !== TransformMode.Placement && mode !== TransformMode.Grab) {
    useDispatch()(ModeAction.changeTransformModeOnCancel(mode))
  }

  EditorHistory.grabCheckPoint = undefined
  SceneState.transformGizmo.setTransformMode(mode)
  useDispatch()(ModeAction.changedTransformMode(mode))
}

export const toggleSnapMode = (): void => {
  useDispatch()(
    ModeAction.changedSnapMode(
      accessModeState().snapMode.value === SnapMode.Disabled ? SnapMode.Grid : SnapMode.Disabled
    )
  )
}

export const setTransformPivot = (pivot: TransformPivotType) => {
  useDispatch()(ModeAction.changedTransformPivotMode(pivot))
}

export const toggleTransformPivot = () => {
  const pivots = Object.keys(TransformPivot)
  const nextIndex = (pivots.indexOf(accessModeState().transformPivot.value) + 1) % pivots.length

  useDispatch()(ModeAction.changedTransformPivotMode(TransformPivot[pivots[nextIndex]]))
}

export const setTransformSpace = (transformSpace: TransformSpace) => {
  useDispatch()(ModeAction.changedTransformSpaceMode(transformSpace))
}

export const toggleTransformSpace = () => {
  useDispatch()(
    ModeAction.changedTransformSpaceMode(
      accessModeState().transformSpace.value === TransformSpace.World
        ? TransformSpace.LocalSelection
        : TransformSpace.World
    )
  )
}

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

  executeCommand(EditorCommands.REPLACE_SELECTION, [])
}
