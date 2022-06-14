import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import {
  addComponent,
  ComponentConstructor,
  getComponent,
  hasComponent,
  removeComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityNodeComponent } from '@xrengine/engine/src/scene/components/EntityNodeComponent'
import { dispatchAction } from '@xrengine/hyperflux'

import { CommandFuncType, CommandParams, MiscCommands } from '../constants/EditorCommands'
import { serializeObject3DArray, serializeProperties } from '../functions/debug'
import { EditorAction } from '../services/EditorServices'
import { SelectionAction } from '../services/SelectionServices'

export enum TagComponentOperation {
  TOGGLE,
  ADD,
  REMOVE
}

export type TagComponentOperationType = {
  component: ComponentConstructor<any, any>
  type: TagComponentOperation
  sceneComponentName: string
}

export type TagComponentCommandUndoParams = {
  operations: TagComponentOperationType[]
}

export type TagComponentCommandParams = CommandParams & {
  type: MiscCommands.TAG_COMPONENT

  operations: TagComponentOperationType[]

  undo?: TagComponentCommandUndoParams
}

function prepare(command: TagComponentCommandParams) {
  if (command.keepHistory) {
    command.undo = {
      operations: command.affectedNodes.map((o, i) => {
        const op = command.operations[i] ?? command.operations[0]

        return {
          component: op.component,
          type: hasComponent(o.entity, op.component) ? TagComponentOperation.ADD : TagComponentOperation.REMOVE,
          sceneComponentName: op.sceneComponentName
        }
      })
    }
  }
}

function execute(command: TagComponentCommandParams) {
  update(command, false)
  emitEventAfter(command)
}

function undo(command: TagComponentCommandParams) {
  update(command, true)
  emitEventAfter(command)
}

function emitEventAfter(command: TagComponentCommandParams) {
  if (command.preventEvents) return

  dispatchAction(EditorAction.sceneModified({ modified: true }))
  dispatchAction(SelectionAction.changedObject({ objects: command.affectedNodes, propertyName: '' }))
}

function update(command: TagComponentCommandParams, isUndo?: boolean) {
  const operations = isUndo && command.undo ? command.undo.operations : command.operations

  for (let i = 0; i < command.affectedNodes.length; i++) {
    const object = command.affectedNodes[i]
    const operation = operations[i] ?? operations[0]
    const isCompExists = hasComponent(object.entity, operation.component)

    switch (operation.type) {
      case TagComponentOperation.ADD:
        if (!isCompExists) addTagComponent(object, operation)
        break

      case TagComponentOperation.REMOVE:
        if (isCompExists) removeTagComponent(object, operation)
        break

      default:
        if (isCompExists) removeTagComponent(object, operation)
        else addTagComponent(object, operation)
        break
    }
  }
}

function addTagComponent(object: EntityTreeNode, operation: TagComponentOperationType) {
  addComponent(object.entity, operation.component, {})
  getComponent(object.entity, EntityNodeComponent)?.components.push(operation.sceneComponentName)
}

function removeTagComponent(object: EntityTreeNode, operation: TagComponentOperationType) {
  removeComponent(object.entity, operation.component)
  const comps = getComponent(object.entity, EntityNodeComponent)?.components
  const index = comps.indexOf(operation.sceneComponentName)

  if (index !== -1) comps.splice(index, 1)
}

function toString(command: TagComponentCommandParams) {
  return `SetPropertiesMultipleCommand id: ${command.id} objects: ${serializeObject3DArray(
    command.affectedNodes
  )} properties: ${serializeProperties(command.operations)}`
}

export const TagComponentCommand: CommandFuncType = {
  prepare,
  execute,
  undo,
  emitEventAfter,
  toString
}
