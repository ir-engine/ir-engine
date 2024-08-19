/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { UUIDComponent } from '@ir-engine/ecs'
import { Component, SerializedComponentType, updateComponent } from '@ir-engine/ecs/src/ComponentFunctions'
import { Entity } from '@ir-engine/ecs/src/Entity'
import { getMutableState } from '@ir-engine/hyperflux'

import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
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
  nodes?: Entity[]
) => {
  return (value: SerializedComponentType<C>[K]) => {
    updateProperties(component, { [propName]: value } as any, nodes)
  }
}

export const updateProperties = <C extends Component>(
  component: C,
  properties: Partial<SerializedComponentType<C>>,
  nodes?: Entity[]
) => {
  const editorState = getMutableState(EditorState)

  const affectedNodes = nodes
    ? nodes
    : editorState.lockPropertiesPanel.value
    ? [UUIDComponent.getEntityByUUID(editorState.lockPropertiesPanel.value)]
    : SelectionState.getSelectedEntities()
  for (let i = 0; i < affectedNodes.length; i++) {
    const node = affectedNodes[i]
    updateComponent(node, component, properties)
  }
}

export const commitProperty = <C extends Component, K extends keyof SerializedComponentType<C>>(
  component: C,
  propName: K,
  nodes?: Entity[]
) => {
  return (value: SerializedComponentType<C>[K]) => {
    commitProperties(component, { [propName]: value } as any, nodes)
  }
}

export const commitProperties = <C extends Component>(
  component: C,
  properties: Partial<SerializedComponentType<C>>,
  nodes?: Entity[]
) => {
  const editorState = getMutableState(EditorState)

  const affectedNodes = nodes
    ? nodes
    : editorState.lockPropertiesPanel.value
    ? [UUIDComponent.getEntityByUUID(editorState.lockPropertiesPanel.value)]
    : SelectionState.getSelectedEntities()

  EditorControlFunctions.modifyProperty(affectedNodes, component, properties)
}
