import { useState } from '@speigg/hookstate'

import { matches, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { defineAction, defineState, getState } from '@xrengine/hyperflux'

import { filterParentEntities } from '../functions/filterParentEntities'

const transformProps = ['position', 'rotation', 'scale', 'matrix']

type SelectionServiceStateType = {
  selectedEntities: Entity[]
  selectedParentEntities: Entity[]
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
  getState(SelectionState).batch((s) => {
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
          affectedObjects: action.objects,
          propertyName: action.propertyName,
          transformPropertyChanged: transformProps.includes(action.propertyName)
        })
      })
      .when(SelectionAction.changedSceneGraph.matches, (action) => {
        return s.merge({ sceneGraphChangeCounter: s.sceneGraphChangeCounter.value + 1 })
      })
  })
}

export const accessSelectionState = () => getState(SelectionState)

export const useSelectionState = () => useState(accessSelectionState())

//Service
export const SelectionService = {}

//Action
export class SelectionAction {
  static changedBeforeSelection = defineAction({
    type: 'editorSelection.BEFORE_SELECTION_CHANGED'
  })

  static changedObject = defineAction({
    type: 'editorSelection.OBJECT_CHANGED',
    objects: matches.array as Validator<unknown, EntityTreeNode[]>,
    propertyName: matches.string
  })

  static changedSceneGraph = defineAction({
    type: 'editorSelection.SCENE_GRAPH_CHANGED'
  })

  static updateSelection = defineAction({
    type: 'editorSelection.SELECTION_CHANGED',
    selectedEntities: matches.array as Validator<unknown, Entity[]>
  })
}
