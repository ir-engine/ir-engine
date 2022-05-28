import { useDispatch } from '@xrengine/client-core/src/store'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { traverseEntityNode } from '@xrengine/engine/src/ecs/functions/EntityTreeFunctions'
import {
  SnapMode,
  TransformMode,
  TransformModeType,
  TransformPivot,
  TransformPivotType,
  TransformSpace
} from '@xrengine/engine/src/scene/constants/transformConstants'
import { DisableTransformTagComponent } from '@xrengine/engine/src/transform/components/DisableTransformTagComponent'

import { EditorHistory } from '../classes/History'
import { accessEditorHelperState, EditorHelperAction } from '../services/EditorHelperState'
import { accessSelectionState } from '../services/SelectionServices'
import { SceneState } from './sceneRenderFunctions'

export const setTransformMode = (mode: TransformModeType): void => {
  if (mode === TransformMode.Placement || mode === TransformMode.Grab) {
    let stop = false
    const selectedEntities = accessSelectionState().selectedEntities.value
    const tree = Engine.instance.currentWorld.entityTree

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
    useDispatch()(EditorHelperAction.changeTransformModeOnCancel(mode))
  }

  EditorHistory.grabCheckPoint = undefined
  SceneState.transformGizmo.setTransformMode(mode)
  useDispatch()(EditorHelperAction.changedTransformMode(mode))
}

export const toggleSnapMode = (): void => {
  useDispatch()(
    EditorHelperAction.changedSnapMode(
      accessEditorHelperState().snapMode.value === SnapMode.Disabled ? SnapMode.Grid : SnapMode.Disabled
    )
  )
}

export const setTransformPivot = (pivot: TransformPivotType) => {
  useDispatch()(EditorHelperAction.changedTransformPivotMode(pivot))
}

export const toggleTransformPivot = () => {
  const pivots = Object.keys(TransformPivot)
  const nextIndex = (pivots.indexOf(accessEditorHelperState().transformPivot.value) + 1) % pivots.length

  useDispatch()(EditorHelperAction.changedTransformPivotMode(TransformPivot[pivots[nextIndex]]))
}

export const setTransformSpace = (transformSpace: TransformSpace) => {
  useDispatch()(EditorHelperAction.changedTransformSpaceMode(transformSpace))
}

export const toggleTransformSpace = () => {
  useDispatch()(
    EditorHelperAction.changedTransformSpaceMode(
      accessEditorHelperState().transformSpace.value === TransformSpace.World
        ? TransformSpace.LocalSelection
        : TransformSpace.World
    )
  )
}
