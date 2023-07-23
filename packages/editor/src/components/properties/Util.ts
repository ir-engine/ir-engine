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

import { debounce } from 'lodash'

import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { SceneState } from '@etherealengine/engine/src/ecs/classes/Scene'
import { Component, SerializedComponentType } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import {
  EntityOrObjectUUID,
  getEntityNodeArrayFromEntities,
  iterateEntityNode
} from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'
import { dispatchAction, getMutableState, getState } from '@etherealengine/hyperflux'

import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { EditorHistoryAction } from '../../services/EditorHistory'
import { EditorState } from '../../services/EditorServices'
import { SelectionState } from '../../services/SelectionServices'

export type EditorPropType = {
  entity: Entity
  component?: Component
  multiEdit?: boolean
}

export type EditorComponentType = React.FC<EditorPropType> & {
  iconComponent?: any
}

export const updateProperty = <C extends Component, K extends keyof SerializedComponentType<C>>(
  component: C,
  propName: K,
  nodes?: EntityOrObjectUUID[]
) => {
  return (value: SerializedComponentType<C>[K]) => {
    updateProperties(component, { [propName]: value } as any, nodes)
  }
}

export const updateProperties = <C extends Component>(
  component: C,
  properties: Partial<SerializedComponentType<C>>,
  nodes?: EntityOrObjectUUID[]
) => {
  const editorState = getMutableState(EditorState)
  const selectionState = getMutableState(SelectionState)

  const affectedNodes = nodes
    ? nodes
    : editorState.lockPropertiesPanel.value
    ? [UUIDComponent.entitiesByUUID[editorState.lockPropertiesPanel.value]]
    : (getEntityNodeArrayFromEntities(selectionState.selectedEntities.value) as EntityOrObjectUUID[])

  EditorControlFunctions.modifyProperty(affectedNodes, component, properties)

  debounce(() => dispatchAction(EditorHistoryAction.createSnapshot({})), 100)
}

export function traverseScene<T>(
  callback: (node: Entity) => T,
  predicate: (node: Entity) => boolean = () => true,
  snubChildren: boolean = false
): T[] {
  const result: T[] = []
  iterateEntityNode(getState(SceneState).sceneEntity, (node) => result.push(callback(node)), predicate, snubChildren)
  return result
}
