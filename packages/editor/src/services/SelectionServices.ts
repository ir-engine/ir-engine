/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { matches, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import {
  hasComponent,
  removeComponent,
  setComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { entityExists } from '@etherealengine/engine/src/ecs/functions/EntityFunctions'
import { EntityOrObjectUUID } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { defineSystem } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { SelectTagComponent } from '@etherealengine/engine/src/scene/components/SelectTagComponent'
import { defineAction, defineActionQueue, defineState, getMutableState } from '@etherealengine/hyperflux'

import { cancelGrabOrPlacement } from '../functions/cancelGrabOrPlacement'
import { filterParentEntities } from '../functions/filterParentEntities'

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
    }) as SelectionServiceStateType
})

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

const updateSelectionQueue = defineActionQueue(SelectionAction.updateSelection.matches)
const changedObjectQueue = defineActionQueue(SelectionAction.changedObject.matches)
const changedSceneGraphQueue = defineActionQueue(SelectionAction.changedSceneGraph.matches)
const forceUpdateQueue = defineActionQueue(SelectionAction.forceUpdate.matches)

const execute = () => {
  const selectionState = getMutableState(SelectionState)
  for (const action of updateSelectionQueue()) {
    cancelGrabOrPlacement()
    /** update SelectTagComponent to only newly selected entities */
    for (const entity of action.selectedEntities.concat(...selectionState.selectedEntities.value)) {
      if (typeof entity === 'number' && entityExists(entity)) {
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

export const EditorSelectionReceptorSystem = defineSystem({
  uuid: 'ee.engine.EditorSelectionReceptorSystem',
  execute
})
