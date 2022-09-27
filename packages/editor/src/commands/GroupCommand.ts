import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { createEntityNode, getEntityNodeArrayFromEntities } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { ScenePrefabs } from '@xrengine/engine/src/scene/systems/SceneObjectUpdateSystem'
import { dispatchAction } from '@xrengine/hyperflux'

import { executeCommand } from '../classes/History'
import EditorCommands, { CommandFuncType, CommandParams, ParentCommands } from '../constants/EditorCommands'
import { cancelGrabOrPlacement } from '../functions/cancelGrabOrPlacement'
import { serializeObject3D, serializeObject3DArray } from '../functions/debug'
import { updateOutlinePassSelection } from '../functions/updateOutlinePassSelection'
import { EditorAction } from '../services/EditorServices'
import { accessSelectionState, SelectionAction } from '../services/SelectionServices'

export type GroupCommandUndoParams = {
  parents: EntityTreeNode[]
  befores: EntityTreeNode[]
  selection: Entity[]
}

export type GroupCommandParams = CommandParams & {
  type: ParentCommands.GROUP

  parents?: EntityTreeNode[]

  befores?: EntityTreeNode[]

  groupNode?: EntityTreeNode

  undo?: GroupCommandUndoParams
}

function prepare(command: GroupCommandParams) {
  if (command.keepHistory) {
    command.undo = {
      parents: [],
      befores: [],
      selection: accessSelectionState().selectedEntities.value.filter((obj) => typeof obj !== 'string') as Entity[]
    }

    const tree = Engine.instance.currentWorld.entityTree

    for (let i = command.affectedNodes.length - 1; i >= 0; i--) {
      const node = command.affectedNodes[i]
      if (typeof node === 'string') continue
      if (!node.parentEntity) throw new Error('Parent is not defined')
      const parent = tree.entityNodeMap.get(node.parentEntity)
      if (!parent) throw new Error('Parent is not defined')
      command.undo.parents.push(parent)

      const before = tree.entityNodeMap.get(parent.children![parent.children!.indexOf(node.entity) + 1])
      command.undo.befores.push(before!)
    }
  }
}

function execute(command: GroupCommandParams) {
  emitEventBefore(command)

  command.groupNode = createEntityNode(createEntity())
  executeCommand({
    type: EditorCommands.ADD_OBJECTS,
    affectedNodes: [command.groupNode],
    parents: command.parents,
    befores: command.befores,
    preventEvents: true,
    updateSelection: false,
    prefabTypes: [ScenePrefabs.group]
  })

  executeCommand({
    type: EditorCommands.REPARENT,
    affectedNodes: command.affectedNodes,
    parents: [command.groupNode],
    preventEvents: true,
    updateSelection: false
  })

  if (command.updateSelection) {
    executeCommand({
      type: EditorCommands.REPLACE_SELECTION,
      affectedNodes: [command.groupNode],
      preventEvents: true
    })
  }

  emitEventAfter(command)
}

function undo(command: GroupCommandParams) {
  if (!command.undo || !command.groupNode) return

  emitEventBefore(command)

  const nodes = [] as EntityTreeNode[]
  for (let i = command.affectedNodes.length - 1; i >= 0; i--) {
    const node = command.affectedNodes[i]
    if (typeof node === 'string') continue
    nodes.push(node)
  }

  executeCommand({
    type: EditorCommands.REPARENT,
    affectedNodes: nodes,
    parents: command.undo.parents,
    befores: command.undo.befores,
    preventEvents: true,
    updateSelection: false
  })

  executeCommand({
    type: EditorCommands.REMOVE_OBJECTS,
    affectedNodes: [command.groupNode],
    preventEvents: true,
    skipSerialization: true,
    updateSelection: false
  })

  executeCommand({
    type: EditorCommands.REPLACE_SELECTION,
    affectedNodes: getEntityNodeArrayFromEntities(command.undo.selection)
  })

  emitEventAfter(command)
}

function emitEventBefore(command: GroupCommandParams) {
  if (command.preventEvents) return

  cancelGrabOrPlacement()
  dispatchAction(SelectionAction.changedBeforeSelection({}))
}

function emitEventAfter(command: GroupCommandParams) {
  if (command.preventEvents) return

  if (command.updateSelection) updateOutlinePassSelection()

  dispatchAction(EditorAction.sceneModified({ modified: true }))
  dispatchAction(SelectionAction.changedSceneGraph({}))
}

function toString(command: GroupCommandParams) {
  return `GroupMultipleObjectsCommand id: ${command.id} objects: ${serializeObject3DArray(
    command.affectedNodes
  )} groupParent: ${serializeObject3D(command.parents)} groupBefore: ${serializeObject3D(command.befores)}`
}

export const GroupCommand: CommandFuncType = {
  prepare,
  execute,
  undo,
  emitEventAfter,
  emitEventBefore,
  toString
}
