import Command, { CommandParams } from './Command'
import { serializeObject3DArray } from '../functions/debug'
import EditorCommands from '../constants/EditorCommands'
import { CommandManager } from '../managers/CommandManager'
import EditorEvents from '../constants/EditorEvents'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { serializeWorld } from '@xrengine/engine/src/scene/functions/serializeWorld'
import { SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { removeEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityNodeComponent } from '@xrengine/engine/src/scene/components/EntityNodeComponent'

export interface RemoveObjectCommandParams extends CommandParams {
  /** Whether to deselect object or not */
  deselectObject?: boolean

  skipSerialization?: boolean
}

export default class RemoveObjectsCommand extends Command {
  undoObjects: EntityTreeNode[]

  oldParents: EntityTreeNode[]

  oldBefores: EntityTreeNode[]

  deselectObject?: boolean

  oldComponents: SceneJson[]

  skipSerialization?: boolean

  removedObjectCount: number

  constructor(objects: EntityTreeNode[], params: RemoveObjectCommandParams) {
    super(objects, params)

    this.removedObjectCount = objects.length
    this.skipSerialization = params.skipSerialization
    this.deselectObject = params.deselectObject

    if (this.keepHistory) {
      this.undoObjects = []
      this.oldParents = []
      this.oldBefores = []
      this.oldComponents = []
      for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i]
        this.undoObjects.push(obj)

        if (obj.parentNode) {
          this.oldParents.push(obj.parentNode)
          this.oldBefores.push(obj.parentNode.children![obj.parentNode.children!.indexOf(obj) + 1])
        }

        if (!this.skipSerialization) this.oldComponents.push(serializeWorld(obj))
      }
    }
  }

  execute() {
    this.emitBeforeExecuteEvent()

    const world = useWorld()
    const removedObjectsRoots = CommandManager.instance.getRootObjects(this.affectedObjects)

    for (let i = 0; i < removedObjectsRoots.length; i++) {
      const object = removedObjectsRoots[i]
      if (!object.parentNode) continue

      world.entityTree.traverse((node) => {
        const entityNode = getComponent(node.entity, EntityNodeComponent)
        node.uuid = entityNode.uuid
        removeEntity(node.entity)
      }, object)
      object.removeFromParent()
    }

    if (this.deselectObject) {
      CommandManager.instance.executeCommand(EditorCommands.REMOVE_FROM_SELECTION, this.affectedObjects, {
        shouldEmitEvent: this.shouldEmitEvent
      })
    }

    this.emitAfterExecuteEvent()
  }

  undo() {
    if (!this.undoObjects) return

    CommandManager.instance.executeCommand(EditorCommands.ADD_OBJECTS, this.undoObjects, {
      parents: this.oldParents,
      befores: this.oldBefores,
      isObjectSelected: this.isSelected,
      useUniqueName: false,
      sceneData: this.oldComponents
    })

    CommandManager.instance.executeCommand(EditorCommands.REPLACE_SELECTION, this.affectedObjects)
  }

  toString() {
    return `RemoveMultipleObjectsCommand id: ${this.id} objects: ${serializeObject3DArray(this.affectedObjects)}`
  }

  emitAfterExecuteEvent() {
    if (this.shouldEmitEvent) {
      CommandManager.instance.emitEvent(EditorEvents.SCENE_GRAPH_CHANGED)
    }
  }
}
