import { SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { removeEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import {
  getEntityNodeArrayFromEntities,
  removeEntityNodeFromParent,
  traverseEntityNode
} from '@xrengine/engine/src/ecs/functions/EntityTree'
import { serializeWorld } from '@xrengine/engine/src/scene/functions/serializeWorld'
import obj3dFromUuid from '@xrengine/engine/src/scene/util/obj3dFromUuid'
import { dispatchAction } from '@xrengine/hyperflux'

import { executeCommand } from '../classes/History'
import EditorCommands, { CommandFuncType, CommandParams, ObjectCommands } from '../constants/EditorCommands'
import { serializeObject3DArray } from '../functions/debug'
import { filterParentEntities } from '../functions/filterParentEntities'
import { EditorAction } from '../services/EditorServices'
import { SelectionAction } from '../services/SelectionServices'

export type RemoveObjectCommandUndoParams = {
  parents: (EntityTreeNode | string)[]
  befores: (EntityTreeNode | string)[]
  components: SceneJson[]
}

export type RemoveObjectCommandParams = CommandParams & {
  type: ObjectCommands.REMOVE_OBJECTS

  skipSerialization?: boolean

  undo?: RemoveObjectCommandUndoParams
}

function prepare(command: RemoveObjectCommandParams) {
  if (command.keepHistory) {
    command.undo = {
      parents: [],
      befores: [],
      components: []
    }

    const tree = Engine.instance.currentWorld.entityTree
    for (let i = command.affectedNodes.length - 1; i >= 0; i--) {
      const node = command.affectedNodes[i]
      const isObj3d = typeof node === 'string'
      if (!isObj3d) {
        if (node.parentEntity) {
          const parent = tree.entityNodeMap.get(node.parentEntity)
          if (!parent) throw new Error('Parent is not defined')
          command.undo.parents.push(parent)

          const before = tree.entityNodeMap.get(parent.children![parent.children!.indexOf(node.entity) + 1])
          command.undo.befores.push(before!)
        }

        if (!command.skipSerialization) command.undo.components.push(serializeWorld(node))
      } else {
        const obj3d = obj3dFromUuid(node)
        const parent = obj3d.parent
        if (!parent) throw new Error('Parent is not defined')
        command.undo.parents
      }
    }
  }
}

function execute(command: RemoveObjectCommandParams) {
  removeObject(command)
  emitEventAfter(command)
}

function undo(command: RemoveObjectCommandParams) {
  if (!command.undo) return

  const nodes = [] as (string | EntityTreeNode)[]
  for (let i = command.affectedNodes.length - 1; i >= 0; i--) {
    nodes.push(command.affectedNodes[i])
  }

  executeCommand({
    type: EditorCommands.ADD_OBJECTS,
    affectedNodes: nodes,
    parents: command.undo.parents,
    befores: command.undo.befores,
    useUniqueName: false,
    sceneData: command.undo.components,
    updateSelection: false
  })

  executeCommand({
    type: EditorCommands.REPLACE_SELECTION,
    affectedNodes: command.affectedNodes
  })
}

function emitEventAfter(command: RemoveObjectCommandParams) {
  if (command.preventEvents) return

  dispatchAction(EditorAction.sceneModified({ modified: true }))
  dispatchAction(SelectionAction.changedSceneGraph({}))
}

function removeObject(command: RemoveObjectCommandParams) {
  const removedParentNodes = getEntityNodeArrayFromEntities(
    filterParentEntities(
      command.affectedNodes.map((node: EntityTreeNode | string): Entity | string => {
        return typeof node === 'string' ? node : node.entity
      }),
      undefined,
      true,
      false
    )
  )
  const scene = Engine.instance.currentWorld.scene
  for (let i = 0; i < removedParentNodes.length; i++) {
    const node = removedParentNodes[i]
    if (typeof node === 'string') {
      const obj = scene.getObjectByProperty('uuid', node)
      obj?.removeFromParent()
    } else {
      if (!node.parentEntity) continue
      traverseEntityNode(node, (node) => removeEntity(node.entity))
      removeEntityNodeFromParent(node)
    }
  }

  if (command.updateSelection) {
    executeCommand({
      type: EditorCommands.REMOVE_FROM_SELECTION,
      affectedNodes: command.affectedNodes,
      preventEvents: command.preventEvents
    })
  }
}

function toString(command: RemoveObjectCommandParams) {
  return `RemoveMultipleObjectsCommand id: ${command.id} objects: ${serializeObject3DArray(command.affectedNodes)}`
}

export const RemoveObjectCommand: CommandFuncType = {
  prepare,
  execute,
  undo,
  emitEventAfter,
  toString
}
