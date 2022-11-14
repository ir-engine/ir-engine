import { EngineActions } from '@xrengine/engine/src/ecs/classes/EngineState'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import {
  addComponent,
  Component,
  hasComponent,
  removeComponent,
  SerializedComponentType,
  setComponent,
  updateComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { dispatchAction, getState } from '@xrengine/hyperflux'

import { EditorHistoryAction } from '../services/EditorHistory'
import { EditorAction } from '../services/EditorServices'
import { SelectionAction, SelectionState } from '../services/SelectionServices'

/**
 *
 * @param nodes
 * @param component
 */
const addOrRemoveComponentToSelection = <C extends Component<any, any>>(component: C, add: boolean) => {
  const entities = getState(SelectionState).selectedEntities.value

  for (let i = 0; i < entities.length; i++) {
    const entity = entities[i]
    if (typeof entity === 'string') continue
    if (add) setComponent(entity, component)
    else removeComponent(entity, component)
  }

  /** @todo remove when all scene components migrated to reactor pattern */
  dispatchAction(
    EngineActions.sceneObjectUpdate({
      entities: entities as Entity[]
    })
  )
  dispatchAction(EditorAction.sceneModified({ modified: true }))
}

/**
 * Updates each property specified in 'properties' on the component for each of the specified entity nodes
 * @param nodes
 * @param properties
 * @param component
 */
const modifyProperty = <C extends Component<any, any>>(
  nodes: EntityTreeNode[],
  component: C,
  properties: Partial<SerializedComponentType<C>>
) => {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    if (typeof node === 'string') continue
    const entity = node.entity
    updateComponent(entity, component, properties)
  }

  /** @todo remove when all scene components migrated to reactor pattern */
  dispatchAction(
    EngineActions.sceneObjectUpdate({
      entities: nodes.filter((node) => typeof node !== 'string').map((node: EntityTreeNode) => node.entity)
    })
  )
  dispatchAction(EditorAction.sceneModified({ modified: true }))
}

/**
 *
 * @param nodes
 * @returns
 */
const replaceSelection = (nodes: (EntityTreeNode | string)[]) => {
  const current = getState(SelectionState).selectedEntities.value
  const selectedEntities = nodes.map((n) => (typeof n === 'string' ? n : n.entity))

  if (selectedEntities.length === current.length) {
    let same = true
    for (let i = 0; i < selectedEntities.length; i++) {
      if (!current.includes(selectedEntities[i])) {
        same = false
        break
      }
    }
    if (same) return
  }

  dispatchAction(SelectionAction.updateSelection({ selectedEntities }))
  dispatchAction(EditorHistoryAction.create({ selectedEntities }))
}

/**
 *
 * @param nodes
 * @returns
 */
const toggleSelection = (nodes: (EntityTreeNode | string)[]) => {
  const selectedEntities = getState(SelectionState).selectedEntities.value.slice(0)

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]
    let index = selectedEntities.indexOf(typeof node === 'string' ? node : node.entity)

    if (index > -1) {
      selectedEntities.splice(index, 1)
    } else {
      selectedEntities.push(typeof node === 'string' ? node : node.entity)
    }
  }
  dispatchAction(SelectionAction.updateSelection({ selectedEntities }))
  dispatchAction(EditorHistoryAction.create({ selectedEntities }))
}

const addToSelection = (nodes: (EntityTreeNode | string)[]) => {
  const selectedEntities = getState(SelectionState).selectedEntities.value.slice(0)

  for (let i = 0; i < nodes.length; i++) {
    const object = nodes[i]
    if (selectedEntities.includes(typeof object === 'string' ? object : object.entity)) continue
    if (typeof object === 'string') {
      selectedEntities.push(object)
    } else {
      selectedEntities.push(object.entity)
    }
  }

  dispatchAction(SelectionAction.updateSelection({ selectedEntities }))
  dispatchAction(EditorHistoryAction.create({ selectedEntities }))
}

export const EditorControlFunctions = {
  addOrRemoveComponentToSelection,
  modifyProperty,
  addToSelection,
  replaceSelection,
  toggleSelection
}
