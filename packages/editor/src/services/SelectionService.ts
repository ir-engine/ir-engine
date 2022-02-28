import { createState, useState } from '@speigg/hookstate'

import { store } from '@xrengine/client-core/src/store'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'

type SelectionServiceStateType = {
  beforeSelectionChanged: boolean
  selectionChanged: boolean
  objectChanged: boolean
  sceneGraphChanged: boolean
  affectedObjects: EntityTreeNode[]
  propertyName: string
}

const state = createState<SelectionServiceStateType>({
  beforeSelectionChanged: false,
  selectionChanged: false,
  objectChanged: false,
  sceneGraphChanged: false,
  affectedObjects: [],
  propertyName: ''
})

store.receptors.push((action: SelectionActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'BEFORE_SELECTION_CHANGED':
        return s.merge({ beforeSelectionChanged: action.beforeSelectionChanged })
      case 'SELECTION_CHANGED':
        return s.merge({ selectionChanged: action.selectionChanged })
      case 'OBJECT_CHANGED':
        return s.merge({
          objectChanged: action.objectChanged,
          affectedObjects: action.objects,
          propertyName: action.propertyName
        })
      case 'SCENE_GRAPH_CHANGED':
        return s.merge({ objectChanged: action.sceneGraphChanged })
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
      type: 'BEFORE_SELECTION_CHANGED' as const,
      beforeSelectionChanged: !accessSelectionState().beforeSelectionChanged.value
    }
  },
  changedSelection: () => {
    return {
      type: 'SELECTION_CHANGED' as const,
      selectionChanged: !accessSelectionState().selectionChanged.value
    }
  },
  changedObject: (objects, propertyName) => {
    return {
      type: 'OBJECT_CHANGED' as const,
      objects,
      propertyName,
      objectChanged: !accessSelectionState().objectChanged.value
    }
  },
  changedSceneGraph: () => {
    return {
      type: 'SCENE_GRAPH_CHANGED' as const,
      sceneGraphChanged: !accessSelectionState().sceneGraphChanged.value
    }
  }
}

export type SelectionActionType = ReturnType<typeof SelectionAction[keyof typeof SelectionAction]>
