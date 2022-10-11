import { EntityJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { cloneEntityNode, getEntityNodeArrayFromEntities } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { serializeWorld } from '@xrengine/engine/src/scene/functions/serializeWorld'
import obj3dFromUuid from '@xrengine/engine/src/scene/util/obj3dFromUuid'
import { dispatchAction } from '@xrengine/hyperflux'

import { executeCommand } from '../classes/History'
import EditorCommands, { CommandFuncType, CommandParams, ObjectCommands } from '../constants/EditorCommands'
import { serializeObject3D, serializeObject3DArray } from '../functions/debug'
import { getDetachedObjectsRoots } from '../functions/getDetachedObjectsRoots'
import { shouldNodeDeserialize } from '../functions/shouldDeserialize'
import { EditorAction } from '../services/EditorServices'
import { accessSelectionState, SelectionAction } from '../services/SelectionServices'

export type DuplicateObjectCommandUndoParams = {
  selection: (string | Entity)[]
}

export type DuplicateObjectCommandParams = CommandParams & {
  type: ObjectCommands.DUPLICATE_OBJECTS

  /** Parent object which will hold objects being duplicateed by this command */
  parents?: (string | EntityTreeNode)[]

  /** Child object before which all objects will be duplicateed */
  befores?: (string | EntityTreeNode)[]

  duplicatedObjects?: (string | EntityTreeNode)[]

  undo?: DuplicateObjectCommandUndoParams
}

function prepare(command: DuplicateObjectCommandParams) {
  command.affectedNodes = command.affectedNodes.filter((o) => typeof o !== 'string' && shouldNodeDeserialize(o))

  if (command.keepHistory) {
    command.undo = {
      selection: accessSelectionState().selectedEntities.value.filter((ent) => typeof ent !== 'string') as Entity[]
    }
  }
}

function execute(command: DuplicateObjectCommandParams) {
  if (!command.duplicatedObjects) {
    const roots = getDetachedObjectsRoots(command.affectedNodes)
    command.duplicatedObjects = roots.map((object) =>
      typeof object === 'string' ? obj3dFromUuid(object).clone().uuid : cloneEntityNode(object)
    )
  }

  if (!command.parents) {
    command.parents = []
    const tree = Engine.instance.currentWorld.entityTree

    for (let o of command.duplicatedObjects) {
      if (typeof o === 'string') {
        const obj3d = obj3dFromUuid(o)
        if (!obj3d.parent) throw new Error('Parent is not defined')
        const parent = obj3d.parent
        command.parents.push(parent.uuid)
      } else {
        if (!o.parentEntity) throw new Error('Parent is not defined')
        const parent = tree.entityNodeMap.get(o.parentEntity)

        if (!parent) throw new Error('Parent is not defined')
        command.parents.push(parent)
      }
    }
  }

  const sceneData = command.duplicatedObjects.map((obj) =>
    typeof obj === 'string'
      ? {
          entities: {} as { [uuid: string]: EntityJson },
          root: '',
          version: 0,
          metadata: {}
        }
      : serializeWorld(obj, true)
  )

  executeCommand({
    type: EditorCommands.ADD_OBJECTS,
    affectedNodes: command.duplicatedObjects,
    parents: command.parents,
    befores: command.befores,
    preventEvents: true,
    updateSelection: false,
    sceneData
  })

  if (command.updateSelection) {
    executeCommand({ type: EditorCommands.REPLACE_SELECTION, affectedNodes: command.duplicatedObjects })
  }

  emitEventAfter(command)
}

function undo(command: DuplicateObjectCommandParams) {
  if (!command.undo || !command.duplicatedObjects) return

  executeCommand({
    type: EditorCommands.REMOVE_OBJECTS,
    affectedNodes: command.duplicatedObjects,
    skipSerialization: true,
    updateSelection: false
  })

  executeCommand({
    type: EditorCommands.REPLACE_SELECTION,
    affectedNodes: getEntityNodeArrayFromEntities(command.undo.selection)
  })
}

function emitEventAfter(command: DuplicateObjectCommandParams) {
  if (command.preventEvents) return

  dispatchAction(EditorAction.sceneModified({ modified: true }))
  dispatchAction(SelectionAction.changedSceneGraph({}))
}

function toString(command: DuplicateObjectCommandParams) {
  return `Duplicate object command id: ${command.id} objects: ${serializeObject3DArray(
    command.affectedNodes
  )} parent: ${serializeObject3D(command.parents)} before: ${serializeObject3D(command.befores)}`
}

export const DuplicateObjectCommand: CommandFuncType = {
  prepare,
  execute,
  undo,
  emitEventAfter,
  toString
}
