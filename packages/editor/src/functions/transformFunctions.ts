import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { hasComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { traverseEntityNode } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import {
  SnapMode,
  TransformMode,
  TransformModeType,
  TransformPivot,
  TransformPivotType,
  TransformSpace
} from '@etherealengine/engine/src/scene/constants/transformConstants'
import { TransformComponent } from '@etherealengine/engine/src/transform/components/TransformComponent'
import { dispatchAction } from '@etherealengine/hyperflux'

import { accessEditorHelperState, EditorHelperAction } from '../services/EditorHelperState'
import { accessSelectionState } from '../services/SelectionServices'
import { SceneState } from './sceneRenderFunctions'

export const setTransformMode = (mode: TransformModeType): void => {
  if (mode === TransformMode.Placement || mode === TransformMode.Grab) {
    let stop = false
    const selectedEntities = accessSelectionState().selectedEntities.value

    // Dont allow grabbing / placing objects with transform disabled.
    for (const entity of selectedEntities) {
      const isUuid = typeof entity === 'string'
      const node = isUuid ? Engine.instance.scene.getObjectByProperty('uuid', entity) : entity

      if (!isUuid && node) {
        traverseEntityNode(node as Entity, (child) => {
          if (!hasComponent(child, TransformComponent)) stop = true
        })
      }

      if (stop) return
    }
  }

  if (mode !== TransformMode.Placement && mode !== TransformMode.Grab) {
    dispatchAction(EditorHelperAction.changeTransformModeOnCancel({ mode }))
  }

  // EditorHistory.grabCheckPoint = undefined

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

  dispatchAction(EditorHelperAction.changedTransformPivotMode({ transformPivot: TransformPivot[pivots[nextIndex]] }))
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
