import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { serializeWorld } from '@xrengine/engine/src/scene/functions/serializeWorld'

import EditorCommands from '../constants/EditorCommands'
import EditorEvents from '../constants/EditorEvents'
import { serializeObject3D, serializeObject3DArray } from '../functions/debug'
import { getDetachedObjectsRoots } from '../functions/getDetachedObjectsRoots'
import { shouldNodeDeserialize } from '../functions/shouldDeserialiez'
import { CommandManager } from '../managers/CommandManager'
import { SceneManager } from '../managers/SceneManager'
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
      this.oldSelection = CommandManager.instance.selected.slice(0)
    }
  }

  execute(isRedoCommand?: boolean) {
    if (isRedoCommand) {
      CommandManager.instance.executeCommand(EditorCommands.ADD_OBJECTS, this.duplicatedObjects, {
        parents: this.parents,
        befores: this.befores,
        shouldEmitEvent: false,
        isObjectSelected: false
      })
    } else {
      const roots = getDetachedObjectsRoots(this.affectedObjects)
      this.duplicatedObjects = roots.map((object) => object.clone())
      const sceneData = this.duplicatedObjects.map((obj) => serializeWorld(obj, true))

      if (!this.parents) this.parents = this.duplicatedObjects.map((o) => o.parentNode)

      CommandManager.instance.executeCommand(EditorCommands.ADD_OBJECTS, this.duplicatedObjects, {
        parents: this.parents,
        befores: this.befores,
        shouldEmitEvent: false,
        isObjectSelected: false,
        sceneData
      })

      if (this.isSelected) {
        CommandManager.instance.executeCommand(EditorCommands.REPLACE_SELECTION, this.duplicatedObjects, {
          shouldGizmoUpdate: false
        })
      }

      CommandManager.instance.updateTransformRoots()
    }

    this.emitAfterExecuteEvent()
  }

  undo() {
    CommandManager.instance.executeCommand(EditorCommands.REMOVE_OBJECTS, this.duplicatedObjects, {
      deselectObject: false,
      skipSerialization: true
    })
    CommandManager.instance.executeCommand(EditorCommands.REPLACE_SELECTION, this.oldSelection)
  }

  toString() {
    return `DuplicateMultipleCommand id: ${this.id} objects: ${serializeObject3DArray(
      this.affectedObjects
    )} parent: ${serializeObject3D(this.parents)} before: ${serializeObject3D(this.befores)}`
  }

  emitAfterExecuteEvent() {
    if (this.shouldEmitEvent) {
      SceneManager.instance.onEmitSceneModified
    }
  }
}
