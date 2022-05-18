import { store } from '@xrengine/client-core/src/store'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import {
  addComponent,
  ComponentConstructor,
  hasComponent,
  removeComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'

import { serializeObject3DArray, serializeProperties } from '../functions/debug'
import { EditorAction } from '../services/EditorServices'
import { SelectionAction } from '../services/SelectionServices'
import Command, { CommandParams } from './Command'

export enum TagComponentOperation {
  TOGGLE,
  ADD,
  REMOVE
}

export type TagComponentOperationType = {
  component: ComponentConstructor<any, any>
  type: TagComponentOperation
}

export interface TagComponentCommandParams extends CommandParams {
  operation: TagComponentOperationType | TagComponentOperationType[]
}

export default class TagComponentCommand extends Command {
  operations: TagComponentOperationType[]
  oldOperations: TagComponentOperationType[]

  constructor(objects: EntityTreeNode[], params: TagComponentCommandParams) {
    super(objects, params)

    this.operations = Array.isArray(params.operation) ? params.operation : [params.operation]

    if (this.keepHistory) {
      this.oldOperations = []

      for (let i = 0; i < this.affectedObjects.length; i++) {
        const component = (this.operations[i] ?? this.operations[0]).component
        const componentExists = hasComponent(this.affectedObjects[i].entity, component)
        this.oldOperations.push({
          component,
          type: componentExists ? TagComponentOperation.ADD : TagComponentOperation.REMOVE
        })
      }
    }
  }

  execute() {
    this.updateComponents(this.affectedObjects, this.operations)
    this.emitAfterExecuteEvent()
  }

  undo() {
    if (!this.oldOperations) return

    this.updateComponents(this.affectedObjects, this.oldOperations)
    this.emitAfterExecuteEvent()
  }

  toString() {
    return `SetPropertiesMultipleCommand id: ${this.id} objects: ${serializeObject3DArray(
      this.affectedObjects
    )} properties: ${serializeProperties(this.operations)}`
  }

  emitAfterExecuteEvent() {
    if (this.shouldEmitEvent) {
      store.dispatch(EditorAction.sceneModified(true))
      store.dispatch(SelectionAction.changedObject(this.affectedObjects, undefined))
    }
  }

  updateComponents(objects: EntityTreeNode[], operations: TagComponentOperationType[]): void {
    for (let i = 0; i < objects.length; i++) {
      const object = objects[i]
      const operation = operations[i] ?? operations[0]
      const isCompExists = hasComponent(object.entity, operation.component)

      switch (operation.type) {
        case TagComponentOperation.ADD:
          if (!isCompExists) addComponent(object.entity, operation.component, {})
          break

        case TagComponentOperation.REMOVE:
          if (isCompExists) removeComponent(object.entity, operation.component)
          break

        default:
          if (isCompExists) removeComponent(object.entity, operation.component)
          else addComponent(object.entity, operation.component, {})
          break
      }
    }

    store.dispatch(EditorAction.sceneModified(true))
    store.dispatch(SelectionAction.changedObject(objects, undefined))
  }
}
