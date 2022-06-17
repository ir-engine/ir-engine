import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import {
  ComponentConstructor,
  ComponentType,
  getComponent
} from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityNodeComponent } from '@xrengine/engine/src/scene/components/EntityNodeComponent'
import { dispatchAction } from '@xrengine/hyperflux'

import { CommandFuncType, CommandParams, ObjectCommands } from '../constants/EditorCommands'
import arrayShallowEqual from '../functions/arrayShallowEqual'
import { serializeObject3DArray, serializeProperties } from '../functions/debug'
import { EditorAction } from '../services/EditorServices'
import { SelectionAction } from '../services/SelectionServices'

export type ModifyPropertyCommandUndoParams<C extends ComponentConstructor<any, any>> = {
  properties: Partial<ComponentType<C>>[]
}

export type ModifyPropertyCommandParams<C extends ComponentConstructor<any, any>> = CommandParams & {
  type: ObjectCommands.MODIFY_PROPERTY

  properties: Partial<ComponentType<C>>[]

  component: C

  undo?: ModifyPropertyCommandUndoParams<C>
}

function prepare<C extends ComponentConstructor<any, any>>(command: ModifyPropertyCommandParams<C>) {
  if (command.keepHistory) {
    command.undo = {
      properties: command.affectedNodes.map((node, i) => {
        const comp = getComponent(node.entity, command.component)
        const oldProps = {} as any
        const propertyNames = Object.keys(command.properties[i] ?? command.properties[0])

        for (const propertyName of propertyNames) {
          const { result, finalProp } = getNestedObject(comp, propertyName)
          const oldValue = result[finalProp]
          oldProps[propertyName] = oldValue && oldValue.clone ? oldValue.clone() : oldValue
        }

        return oldProps
      })
    }
  }
}

function shouldUpdate<C extends ComponentConstructor<any, any>>(
  currentCommnad: ModifyPropertyCommandParams<C>,
  newCommand: ModifyPropertyCommandParams<C>
): boolean {
  if (
    currentCommnad.component !== newCommand.component ||
    currentCommnad.properties.length !== newCommand.properties.length ||
    !arrayShallowEqual(currentCommnad.affectedNodes, newCommand.affectedNodes)
  )
    return false

  for (let i = 0; i < currentCommnad.properties.length; i++) {
    arrayShallowEqual(Object.keys(currentCommnad.properties[i]), Object.keys(newCommand.properties[i]))
    if (!arrayShallowEqual(Object.keys(currentCommnad.properties[i]), Object.keys(newCommand.properties[i]))) {
      return false
    }
  }

  return true
}

function update<C extends ComponentConstructor<any, any>>(
  currentCommnad: ModifyPropertyCommandParams<C>,
  newCommand: ModifyPropertyCommandParams<C>
) {
  currentCommnad.properties = newCommand.properties
  execute(currentCommnad)
}

function execute<C extends ComponentConstructor<any, any>>(command: ModifyPropertyCommandParams<C>) {
  updateProperty(command, false)
}

function undo<C extends ComponentConstructor<any, any>>(command: ModifyPropertyCommandParams<C>) {
  updateProperty(command, true)
}

function updateProperty<C extends ComponentConstructor<any, any>>(
  command: ModifyPropertyCommandParams<C>,
  isUndo?: boolean
) {
  const properties = isUndo && command.undo ? command.undo.properties : command.properties

  for (let i = 0; i < command.affectedNodes.length; i++) {
    const entity = command.affectedNodes[i].entity
    const props = properties[i] ?? properties[0]

    const comp = getComponent(entity, command.component)
    if (comp) {
      for (const propertyName of Object.keys(props)) {
        const value = props[propertyName]
        const { result, finalProp } = getNestedObject(comp, propertyName)

        if (value && value.copy) {
          if (!result[finalProp]) result[finalProp] = new value.constructor()
          result[finalProp].copy(value)
        } else if (
          typeof value !== 'undefined' &&
          typeof result[finalProp] === 'object' &&
          typeof result[finalProp].set === 'function'
        ) {
          result[finalProp].set(value)
        } else {
          result[finalProp] = value
        }

        dispatchAction(SelectionAction.changedObject({ objects: [command.affectedNodes[i]], propertyName }))
      }
    }

    const nodeComponent = getComponent(entity, EntityNodeComponent)
    for (const component of nodeComponent.components) {
      Engine.instance.currentWorld.sceneLoadingRegistry.get(component)?.update?.(entity, props)
    }
  }

  dispatchAction(EditorAction.sceneModified({ modified: true }))
}

function toString<C extends ComponentConstructor<any, any>>(command: ModifyPropertyCommandParams<C>) {
  return `Modify Property Command id: ${command.id} objects: ${serializeObject3DArray(
    command.affectedNodes
  )} properties: ${serializeProperties(command.properties)}`
}

export const ModifyPropertyCommand: CommandFuncType = {
  prepare,
  execute,
  undo,
  shouldUpdate,
  update,
  toString
}

export function getNestedObject(object: any, propertyName: string): { result: any; finalProp: string } {
  const props = propertyName.split('.')
  let result = object

  for (let i = 0; i < props.length - 1; i++) {
    result = result[props[i]]
  }

  return { result, finalProp: props[props.length - 1] }
}
