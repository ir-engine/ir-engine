import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { SceneState } from '@etherealengine/engine/src/ecs/classes/Scene'
import {
  Component,
  ComponentType,
  SerializedComponentType
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityOrObjectUUID, getEntityNodeArrayFromEntities } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { iterateEntityNode } from '@etherealengine/engine/src/ecs/functions/EntityTree'
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
    ? [UUIDComponent.entitiesByUUID[editorState.lockPropertiesPanel.value]?.value]
    : (getEntityNodeArrayFromEntities(selectionState.selectedEntities.value) as EntityOrObjectUUID[])

  EditorControlFunctions.modifyProperty(affectedNodes, component, properties)

  dispatchAction(EditorHistoryAction.createSnapshot({ modify: true }))
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
