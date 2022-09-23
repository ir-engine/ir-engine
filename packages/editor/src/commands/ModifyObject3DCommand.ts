import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineActions } from '@xrengine/engine/src/ecs/classes/EngineState'
import { dispatchAction } from '@xrengine/hyperflux'

import { executeCommand } from '../classes/History'
import { CommandFuncType, CommandParams, MiscCommands } from '../constants/EditorCommands'
import arrayShallowEqual from '../functions/arrayShallowEqual'
import { serializeObject3DArray, serializeProperties } from '../functions/debug'
import { EditorAction } from '../services/EditorServices'
import { SelectionAction } from '../services/SelectionServices'

export type ModifyObj3DCommandUndoParams = {
  properties: { [_: string]: any }[]
}

export type ModifyObj3DCommandParams = CommandParams & {
  type: MiscCommands.MODIFY_OBJECT3D
  properties: { [_: string]: any }[]
  undo?: ModifyObj3DCommandUndoParams
}

function prepare(command: ModifyObj3DCommandParams) {
  if (command.keepHistory) {
    command.undo = {
      properties: command.affectedNodes
        .filter((node) => typeof node === 'string')
        .map((node: string, i) => {
          const obj3d = Engine.instance.currentWorld.scene.getObjectByProperty('uuid', node)
          if (!obj3d) throw new Error('Obj3d not defined')
          const oldProps = {} as any
          const propertyNames = Object.keys(command.properties[i] ?? command.properties[0])
          propertyNames.map((propertyName) => {
            const oldValue = obj3d[propertyName]
            oldProps[propertyName] = typeof oldValue?.clone === 'function' ? oldValue.clone() : oldValue
          })
          return oldProps
        })
    }
  }
}

function shouldUpdate(currentCommand: ModifyObj3DCommandParams, newCommand: ModifyObj3DCommandParams): boolean {
  if (
    currentCommand.properties.length !== newCommand.properties.length ||
    !arrayShallowEqual(currentCommand.affectedNodes, newCommand.affectedNodes)
  )
    return false

  return !currentCommand.properties.some((property, i) => {
    if (!arrayShallowEqual(Object.keys(property), Object.keys(newCommand.properties[i]))) {
      return true
    }
    return false
  })
}

function update(currentCommand: ModifyObj3DCommandParams, newCommand: ModifyObj3DCommandParams) {
  currentCommand.properties = newCommand.properties
  executeCommand(currentCommand)
}

function execute(command) {
  updateProperty(command, false)
}

function undo(command) {
  updateProperty(command, true)
}

function updateProperty(command: ModifyObj3DCommandParams, isUndo?: boolean) {
  const scene = Engine.instance.currentWorld.scene
  const properties = isUndo && command.undo ? command.undo.properties : command.properties
  command.affectedNodes.map((node, i) => {
    if (typeof node !== 'string') return
    const obj3d = scene.getObjectByProperty('uuid', node)!
    const props = properties[i] ?? properties[0]
    Object.keys(props).map((k) => {
      const value = props[k]
      if (typeof value?.copy === 'function') {
        if (!obj3d[k]) obj3d[k] = new value.constructor()
        obj3d[k].copy(value)
      } else if (typeof value !== 'undefined' && typeof obj3d[k] === 'object' && typeof obj3d[k].set === 'function') {
        obj3d[k].set(value)
      } else {
        obj3d[k] = value
      }
    })
  })
  dispatchAction(EditorAction.sceneModified({ modified: true }))
}

function toString(command: ModifyObj3DCommandParams) {
  return `Modify Object3D Command id: ${command.id} objects: ${serializeObject3DArray(
    command.affectedNodes
  )} properties: ${serializeProperties(command.properties)}`
}

export const ModifyObj3DCommand: CommandFuncType = {
  prepare,
  execute,
  undo,
  shouldUpdate,
  update,
  toString
}
