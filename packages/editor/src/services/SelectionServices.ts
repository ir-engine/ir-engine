import { createState, useState } from '@speigg/hookstate'

import { store } from '@xrengine/client-core/src/store'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'

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

const state = createState<SelectionServiceStateType>({
  selectedEntities: [],
  selectedParentEntities: [],
  beforeSelectionChangeCounter: 1,
  selectionCounter: 1,
  objectChangeCounter: 1,
  sceneGraphChangeCounter: 1,
  affectedObjects: [],
  propertyName: '',
  transformPropertyChanged: false
})

store.receptors.push((action: SelectionActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'BEFORE_SELECTION_CHANGED':
        return s.merge({ beforeSelectionChangeCounter: s.beforeSelectionChangeCounter.value + 1 })
      case 'SELECTION_CHANGED':
        return s.merge({
          selectionCounter: s.selectionCounter.value + 1,
          selectedEntities: action.selectedEntities,
          selectedParentEntities: filterParentEntities(action.selectedEntities)
        })
      case 'OBJECT_CHANGED':
        return s.merge({
          objectChangeCounter: s.objectChangeCounter.value + 1,
          affectedObjects: action.objects,
          propertyName: action.propertyName,
          transformPropertyChanged: transformProps.includes(action.propertyName)
        })
      case 'SCENE_GRAPH_CHANGED':
        return s.merge({ sceneGraphChangeCounter: s.sceneGraphChangeCounter.value + 1 })
    }
  }, action.type)
})

export const accessSelectionState = () => state

export const useSelectionState = () => useState(state) as any as typeof state

//Service
export const SelectionService = {}

//Action
export const SelectionAction = {
  changedBeforeSelection: () => {
    return {
      type: 'BEFORE_SELECTION_CHANGED' as const
    }
  },
  changedObject: (objects, propertyName) => {
    return {
      type: 'OBJECT_CHANGED' as const,
      objects,
      propertyName
    }
  },
  changedSceneGraph: () => {
    return {
      type: 'SCENE_GRAPH_CHANGED' as const
    }
  },
  updateSelection: (selectedEntities: Entity[]) => {
    return {
      type: 'SELECTION_CHANGED' as const,
      selectedEntities
    }
  }
}

export type SelectionActionType = ReturnType<typeof SelectionAction[keyof typeof SelectionAction]>
