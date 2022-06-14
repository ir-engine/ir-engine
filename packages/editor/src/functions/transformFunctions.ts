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
import { dispatchAction } from '@xrengine/hyperflux'

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
    dispatchAction(EditorHelperAction.changeTransformModeOnCancel({ mode }))
  }

  EditorHistory.grabCheckPoint = undefined
  SceneState.transformGizmo.setTransformMode(mode)
  dispatchAction(EditorHelperAction.changedTransformMode({ mode }))
}

export const toggleSnapMode = (): void => {
  dispatchAction(
    EditorHelperAction.changedSnapMode({
      snapMode: accessEditorHelperState().snapMode.value === SnapMode.Disabled ? SnapMode.Grid : SnapMode.Disabled
    })
  )
}

export const setTransformPivot = (transformPivot: TransformPivotType) => {
  dispatchAction(EditorHelperAction.changedTransformPivotMode({ transformPivot }))
}

export const toggleTransformPivot = () => {
  const pivots = Object.keys(TransformPivot)
  const nextIndex = (pivots.indexOf(accessEditorHelperState().transformPivot.value) + 1) % pivots.length

  dispatchAction(EditorHelperAction.changedTransformPivotMode(TransformPivot[pivots[nextIndex]]))
}

export const setTransformSpace = (transformSpace: TransformSpace) => {
  dispatchAction(EditorHelperAction.changedTransformSpaceMode({ transformSpace }))
}

export const toggleTransformSpace = () => {
  dispatchAction(
    EditorHelperAction.changedTransformSpaceMode({
      transformSpace:
        accessEditorHelperState().transformSpace.value === TransformSpace.World
          ? TransformSpace.LocalSelection
          : TransformSpace.World
    })
  )
}
