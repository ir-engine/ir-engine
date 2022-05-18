import { store } from '@xrengine/client-core/src/store'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { cloneEntityNode, getEntityNodeArrayFromEntities } from '@xrengine/engine/src/ecs/functions/EntityTreeFunctions'
import { useWorld } from '@xrengine/engine/src/ecs/functions/SystemHooks'
import { serializeWorld } from '@xrengine/engine/src/scene/functions/serializeWorld'

import { executeCommand } from '../classes/History'
import EditorCommands from '../constants/EditorCommands'
import { serializeObject3D, serializeObject3DArray } from '../functions/debug'
import { getDetachedObjectsRoots } from '../functions/getDetachedObjectsRoots'
import { shouldNodeDeserialize } from '../functions/shouldDeserialize'
import { EditorAction } from '../services/EditorServices'
import { accessSelectionState, SelectionAction } from '../services/SelectionServices'
import Command, { CommandParams } from './Command'

export interface DuplicateObjectCommandParams extends CommandParams {
  /** Parent object which will hold objects being added by this command */
  parents?: EntityTreeNode | EntityTreeNode[]

  /** Child object before which all objects will be added */
  befores?: EntityTreeNode | EntityTreeNode[]
}

export default class DuplicateObjectCommand extends Command {
  parents?: EntityTreeNode[]

  befores?: EntityTreeNode[]

  duplicatedObjects: EntityTreeNode[]

  constructor(objects: EntityTreeNode[], params: DuplicateObjectCommandParams) {
    super(objects, params)

    this.affectedObjects = objects.filter((o) => shouldNodeDeserialize(o))
    this.parents = params.parents ? (Array.isArray(params.parents) ? params.parents : [params.parents]) : undefined
    this.befores = params.befores ? (Array.isArray(params.befores) ? params.befores : [params.befores]) : undefined
    this.duplicatedObjects = []

    if (this.keepHistory) {
      this.oldSelection = accessSelectionState().selectedEntities.value.slice(0)
    }
  }

  execute(isRedoCommand?: boolean) {
    if (isRedoCommand) {
      executeCommand(EditorCommands.ADD_OBJECTS, this.duplicatedObjects, {
        parents: this.parents,
        befores: this.befores,
        shouldEmitEvent: false,
        isObjectSelected: false
      })
    } else {
      const roots = getDetachedObjectsRoots(this.affectedObjects)
      this.duplicatedObjects = roots.map((object) => cloneEntityNode(object))
      const sceneData = this.duplicatedObjects.map((obj) => serializeWorld(obj, true))
      const tree = useWorld().entityTree

      if (!this.parents) {
        this.parents = []

        for (let o of this.duplicatedObjects) {
          if (!o.parentEntity) throw new Error('Parent is not defined')
          const parent = tree.entityNodeMap.get(o.parentEntity)

          if (!parent) throw new Error('Parent is not defined')
          this.parents.push(parent)
        }
      }

      executeCommand(EditorCommands.ADD_OBJECTS, this.duplicatedObjects, {
        parents: this.parents,
        befores: this.befores,
        shouldEmitEvent: false,
        isObjectSelected: false,
        sceneData
      })

      if (this.isSelected) {
        executeCommand(EditorCommands.REPLACE_SELECTION, this.duplicatedObjects)
      }
    }

    this.emitAfterExecuteEvent()
  }

  undo() {
    executeCommand(EditorCommands.REMOVE_OBJECTS, this.duplicatedObjects, {
      deselectObject: false,
      skipSerialization: true
    })

    executeCommand(EditorCommands.REPLACE_SELECTION, getEntityNodeArrayFromEntities(this.oldSelection))
  }

  toString() {
    return `DuplicateMultipleCommand id: ${this.id} objects: ${serializeObject3DArray(
      this.affectedObjects
    )} parent: ${serializeObject3D(this.parents)} before: ${serializeObject3D(this.befores)}`
  }

  emitAfterExecuteEvent() {
    if (this.shouldEmitEvent) {
      store.dispatch(EditorAction.sceneModified(true))
      store.dispatch(SelectionAction.changedSceneGraph())
    }
  }
}
