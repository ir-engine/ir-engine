import Command, { CommandParams } from './Command'
import { serializeObject3D } from '../functions/debug'
import { CommandManager } from '../managers/CommandManager'
import EditorCommands from '../constants/EditorCommands'
import EditorEvents from '../constants/EditorEvents'
import { getDetachedObjectsRoots } from '../functions/getDetachedObjectsRoots'
import makeUniqueName from '../functions/makeUniqueName'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { createNewEditorNode, loadSceneEntity } from '@xrengine/engine/src/scene/functions/SceneLoading'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { ScenePrefabTypes } from '@xrengine/engine/src/scene/functions/registerPrefabs'
import { reparentObject3D } from '@xrengine/engine/src/scene/functions/ReparentFunction'
import { createEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'

export interface AddObjectCommandParams extends CommandParams {
  prefabTypes?: ScenePrefabTypes | ScenePrefabTypes[]

  sceneData?: SceneJson | SceneJson[]

  /** Parent object which will hold objects being added by this command */
  parents?: EntityTreeNode | EntityTreeNode[]

  /** Child object before which all objects will be added */
  befores?: EntityTreeNode | EntityTreeNode[]

  /** Whether to use unique name or not */
  useUniqueName?: boolean
}

export default class AddObjectCommand extends Command {
  parents?: EntityTreeNode[]
  befores?: EntityTreeNode[]
  prefabTypes?: ScenePrefabTypes[]
  sceneData?: SceneJson[]

  /** Whether to use unique name or not */
  useUniqueName?: boolean

  constructor(objects: EntityTreeNode[], params: AddObjectCommandParams) {
    super(objects, params)

    this.parents = params.parents ? (Array.isArray(params.parents) ? params.parents : [params.parents]) : undefined
    this.befores = params.befores ? (Array.isArray(params.befores) ? params.befores : [params.befores]) : undefined
    this.useUniqueName = params.useUniqueName ?? true

    this.sceneData = params.sceneData
      ? Array.isArray(params.sceneData)
        ? params.sceneData
        : [params.sceneData]
      : undefined

    this.prefabTypes = params.prefabTypes
      ? Array.isArray(params.prefabTypes)
        ? params.prefabTypes
        : [params.prefabTypes]
      : undefined

    if (this.keepHistory) {
      this.oldSelection = CommandManager.instance.selected.slice(0)
    }
  }

  execute(): void {
    this.emitBeforeExecuteEvent()
    this.addObject(this.affectedObjects, this.prefabTypes, this.sceneData, this.parents, this.befores)
    this.emitAfterExecuteEvent()
  }

  undo(): void {
    CommandManager.instance.executeCommand(EditorCommands.REMOVE_OBJECTS, this.affectedObjects, {
      deselectObject: false,
      skipSerialization: true
    })

    if (this.oldSelection) {
      CommandManager.instance.executeCommand(EditorCommands.REPLACE_SELECTION, this.oldSelection)
    }
  }

  toString(): string {
    return `AddObjectCommand id: ${this.id} object: ${serializeObject3D(this.affectedObjects)} parent: ${
      this.parents
    } before: ${serializeObject3D(this.befores)}`
  }

  emitBeforeExecuteEvent() {
    if (this.shouldEmitEvent && this.isSelected)
      CommandManager.instance.emitEvent(EditorEvents.BEFORE_SELECTION_CHANGED)
  }

  emitAfterExecuteEvent() {
    if (this.shouldEmitEvent) {
      if (this.isSelected) CommandManager.instance.emitEvent(EditorEvents.SELECTION_CHANGED)

      CommandManager.instance.emitEvent(EditorEvents.SCENE_GRAPH_CHANGED)
    }
  }

  addObject(
    objects: EntityTreeNode[],
    prefabTypes?: ScenePrefabTypes[],
    sceneData?: SceneJson[],
    parents?: EntityTreeNode[],
    befores?: EntityTreeNode[]
  ): void {
    const rootObjects = getDetachedObjectsRoots(objects) as EntityTreeNode[]
    const world = useWorld()
    console.log(objects, prefabTypes, sceneData)
    for (let i = 0; i < rootObjects.length; i++) {
      const object = rootObjects[i]

      if (prefabTypes) {
        createNewEditorNode(object.entity, prefabTypes[i] ?? prefabTypes[0])
      } else if (sceneData) {
        const data = sceneData[i] ?? sceneData[0]

        object.traverse((node) => {
          node.entity = createEntity()
          loadSceneEntity(node, data.entities[node.uuid])
          if (node.uuid !== data.root) reparentObject3D(node, node.parentNode)
        })
      }

      let parent = parents ? parents[i] ?? parents[0] : world.entityTree.rootNode
      let before = befores ? befores[i] ?? befores[0] : undefined

      const index = before ? parent.children?.indexOf(before) : undefined
      world.entityTree.addEntityNode(object, parent, index)

      reparentObject3D(object, parent, before)

      if (this.useUniqueName) object.traverse((node) => makeUniqueName(node, world))
    }

    if (this.isSelected) {
      CommandManager.instance.executeCommand(EditorCommands.REPLACE_SELECTION, this.affectedObjects, {
        shouldEmitEvent: false
      })
    }
  }
}
