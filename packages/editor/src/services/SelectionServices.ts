import { useState } from '@hookstate/core'

import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { defineAction, defineState, getState } from '@xrengine/hyperflux'

import { filterParentEntities } from '../functions/filterParentEntities'

const transformProps = ['position', 'rotation', 'scale', 'matrix']

type SelectionServiceStateType = {
  selectedEntities: (Entity | string)[]
  selectedParentEntities: (Entity | string)[]
  beforeSelectionChangeCounter: number
  selectionCounter: number
  objectChangeCounter: number
  sceneGraphChangeCounter: number
  affectedObjects: EntityTreeNode[]
  propertyName: string
  transformPropertyChanged: boolean
}

const SelectionState = defineState({
  name: 'SelectionState',
  initial: () =>
    ({
      selectedEntities: [],
      selectedParentEntities: [],
      beforeSelectionChangeCounter: 1,
      selectionCounter: 1,
      objectChangeCounter: 1,
      sceneGraphChangeCounter: 1,
      affectedObjects: [],
      propertyName: '',
      transformPropertyChanged: false
    } as SelectionServiceStateType)
})

export const EditorSelectionServiceReceptor = (action) => {
  const s = getState(SelectionState)
  matches(action)
    .when(SelectionAction.changedBeforeSelection.matches, (action) => {
      return s.merge({ beforeSelectionChangeCounter: s.beforeSelectionChangeCounter.value + 1 })
    })
    .when(SelectionAction.updateSelection.matches, (action) => {
      return s.merge({
        selectionCounter: s.selectionCounter.value + 1,
        selectedEntities: action.selectedEntities,
        selectedParentEntities: filterParentEntities(action.selectedEntities)
      })
    })
    .when(SelectionAction.changedObject.matches, (action) => {
      return s.merge({
        objectChangeCounter: s.objectChangeCounter.value + 1,
        affectedObjects: action.objects.filter((object) => typeof object !== 'string') as EntityTreeNode[],
        propertyName: action.propertyName,
        transformPropertyChanged: transformProps.includes(action.propertyName)
      })
    })
    .when(SelectionAction.changedSceneGraph.matches, (action) => {
      return s.merge({ sceneGraphChangeCounter: s.sceneGraphChangeCounter.value + 1 })
    })
}

export const accessSelectionState = () => getState(SelectionState)

export const useSelectionState = () => useState(accessSelectionState())

//Service
export const SelectionService = {}

//Action
export class SelectionAction {
  static changedBeforeSelection = defineAction({
    type: 'xre.editor.Selection.BEFORE_SELECTION_CHANGED'
  })

  static changedObject = defineAction({
    type: 'xre.editor.Selection.OBJECT_CHANGED',
    objects: matches.array as Validator<unknown, (EntityTreeNode | string)[]>,
    propertyName: matches.string
  })

  static changedSceneGraph = defineAction({
    type: 'xre.editor.Selection.SCENE_GRAPH_CHANGED'
  })

  static updateSelection = defineAction({
    type: 'xre.editor.Selection.SELECTION_CHANGED',
    selectedEntities: matches.array as Validator<unknown, (Entity | string)[]>
  })
}
