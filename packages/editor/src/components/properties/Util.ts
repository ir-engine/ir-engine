import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { World } from '@xrengine/engine/src/ecs/classes/World'
import {
  Component,
  ComponentType,
  SerializedComponentType
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityOrObjectUUID, getEntityNodeArrayFromEntities } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { iterateEntityNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { UUIDComponent } from '@xrengine/engine/src/scene/components/UUIDComponent'
import { dispatchAction, getState } from '@xrengine/hyperflux'

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
  const editorState = getState(EditorState)
  const selectionState = getState(SelectionState)

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
  snubChildren: boolean = false,
  world: World = Engine.instance.currentWorld
): T[] {
  const result: T[] = []
  iterateEntityNode(world.sceneEntity, (node) => result.push(callback(node)), predicate, snubChildren)
  return result
}
