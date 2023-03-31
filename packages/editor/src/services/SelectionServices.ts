import { useState } from '@hookstate/core'

import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import {
  hasComponent,
  removeComponent,
  setComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityOrObjectUUID } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { SystemDefintion } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { SelectTagComponent } from '@etherealengine/engine/src/scene/components/SelectTagComponent'
import {
  createActionQueue,
  defineAction,
  defineState,
  getMutableState,
  removeActionQueue
} from '@etherealengine/hyperflux'

import { cancelGrabOrPlacement } from '../functions/cancelGrabOrPlacement'
import { filterParentEntities } from '../functions/filterParentEntities'
import { updateOutlinePassSelection } from '../functions/updateOutlinePassSelection'

const transformProps = ['position', 'rotation', 'scale', 'matrix']

type SelectionServiceStateType = {
  selectedEntities: EntityOrObjectUUID[]
  selectedParentEntities: EntityOrObjectUUID[]
  selectionCounter: number
  objectChangeCounter: number
  sceneGraphChangeCounter: number
  propertyName: string
  transformPropertyChanged: boolean
}

export const SelectionState = defineState({
  name: 'SelectionState',
  initial: () =>
    ({
      selectedEntities: [],
      selectedParentEntities: [],
      selectionCounter: 1,
      objectChangeCounter: 1,
      sceneGraphChangeCounter: 1,
      propertyName: '',
      transformPropertyChanged: false
    } as SelectionServiceStateType)
})

export default function EditorSelectionReceptor(): SystemDefintion {
  const selectionState = getMutableState(SelectionState)

  const updateSelectionQueue = createActionQueue(SelectionAction.updateSelection.matches)
  const changedObjectQueue = createActionQueue(SelectionAction.changedObject.matches)
  const changedSceneGraphQueue = createActionQueue(SelectionAction.changedSceneGraph.matches)
  const forceUpdateQueue = createActionQueue(SelectionAction.forceUpdate.matches)

  const execute = () => {
    for (const action of updateSelectionQueue()) {
      cancelGrabOrPlacement()
      /** update SelectTagComponent to only newly selected entities */
      for (const entity of action.selectedEntities.concat(...selectionState.selectedEntities.value)) {
        if (typeof entity === 'number') {
          const add = action.selectedEntities.includes(entity)
          if (add && !hasComponent(entity, SelectTagComponent)) setComponent(entity, SelectTagComponent)
          if (!add && hasComponent(entity, SelectTagComponent)) removeComponent(entity, SelectTagComponent)
        }
      }
      selectionState.merge({
        selectionCounter: selectionState.selectionCounter.value + 1,
        selectedEntities: action.selectedEntities,
        selectedParentEntities: filterParentEntities(action.selectedEntities)
      })
      updateOutlinePassSelection()
    }
    for (const action of changedObjectQueue())
      selectionState.merge({
        objectChangeCounter: selectionState.objectChangeCounter.value + 1,
        propertyName: action.propertyName,
        transformPropertyChanged: transformProps.includes(action.propertyName)
      })
    for (const action of changedSceneGraphQueue())
      selectionState.merge({ sceneGraphChangeCounter: selectionState.sceneGraphChangeCounter.value + 1 })
    for (const action of forceUpdateQueue())
      selectionState.merge({ objectChangeCounter: selectionState.objectChangeCounter.value + 1 })
  }

  const cleanup = async () => {
    removeActionQueue(updateSelectionQueue)
    removeActionQueue(changedObjectQueue)
    removeActionQueue(changedSceneGraphQueue)
    removeActionQueue(forceUpdateQueue)
  }

  return { execute, cleanup }
}
/**@deprecated use getMutableState directly instead */
export const accessSelectionState = () => getMutableState(SelectionState)
/**@deprecated use useHookstate(getMutableState(...) directly instead */
export const useSelectionState = () => useState(accessSelectionState())

//Service
export const SelectionService = {}

//Action
export class SelectionAction {
  static changedObject = defineAction({
    type: 'ee.editor.Selection.OBJECT_CHANGED',
    objects: matches.array as Validator<unknown, EntityOrObjectUUID[]>,
    propertyName: matches.string
  })

  static changedSceneGraph = defineAction({
    type: 'ee.editor.Selection.SCENE_GRAPH_CHANGED'
  })

  static updateSelection = defineAction({
    type: 'ee.editor.Selection.SELECTION_CHANGED',
    selectedEntities: matches.array as Validator<unknown, EntityOrObjectUUID[]>
  })

  static forceUpdate = defineAction({
    type: 'ee.editor.Selection.FORCE_UPDATE'
  })
}
