import { Matrix4, Vector3 } from 'three'

import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { getEntityNodeArrayFromEntities, reparentEntityNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { GroupComponent } from '@xrengine/engine/src/scene/components/GroupComponent'
import { reparentObject3D } from '@xrengine/engine/src/scene/functions/ReparentFunction'
import obj3dFromUuid from '@xrengine/engine/src/scene/util/obj3dFromUuid'
import { TransformComponent } from '@xrengine/engine/src/transform/components/TransformComponent'
import { dispatchAction } from '@xrengine/hyperflux'

import { executeCommand } from '../classes/History'
import EditorCommands, { CommandFuncType, CommandParams, ParentCommands } from '../constants/EditorCommands'
import { cancelGrabOrPlacement } from '../functions/cancelGrabOrPlacement'
import { serializeObject3D, serializeObject3DArray } from '../functions/debug'
import { updateOutlinePassSelection } from '../functions/updateOutlinePassSelection'
import { EditorAction } from '../services/EditorServices'
import { accessSelectionState, SelectionAction } from '../services/SelectionServices'

export type ReparentCommandUndoParams = {
  parents: (EntityTreeNode | string)[]
  befores: (EntityTreeNode | string)[]
  positions: Vector3[]
  selection: (string | Entity)[]
}

export type ReparentCommandParams = CommandParams & {
  type: ParentCommands.REPARENT

  parents: (EntityTreeNode | string)[]

  befores?: (EntityTreeNode | string)[]

  positions?: Vector3[]

  undo?: ReparentCommandUndoParams
}

function prepare(command: ReparentCommandParams) {
  if (command.keepHistory) {
    command.undo = {
      parents: [],
      befores: [],
      positions: [],
      selection: accessSelectionState().selectedEntities.value.filter((ent) => typeof ent !== 'string') as Entity[]
    }

    const tree = Engine.instance.currentWorld.entityTree

    for (let i = command.affectedNodes.length - 1; i >= 0; i--) {
      const node = command.affectedNodes[i]
      if (typeof node !== 'string') {
        if (node.parentEntity) {
          const parent = tree.entityNodeMap.get(node.parentEntity)
          if (!parent) throw new Error('Parent is not defined')
          command.undo.parents.push(parent)

          const before = tree.entityNodeMap.get(parent.children![parent.children!.indexOf(node.entity) + 1])
          command.undo.befores.push(before!)
        }

        command.undo.positions.push(getComponent(node.entity, TransformComponent)?.position.clone() ?? new Vector3())
      } else {
        const obj3d = obj3dFromUuid(node)
        if (obj3d.parent) {
          const parent = obj3d.parent
          command.undo.parents.push(parent.uuid)
          const before = parent.children[parent.children.indexOf(obj3d) + 1]
          command.undo.befores.push(before?.uuid)
        }
      }
    }
  }
}

function execute(command: ReparentCommandParams) {
  emitEventBefore(command)

  reparent(command, false)

  if (command.positions) {
    executeCommand({
      type: EditorCommands.POSITION,
      affectedNodes: command.affectedNodes,
      positions: command.positions
    })
  }

  emitEventAfter(command)
}

function undo(command: ReparentCommandParams) {
  if (!command.undo) return

  emitEventBefore(command)

  reparent(command, true)

  if (command.positions) {
    executeCommand({
      type: EditorCommands.POSITION,
      affectedNodes: command.affectedNodes,
      positions: command.undo.positions,
      preventEvents: true
    })
  }

  executeCommand({
    type: EditorCommands.REPLACE_SELECTION,
    affectedNodes: getEntityNodeArrayFromEntities(command.undo.selection)
  })

  emitEventAfter(command)
}

function emitEventBefore(command: ReparentCommandParams) {
  if (command.preventEvents) return

  cancelGrabOrPlacement()
  dispatchAction(SelectionAction.changedBeforeSelection({}))
}

function emitEventAfter(command: ReparentCommandParams) {
  if (command.preventEvents) return

  if (command.updateSelection) updateOutlinePassSelection()

  dispatchAction(EditorAction.sceneModified({ modified: true }))
  dispatchAction(SelectionAction.changedSceneGraph({}))
}

function reparent(command: ReparentCommandParams, isUndo: boolean) {
  let parents = command.parents
  let befores = command.befores
  let nodes = command.affectedNodes

  if (isUndo && command.undo) {
    parents = command.undo.parents
    befores = command.undo.befores
    nodes = []
    for (let i = command.affectedNodes.length - 1; i >= 0; i--) {
      nodes.push(command.affectedNodes[i])
    }
  }

  for (let i = 0; i < nodes.length; i++) {
    const parent = parents[i] ?? parents[0]
    if (!parent) continue

    const node = nodes[i]
    const before = befores ? befores[i] ?? befores[0] : undefined
    if (typeof node !== 'string') {
      const _parent = parent as EntityTreeNode
      if (node.entity === _parent.entity) continue
      const _before = before as EntityTreeNode | undefined
      const index = _before && _parent.children ? _parent.children.indexOf(_before.entity) : undefined
      reparentEntityNode(node, _parent, index)
      reparentObject3D(node, _parent, _before)
    } else {
      const _parent =
        typeof parent === 'string' ? obj3dFromUuid(parent) : getComponent(parent.entity, GroupComponent)[0]

      const obj3d = obj3dFromUuid(node)
      const oldWorldTransform = obj3d.parent?.matrixWorld ?? new Matrix4()
      obj3d.removeFromParent()
      _parent.add(obj3d)
      obj3d.applyMatrix4(_parent.matrixWorld.clone().invert().multiply(oldWorldTransform))
    }
  }

  if (command.updateSelection) {
    executeCommand({
      type: EditorCommands.REPLACE_SELECTION,
      affectedNodes: command.affectedNodes,
      preventEvents: true
    })
  }
}

function toString(command: ReparentCommandParams) {
  return `${command.constructor.name} id: ${command.id} objects: ${serializeObject3DArray(
    command.affectedNodes
  )} newParent: ${serializeObject3D(command.parents)} newBefore: ${serializeObject3D(command.befores)}`
}

export const ReparentCommand: CommandFuncType = {
  prepare,
  execute,
  undo,
  emitEventAfter,
  emitEventBefore,
  toString
}
