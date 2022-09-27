import { SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { addComponent, getComponent, hasComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import {
  addEntityNodeChild,
  getEntityNodeArrayFromEntities,
  traverseEntityNode
} from '@xrengine/engine/src/ecs/functions/EntityTree'
import { GroupComponent, Object3DWithEntity } from '@xrengine/engine/src/scene/components/GroupComponent'
import { reparentObject3D } from '@xrengine/engine/src/scene/functions/ReparentFunction'
import { createNewEditorNode, deserializeSceneEntity } from '@xrengine/engine/src/scene/systems/SceneLoadingSystem'
import obj3dFromUuid from '@xrengine/engine/src/scene/util/obj3dFromUuid'
import { dispatchAction } from '@xrengine/hyperflux'

import { executeCommand } from '../classes/History'
import EditorCommands, { CommandFuncType, CommandParams, ObjectCommands } from '../constants/EditorCommands'
import { cancelGrabOrPlacement } from '../functions/cancelGrabOrPlacement'
import { serializeObject3D } from '../functions/debug'
import { getDetachedObjectsRoots } from '../functions/getDetachedObjectsRoots'
import makeUniqueName from '../functions/makeUniqueName'
import { updateOutlinePassSelection } from '../functions/updateOutlinePassSelection'
import { EditorAction } from '../services/EditorServices'
import { accessSelectionState, SelectionAction } from '../services/SelectionServices'

export type AddObjectCommandUndoParams = {
  selection: (Entity | string)[]
}

export type AddObjectCommandParams = CommandParams & {
  type: ObjectCommands.ADD_OBJECTS

  prefabTypes?: string[]

  sceneData?: SceneJson[]

  /** Parent object which will hold objects being added by this command */
  parents?: (string | EntityTreeNode)[]

  /** Child object before which all objects will be added */
  befores?: (string | EntityTreeNode)[]

  /** Whether to use unique name or not */
  useUniqueName?: boolean

  undo?: AddObjectCommandUndoParams
}

function prepare(command: AddObjectCommandParams) {
  if (typeof command.useUniqueName === 'undefined') command.useUniqueName = true

  if (command.keepHistory) {
    const validEntities = accessSelectionState().selectedEntities.value.slice()
    command.undo = { selection: validEntities }
  }
}

function execute(command: AddObjectCommandParams) {
  emitEventBefore(command)
  addObject(command)
  emitEventAfter(command)
}

function undo(command: AddObjectCommandParams) {
  if (!command.undo) return

  executeCommand({
    type: EditorCommands.REMOVE_OBJECTS,
    affectedNodes: command.affectedNodes,
    skipSerialization: true,
    updateSelection: false
  })

  executeCommand({
    type: EditorCommands.REPLACE_SELECTION,
    affectedNodes: getEntityNodeArrayFromEntities(command.undo.selection)
  })
}

function emitEventBefore(command: AddObjectCommandParams) {
  if (command.preventEvents) return

  cancelGrabOrPlacement()
  dispatchAction(SelectionAction.changedBeforeSelection({}))
}

function emitEventAfter(command: AddObjectCommandParams) {
  if (command.preventEvents) return

  if (command.updateSelection) updateOutlinePassSelection()

  dispatchAction(EditorAction.sceneModified({ modified: true }))
  dispatchAction(SelectionAction.changedSceneGraph({}))
}

function addObject(command: AddObjectCommandParams) {
  const rootObjects = getDetachedObjectsRoots(command.affectedNodes)
  const world = Engine.instance.currentWorld

  for (let i = 0; i < rootObjects.length; i++) {
    const object = rootObjects[i]
    if (typeof object !== 'string') {
      if (command.prefabTypes) {
        createNewEditorNode(object, command.prefabTypes[i] ?? command.prefabTypes[0])
      } else if (command.sceneData) {
        const data = command.sceneData[i] ?? command.sceneData[0]

        traverseEntityNode(object, (node) => {
          if (!data.entities[node.uuid]) return
          node.entity = createEntity()
          deserializeSceneEntity(node, data.entities[node.uuid])

          if (node.parentEntity && node.uuid !== data.root)
            reparentObject3D(node, node.parentEntity, undefined, world.entityTree)
        })
      }
    }

    let parent = command.parents ? command.parents[i] ?? command.parents[0] : world.entityTree.rootNode
    let before = command.befores ? command.befores[i] ?? command.befores[0] : undefined

    let index
    if (typeof parent !== 'string') {
      if (before && typeof before === 'string' && !hasComponent(parent.entity, GroupComponent)) {
        addComponent(parent.entity, GroupComponent, [])
      }
      index =
        before && parent.children
          ? typeof before === 'string'
            ? getComponent(parent.entity, GroupComponent).indexOf(obj3dFromUuid(before) as Object3DWithEntity)
            : parent.children.indexOf(before.entity)
          : undefined
    } else {
      const pObj3d = obj3dFromUuid(parent)
      index =
        before && pObj3d.children && typeof before === 'string'
          ? pObj3d.children.indexOf(obj3dFromUuid(before))
          : undefined
    }
    if (typeof parent !== 'string' && typeof object !== 'string') {
      addEntityNodeChild(object, parent, index)

      reparentObject3D(object, parent, typeof before === 'string' ? undefined : before, world.entityTree)

      if (command.useUniqueName) traverseEntityNode(object, (node) => makeUniqueName(node))
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

function toString(command: AddObjectCommandParams): string {
  return `AddObjectCommand id: ${command.id} object: ${serializeObject3D(command.affectedNodes)} parent: ${
    command.parents
  } before: ${serializeObject3D(command.befores)}`
}

export const AddObjectCommand: CommandFuncType = { prepare, execute, undo, emitEventAfter, emitEventBefore, toString }
