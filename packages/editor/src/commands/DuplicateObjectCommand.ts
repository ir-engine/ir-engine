import EditorCommands from '../constants/EditorCommands'
import EditorEvents from '../constants/EditorEvents'
import { serializeObject3D, serializeObject3DArray } from '../functions/debug'
import getDetachedObjectsRoots from '../functions/getDetachedObjectsRoots'
import { CommandManager } from '../managers/CommandManager'
import Command, { CommandParams } from './Command'

export interface DuplicateObjectCommandParams extends CommandParams {
  /** Parent object which will hold objects being added by this command */
  parents?: any

  /** Child object before which all objects will be added */
  befores?: any
}

export default class DuplicateObjectCommand extends Command {
  parent: any

  before: any

  selectObjects: any

  duplicatedObjects: any[]

  constructor(objects?: any | any[], params?: DuplicateObjectCommandParams) {
    super(objects, params)

    if (!Array.isArray(objects)) {
      objects = [objects]
    }

    this.affectedObjects = objects.slice(0)
    this.parent = params.parents
    this.before = params.befores
    this.selectObjects = params.isObjectSelected
    this.oldSelection = CommandManager.instance.selected.slice(0)
    this.duplicatedObjects = []
  }

  execute(isRedoCommand?: boolean) {
    if (isRedoCommand) {
      CommandManager.instance.executeCommand(EditorCommands.ADD_OBJECTS, this.duplicatedObjects, {
        parents: this.parent,
        befores: this.before,
        shouldEmitEvent: false,
        isObjectSelected: false
      })
    } else {
      const validNodes = this.affectedObjects.filter((object) => object.constructor.canAddNode())
      const roots = getDetachedObjectsRoots(validNodes)
      this.duplicatedObjects = roots.map((object) => object.clone())

      if (this.parent) {
        CommandManager.instance.executeCommand(EditorCommands.ADD_OBJECTS, this.duplicatedObjects, {
          parents: this.parent,
          befores: this.before,
          shouldEmitEvent: false,
          isObjectSelected: false
        })
      } else {
        for (let i = 0; i < roots.length; i++) {
          CommandManager.instance.executeCommand(EditorCommands.ADD_OBJECTS, [this.duplicatedObjects[i]], {
            parents: roots[i].parent,
            shouldEmitEvent: false,
            isObjectSelected: false
          })
        }
      }

      if (this.isSelected) {
        CommandManager.instance.executeCommand(EditorCommands.REPLACE_SELECTION, this.duplicatedObjects, {
          shouldEmitEvent: false,
          shouldGizmoUpdate: false
        })
      }

      CommandManager.instance.updateTransformRoots()
    }

    this.emitAfterExecuteEvent()
  }

  undo() {
    CommandManager.instance.executeCommand(EditorCommands.REMOVE_OBJECTS, this.duplicatedObjects, {
      deselectObject: false
    })
    CommandManager.instance.executeCommand(EditorCommands.REPLACE_SELECTION, this.oldSelection)
  }

  toString() {
    return `DuplicateMultipleCommand id: ${this.id} objects: ${serializeObject3DArray(
      this.affectedObjects
    )} parent: ${serializeObject3D(this.parent)} before: ${serializeObject3D(this.before)}`
  }

  emitAfterExecuteEvent() {
    if (this.shouldEmitEvent) {
      CommandManager.instance.emitEvent(EditorEvents.SCENE_GRAPH_CHANGED)
    }
  }
}
