import { store } from '@xrengine/client-core/src/store'
import { SceneJson } from '@xrengine/common/src/interfaces/SceneInterface'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { removeEntity } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import {
  getEntityNodeArrayFromEntities,
  removeEntityNodeFromParent,
  traverseEntityNode
} from '@xrengine/engine/src/ecs/functions/EntityTreeFunctions'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { serializeWorld } from '@xrengine/engine/src/scene/functions/serializeWorld'

import { executeCommand } from '../classes/History'
import EditorCommands from '../constants/EditorCommands'
import { serializeObject3DArray } from '../functions/debug'
import { filterParentEntities } from '../functions/filterParentEntities'
import { EditorAction } from '../services/EditorServices'
import { SelectionAction } from '../services/SelectionServices'
import Command, { CommandParams } from './Command'

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
      const tree = useWorld().entityTree

      for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i]
        this.undoObjects.push(obj)

        if (obj.parentEntity) {
          const parent = tree.entityNodeMap.get(obj.parentEntity)
          if (!parent) throw new Error('Parent is not defined')
          this.oldParents.push(parent)

          const before = tree.entityNodeMap.get(parent.children![parent.children!.indexOf(obj.entity) + 1])
          this.oldBefores.push(before!)
        }

        if (!this.skipSerialization) this.oldComponents.push(serializeWorld(obj))
      }
    }
  }

  execute() {
    this.emitBeforeExecuteEvent()

    const removedObjectsRoots = getEntityNodeArrayFromEntities(
      filterParentEntities(
        this.affectedObjects.map((o) => o.entity),
        undefined,
        true,
        false
      )
    )

    for (let i = 0; i < removedObjectsRoots.length; i++) {
      const object = removedObjectsRoots[i]
      if (!object.parentEntity) continue

      traverseEntityNode(object, (node) => removeEntity(node.entity))
      removeEntityNodeFromParent(object)
    }

    if (this.deselectObject) {
      executeCommand(EditorCommands.REMOVE_FROM_SELECTION, this.affectedObjects, {
        shouldEmitEvent: this.shouldEmitEvent
      })
    }

    this.emitAfterExecuteEvent()
  }

  undo() {
    if (!this.undoObjects) return

    executeCommand(EditorCommands.ADD_OBJECTS, this.undoObjects, {
      parents: this.oldParents,
      befores: this.oldBefores,
      isObjectSelected: this.isSelected,
      useUniqueName: false,
      sceneData: this.oldComponents
    })

    executeCommand(EditorCommands.REPLACE_SELECTION, this.affectedObjects)
  }

  toString() {
    return `RemoveMultipleObjectsCommand id: ${this.id} objects: ${serializeObject3DArray(this.affectedObjects)}`
  }

  emitAfterExecuteEvent() {
    if (this.shouldEmitEvent) {
      store.dispatch(EditorAction.sceneModified(true))
      store.dispatch(SelectionAction.changedSceneGraph())
    }
  }
}
