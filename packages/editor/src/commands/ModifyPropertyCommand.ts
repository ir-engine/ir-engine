import { EngineActions } from '@xrengine/engine/src/ecs/classes/EngineState'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { Component, getComponent, SerializedComponentType } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { dispatchAction } from '@xrengine/hyperflux'

import { CommandFuncType, CommandParams, ObjectCommands } from '../constants/EditorCommands'
import arrayShallowEqual from '../functions/arrayShallowEqual'
import { serializeObject3DArray, serializeProperties } from '../functions/debug'
import { EditorAction } from '../services/EditorServices'
import { SelectionAction } from '../services/SelectionServices'

export type ModifyPropertyCommandUndoParams<C extends Component<any, any>> = {
  properties: Partial<SerializedComponentType<C>>[]
}

export type ModifyPropertyCommandParams<C extends Component<any, any>> = CommandParams & {
  type: ObjectCommands.MODIFY_PROPERTY

  properties: Partial<SerializedComponentType<C>>[]

  component: C

  undo?: ModifyPropertyCommandUndoParams<C>
}

function prepare<C extends Component<any, any>>(command: ModifyPropertyCommandParams<C>) {
  if (command.keepHistory) {
    command.undo = {
      properties: command.affectedNodes
        .filter((node) => typeof node !== 'string')
        .map((node: EntityTreeNode, i) => {
          const comp = getComponent(node.entity, command.component)
          const oldProps = {} as any
          const propertyNames = Object.keys(command.properties[i] ?? command.properties[0])

          for (const propertyName of propertyNames) {
            const { result, finalProp } = getNestedObject(comp, propertyName)
            const oldValue = result ? result[finalProp] : {}
            oldProps[propertyName] = oldValue && oldValue.clone ? oldValue.clone() : oldValue
          }

          return oldProps
        })
    }
  }
}

function shouldUpdate<C extends Component<any, any>>(
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

function update<C extends Component<any, any>>(
  currentCommnad: ModifyPropertyCommandParams<C>,
  newCommand: ModifyPropertyCommandParams<C>
) {
  currentCommnad.properties = newCommand.properties
  execute(currentCommnad)
}

function execute<C extends Component<any, any>>(command: ModifyPropertyCommandParams<C>) {
  updateProperty(command, false)
}

function undo<C extends Component<any, any>>(command: ModifyPropertyCommandParams<C>) {
  updateProperty(command, true)
}

function updateProperty<C extends Component<any, any>>(command: ModifyPropertyCommandParams<C>, isUndo?: boolean) {
  const properties = isUndo && command.undo ? command.undo.properties : command.properties

  for (let i = 0; i < command.affectedNodes.length; i++) {
    const node = command.affectedNodes[i]
    if (typeof node === 'string') continue
    const entity = node.entity
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

        dispatchAction(SelectionAction.changedObject({ objects: [node], propertyName }))
      }
    }
  }

  dispatchAction(
    EngineActions.sceneObjectUpdate({
      entities: command.affectedNodes
        .filter((node) => typeof node !== 'string')
        .map((node: EntityTreeNode) => node.entity)
    })
  )
  dispatchAction(EditorAction.sceneModified({ modified: true }))
}

function toString<C extends Component<any, any>>(command: ModifyPropertyCommandParams<C>) {
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
    if (typeof result[props[i]] === 'undefined') result[props[i]] = {}
    result = result[props[i]]
  }

  return { result, finalProp: props[props.length - 1] }
}
