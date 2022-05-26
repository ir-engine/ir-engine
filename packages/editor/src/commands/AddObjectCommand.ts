import { store } from '@xrengine/client-core/src/store'
import { SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import {
  addEntityNodeInTree,
  getEntityNodeArrayFromEntities,
  traverseEntityNode
} from '@xrengine/engine/src/ecs/functions/EntityTreeFunctions'
import { ScenePrefabTypes } from '@xrengine/engine/src/scene/functions/registerPrefabs'
import { reparentObject3D } from '@xrengine/engine/src/scene/functions/ReparentFunction'
import { createNewEditorNode, loadSceneEntity } from '@xrengine/engine/src/scene/functions/SceneLoading'

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
  selection: Entity[]
}

export type AddObjectCommandParams = CommandParams & {
  type: ObjectCommands.ADD_OBJECTS

  prefabTypes?: ScenePrefabTypes[]

  sceneData?: SceneJson[]

  /** Parent object which will hold objects being added by this command */
  parents?: EntityTreeNode[]

  /** Child object before which all objects will be added */
  befores?: EntityTreeNode[]

  /** Whether to use unique name or not */
  useUniqueName?: boolean

  undo?: AddObjectCommandUndoParams
}

function prepare(command: AddObjectCommandParams) {
  if (typeof command.useUniqueName === 'undefined') command.useUniqueName = true

  if (command.keepHistory) {
    command.undo = { selection: accessSelectionState().selectedEntities.value.slice(0) }
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
  store.dispatch(SelectionAction.changedBeforeSelection())
}

function emitEventAfter(command: AddObjectCommandParams) {
  if (command.preventEvents) return

  if (command.updateSelection) updateOutlinePassSelection()

  store.dispatch(EditorAction.sceneModified(true))
  store.dispatch(SelectionAction.changedSceneGraph())
}

function addObject(command: AddObjectCommandParams) {
  const rootObjects = getDetachedObjectsRoots(command.affectedNodes)
  const world = Engine.instance.currentWorld

  for (let i = 0; i < rootObjects.length; i++) {
    const object = rootObjects[i]

    if (command.prefabTypes) {
      createNewEditorNode(object.entity, command.prefabTypes[i] ?? command.prefabTypes[0])
    } else if (command.sceneData) {
      const data = command.sceneData[i] ?? command.sceneData[0]

      traverseEntityNode(object, (node) => {
        node.entity = createEntity()
        loadSceneEntity(node, data.entities[node.uuid])

        if (node.parentEntity && node.uuid !== data.root)
          reparentObject3D(node, node.parentEntity, undefined, world.entityTree)
      })
    }

    let parent = command.parents ? command.parents[i] ?? command.parents[0] : world.entityTree.rootNode
    let before = command.befores ? command.befores[i] ?? command.befores[0] : undefined

    const index = before && parent.children ? parent.children.indexOf(before.entity) : undefined
    addEntityNodeInTree(object, parent, index, false, world.entityTree)

    reparentObject3D(object, parent, before, world.entityTree)

    if (command.useUniqueName) traverseEntityNode(object, (node) => makeUniqueName(node))
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
